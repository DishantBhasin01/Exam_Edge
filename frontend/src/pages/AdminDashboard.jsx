import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/layout/Navbar";

const AdminDashboard = () => {
  const [exams, setExams] = useState([]);
  const navigate = useNavigate();

  useEffect(() => { 
    const fetchExams = async () => {
      try {
        // const token = localStorage.getItem("user");
        const user = JSON.parse(localStorage.getItem("user")); 
        const token = user?.token;
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

  const handleCreateExam = () => {
    navigate("/createExam");
  };

  const handleDeleteExam = async (examId) => {
    if (!window.confirm("Are you sure you want to delete this exam?")) return;
  
    try {
      const user = JSON.parse(localStorage.getItem("user")); 
      const token = user?.token;
  
      await axios.delete(`http://localhost:5000/api/exams/${examId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      // Remove from state
      setExams((prevExams) => prevExams.filter((exam) => exam._id !== examId));
    } catch (error) {
      console.error("Error deleting exam:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-black text-white">
      <Navbar />

      <div className="container mx-auto px-4 pt-24 pb-12">
        <h2 className="text-5xl font-extrabold text-center text-white mb-10 tracking-wide drop-shadow-md">
          Admin Dashboard
        </h2>

        <div className="flex justify-end mb-10">
          <button
            onClick={handleCreateExam}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-300"
          >
            ➕ Create Exam
          </button>
        </div>

        {exams.length === 0 ? (
          <p className="text-center text-gray-300 text-lg">No exams created yet.</p>
        ) : (
          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {exams.slice().reverse().map((exam) => (
              <div key={exam._id} className="bg-gradient-to-br from-[#1f2937] to-[#111827] rounded-3xl p-6 shadow-2xl hover:shadow-blue-800 transition duration-300 transform hover:-translate-y-1">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-2xl font-semibold text-blue-400">{exam.title}</h3>
                <button onClick={() => handleDeleteExam(exam._id)} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full shadow-md hover:shadow-lg transition duration-300 transform hover:scale-105" title="Delete Exam">
                   <span className="hidden sm:inline">Delete</span>
                </button>

              </div>
              <p className="text-gray-400 mb-4">🕒 Duration: {exam.duration} min</p>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Questions: {exam.questions?.length || "N/A"}</span>
                <span>ID: {exam._id.slice(-5)}</span>
              </div>
            </div>
            
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
