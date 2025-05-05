// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import EmployeeProfileViewer from "./components/EmployeeProfileViewer";
import EmployeeForm from "./components/EmployeeForm";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "react-phone-input-2/lib/style.css";

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 p-4">
        <Routes>
          {/* Create form at root */}
          <Route
            path="/"
            element={
              <>
                <h1 className="text-3xl font-bold text-center mb-6">
                  Create Employee Profile
                </h1>
                <EmployeeForm isEdit={false} />
              </>
            }
          />

          {/* Viewer on its own route */}
          <Route
            path="/employees"
            element={
              <>
                <h1 className="text-4xl font-bold text-center mb-6">
                  Employee Details
                </h1>
                <EmployeeProfileViewer />
              </>
            }
          />

          {/* Edit form */}
          <Route
            path="/edit/:id"
            element={
              <>
                <h1 className="text-3xl font-bold text-center mb-6">
                  Edit Employee Profile
                </h1>
                <EmployeeForm isEdit={true} />
              </>
            }
          />
        </Routes>

        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </Router>
  );
};

export default App;
