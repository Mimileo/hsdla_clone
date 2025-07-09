// src/App.tsx
import { Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard/Dashboard";
import MainLayout from "./layouts/MainLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import Home from "./pages/Home";
import { useEffect } from "react";
import { useAuthStore } from "./stores/authStore";
import ProtectedRoute from "./components/routeWrappers/ProtectRoute";
import AuthenticatedRoute from "./components/routeWrappers/AuthenticatedRoute";
import RegisterPage from "./pages/RegisterPage";
import { Transcripts } from "./pages/Dashboard/transcripts/Transcripts";
import TranscriptDetail from "./pages/Dashboard/transcripts/TranscriptDetail";
import { Users } from "./pages/Dashboard/users/Users";
import TranscriptPreviewPage from "./pages/Dashboard/transcripts/TranscriptPreviewPage";
import EditTranscript from "./pages/Dashboard/transcripts/EditTranscript";
import { SettingsPage } from "./pages/Dashboard/SettingsPage";
import UserPage from "./pages/Dashboard/users/UserPage";
import EditUserPage from "./pages/Dashboard/users/EditUser";
function App() {
  useEffect(() => {
    useAuthStore.getState().checkAuth();
  }, []);

  return (

      
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
      </Route>
      <Route element={<MainLayout />}>
        <Route
          path="/register"
          element={
            <AuthenticatedRoute>
              <RegisterPage />
            </AuthenticatedRoute>
          }
        />
      </Route>
      <Route element={<MainLayout />}>
        <Route
          path="/login"
          element={
            <AuthenticatedRoute>
              <LoginPage />
            </AuthenticatedRoute>
          }
        />
      </Route>
      <Route element={<DashboardLayout />}>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
         <Route
          path="/dashboard/users"
          element={
            <ProtectedRoute>
              <Users />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/transcripts"
          element={
            <ProtectedRoute>
              <Transcripts />
            </ProtectedRoute>
          }
        />

        <Route 
          path="/dashboard/transcripts/preview" 
          element={
            <ProtectedRoute>
              <TranscriptPreviewPage />
            </ProtectedRoute>
          }
           />

         <Route 
          path="/dashboard/transcripts/edit/:id" 
          element={
            <ProtectedRoute>
              <EditTranscript />
            </ProtectedRoute>
          }
           />



        <Route
          path="/dashboard/transcripts/:id"
          element={
            <ProtectedRoute>
              <TranscriptDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/users"
          element={
            <ProtectedRoute>
              <Users />
            </ProtectedRoute>
          }
        />

         <Route
          path="/dashboard/users/:id"
          element={
            <ProtectedRoute>
              <UserPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/users/edit/:id"
          element={
            <ProtectedRoute>
              <EditUserPage />
            </ProtectedRoute>
          }
        />



         <Route
          path="/dashboard/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

       
       
      </Route>
    </Routes>
  );
}

export default App;
