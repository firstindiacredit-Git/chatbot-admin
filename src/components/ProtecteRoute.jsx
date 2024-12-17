import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token'); // Get the token

  return token ? children : <Navigate to="/" />; // Redirect to login if no token
};

export default ProtectedRoute;
