import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminLogin from "./components/AdminLogin"; // Import the AdminLogin component
import AdminSignup from "./components/AdminSignup"; // Import the AdminSignup component
import AdminPanel from "./components/AdminPanel"; // Import Admin Panel
import ProtectedRoute from "./components/ProtecteRoute";

function App() {
  return (
    <Router>
      <Routes>
        {/* Route for Admin Signup */}
        <Route path="/signup" element={<AdminSignup />} />
        
        {/* Route for Admin Login */}
        <Route path="/" element={<AdminLogin />} />
        
        {/* Route for Admin Dashboard/Panel */}
        <Route path="/dashboard" element={ <ProtectedRoute><AdminPanel /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
