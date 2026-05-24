import { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import { Toaster } from "react-hot-toast";
import AuthContext from "../context/AuthContext.js";

const App = () => {
  const { authUser } = useContext(AuthContext);
  const isAuthenticated = Boolean(authUser);
  const backgroundStyle = {
    backgroundImage: "url('/bgImage.svg')",
    backgroundSize: "contain",
  };

  let homeElement = <Navigate to="/login" />;
  let loginElement = <LoginPage />;
  let profileElement = <Navigate to="/login" />;

  if (isAuthenticated) {
    homeElement = <HomePage />;
    loginElement = <Navigate to="/" />;
    profileElement = <ProfilePage />;
  }

  return (
    <div style={backgroundStyle}>
      <Toaster />
      <Routes>
        <Route path="/" element={homeElement} />
        <Route path="/login" element={loginElement} />
        <Route path="/profile" element={profileElement} />
      </Routes>
    </div>
  );
};

export default App;
