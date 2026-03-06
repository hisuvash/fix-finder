import { BrowserRouter, Routes, Route, Navigate  } from "react-router-dom";
import LoginPage from "../features/auth/pages/LoginPage";
import RegistrationPage from "../features/auth/pages/RegisterPage"
import ProfilePage from "../features/auth/pages/ProfilePage"

export default function AppRoutes() {
  console.log("AppRoutes rendered");
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/profile" element={<ProfilePage />} />

      </Routes>
    </BrowserRouter>
  );
}