import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./EmployeeLogin.css";
import { BASE_URL } from "../../api/API";
import cyber from "../../assets/cyber.png"
import logo from "../../assets/logo.png";

const EmployeeLogin = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");

    const [showOtp, setShowOtp] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Change this according to your project
    const baseURL = import.meta.env.VITE_API_BASE_URL;

 
    const handleSendOtp = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (!email.trim()) {
            setError("Please enter your email");
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email.trim())) {
            setError("Please enter a valid email address");
            return;
        }

        try {
            setLoading(true);

            const response = await axios.post(
                `${BASE_URL}/ReimbursementAgentOtp`,
                {
                    email: email.trim(),
                    mobileNumber: "",
                }
            );

            console.log("Send OTP Response:", response.data);

            setShowOtp(true);
            setSuccess("OTP sent successfully to your email");
        } catch (error) {
            console.error("Send OTP Error:", error);

            setError(
                error?.response?.data?.message ||
                "Unable to send OTP. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };


    const handleVerifyOtp = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (!otp.trim()) {
            setError("Please enter OTP");
            return;
        }

        try {
            setLoading(true);

            const response = await axios.post(
                `${BASE_URL}/VerifyLoginOTP?otp=${encodeURIComponent(
                    otp.trim()
                )}`,
                {
                    email: email.trim(),
                }
            );

            console.log("Verify OTP Response:", response.data);


            if (response.data.status === true) {

                localStorage.setItem("isLoggedIn", "true");
                localStorage.setItem("userType", "employee");


                localStorage.setItem(
                    "employeeId",
                    response.data.employeeId
                );

                localStorage.removeItem("AgentId");

                setSuccess("Login successful");

                navigate("/dashboard", {
                    replace: true,
                });
            }


        } catch (error) {
            console.error("Verify OTP Error:", error);

            setError(
                error?.response?.data?.message ||
                "Invalid OTP. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    /* =========================================================
       CHANGE EMAIL
    ========================================================= */
    const handleChangeEmail = () => {
        setShowOtp(false);
        setOtp("");
        setError("");
        setSuccess("");
    };

    return (
        <div className="employee-login-page">

            <div className="employee-login-banner">
                <img
                    src={cyber}
                    alt="Across Assist"
                    className="employee-login-banner-image"
                />
            </div>


            {/* =====================================================
        RIGHT LOGIN AREA
    ===================================================== */}
            <div className="employee-login-right">

                <div className="employee-login-card">

                    {/* Logo */}
                    <img
                        src={logo}
                        alt="Across Assist"
                        className="employee-login-logo"
                    />


                    {/* Header */}
                    <div className="employee-login-header">

                        <h2>Employee Login</h2>

                        <p>
                            Login using your registered email
                        </p>

                    </div>


                    {/* Error */}
                    {error && (
                        <div className="employee-login-error">
                            {error}
                        </div>
                    )}


                    {/* Success */}
                    {success && (
                        <div className="employee-login-success">
                            {success}
                        </div>
                    )}


                    {/* =================================================
            EMAIL FORM
        ================================================= */}
                    {!showOtp ? (

                        <form onSubmit={handleSendOtp}>

                            <div className="employee-form-group">

                                <input
                                    type="email"
                                    placeholder="UserName"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    autoComplete="email"
                                />

                            </div>


                            <button
                                type="submit"
                                className="employee-login-btn"
                                disabled={loading}
                            >
                                {loading ? "Sending OTP..." : "SEND OTP"}
                            </button>

                        </form>

                    ) : (

                        /* =================================================
                           OTP FORM
                        ================================================= */

                        <form onSubmit={handleVerifyOtp}>

                            <div className="employee-email-display">

                                OTP sent to

                                <strong>
                                    {email}
                                </strong>

                            </div>


                            <div className="employee-form-group">

                                <input
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={6}
                                    placeholder="Enter OTP"
                                    value={otp}
                                    onChange={(e) =>
                                        setOtp(
                                            e.target.value.replace(/\D/g, "")
                                        )
                                    }
                                    autoFocus
                                />

                            </div>


                            <button
                                type="submit"
                                className="employee-login-btn"
                                disabled={loading}
                            >
                                {loading
                                    ? "VERIFYING..."
                                    : "VERIFY & LOGIN"}
                            </button>


                            <button
                                type="button"
                                className="employee-change-email"
                                onClick={handleChangeEmail}
                            >
                                Change Email
                            </button>

                        </form>

                    )}

                </div>


                {/* =====================================================
          FOOTER
      ===================================================== */}
                <div className="employee-login-footer">

                    <div>
                        By using this portal, you agree to our{" "}
                        <span>Terms</span> and{" "}
                        <span>Privacy Policy</span>.
                    </div>

                    <div>
                        © 2024 - Across Assist. All rights reserved.
                    </div>

                </div>

            </div>

        </div>
    );
};

export default EmployeeLogin;