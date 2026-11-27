import logo from "../assets/logo.png";
import cyber from "../assets/cyber.png";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useState } from "react";
import "./login.css"

const Login = () => {
  const navigator = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  // Static users
  const staticUsers = [
    {
      email: "hemant.hasija@acrossassist.com",
      password: "123456",
    },
    {
      email: "anuj.maheshwari@acrossassist.com",
      password: "123456",
    },
    {
      email: "ankur.sawhney@acrossassist.com",
      password: "123456",
    },
    {
      email: "admin@gmail.com",
      password: "123456",
    },
    {
      email: "neeraj.verma@acrossassist.com",
      password: "123456",
    },
  ];

  const handleloginValue = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = () => {
    // Validation
    if (!form.email.trim() || !form.password) {
      Swal.fire({
        title: "Please enter email and password",
        icon: "warning",
      });

      return;
    }

    // Find matching static user
    const user = staticUsers.find(
      (item) =>
        item.email.toLowerCase() === form.email.trim().toLowerCase() &&
        item.password === form.password
    );

    // Invalid login
    if (!user) {
      Swal.fire({
        title: "Invalid email or password",
        icon: "error",
      });

      return;
    }

    localStorage.setItem("AgentId", user.email);
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userType", "static");

    // Remove employee data if an employee was previously logged in
    localStorage.removeItem("employeeId");

    console.log("Static Login Success:", user.email);

    // Redirect
    navigator("/home");
  };

  return (
    <div className="login-page">

      {/* LEFT BANNER */}
      <div className="login-banner">
        <img
          src={cyber}
          alt="Across Assist"
          className="login-banner-image"
        />
      </div>

      {/* RIGHT LOGIN AREA */}
      <div className="login-right">

        <div className="login-card">

          {/* Logo */}
          <img
            src={logo}
            alt="Across Assist"
            className="login-logo"
          />

          {/* Welcome */}
          <h2 className="login-welcome">
            Welcome Back!
          </h2>

          <p className="login-subtitle">
            Sign in to access your Across Assist portal
          </p>

          {/* Username */}
          <div className="login-field">
            <input
              type="text"
              placeholder="UserName"
              name="email"
              value={form.email}
              onChange={handleloginValue}
              className="login-input"
            />
          </div>

          {/* Password */}
          <div className="login-field password-field">

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              name="password"
              value={form.password}
              onChange={handleloginValue}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleLogin();
                }
              }}
              className="login-input"
            />

            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <FaEyeSlash size={17} />
              ) : (
                <FaEye size={17} />
              )}
            </button>

          </div>

          {/* Login Button */}
          <button
            type="button"
            className="login-button"
            onClick={handleLogin}
          >
            LOGIN
          </button>

          {/* Forgot Password */}
          <button
            type="button"
            className="forgot-password"
          >
            Forgot Password? Click here
          </button>

        </div>

        {/* Footer */}
        <div className="login-footer">

          <div>
            By using this portal, you agree to our{" "}
            <span>Terms</span> and <span>Privacy Policy</span>.
          </div>

          <div>
            © 2024 - Across Assist. All rights reserved.
          </div>

        </div>

      </div>

    </div>
  );
};

export default Login;