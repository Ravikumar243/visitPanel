import React, { useEffect, useRef, useState } from "react";
import {
  ShieldOutlined,
  LocationOnOutlined,
  CameraAltOutlined,
  AccessTimeOutlined,
  DescriptionOutlined,
  PictureAsPdfOutlined,
  OpenInNewOutlined,
  CheckCircleOutlineOutlined
} from "@mui/icons-material";
import {
  PersonOutlineOutlined,
} from "@mui/icons-material";
import "./SalesAgentLocationData.css";
import { toast, ToastContainer } from "react-toastify";
import { BASE_URL } from "../../api/API";

const SalesAgentLocationData = () => {
  const [saving, setSaving] = useState("")
  const [currentStep, setCurrentStep] = useState(2);
  const [agentDetails, setAgentDetails] = useState(null);
  const [agentLoading, setAgentLoading] = useState(true);
  const [agentError, setAgentError] = useState("");
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [consentCompleted, setConsentCompleted] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);
  const [saveVisitLoading, setSaveVisitLoading] = useState(false)
  console.log(justSubmitted, "justSubmitted")

  console.log(currentStep, 'currentStepljsld')
  const [locationData, setLocationData] = useState({
    latitude: "",
    longitude: "",
    accuracy: "",
    address: "",
  });

  const [selfieImage, setSelfieImage] = useState("");
  const [selfieFile, setSelfieFile] = useState(null);
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraFacingMode, setCameraFacingMode] = useState("user");
  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [dealerName, setDealerName] = useState("");
  const [dealerMobile, setDealerMobile] = useState("");
  const [remarks, setRemarks] = useState("");
  const [visitDetails, setVisitDetails] = useState(null);
  const [visitDetailsCount, setVisitDetailsCont] = useState(null);
  const [visitDetailsLoading, setVisitDetailsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [visitId, setVisitId] = useState("V-8842");
  const [visitTime, setVisitTime] = useState("12:47 PM");

  const videoRef = useRef(null);
  const canvasRef = useRef(null);



  const hasValue = (value) => {
    return (
      value !== undefined &&
      value !== null &&
      value !== ""
    );
  };

  const getNextStepFromVisitDetails = (data) => {
    console.log("getNextStepFromVisitDetails DATA:", data);

    // First login -> base location
    if (agentDetails?.firstLogin === false) {
      return 1;
    }

    // No visit data -> Start Visit
    if (!data) {
      return 2;
    }

    const visit = data;

    // API 1 / Visit API uses isConsent
    const isConsent =
      visit?.isConsent === true ||
      visit?.IsConsent === true;

    const latitude = visit?.latitude ?? visit?.Latitude;
    const longitude = visit?.longitude ?? visit?.Longitude;
    const image = visit?.image ?? visit?.Image;
    const dealer = visit?.dealerName ?? visit?.DealerName;
    const isSubmitted =
      visit?.isSubmitted === true ||
      visit?.IsSubmitted === true;

    const hasLocation =
      hasValue(latitude) &&
      hasValue(longitude);

    const hasImage = hasValue(image);
    const hasDealer = hasValue(dealer);

    console.log("NEXT STEP CHECK:", {
      isConsent,
      isSubmitted,
      hasLocation,
      hasImage,
      hasDealer,
      latitude,
      longitude,
      image,
      dealer,
    });

    if (isSubmitted) {
      if (justSubmitted) {
        return 8;
      }

      return 2;
    }

    if (isConsent && !hasLocation && !hasImage && !hasDealer) {
      return 4;
    }

    // Location saved but selfie not captured
    // -> Step 5
    if (hasLocation && !hasImage) {
      return 5;
    }

    // Selfie + dealer details saved
    // -> Visit recorded
    if (hasImage && hasDealer) {
      return 8;
    }

    // Image exists but dealer details are not complete
    // -> Review screen
    if (hasImage) {
      return 7;
    }

    // Location exists
    // -> Location captured
    if (hasLocation) {
      return 5;
    }

    // Consent exists but something else is incomplete
    // -> Step 4
    if (isConsent) {
      return 4;
    }

    // Nothing started
    return 2;
  };

  const fetchAgentDetails = async () => {
    try {
      setAgentLoading(true);
      setAgentError("");


      const params = new URLSearchParams(window.location.search);
      const EmployeeMobileNo = params.get("EmployeeMobileNo");


      if (!EmployeeMobileNo) {
        console.log("MobileNo is missing from the URL.")
        setAgentError("MobileNo is missing from the URL.");
        return;
      }

      console.log("Agent MobileNo:", EmployeeMobileNo);

      const response = await fetch(
        `${BASE_URL}/GetAgentDetails?EmployeeMobileNo=${encodeURIComponent(EmployeeMobileNo)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch agent details");
      }

      const data = await response.json();

      if (data?.status === true) {
        const agentData = data?.data;

        setAgentDetails(agentData);

        if (agentData?.firstLogin === false) {
          setCurrentStep(1);
        } else if (agentData?.isConsent === true) {
          setCurrentStep(4);
        }
      }


    } catch (error) {
      console.error("GetAgentDetails Error:", error);
      setAgentError("Unable to load agent details.");
    } finally {
      setAgentLoading(false);
    }
  };

  useEffect(() => {


    fetchAgentDetails();
  }, []);


  console.log(agentDetails, "agentDetailskslkdf")
  const fetchVisitDetails = async () => {
    try {
      setVisitDetailsLoading(true);


      const employeeId = agentDetails?.employeeId

      if (!employeeId) {
        console.log("Employee ID not available");
        return;
      }

      const today = new Date();

      const formatDate = (date) => {
        return date.toISOString().split("T")[0];
      };

      const fromDate = formatDate(today);
      const toDate = formatDate(today);

      const queryParams = new URLSearchParams();

      queryParams.append("fromDate", fromDate);
      queryParams.append("toDate", toDate);
      queryParams.append("employeeId", employeeId);

      const response = await fetch(
        `${BASE_URL}/GetReimbursementAgentVisitDetails?${queryParams.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to fetch reimbursement visit details"
        );
      }

      const data = await response.json();

      if (data?.success === true) {
        const visit = data?.data?.[0];
        setVisitDetailsCont(data?.count)
        setVisitDetails(visit);



        const nextStep = getNextStepFromVisitDetails(data?.data[0]);

        console.log(
          "Saved visit data found. Opening step:",
          nextStep
        );

        setCurrentStep(nextStep);
      }

    } catch (error) {
      console.error(
        "GetReimbursementAgentVisitDetails Error:",
        error
      );
    } finally {
      setVisitDetailsLoading(false);
    }
  };

  useEffect(() => {

    fetchVisitDetails();
  }, [agentDetails]);

  const saveVisitDetails = async (updatedData = {}) => {
    try {
      setSaving(true);

      setSaveVisitLoading(true)
      const queryParams = new URLSearchParams();
      let imageFile = null;

      Object.entries(updatedData).forEach(([key, value]) => {
        if (
          key === "selfieImage" ||
          key === "image" ||
          key === "photo" ||
          key === "Image"
        ) {
          if (value instanceof File || value instanceof Blob) {
            imageFile = value;
          }
          return;
        }

        if (value === null || value === undefined) {
          return;
        }

        queryParams.append(key, String(value));
      });


      const formData = new FormData();

      if (imageFile) {
        formData.append(
          "Image",
          imageFile,
          imageFile.name || "selfie.jpg"
        );
      }

      const response = await fetch(
        `${BASE_URL}/SaveReimbursementAgent_VisitDetails?${queryParams.toString()}`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save visit details");
      }

      const result = await response.json();




      console.log(
        "SaveReimbursementAgent_VisitDetails Response:",
        result
      );

      setAgentDetails((prev) => ({
        ...(prev || {}),
        ...updatedData,
      }));

      return result;
    } catch (error) {
      console.error(
        "SaveReimbursementAgent_VisitDetails Error:",
        error
      );
      setSaveVisitLoading(false)

      alert("Unable to save visit details. Please try again.");

      throw error;
    } finally {
      setSaving(false);
      setSaveVisitLoading(false)
    }
  };

  const handleEnableBaseLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        const accuracy = position.coords.accuracy;

        console.log("Base Latitude:", latitude);
        console.log("Base Longitude:", longitude);
        console.log("Base Accuracy:", accuracy);

        try {
          setLocationData({
            latitude,
            longitude,
            accuracy,
            address: "Base location captured",
          });



          await saveVisitDetails({
            EmployeeId: agentDetails?.employeeId,
            Latitude: latitude,
            Longitude: longitude,
            Type: "Login",
          });

          await fetchAgentDetails();

          setCurrentStep(2);
        } catch (error) {
          console.error("Base location save error:", error);
          alert("Unable to save base location. Please try again.");
        } finally {
          setLocationLoading(false);
        }
      },

      (error) => {
        console.error("Base location error:", error);

        setLocationLoading(false);

        if (error.code === 1) {
          alert(
            "Location permission was denied. Please allow location access from your browser settings."
          );
        } else if (error.code === 2) {
          alert("Unable to get your current location.");
        } else {
          alert("Location request timed out.");
        }
      },

      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  const handleStartVisit = () => {
    if (agentDetails?.isConcent === true) {
      setCurrentStep(4)
      return;
    } else {
      setCurrentStep(3);
    }
  };

  const handleDownloadPolicy = () => {
    const link = document.createElement("a");

    link.href = "/Reimbursement_Policy_v3.pdf";
    link.download = "Reimbursement_Policy_v3.pdf";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  const handleContinue = async () => {
    if (!policyAccepted) return;

    try {
      await saveVisitDetails({
        IsConsent: true,
        EmployeeId: agentDetails?.employeeId,
        IsSubmitted: false,
      });

      setAgentDetails((prev) => ({
        ...(prev || {}),
        isConsent: true,
      }));

      setCurrentStep(4);
    } catch (error) {
      console.error(error);
    }
  };
  const handleEnableLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        const accuracy = position.coords.accuracy;

        console.log("Latitude:", latitude);
        console.log("Longitude:", longitude);
        console.log("Accuracy:", accuracy);

        try {
          // Save location in state
          setLocationData({
            latitude,
            longitude,
            accuracy,
            address: "Location captured",
          });

          // Save ONLY current screen data to API
          await saveVisitDetails({
            latitude,
            longitude,
            EmployeeId: agentDetails?.employeeId,
            IsSubmitted: false,
          });

          setCurrentStep(5);
        } catch (error) {
          console.error("Location save error:", error);
          alert("Unable to save location. Please try again.");
        } finally {
          setLocationLoading(false);
        }
      },

      (error) => {
        console.error("Location error:", error);

        setLocationLoading(false);

        if (error.code === 1) {
          alert(
            "Location permission was denied. Please allow location access from your browser settings."
          );
        } else if (error.code === 2) {
          alert("Unable to get your current location.");
        } else {
          alert("Location request timed out.");
        }
      },

      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };
  const handleOpenCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
        },
        audio: false,
      });

      setCameraStream(stream);
      setCameraFacingMode("user");


      setCurrentStep(6);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);

    } catch (error) {
      console.error("Camera error:", error);

      alert(
        "Camera permission is required. Please allow camera access."
      );
    }
  };

  const handleCaptureSelfie = async () => {
    const video = videoRef.current;

    if (!video) return;

    const canvas = document.createElement("canvas");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    try {
      const imageBlob = await new Promise((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Unable to create image"));
            }
          },
          "image/jpeg",
          0.9
        );
      });

      const imageFile = new File(
        [imageBlob],
        `selfie-${Date.now()}.jpg`,
        {
          type: "image/jpeg",
        }
      );

      // IMPORTANT:
      // Keep actual File for final submit API
      setSelfieFile(imageFile);

      // Only for preview
      const previewUrl = URL.createObjectURL(imageFile);
      setSelfieImage(previewUrl);

      // Stop camera
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => {
          track.stop();
        });
      }

      setCameraStream(null);

      const now = new Date();

      const formattedDate = now.toISOString().split("T")[0];

      const formattedTime = now.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      setCurrentDate(formattedDate);
      setCurrentTime(formattedTime);

      setCurrentStep(7);

    } catch (error) {
      console.error("Selfie capture error:", error);
      alert("Unable to capture selfie. Please try again.");
    }
  };

  const handleSwitchCamera = async () => {
    try {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => {
          track.stop();
        });
      }

      const newFacingMode =
        cameraFacingMode === "user"
          ? "environment"
          : "user";

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: newFacingMode,
          },
          audio: false,
        });

      setCameraStream(stream);
      setCameraFacingMode(newFacingMode);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

    } catch (error) {
      console.error("Camera switch error:", error);
    }
  };


  const handleSubmitVisit = async () => {

    try {
      if (!dealerName.trim()) {
        toast.warning("Dealer Name is required.");
        return;
      }

      if (!/^\d{10}$/.test(dealerMobile)) {
        toast.warning("Dealer Mobile Number must be exactly 10 digits.");
        return;
      }

      setSaving(true);


      const convertTo24Hour = (time) => {
        if (!time) return "";

        const [timePart, modifier] = time.split(" ");
        let [hours, minutes] = timePart.split(":");

        hours = parseInt(hours, 10);

        if (modifier?.toUpperCase() === "PM" && hours !== 12) {
          hours += 12;
        }

        if (modifier?.toUpperCase() === "AM" && hours === 12) {
          hours = 0;
        }

        return `${String(hours).padStart(2, "0")}:${minutes}`;
      };

      await saveVisitDetails({
        EmployeeId: agentDetails?.employeeId,
        Date: currentDate,
        Time: convertTo24Hour(currentTime),
        DealerName: dealerName.trim(),
        DealerMobileNo: dealerMobile.trim(),
        Remark: remarks,
        Image: selfieFile,
        IsSubmitted: true,
      });

      setJustSubmitted(true);

      setCurrentStep(8);
    } catch (error) {
      console.error("Submit visit error:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleLogAnotherVisit = () => {
    setIsSubmitted(false);
    setDealerName("");
    setDealerMobile("");
    setRemarks("");
    setSelfieImage("");
    setSelfieFile(null);

    setCurrentStep(2);
  };

  const handleBackStep = () => {
    switch (currentStep) {
      case 5:
        // Location captured -> Start Visit
        setCurrentStep(2);
        break;

      case 7:
        setCurrentStep(5);
        break;

      default:
        break;
    }
  };

  const getInitials = (name = "") => {
    return name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0].toUpperCase())
      .join("");
  };

  return (
    <div className="sales-agent-page">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        newestOnTop
        closeOnClick
        pauseOnHover
      />
      <div className="sales-agent-card">

        {currentStep === 1 && (
          <>
            <div className="sales-agent-progress">
              Step 1 of 8 · Share base location
            </div>

            <div className="base-location-content">

              <div className="base-location-icon">
                <LocationOnOutlined />
              </div>

              <h2>Share your base location</h2>

              <p className="base-location-description">
                Before starting your first visit, we need to capture
                your current base location.
              </p>

              <div className="base-location-info-card">

                <div className="base-location-info-icon">
                  <LocationOnOutlined />
                </div>

                <div>
                  <h4>Why do we need this?</h4>

                  <p>
                    Your base location helps us verify your starting
                    location and manage your dealer visits accurately.
                  </p>
                </div>

              </div>

              <div className="base-location-permission-card">

                <div className="base-location-permission-header">
                  <span className="permission-dot"></span>

                  <span>Location permission</span>
                </div>

                <div className="base-location-permission-text">
                  This website wants to access your current location.
                </div>

                <div className="base-location-permission-actions">

                  <button
                    type="button"
                    className="base-location-block-btn"
                  >
                    Block
                  </button>

                  <button
                    type="button"
                    className="base-location-allow-btn"
                    onClick={handleEnableBaseLocation}
                    disabled={locationLoading}
                  >
                    {locationLoading
                      ? "Getting location..."
                      : "Allow"}
                  </button>

                </div>

              </div>

            </div>

            <div className="base-location-footer">

              <button
                type="button"
                className="base-location-continue-btn"
                onClick={handleEnableBaseLocation}
                disabled={locationLoading}
              >
                {locationLoading
                  ? "Getting location..."
                  : "Share location & continue"}
              </button>

            </div>
          </>
        )}

        {currentStep === 2 && (
          <>
            <div className="sales-agent-progress">
              Step 2 of 8 · Start visit
            </div>

            <div className="sales-agent-content">

              <div className="sales-agent-icon-box">
                <ShieldOutlined />
              </div>

              <h2>
                Hi {agentDetails?.employeeName} <span>👋</span>
              </h2>

              <p className="sales-agent-description">
                Mark your dealer visit for today. This link is unique
                to you and expires at midnight.
              </p>

              <div className="sales-agent-requirements">

                <div className="sales-agent-requirement">
                  <LocationOnOutlined />
                  <span>Live location required</span>
                </div>

                <div className="sales-agent-requirement">
                  <CameraAltOutlined />
                  <span>Live selfie required</span>
                </div>



              </div>
            </div>

            <div className="sales-agent-footer">
              <button
                type="button"
                onClick={handleStartVisit}
                className="sales-agent-start-btn"
              >
                Start visit
              </button>
            </div>
          </>
        )}

        {currentStep === 3 && agentDetails?.isConcent !== true && (
          <>
            <div className="sales-agent-progress">
              Step 3 of 8 · Policy consent
            </div>

            <div className="policy-content">

              <div className="sales-agent-icon-box">
                <DescriptionOutlined />
              </div>

              <h2>Reimbursement Policy</h2>

              <p className="policy-description">
                Before you begin, please review the company
                reimbursement policy for dealer visits.
              </p>

              <div className="policy-pdf-card">

                <div className="policy-pdf-icon">
                  <PictureAsPdfOutlined />
                </div>

                <div className="policy-pdf-info"
                  onClick={handleDownloadPolicy}
                  role="button"
                  tabIndex={0}
                >
                  <div className="policy-pdf-name" >
                    Reimbursement_Policy_v3.pdf
                  </div>

                  <div className="policy-pdf-meta">
                    HR-POL-2026-14 · 2 pages
                  </div>
                </div>

                <OpenInNewOutlined className="policy-open-icon" />

              </div>

              <p className="policy-help-text">
                Tap the document above to open and read the full policy
                before accepting.
              </p>

            </div>

            <div className="policy-footer">

              <div className="policy-divider"></div>

              <label className="policy-checkbox-row">

                <input
                  type="checkbox"
                  checked={policyAccepted}
                  onChange={(e) =>
                    setPolicyAccepted(e.target.checked)
                  }
                />

                <span>
                  I have read and agree to the reimbursement
                  policy
                </span>

              </label>

              <button
                type="button"
                disabled={!policyAccepted}
                onClick={handleContinue}
                className={`policy-continue-btn ${policyAccepted ? "active" : ""
                  }`}
              >
                Continue
              </button>

            </div>
          </>
        )}

        {currentStep === 4 && (
          <>
            <div className="sales-agent-progress">
              Step 4 of 8 · Share location
            </div>

            <div className="location-content">

              {/* LOCATION ICON */}
              <div className="sales-agent-icon-box">
                <LocationOnOutlined />
              </div>

              {/* TITLE */}
              <h2>Share your location</h2>

              <p className="location-description">
                We need your GPS to verify which dealer you
                visited.
              </p>

              {/* BROWSER PERMISSION MOCKUP */}
              <div className="location-permission-box">

                <div className="permission-domain">
                  <span className="permission-dot"></span>
                  <span>att.crm.co</span>
                </div>

                <div className="permission-question">
                  att.crm.co wants to know your location
                </div>

                <div className="permission-buttons">
                  <button type="button">
                    Block
                  </button>

                  <button
                    type="button"
                    onClick={handleEnableLocation}
                  >
                    Allow
                  </button>
                </div>

              </div>

            </div>

            {/* BOTTOM BUTTON */}
            <div className="location-footer">

              <button
                type="button"
                onClick={handleEnableLocation}
                className="location-enable-btn"
                disabled={locationLoading}
              >
                {locationLoading
                  ? "Getting location..."
                  : "Enable location"}
              </button>

            </div>
          </>
        )}




        {currentStep === 5 && (
          <>
            <div className="sales-agent-progress">
              Step 5 of 8 · Location captured
            </div>

            <div className="location-captured-content">

              {/* LOCATION ICON */}
              <div className="location-captured-icon">
                <LocationOnOutlined />
              </div>

              {/* TITLE */}
              <h2>Location captured</h2>

              {/* LOCATION DETAILS */}
              <div className="location-details-card">

                <div className="location-address">
                  {locationData.locationAddress || "Location captured"}
                </div>

                <div className="location-coordinate">
                  Latitude:{" "}
                  {Number(visitDetails?.latitude).toFixed(6)}
                </div>

                <div className="location-coordinate">
                  Longitude:{" "}
                  {Number(visitDetails?.longitude).toFixed(6)}
                </div>

                {/* <div className="location-coordinate">
                  Accuracy: ±{" "}
                  {Math.round(locationData.accuracy)} metres
                </div> */}

              </div>

              {/* NEXT STEP */}
              <div className="location-next-step">
                <CameraAltOutlined />

                <span>
                  Next: take a live selfie
                </span>
              </div>

            </div>

            {/* FOOTER */}
            <div className="location-footer">

              <button
                type="button"
                className="location-enable-btn"
                onClick={handleOpenCamera}
              >
                Open camera
              </button>

            </div>
          </>
        )}

        {currentStep === 6 && (
          <div className="selfie-camera-screen">

            {/* TOP BAR */}
            <div className="selfie-camera-topbar">
              <button
                type="button"
                className="camera-close-btn"
                onClick={() => setCurrentStep(5)}
              >
                ×
              </button>

              <div className="camera-type-badge">
                Front camera
              </div>

              <button
                type="button"
                className="camera-switch-btn"
                onClick={handleSwitchCamera}
              >
                ↻
              </button>
            </div>

            {/* CAMERA */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="selfie-video"
            />

            {/* CAPTURE BUTTON */}
            <div className="selfie-camera-footer">
              <button
                type="button"
                className="selfie-capture-btn"
                onClick={handleCaptureSelfie}
              >
                <span></span>
              </button>
            </div>

          </div>
        )}

        {currentStep === 7 && (
          <div className="review-submit-screen">

            <div className="sales-agent-progress">
              Step 7 of 8 · Review & submit
            </div>

            <div className="review-scroll-content">

              <h2>Review and submit</h2>

              {/* SELFIE */}
              <div className="review-selfie-card">
                {selfieImage ? (
                  <img
                    src={selfieImage}
                    alt="Selfie"
                    className="review-selfie-image"
                  />
                ) : (
                  <div className="review-selfie-placeholder">
                    <PersonOutlineOutlined />
                  </div>
                )}

                <div className="selfie-captured-badge">
                  ✓ Selfie captured
                </div>
              </div>

              {/* USER */}
              <div className="review-user-card">
                <div className="review-avatar">
                  {getInitials(visitDetails?.employeeName)}
                </div>

                <div>
                  <div className="review-user-name">
                    {visitDetails?.employeeName}
                  </div>

                  {/* <div className="review-user-meta">
                    E1023 · +91 XXXXX 1234
                  </div> */}
                </div>
              </div>
              <div className="review-dealer-fields">

                <div className="review-dealer-field">
                  <label>Dealer Name *</label>

                  <input
                    type="text"
                    value={dealerName}
                    onChange={(e) => setDealerName(e.target.value)}
                    placeholder="Dealer Name"
                    required
                  />
                </div>

                <div className="review-dealer-field">
                  <label>Dealer Mobile *</label>

                  <input
                    type="tel"
                    value={dealerMobile}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                      setDealerMobile(value);
                    }}
                    placeholder="Dealer Mobile"
                    maxLength={10}
                    required
                  />
                </div>

              </div>
              <div className="review-grid">

                <div className="review-info-card">
                  <span>DATE</span>
                  <strong>{currentDate}</strong>
                </div>

                <div className="review-info-card">
                  <span>TIME</span>
                  <strong>{currentTime}</strong>
                </div>

                <div className="review-info-card">
                  <span>LATITUDE</span>
                  <strong>{visitDetails?.latitude}</strong>
                </div>

                <div className="review-info-card">
                  <span>LONGITUDE</span>
                  <strong>{visitDetails?.longitude}</strong>
                </div>

              </div>

              {/* LOCATION */}
              <div className="review-location-card">
                <span>LOCATION</span>
                <strong>{visitDetails?.locationAddress}</strong>
              </div>

              {/* REMARKS */}
              <div className="review-remarks">
                <label>Remarks (optional)</label>

                <textarea
                  name="remark"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Add any notes..."
                  rows={3}
                />
              </div>

            </div>

            {/* SUBMIT */}
            <div className="review-submit-footer">
              <button
                type="button"
                className="review-submit-btn"
                onClick={handleSubmitVisit}
                disabled = {saveVisitLoading}
              >
                {saveVisitLoading ? "Submitting" : "Submit visit"}
              </button>
            </div>

          </div>
        )}

        {currentStep === 8 && (
          <>
            <div className="sales-agent-progress">
              Step 8 of 8 · Visit recorded
            </div>

            <div className="visit-recorded-content">

              {/* SUCCESS ICON */}
              <div className="visit-success-icon">
                <CheckCircleOutlineOutlined />
              </div>

              {/* TITLE */}
              <h2>Visit recorded</h2>

              <p className="visit-recorded-description">
                This is your {visitDetailsCount} visit today
              </p>

              {/* VISIT DETAILS */}
              <div className="visit-details-card">

                <div className="visit-detail-row">
                  <span>Time</span>
                  <strong>{visitDetails?.visitTime}</strong>
                </div>

                <div className="visit-detail-row">
                  <span>Location</span>
                  <strong>{visitDetails?.locationAddress}</strong>
                </div>

              </div>

            </div>

            {/* FOOTER */}
            <div className="visit-recorded-footer">

              <button
                type="button"
                className="visit-another-btn"
                onClick={handleLogAnotherVisit}
              >
                Log another visit
              </button>

              <div className="visit-expiry-text">
                Link stays active till midnight
              </div>

            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SalesAgentLocationData;