const ExamSession = require("../models/ExamSession");
const Exam = require("../models/Exam");
const Result = require("../models/Result");

const autoSubmitExams = async () => {
    try {
        const currentTime = new Date();

        // Find all expired, unsubmitted exam sessions
        const expiredSessions = await ExamSession.find({ submitted: false, endTime: { $lt: currentTime } });

        // if (expiredSessions.length === 0) {
        //     console.log("No expired exams found for auto-submission.");
        //     return;
        // }

        for (const session of expiredSessions) {
            const exam = await Exam.findById(session.examId);
            if (!exam) continue;

            const answers = session.answers || []; // Ensure answers exist
            let score = 0;

            // Auto-grade based on attempted answers
            exam.questions.forEach((q, index) => {
                if (answers[index] && q.correctAnswer === answers[index]) {
                    score++;
                }
            });

            const totalQuestions = exam.questions.length;
            const percentage = (score / totalQuestions) * 100;

            // Save result
            await Result.create({
                userId: session.userId,
                examId: exam._id,
                score,
                totalQuestions,
                percentage,
            });

            // Mark session as submitted
            session.submitted = true;
            session.submissionTime = currentTime;
            await session.save();
        }

        console.log(`Auto-submitted ${expiredSessions.length} exams.`);
    } catch (error) {
        console.error("Error in auto-submit:", error);
    }
};

module.exports = autoSubmitExams;
