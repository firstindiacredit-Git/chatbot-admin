import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AdminSignup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState(""); // Email for signup
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // Confirm password for validation
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/admin/signup", {
        username,
        email,
        password,
      });
      //localStorage.setItem("adminToken", response.data.token); // Store JWT token
      navigate("/"); // Redirect to dashboard after successful signup
    } catch (error) {
      setError(error.response?.data?.message || "An error occurred during signup.");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <form onSubmit={handleSignup} className="p-6 shadow-lg rounded-lg bg-gray-50">
        <h2 className="text-2xl font-bold mb-4">Admin Signup</h2>

        {error && <div className="mb-4 text-red-500">{error}</div>} {/* Display error */}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
          required
        />
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
          required
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Signup
        </button>

        <div className="mt-4">
          <span>Already have an account?</span>
          <button
            onClick={() => navigate("/login")}
            className="text-blue-500 ml-2"
          >
            Login here
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSignup;
