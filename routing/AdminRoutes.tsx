// import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import Layout from "../components/layouts/Layout";
import AdminDashboard from "../pages/admin/AdminDashboard";
import Login from "../pages/Login.js";
import SignupPage from "../pages/SignupPage";
import HeadDashboard from "../pages/head/HeadDashboard";
import { AuthProvider } from "../context/AuthContext";
import StaffDashboard from "../pages/staff/StaffDashboard";
import ProtectedRoute from "../components/routes/ProtectedRoutes.js";
import VerifyEmail from "../pages/VerifyEmail.js";
import Cards from '../pages/Cards';
import CardDetails from '../pages/cardsDetails.js';
import SubmissionDetails from "../pages/SubmissionDetails";
import Departments from "../pages/Departments";
import UsersPage from "../pages/usersPage";
import Analytics from "../pages/Analytics.js";
import StaffManagement from "../pages/StaffManagement";
import Profile from "../pages/Profile.js";
import EditProfile from "../pages/EditProfile.js";

export default function routes() {
  return (
    <Router>
      <AuthProvider>
        <Toaster 
          position="top-right"
          reverseOrder={false}
          gutter={8}
          containerClassName=""
          containerStyle={{}}
          toastOptions={{
            // Default options
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
              padding: '16px',
              borderRadius: '8px',
              fontSize: '14px',
            },
            // Success toast style
            success: {
              duration: 3000,
              style: {
                background: '#10b981',
                color: '#fff',
              },
              iconTheme: {
                primary: '#fff',
                secondary: '#10b981',
              },
            },
            // Error toast style
            error: {
              duration: 4000,
              style: {
                background: '#ef4444',
                color: '#fff',
              },
              iconTheme: {
                primary: '#fff',
                secondary: '#ef4444',
              },
            },
            // Loading toast style
            loading: {
              style: {
                background: '#3b82f6',
                color: '#fff',
              },
            },
          }}
        />
        <Layout>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/edit" element={<EditProfile />} />
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
            <Route path="/cards" element={<ProtectedRoute><Cards /></ProtectedRoute>} />
            <Route
              path="/departments"
              element={
                <ProtectedRoute>
                  <Departments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff"
              element={
                <ProtectedRoute>
                  <StaffManagement />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  );
}