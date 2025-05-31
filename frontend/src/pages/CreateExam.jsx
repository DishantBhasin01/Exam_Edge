import axios from "axios";
import { useState } from "react";
import Navbar from "../components/layout/Navbar";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from "react-router-dom";

const CreateExam = () => {
  const [exam, setExam] = useState({
    title: "",
    description: "",
    duration: "",
    questions: [
      { questionText: "", options: ["", "", "", ""], correctAnswer: null },
    ],
  });

  const handleChange = (e) => {
    setExam({ ...exam, [e.target.name]: e.target.value });
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...exam.questions];
    updatedQuestions[index][field] = value;
    setExam({ ...exam, questions: updatedQuestions });
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const updatedQuestions = [...exam.questions];
    updatedQuestions[qIndex].options[oIndex] = value;
    setExam({ ...exam, questions: updatedQuestions });
  };

  const addQuestion = () => {
    setExam({
      ...exam,
      questions: [...exam.questions, { questionText: "", options: ["", "", "", ""], correctAnswer: null }],
    });
  };


  const navigate = useNavigate();
  const handleSubmit = async () => {

    if (!exam.title || !exam.description || !exam.duration) {
      toast.error(" Please fill in all exam fields ");
      return;
    }

    for (let i = 0; i < exam.questions.length; i++) {
      const q = exam.questions[i];
  
      // Check question text
      if (!q.questionText.trim()) {
        toast.error(` Question ${i + 1}: Enter question text.`);
        return;
      }
  
      // Check all options are filled
      if (q.options.some(option => !option.trim())) {
        toast.error(` Question ${i + 1}: Fill in all options.`);
        return;
      }
  
      // Check if a correct answer is selected
      if (q.correctAnswer === null || q.correctAnswer === undefined) {
        toast.error(` Question ${i + 1}: Select the correct answer.`);
        return;
      }
    }

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const token = user?.token;

      const formattedExam = {
        ...exam,
        questions: exam.questions.map(q => ({
          ...q,
          correctAnswer: q.options[q.correctAnswer] || "",
        })),
      };

      const response = await axios.post("http://localhost:5000/api/exams/", formattedExam, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success(" Exam created successfully!");

      // Clear the form
      // setExam({
      //   title: "",
      //   description: "",
      //   duration: "",
      //   questions: [{ questionText: "", options: ["", "", "", ""], correctAnswer: null }],
      // });
      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 1000);

    } catch (error) {
      toast.error("Something went wrong while creating the exam.");
      console.error("Error creating exam:", error);
    }
  };


  const removeQuestion = (index) => {
    const updatedQuestions = exam.questions.filter((_, i) => i !== index);
    setExam({ ...exam, questions: updatedQuestions });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
    <Navbar />
    <ToastContainer position="top-right" autoClose={3000} />
    <div className="max-w-6xl mx-auto px-6 py-10 pt-24">
      <div className="bg-gray-800 p-6 rounded-2xl shadow-md">
        <h2 className="text-3xl font-bold text-center mb-6 text-blue-400">📝 Create New Exam</h2>

        <div className="grid gap-4">
          <input
            type="text"
            name="title"
            placeholder="Exam Title"
            value={exam.title}
            onChange={handleChange}
            className="bg-gray-700 text-white border border-gray-600 p-3 rounded-md w-full focus:outline-blue-400 placeholder-gray-400"
          />
          <textarea
            name="description"
            placeholder="Description"
            value={exam.description}
            onChange={handleChange}
            className="bg-gray-700 text-white border border-gray-600 p-3 rounded-md w-full focus:outline-blue-400 placeholder-gray-400"
          />
          <input
            type="number"
            name="duration"
            placeholder="Duration (in minutes)"
            value={exam.duration}
            onChange={handleChange}
            className="bg-gray-700 text-white border border-gray-600 p-3 rounded-md w-full focus:outline-blue-400 placeholder-gray-400"
          />
        </div>

        {/* Questions Section */}
        <div className="mt-6 space-y-6">
          {exam.questions.map((q, qIndex) => (
            <div 
            key={qIndex} 
            className="border border-gray-600 p-5 rounded-lg shadow-sm bg-gray-700"
            >
              <div className="flex justify-end items-center mb-3">
                {/* <h4 className="font-semibold text-lg text-white">Question {qIndex + 1}</h4> */}
                  {exam.questions.length > 1 && (
                    <button
                    onClick={() => removeQuestion(qIndex)}
                    className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded-md shadow-md transition duration-300 transform hover:scale-105"
                  >
                     Remove Question
                  </button>
                  
                  )}
              </div>


              <h4 className="font-semibold text-lg mb-3 text-white">Question {qIndex + 1}</h4>
              <input
                type="text"
                placeholder="Question Text"
                value={q.questionText}
                onChange={(e) => handleQuestionChange(qIndex, "questionText", e.target.value)}
                className="bg-gray-800 text-white border border-gray-600 p-3 rounded-md w-full mb-3 focus:outline-blue-400 placeholder-gray-400"
              />

              {/* Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {q.options.map((option, oIndex) => (
                  <label key={oIndex} className="flex items-center gap-2 text-white">
                    <input
                      type="radio"
                      name={`correct-${qIndex}`}
                      checked={q.correctAnswer === oIndex}
                      onChange={() => handleQuestionChange(qIndex, "correctAnswer", oIndex)}
                      className="accent-blue-500"
                    />
                    <input
                      type="text"
                      placeholder={`Option ${oIndex + 1}`}
                      value={option}
                      onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                      className="bg-gray-800 text-white border border-gray-600 p-2 rounded-md w-full focus:outline-blue-400 placeholder-gray-400"
                    />
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <button
            onClick={addQuestion}
            className="px-5 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md transition"
          >
            ➕ Add Question
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition"
          >
            ✅ Create Exam
          </button>
        </div>
      </div>
    </div>
  </div>
  );
};

export default CreateExam;
