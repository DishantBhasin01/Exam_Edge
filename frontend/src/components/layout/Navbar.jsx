import { Link, useNavigate } from "react-router-dom"; // ⬅️ added useNavigate
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate(); // ⬅️ get the navigate function

  const handleLogout = () => {
    logout();               // perform logout
    navigate("/login");     // ⬅️ redirect to login (or homepage if you prefer)
  };

  return (
    <nav className="w-full fixed top-0 left-0 bg-gray-900 text-white shadow-md py-4 px-10 flex justify-between items-center z-50">
      <h1 className="text-xl font-bold">
        <Link to="/" className="hover:text-blue-500 transition-all duration-300">
        ExamEdge
        </Link>
      </h1>

      <div className="flex items-center gap-4">
  {user ? (
    <div className="flex items-center gap-3 bg-white text-blue-600 px-4 py-2 rounded-full shadow hover:shadow-md transition">
      <div className="w-8 h-8 bg-blue-500 text-white flex items-center justify-center rounded-full font-semibold">
        {user.name.charAt(0).toUpperCase()}
      </div>
      <span className="font-medium">Hi, {user.name.split(" ")[0]}</span>
      <button
        onClick={handleLogout}
        className="ml-2 px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded-full transition"
      >
        Logout
      </button>
    </div>
  ) : (
    <>
      <Link to="/login" className="px-4 py-2 border rounded hover:bg-blue-800 transition">Login</Link>
      <Link to="/signup" className="px-4 py-2 bg-black text-white rounded hover:bg-blue-800 transition">Sign Up</Link>
    </>
  )}
</div>

    </nav>
  );
};

export default Navbar;
