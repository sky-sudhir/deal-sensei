import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import NotFound from "./components/sections/NotFound";
import { ThemeProvider } from "./components/theme-provider";
import { Toaster } from "sonner";
import "./styles/globals.css";

// Auth Pages
import Landing from "./pages/Landing";
import Signup from "./pages/auth/Signup";
import Login from "./pages/auth/Login";
import VerifyEmailSent from "./pages/auth/VerifyEmailSent";
import VerifyEmail from "./pages/auth/VerifyEmail";

// Routes
import HomeRoutes from "./pages/homeRoutes";

// Layout
import AppLayout from "./components/layout/AppLayout";

// Auth Guard
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { useSelector } from "react-redux";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="dealsensei-theme">
      <Toaster position="top-right" expand={true} richColors />
      <div className="min-h-screen bg-background text-foreground">
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/verify-email-sent" element={<VerifyEmailSent />} />
            <Route path="/verify-email/:token" element={<VerifyEmail />} />

            {/* Protected Routes with AppLayout */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              {HomeRoutes}
            </Route>

            {/* Error Routes */}
            <Route path="404" element={<NotFound />} />
            <Route path="*" element={<Navigate replace to="/404" />} />
          </Routes>
        </BrowserRouter>
      </div>
    </ThemeProvider>
  );
}

export default App;
