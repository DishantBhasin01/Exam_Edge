import React from "react";
import Navbar from "../components/layout/Navbar";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-gray-900 text-white font-sans">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="flex items-center justify-between px-10 py-24 bg-gradient-to-r from-blue-900 to-black">
        <div>
          <h2 className="text-5xl font-extrabold leading-tight max-w-lg">
            Master Your Future with Online Examinations
          </h2>
          <p className="text-gray-300 mt-4 max-w-lg">
            Join thousands of students and institutions using our platform for online exams.
          </p>
          <button 
          onClick={() => {
            const userString=localStorage.getItem("user");
            if(!userString){
              toast.error("you must logged in to get start");
              return navigate("/login");
            }
            const user =JSON.parse(userString);
            const role =user?.role || user?.user?.role; 
            if(role==="admin"){
              navigate("/admin/dashboard");
            }else if(user.role==="student"){
              navigate("/student/dashboard");
            }else{
              navigate("/login");
            }
          }} className="mt-8 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition duration-300">
            Get Started
          </button>
        </div>
        <img
          src="https://static.vecteezy.com/system/resources/previews/003/296/458/non_2x/high-school-university-student-take-online-exam-using-laptop-free-vector.jpg"
          alt="Students on Laptop"
          className="w-1/2 rounded-xl shadow-lg mt-8"
        />
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-800 text-center">
  <h3 className="text-3xl font-bold text-blue-500 mb-8">
    Trusted by Students and Institutions Nationwide
  </h3>
  <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
    <div className="bg-gray-700 shadow-xl p-8 rounded-3xl transform transition-all duration-300 hover:scale-105 hover:bg-gray-600">
      <p className="text-4xl font-bold text-blue-400">100,000+</p>
      <p className="text-gray-300">Active Students</p>
    </div>
    <div className="bg-gray-700 shadow-xl p-8 rounded-3xl transform transition-all duration-300 hover:scale-105 hover:bg-gray-600">
      <p className="text-4xl font-bold text-blue-400">5,000+</p>
      <p className="text-gray-300">Exams Conducted</p>
    </div>
    <div className="bg-gray-700 shadow-xl p-8 rounded-3xl transform transition-all duration-300 hover:scale-105 hover:bg-gray-600">
      <p className="text-4xl font-bold text-blue-400">95%</p>
      <p className="text-gray-300">Success Rate</p>
    </div>
    <div className="bg-gray-700 shadow-xl p-8 rounded-3xl transform transition-all duration-300 hover:scale-105 hover:bg-gray-600">
      <p className="text-4xl font-bold text-blue-400">24/7</p>
      <p className="text-gray-300">Support Available</p>
    </div>
  </div>
</section>

      {/* Footer */}
      <footer className="bg-gray-900 py-10 px-10 flex justify-between text-gray-400">
        <div>
          <h4 className="text-2xl font-bold text-white">ExamMaster</h4>
          <p>Your trusted platform for online examinations.</p>
        </div>
        <div>
          <h5 className="font-semibold text-white">Contact Us</h5>
          <p>123 Exam Street, Learning City</p>
          <p>info@exammaster.com</p>
        </div>
        <div>
          <h5 className="font-semibold text-white">Quick Links</h5>
          <p className="text-gray-300 hover:underline cursor-pointer">About Us</p>
          <p className="text-gray-300 hover:underline cursor-pointer">Privacy Policy</p>
        </div>
        <div>
          <h5 className="font-semibold text-white">Follow Us</h5>
          <div className="flex space-x-4">
            <span className="cursor-pointer text-blue-500">🔵</span>
            <span className="cursor-pointer text-blue-400">🐦</span>
            <span className="cursor-pointer text-pink-500">📸</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
