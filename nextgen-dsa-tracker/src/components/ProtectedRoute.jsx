// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');

  // If there is no token, instantly teleport them back to the home page
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // If they have a token, let them through to the page they requested
  return children;
}