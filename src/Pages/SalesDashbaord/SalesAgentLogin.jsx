import React, { useState } from "react";
import {
  PersonOutlineOutlined,
  LockOutlined,
  PhoneOutlined,
  VisibilityOutlined,
  VisibilityOffOutlined,
  LoginOutlined,
  SmsOutlined,
} from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "./SalesAgentLogin.css";
import { BASE_URL } from "../../api/API";

const SalesAgentLogin = () => {
  const navigate = useNavigate();

  const [loginType, setLoginType] = useState("email");

  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");

  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePasswordLogin = async (e) => {
    e.preventDefault();

    if (!userId.trim()) {
      toast.warning("Please enter User ID");
      return;
    }

    if (!password.trim()) {
      toast.warning("Please enter password");
      return;
    }

    try {
      setLoading(true);

      // TODO: Replace this with your login API
      /*
      const response = await axios.post(`${BASE_URL}/agent/login`, {
        userId,
        password,
      });

      if (!response.data?.success) {
        toast.error(response.data?.message || "Invalid credentials");
        return;
      }

      localStorage.setItem(
        "agentToken",
        response.data.token
      );

      localStorage.setItem(
        "agentDetails",
        JSON.stringify(response.data.agent)
      );
      */

      // Temporary success
      localStorage.setItem("agentUserId", userId);

      toast.success("Login successful");

      setTimeout(() => {
        navigate("/sales-visit-location-data");
      }, 500);
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Unable to login");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e?.preventDefault();

    if (loginType === "email") {
      if (!email.trim()) {
        toast.warning("Please enter your email");
        return;
      }
    }

    if (loginType === "mobile") {
      if (!/^\d{10}$/.test(mobile)) {
        toast.warning("Please enter a valid 10 digit mobile number");
        return;
      }
    }

    try {
      setLoading(true);

      const payload =
        loginType === "email"
          ? {
            email: email.trim(),
          }
          : {
            mobileNumber: mobile,
          };

      const response = await fetch(
        `${BASE_URL}/ReimbursementAgentOtp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const responseData = await response.json();

      console.log(
        "ReimbursementAgentOtp response:",
        responseData
      );

      if (response.ok) {
        setOtpSent(true);

        toast.success(
          responseData?.message || "OTP sent successfully"
        );
      } else {
        toast.error(
          responseData?.message || "Unable to send OTP"
        );
      }
    } catch (error) {
      console.error("Send OTP error:", error);

      toast.error("Unable to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpLogin = async (e) => {
    e.preventDefault();

    if (!otpSent) {
      await handleSendOtp();
      return;
    }

    if (!/^\d{4,6}$/.test(otp)) {
      toast.warning("Please enter a valid OTP");
      return;
    }

    try {
      setLoading(true);

      const queryParams =
        loginType === "email"
          ? new URLSearchParams({
            otp: otp,
          })
          : new URLSearchParams({
            otp: otp,
          });

      console.log(
        "VerifyLoginOTP query:",
        queryParams.toString()
      );

      const response = await fetch(
        `${BASE_URL}/VerifyLoginOTP?${queryParams.toString()}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const responseData = await response.json();

      console.log(
        "VerifyLoginOTP response:",
        responseData
      );

      if (responseData.status== true) {
        
       toast.success(responseData.message || "Success")
        if (responseData?.agent) {
          localStorage.setItem(
            "agentDetails",
            JSON.stringify(responseData.agent)
          );
        }

        localStorage.setItem(
          "employeeMobileNo",
          responseData?.employeeMobileNo
        );

      

        setTimeout(() => {
          navigate(`/sales-visit-location-data?EmployeeMobileNo=${responseData?.employeeMobileNo}`);
        }, 500);
      } else {
        toast.error(
          responseData?.message || "Invalid OTP"
        );
      }
    } catch (error) {
      console.error(
        "OTP verification error:",
        error
      );

      toast.error("Unable to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sales-agent-login-page">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        newestOnTop
        closeOnClick
        pauseOnHover
      />

      <div className="sales-agent-login-card">

        {/* Logo / Icon */}
        <div className="sales-agent-login-icon">
          <LoginOutlined />
        </div>

        <h3>Agent Visit</h3>

        <p className="sales-agent-login-subtitle">
          Login to continue your dealer visit
        </p>

        <div className="sales-agent-login-tabs">

          <button
            type="button"
            className={loginType === "email" ? "active" : ""}
            onClick={() => {
              setLoginType("email");
              setOtpSent(false);
              setOtp("");
            }}
          >
            <SmsOutlined />
            Email OTP
          </button>

          <button
            type="button"
            className={loginType === "mobile" ? "active" : ""}
            onClick={() => {
              setLoginType("mobile");
              setOtpSent(false);
              setOtp("");
            }}
          >
            <PhoneOutlined />
            Mobile OTP
          </button>

        </div>

        {(loginType === "email" || loginType === "mobile") && (
          <form onSubmit={handleOtpLogin}>

            {/* EMAIL */}
            {loginType === "email" && (
              <div className="sales-agent-login-field">
                <label>Email</label>

                <div className="sales-agent-login-input">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={otpSent}
                    autoComplete="email"
                  />
                </div>
              </div>
            )}

            {/* MOBILE */}
            {loginType === "mobile" && (
              <div className="sales-agent-login-field">
                <label>Mobile Number</label>

                <div className="sales-agent-login-input">
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="Enter 10 digit mobile number"
                    value={mobile}
                    onChange={(e) =>
                      setMobile(
                        e.target.value.replace(/\D/g, "")
                      )
                    }
                    disabled={otpSent}
                  />
                </div>
              </div>
            )}

            {/* OTP */}
            {otpSent && (
              <div className="sales-agent-login-field">
                <label>OTP</label>

                <div className="sales-agent-login-input">
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) =>
                      setOtp(
                        e.target.value.replace(/\D/g, "")
                      )
                    }
                    autoComplete="one-time-code"
                  />
                </div>

                <div className="sales-agent-otp-info">
                  {loginType === "email"
                    ? `OTP sent to ${email}`
                    : `OTP sent to +91 ${mobile}`}
                </div>
              </div>
            )}

            <button
              type="submit"
              className="sales-agent-login-btn"
              disabled={loading}
            >
              {loading
                ? "Please wait..."
                : otpSent
                  ? "Verify & Login"
                  : "Send OTP"}
            </button>

            {otpSent && (
              <button
                type="button"
                className="sales-agent-resend-btn"
                onClick={handleSendOtp}
                disabled={loading}
              >
                Resend OTP
              </button>
            )}

          </form>
        )}

        {/* MOBILE OTP LOGIN */}
        {/* {loginType === "mobile" && (
          <form onSubmit={handleOtpLogin}>

            <div className="sales-agent-login-field">
              <label>Mobile Number</label>

              <div className="sales-agent-login-input">
                <PhoneOutlined />

                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="Enter 10 digit mobile number"
                  value={mobile}
                  onChange={(e) =>
                    setMobile(
                      e.target.value.replace(
                        /\D/g,
                        ""
                      )
                    )
                  }
                />
              </div>
            </div>

            {otpSent && (
              <div className="sales-agent-login-field">
                <label>OTP</label>

                <div className="sales-agent-login-input">
                  <SmsOutlined />

                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) =>
                      setOtp(
                        e.target.value.replace(
                          /\D/g,
                          ""
                        )
                      )
                    }
                  />
                </div>

                <div className="sales-agent-otp-info">
                  OTP sent to +91 {mobile}
                </div>
              </div>
            )}

            <button
              type="submit"
              className="sales-agent-login-btn"
              disabled={loading}
            >
              {loading ? (
                "Please wait..."
              ) : otpSent ? (
                <>
                  <LoginOutlined />
                  Verify & Login
                </>
              ) : (
                <>
                  <SmsOutlined />
                  Send OTP
                </>
              )}
            </button>

            {otpSent && (
              <button
                type="button"
                className="sales-agent-resend-btn"
                onClick={handleSendOtp}
                disabled={loading}
              >
                Resend OTP
              </button>
            )}
          </form>
        )} */}

        <div className="sales-agent-login-footer">
          <span>Secure Agent Portal</span>
        </div>
      </div>
    </div>
  );
};

export default SalesAgentLogin;