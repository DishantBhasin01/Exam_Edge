import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
//import ProtectedRoute from "./components/layout/ProtectedRoute";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Exam from "./pages/Exam";
import Results from "./pages/Results";
import Home from "./pages/Home";
import AdminDashboard from "./pages/AdminDashboard";
import CreateExam from "./pages/CreateExam";


const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/student/dashboard" element={<Dashboard />} />
        <Route path="/examiner/dashboard" element={<Dashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/exam/:examId" element={<Exam />} />
        <Route path="/results" element={<Results />} />
        <Route path="/createExam" element={<CreateExam />} />

      </Routes>
    </Router>
  );
};

export default AppRoutes;


//new

// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import Login from "./pages/Login";
// import Signup from "./pages/Signup";
// import Dashboard from "./pages/Dashboard";
// import Exam from "./pages/Exam";
// import Results from "./pages/Results";
// import Home from "./pages/Home";
// import ProtectedRoute from "./components/layout/ProtectedRoute"; 

// const AppRoutes = () => {
//   return (
//     <Router>
//       <Routes>
//         <Route path="/" element={<Home />} />
//         <Route path="/login" element={<Login />} />
//         <Route path="/signup" element={<Signup />} />
        
//         {/*
//         <Route 
//           path="/dashboard" 
//           element={
//             <ProtectedRoute>
//               <Dashboard />
//             </ProtectedRoute>
//           } 
//         />
//         <Route 
//           path="/exam/:examId" 
//           element={
//             <ProtectedRoute>
//               <Exam />
//             </ProtectedRoute>
//           } 
//         />
//         <Route 
//           path="/results" 
//           element={
//             <ProtectedRoute>
//               <Results />
//             </ProtectedRoute>
//           } 
//         />
//       </Routes>
//     </Router>
//   );
// };

// export default AppRoutes;
