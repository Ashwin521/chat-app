import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthContext } from "../context/AuthContext";
import { Toaster } from "react-hot-toast";

const App = () => {
  return (
    <div className="bg-[url('/bgImage.svg')] bg-contain min-h-screen">
      <Toaster />
      <Routes>
        {/* Public route */}
        <Route path="/login" element={<LoginPageRedirect />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
};

// Redirect authenticated user away from /login
const LoginPageRedirect = () => {
  const { authUser } = useContext(AuthContext);
  return authUser ? <Navigate to="/" replace /> : <LoginPage />;
};

export default App;
