import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "../components/layouts/Layout"; // Ensure the file exists at 'src/components/Layout.tsx' or adjust the path accordingly
import AdminDashboard from "../pages/admin/AdminDashboard"; // Ensure the file exists at 'src/pages/admin/AdminDashboard.tsx' or adjust the path accordingly
import Login from "../pages/login"; // Ensure the file exists at 'src/pages/login.tsx' or adjust the path accordingly
import SignupPage from '../pages/SignupPage';
import HeadDashboard from "../pages/head/HeadDashboard"; // Ensure the file exists at 'src/pages/head/HeadDashboard.tsx' or adjust the path accordingly
export default function routes() {
  return (
    <div className="routes">
      {/* Main content area */}
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/AdminDashboard" element={<AdminDashboard />} />
            <Route path="/HeadDashboard" element={<HeadDashboard />} />
          </Routes>
        </Layout>
        {/* Footer */}
      </Router>
    </div>
  );
}
