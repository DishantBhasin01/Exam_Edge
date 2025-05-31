import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/layout/Navbar";

const Results = () => {
  const [results, setResults] = useState([]);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        
        const user = JSON.parse(localStorage.getItem("user")); 
        const token = user?.token; 
        const res = await axios.get("http://localhost:5000/api/exams/results", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setResults(res.data);
      } catch (error) {
        console.error("Error fetching results:", error);
      }
    };
    fetchResults();
  }, []);

  return (
    <div className="bg-gray-900 min-h-screen text-white">
      <Navbar />
      <div className="container mx-auto p-6 mt-20">
        <h2 className="text-3xl font-bold text-center text-indigo-400 mb-6">
          Exam Results
        </h2>
        {results.length === 0 ? (
          <p className="text-center text-lg text-gray-400">No results available.</p>
        ) : (
          <div className="space-y-6">
            {results.slice().reverse().map((result) => (
              <div
                key={result._id}
                className="bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <h3 className="text-2xl font-semibold text-indigo-300 mb-2">
                  {result.examId?.title || "Unknown"}
                </h3>
                <p className="text-lg">Score: {result.score} / {result.totalQuestions}</p>
                <p className="text-lg">Percentage: {result.percentage}%</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Results;
