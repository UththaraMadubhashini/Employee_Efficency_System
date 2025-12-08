import React, { useState, useRef } from "react";
import {
  Box,
  Button,
  Card,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import Webcam from "react-webcam";
import axios from "axios";
import { toast } from "react-toastify";

export default function EmployeeRegistration() {
  const [formData, setFormData] = useState({
    emp_id: "",
    name: "",
    email: "",
  });
  const [showWebcam, setShowWebcam] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const webcamRef = useRef(null);

  const API_URL = "http://localhost:5001";

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const capturePhoto = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);
    setShowWebcam(false);
    toast.success("Photo captured successfully!");
  };

  const handleSubmit = async () => {
    if (!formData.emp_id || !formData.name || !capturedImage) {
      toast.error("Please fill all required fields and capture your photo");
      return;
    }

    setIsProcessing(true);

    try {
      const response = await axios.post(`${API_URL}/register_face`, {
        emp_id: formData.emp_id,
        image: capturedImage,
      });

      if (response.data.success) {
        toast.success(response.data.message || "Face registered successfully!");
        // Reset form
        setFormData({ emp_id: "", name: "", email: "" });
        setCapturedImage(null);
      }
    } catch (error) {
      console.error("Registration error:", error);
      if (error.response) {
        toast.error(error.response.data.error || "Registration failed");
      } else {
        toast.error("Network error. Please try again.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#f5f7fa",
        padding: 3,
      }}
    >
      <Card
        sx={{
          maxWidth: 600,
          width: "100%",
          padding: 4,
          borderRadius: 3,
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        }}
      >
        <Typography variant="h4" align="center" gutterBottom sx={{ color: "#67bce0", fontWeight: 700 }}>
          Employee Face Registration
        </Typography>
        <Typography variant="body2" align="center" color="textSecondary" sx={{ mb: 3 }}>
          Register your face for attendance tracking. Make sure you're already registered as an employee in Firebase.
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Employee ID"
            name="emp_id"
            value={formData.emp_id}
            onChange={handleInputChange}
            fullWidth
            required
            variant="outlined"
            sx={{
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": {
                  borderColor: "#67bce0",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#67bce0",
                },
              },
            }}
          />

          <TextField
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            fullWidth
            variant="outlined"
            
            sx={{
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": {
                  borderColor: "#67bce0",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#67bce0",
                },
              },
            }}
          />

          <TextField
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            fullWidth
            variant="outlined"
            sx={{
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": {
                  borderColor: "#67bce0",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#67bce0",
                },
              },
            }}
          />

          {/* Captured Image Preview */}
          {capturedImage && (
            <Box sx={{ textAlign: "center", mt: 2 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: "#4caf50" }}>
                ✓ Photo Captured Successfully
              </Typography>
              <img
                src={capturedImage}
                alt="Captured"
                style={{
                  width: "100%",
                  maxWidth: "300px",
                  borderRadius: "12px",
                  border: "3px solid #4caf50",
                  boxShadow: "0 4px 12px rgba(76, 175, 80, 0.3)",
                }}
              />
            </Box>
          )}

          {/* Webcam View */}
          {showWebcam && (
            <Box sx={{ textAlign: "center", mt: 2 }}>
              <Typography variant="body2" sx={{ mb: 2, fontWeight: 600, color: "#67bce0" }}>
                Position your face in the frame
              </Typography>
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                videoConstraints={{
                  width: 640,
                  height: 480,
                  facingMode: "user",
                }}
                style={{
                  width: "100%",
                  maxWidth: "400px",
                  borderRadius: "12px",
                  border: "2px solid #67bce0",
                }}
              />
              <Box sx={{ display: "flex", gap: 2, justifyContent: "center", mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => setShowWebcam(false)}
                  sx={{
                    borderColor: "#757575",
                    color: "#757575",
                    fontWeight: 600,
                    "&:hover": {
                      borderColor: "#616161",
                      backgroundColor: "rgba(117, 117, 117, 0.1)",
                    },
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={capturePhoto}
                  sx={{
                    backgroundColor: "#4caf50",
                    color: "white",
                    fontWeight: 600,
                    "&:hover": {
                      backgroundColor: "#388e3c",
                    },
                  }}
                >
                  Capture Photo
                </Button>
              </Box>
            </Box>
          )}

          {/* Action Buttons */}
          {!showWebcam && !capturedImage && (
            <Button
              variant="outlined"
              onClick={() => setShowWebcam(true)}
              sx={{
                mt: 2,
                borderColor: "#67bce0",
                color: "#67bce0",
                fontWeight: 600,
                padding: "12px",
                fontSize: "15px",
                "&:hover": {
                  borderColor: "#4a9fbe",
                  backgroundColor: "rgba(103, 188, 224, 0.1)",
                },
              }}
            >
              📷 Open Camera to Capture Photo
            </Button>
          )}

          {capturedImage && !showWebcam && (
            <Button
              variant="outlined"
              onClick={() => {
                setCapturedImage(null);
                setShowWebcam(true);
              }}
              sx={{
                mt: 1,
                borderColor: "#ff9800",
                color: "#ff9800",
                fontWeight: 600,
                "&:hover": {
                  borderColor: "#f57c00",
                  backgroundColor: "rgba(255, 152, 0, 0.1)",
                },
              }}
            >
              🔄 Retake Photo
            </Button>
          )}

          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isProcessing || !capturedImage || !formData.emp_id}
            sx={{
              mt: 2,
              backgroundColor: "#67bce0",
              color: "white",
              fontWeight: 700,
              padding: "14px",
              fontSize: "16px",
              boxShadow: "0 4px 12px rgba(103, 188, 224, 0.3)",
              "&:hover": {
                backgroundColor: "#4a9fbe",
                boxShadow: "0 6px 16px rgba(103, 188, 224, 0.4)",
              },
              "&:disabled": {
                backgroundColor: "#ccc",
                color: "#666",
              },
            }}
          >
            {isProcessing ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1, color: "white" }} />
                Registering Face...
              </>
            ) : (
              "✓ Register Face for Attendance"
            )}
          </Button>
        </Box>
      </Card>
    </Box>
  );
}