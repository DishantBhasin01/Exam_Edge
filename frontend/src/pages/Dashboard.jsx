import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaClock, FaPlay, FaClipboardList } from "react-icons/fa";
import Navbar from "../components/layout/Navbar";

const Dashboard = () => {
  const [exams, setExams] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const token = user?.token;
        localStorage.removeItem("examSessionId");
        const res = await axios.get("http://localhost:5000/api/exams", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setExams(res.data);
      } catch (error) {
        console.error("Error fetching exams:", error);
      }
    };
    fetchExams();
  }, []);

  const handleStartExam = (examId) => {
    navigate(`/exam/${examId}`);
  };

  const handleViewResults = () => {
    navigate("/results");
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Navbar at the top */}
      <Navbar />

      {/* Main content */}
      <div className="container mx-auto px-6 pt-24">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-4xl font-bold">📘 Your Exams</h2>
          <button
            onClick={handleViewResults}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg transition duration-300"
          >
            <FaClipboardList />
            View Results
          </button>
        </div>

        {exams.length === 0 ? (
          <p className="text-center text-gray-300 text-lg">No exams available yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.slice().reverse().map((exam) => (
              <div
                key={exam._id}
                className="bg-gray-700 bg-opacity-50 backdrop-blur-md shadow-xl rounded-xl p-6 border border-gray-600 hover:scale-[1.02] transition duration-300"
              >
                <h3 className="text-2xl font-semibold mb-2">{exam.title}</h3>
                <p className="text-gray-300 flex items-center mb-4">
                  <FaClock className="mr-2 text-yellow-400" /> {exam.duration} mins
                </p>
                <button
                  onClick={() => handleStartExam(exam._id)}
                  className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
                >
                  <FaPlay />
                  Start Exam
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
