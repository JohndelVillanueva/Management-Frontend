// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Route from "../routing/AdminRoutes"; // Ensure the file exists at 'src/routing/route.tsx' or adjust the path accordingly
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
export default function App() {
  return (
    <div className="App">
      {/* Main content area */}
      <ToastContainer />
      <Route />
    </div>
  );
}
