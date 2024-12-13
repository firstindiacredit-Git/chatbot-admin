import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/api/admin/login", { username, password });
      localStorage.setItem("adminToken", response.data.token);
      navigate("/dashboard");
    } catch (error) {
      alert("Invalid login credentials");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <form onSubmit={handleLogin} className="p-6 shadow-lg rounded-lg bg-gray-50">
        <h2 className="text-2xl font-bold mb-4">Admin Login</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Login
        </button>

        <div className="mt-4">
          <span>Don't have an account?</span>
          <button
            onClick={() => navigate("/signup")}
            className="text-blue-500 ml-2"
          >
            Signup here
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminLogin;
