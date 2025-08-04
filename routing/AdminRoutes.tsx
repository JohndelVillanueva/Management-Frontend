import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "../components/layouts/Layout"; // Ensure the file exists at 'src/components/Layout.tsx' or adjust the path accordingly
import AdminDashboard from "../pages/admin/AdminDashboard"; // Ensure the file exists at 'src/pages/admin/AdminDashboard.tsx' or adjust the path accordingly
import Login from "../pages/Login.js"; // Ensure the file exists at 'src/pages/login.tsx' or adjust the path accordingly
import SignupPage from "../pages/SignupPage";
import HeadDashboard from "../pages/head/HeadDashboard"; // Ensure the file exists at 'src/pages/head/HeadDashboard.tsx' or adjust the path accordingly
import { AuthProvider } from "../context/AuthContext";
import StaffDashboard from "../pages/staff/StaffDashboard"; // Ensure the file exists at 'src/pages/staff/StaffDashboard.tsx' or adjust the path accordingly
import ProtectedRoute from "../components/routes/ProtectedRoutes.js"; // Ensure the file exists at 'src/components/ProtectedRoute.tsx' or adjust the path accordingly
import VerifyEmail from "../pages/VerifyEmail.js";
import Cards from '../pages/cardsDetails.js';
import CardDetails from '../pages/cardsDetails.js';
import SubmissionDetails from "../pages/submissionDetails"; // Ensure the path is correct and the component exists
import Departments from "../pages/Departments";

export default function routes() {
  return (
    <Router>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route
              path="/CardDetails/:id"
              element={
                <ProtectedRoute>
                  <CardDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/submissions/:submissionId"
              element={
                <ProtectedRoute>
                  <SubmissionDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/AdminDashboard"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/HeadDashboard"
              element={
                <ProtectedRoute>
                  <HeadDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/StaffDashboard"
              element={
                <ProtectedRoute>
                  <StaffDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cards"
              element={
                <ProtectedRoute>
                  <Cards />
                </ProtectedRoute>
              }
            />
            <Route
              path="/departments"
              element={
                <ProtectedRoute>
                  <Departments />
                </ProtectedRoute>
              }
            />

            {/* <Route path="/HeadDashboard" element={<HeadDashboard />} />
            <Route path="/StaffDashboard" element={<StaffDashboard />} /> */}
          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  );
}

