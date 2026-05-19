import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import CandidateDashboard from "./pages/CandidateDashboard";
import Companies from "./pages/Companies";
import CompanyDetails from "./pages/CompanyDetails";
import Dashboard from "./pages/Dashboard";
import DashboardApplications from "./pages/DashboardApplications";
import Home from "./pages/Home";
import JobDetails from "./pages/JobDetails";
import Jobs from "./pages/Jobs";
import Login from "./pages/Login";
import MyApplications from "./pages/MyApplications";
import Register from "./pages/Register";

function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            boxShadow: "0 14px 35px rgba(15, 23, 42, 0.14)",
            color: "#0f172a",
            fontSize: "14px",
            fontWeight: 600,
          },
          success: {
            iconTheme: {
              primary: "#059669",
              secondary: "#ffffff",
            },
          },
          error: {
            duration: 4500,
            iconTheme: {
              primary: "#dc2626",
              secondary: "#ffffff",
            },
          },
        }}
      />
      <Navbar />
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/companies/:id" element={<CompanyDetails />} />
          <Route path="/jobs/:id" element={<JobDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route
              path="/dashboard/applications"
              element={<Navigate to="/employer/applications" replace />}
            />
            <Route
              path="/employer/applications"
              element={<DashboardApplications />}
            />
            <Route
              path="/candidate-dashboard"
              element={<CandidateDashboard />}
            />
            <Route path="/my-applications" element={<MyApplications />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
}

export default App;
