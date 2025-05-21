import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "../components/layouts/Layout"; // Ensure the file exists at 'src/components/Layout.tsx' or adjust the path accordingly
import AdminDashboard from "../pages/admin/AdminDashboard"; // Ensure the file exists at 'src/pages/admin/AdminDashboard.tsx' or adjust the path accordingly
import StudentRecords from "../pages/student/StudentRecord"; // Ensure the file exists at 'src/pages/student/StudentRecords.tsx' or adjust the path accordingly
import ClassScheduling from "../pages/student/ClassScheduling"; // Ensure the file exists at 'src/pages/student/ClassScheduling.tsx' or adjust the path accordingly
import Login from "../pages/login"; // Ensure the file exists at 'src/pages/login.tsx' or adjust the path accordingly
export default function routes() {
  return (
    <div className="routes">
      {/* Main content area */}
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/class-scheduling" element={<ClassScheduling />} />
            <Route path="/student-records" element={<StudentRecords />} />
            <Route path="/AdminDashboard" element={<AdminDashboard />} />
          </Routes>
        </Layout>
        {/* Footer */}
      </Router>
    </div>
  );
}
