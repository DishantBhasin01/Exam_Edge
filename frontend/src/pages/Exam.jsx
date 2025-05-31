import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const Exam = () => {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [showFullscreenWarning, setShowFullscreenWarning] = useState(false);
  const [fullscreenCountdown, setFullscreenCountdown] = useState(10);

  const fullscreenTimerRef = useRef(null);
  const examContainerRef = useRef(null);

  // Fetch exam data and start timer
  useEffect(() => {
    const fetchExam = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const token = user?.token;

        const res = await axios.post(
          `http://localhost:5000/api/exams/start/${examId}`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const { examSessionId, endTime, ...examData } = res.data;
        localStorage.setItem("examSessionId", examSessionId);

        const endTimestamp = new Date(endTime).getTime();
        const now = Date.now();
        const remainingTime = Math.max((endTimestamp - now) / 1000, 0);

        setExam(examData);
        setTimeLeft(remainingTime);

        setTimeout(() => {
          requestFullscreen();
        }, 500);
      } catch (err) {
        console.error("Failed to fetch exam:", err);
      }
    };

    fetchExam();
  }, [examId]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }

    const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  // Fullscreen protection
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFullscreen =
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement;

      if (!isFullscreen) {
        setShowFullscreenWarning(true);
        setFullscreenCountdown(10);

        const interval = setInterval(() => {
          setFullscreenCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              fullscreenTimerRef.current = null;
              handleSubmit();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        fullscreenTimerRef.current = interval;
      } else {
        setShowFullscreenWarning(false);
        if (fullscreenTimerRef.current) {
          clearInterval(fullscreenTimerRef.current);
          fullscreenTimerRef.current = null;
        }
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange);

      if (fullscreenTimerRef.current) {
        clearInterval(fullscreenTimerRef.current);
      }
    };
  }, []);

  const requestFullscreen = () => {
    const el = examContainerRef.current;
    if (!el) return;

    if (el.requestFullscreen) el.requestFullscreen().catch(console.error);
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    else if (el.mozRequestFullScreen) el.mozRequestFullScreen();
    else if (el.msRequestFullscreen) el.msRequestFullscreen();
  };

  const handleAnswerChange = (questionId, option) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleSubmit = async () => {
    if (submitted) return;
    try {
      const examSessionId = localStorage.getItem("examSessionId");
      localStorage.removeItem("examSessionId");


      const user = JSON.parse(localStorage.getItem("user"));
      const token = user?.token;

      const res = await axios.post(
        `http://localhost:5000/api/exams/submit/${examSessionId}`,
         {answers} ,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSubmitted(true);
      const { certificateUrl } = res.data;

      if (certificateUrl) {
        window.open(certificateUrl, "_blank");
      }

      navigate("/results", { replace: true });

      // Prevent going back
      window.onpopstate = () => {
        navigate("/student/dashboard", { replace: true });
      };
    } catch (err) {
      console.error("Error submitting exam:", err);
    }
  };

  if (!exam) {
    return (
      <p className="text-center text-lg text-gray-300 mt-20">
        Fetching Exam Details...
      </p>
    );
  }

  return (
    <div
      ref={examContainerRef}
      className="min-h-screen bg-gray-900 text-white px-4 sm:px-8 md:px-16 py-10 overflow-auto"
      style={{ maxHeight: "100vh" }}  // Ensures scrolling in fullscreen
    >
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-indigo-400 mb-8">
          {exam.title}
        </h1>

        <div className="text-right mb-6">
          <span className="bg-red-800 text-white px-4 py-2 rounded-full font-semibold text-lg">
            ⏰ {Math.floor(timeLeft)}s
          </span>
        </div>

        <div className="space-y-6">
          {exam.questions.map((q, idx) => (
            <div
              key={q._id}
              className="p-6 bg-gray-800 shadow-md rounded-xl border border-gray-700"
            >
              <h3 className="text-xl font-semibold mb-4">
                {idx + 1}. {q.questionText}
              </h3>
              <div className="grid gap-3">
                {q.options.map((opt, i) => (
                  <label
                    key={i}
                    className={`flex items-center px-4 py-2 rounded-lg border cursor-pointer transition-colors duration-200 ${
                      answers[q._id] === opt
                        ? "bg-indigo-600 border-indigo-400"
                        : "bg-gray-700 border-gray-600 hover:bg-gray-600"
                    }`}
                  >
                    <input
                      type="radio"
                      name={q._id}
                      value={opt}
                      checked={answers[q._id] === opt}
                      onChange={() => handleAnswerChange(q._id, opt)}
                      className="mr-3 accent-indigo-400"
                    />
                    <span className="text-base font-medium">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <button
            onClick={handleSubmit}
            disabled={submitted}
            className={`w-full max-w-xs px-6 py-3 rounded-xl font-semibold transition duration-300 shadow-lg ${
              submitted
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            } text-white`}
          >
            {submitted ? "Submitted" : "Submit Exam"}
          </button>
        </div>
      </div>

      {/* Fullscreen Warning Modal */}
      {showFullscreenWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl shadow-xl p-8 max-w-md w-full text-center border border-red-500">
            <h2 className="text-2xl font-bold text-red-500 mb-4">
              Exited Fullscreen Mode!
            </h2>
            <p className="text-gray-300 mb-4">
              Please return to fullscreen within {fullscreenCountdown} seconds, or your exam will be submitted.
            </p>
            <button
              onClick={requestFullscreen}
              className="bg-green-700 hover:bg-green-800 text-white font-semibold py-2 px-6 rounded"
            >
              Return to Fullscreen
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Exam;
