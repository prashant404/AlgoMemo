// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Components & Bouncer
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute"; // <-- Don't forget to import the bouncer!

// Pages
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import TopicDetail from "./pages/TopicDetail";
import CuratedList from "./pages/CuratedList";
import MockInterview from "./pages/MockInterview";
import Profile from "./pages/Profile";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-foreground selection:bg-brand/30 selection:text-brand-foreground">
        <Navbar />
        <Routes>
          {/* PUBLIC ROUTE: The landing page is open to everyone */}
          <Route path="/" element={<Home />} />

          {/* PRIVATE ROUTE: Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* PRIVATE ROUTE: Topic Detail */}
          <Route
            path="/topic/:topicId"
            element={
              <ProtectedRoute>
                <TopicDetail />
              </ProtectedRoute>
            }
          />

          <Route
            path="/list/:listId"
            element={
              <ProtectedRoute>
                <CuratedList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/mock-interview"
            element={
              <ProtectedRoute>
                <MockInterview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}
// Add import at the top

export default App;
