const express = require("express");
const auth = require("../middleware/auth");
const Exam = require("../models/Exam");
const ExamSession = require("../models/ExamSession");
const User = require("../models/User");
const Result = require("../models/Result");
const mongoose = require("mongoose");
const path = require('path');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const uploadToS3 = require('../utils/uploadToS3'); 

const router = express.Router();

// Get exam results (Students only)
router.get("/results", auth, async (req, res) => {
    //console.log("inn resulr")
    if (req.user.role !== "student") {
        return res.status(403).json({ msg: "Access denied" });
    }

    try {
        //console.log(req.user.userId);
        const results = await Result.find({ userId: req.user.userId }).populate("examId", "title description");
        res.json(results);
    } catch (error) {
        console.error(error); // Log the error
        res.status(500).json({ msg: "Server error" });
    }
});


router.get("/:examId", auth, async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.examId);
        if (!exam) return res.status(404).json({ msg: "Exam not found" });

        res.json(exam);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Server error" });
    }
});



router.delete("/:examId", auth, async (req, res) => {
  try {
    const examId = req.params.examId;
    await Exam.findByIdAndDelete(examId);
    
    res.status(200).json({ message: "Exam deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting exam" });
  }
});





router.post("/", auth, async (req, res) => {
    console.log(req.user.role);
    if (req.user.role !== "admin" && req.user.role !== "examiner") {
        return res.status(403).json({ msg: "Access denied" });
    }

    try {
        const { title, description, duration, questions, correctAnswers } = req.body;

        const newExam = new Exam({
            title,
            description,
            duration,
            questions,
            correctAnswers 
        });

        await newExam.save();
        res.status(201).json({ msg: "Exam created successfully", exam: newExam });
    } catch (error) {
        console.error(error); // Log the error
        res.status(500).json({ msg: "Server error" });
    }
});


router.get("/", auth, async (req, res) => {
    //console.log("Hello");
    try {
        const exams = await Exam.find({}, { "questions.correctAnswer": 0 }); // Hide correct answers
        //console.log(exams);
        res.json(exams);
    } catch (error) {
        console.error(error); // Log the error
        res.status(500).json({ msg: "Server error" });
    }
});

// Start an exam (Only for students)
router.post("/start/:examId", auth, async (req, res) => {
    //console.log("Huehue Mai aagya");
    if (req.user.role !== "student") {
        return res.status(403).json({ msg: "Access denied" });
    }

    const examId = new mongoose.Types.ObjectId(req.params.examId);

    if (!mongoose.Types.ObjectId.isValid(examId)) {
        return res.status(400).json({ error: "Invalid examId format" });
    }

    console.log("Valid object id");

    //console.log(examId);

    try {
        
        
        const exam = await Exam.aggregate([
            { $match: { _id: examId } }, 
            { $unwind: "$questions" },
            { $sample: { size: 10 } }, // Adjust size as needed
            { $group: { _id: "$_id", questions: { $push: "$questions" }, title: { $first: "$title" }, duration: { $first: "$duration" } } }
        ]);

        console.log("here aagya");
        
        if (!exam) return res.status(404).json({ msg: "Exam not found" });

        const startTime = new Date();
        const endTime = new Date(startTime.getTime() + exam[0].duration * 60000);

        const examSession = new ExamSession({
            userId: req.user.userId,
            examId: exam[0]._id,
            startTime,
            endTime,
        });

        await examSession.save();

        res.status(200).json({ 
            msg: "Exam started", 
            examSessionId: examSession._id, 
            startTime, 
            endTime, 
            questions: exam[0].questions 
        });

    } catch (error) {
        console.error(error); // Log the error
        res.status(500).json({ msg: "Server error" });
    }
});



router.post('/submit/:examSessionId', auth, async (req, res) => {
    const examSessionId = req.params.examSessionId;
    const {answers} = req.body;
    console.log(answers);  
    if (req.user.role !== 'student') {
      return res.status(403).json({ msg: 'Access denied' });
    }
  
    if (!examSessionId) {
      return res.status(400).json({ error: 'Missing examSessionId' });
    }
  
    try {
      const examSession = await ExamSession.findById(examSessionId);
      if (!examSession) return res.status(404).json({ msg: 'Exam session not found' });
  
      const exam = await Exam.findById(examSession.examId);
      if (!exam) return res.status(404).json({ msg: 'Exam not found' });
  
      const currentTime = new Date();
      if (currentTime > examSession.endTime) {
        return res.status(400).json({ msg: 'Time expired. Auto-submitting exam.' });
      }
  
      if (!answers) return res.status(400).json({ msg: 'Invalid answers format' });
  
      const calculateScore = (questions, studentAnswers) => {
        let score = 0;
        questions.forEach((q) => {
          const qid = q._id.toString();
          if (studentAnswers[qid] && studentAnswers[qid] === q.correctAnswer) {
            score++;
          }
        });
        console.log(studentAnswers);
        return score;
      };
  
      const score = calculateScore(exam.questions, answers);
      const percentage = (score / exam.questions.length) * 100;
  
      const result = new Result({
        userId: req.user.userId,
        examId: exam._id,
        score,
        totalQuestions: exam.questions.length,
        percentage,
      });
  
      await result.save();
  
      examSession.submitted = true;
      examSession.submissionTime = currentTime;
      await examSession.save();
  
      let certificateUrl = null;
  
      if (percentage < 0) {
        const user = await User.findById(req.user.userId);
        const studentName = user.name || 'Student';
        const examName = exam.title || 'Your Exam';
  
        const safeStudentName = studentName.replace(/[\/\\?%*:|"<>]/g, '').replace(/\s+/g, '-');
        const safeExamName = examName.replace(/[\/\\?%*:|"<>]/g, '').replace(/\s+/g, '-');
        const fileName = `${safeStudentName}-${safeExamName}-certificate.pdf`;
        const certDir = path.join(__dirname, '../certificates');
        const filePath = path.join(certDir, fileName);
  
        if (!fs.existsSync(certDir)) fs.mkdirSync(certDir, { recursive: true });
  
        const doc = new PDFDocument();
        const writeStream = fs.createWriteStream(filePath);
        doc.pipe(writeStream);
  
        doc.fontSize(26).text('Certificate of Achievement', { align: 'center' });
        doc.moveDown();
        doc.fontSize(18).text(`This is to certify that ${studentName}`, { align: 'center' });
        doc.text(`has successfully completed the exam: ${examName}`, { align: 'center' });
        doc.text(`with a score of ${percentage.toFixed(2)}%`, { align: 'center' });
  
        doc.end();
  
        await new Promise((resolve) => writeStream.on('finish', resolve));
  
        certificateUrl = await uploadToS3(filePath, fileName);
        fs.unlinkSync(filePath);
      }
  
      res.status(200).json({
        msg: 'Exam submitted successfully',
        result,
        certificateUrl,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: 'Server error' });
    }
  });
  

module.exports = router;
