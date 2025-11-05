import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  useMediaQuery,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./Attendance.css";
import { toast } from "react-toastify";
import Webcam from "react-webcam";
import axios from "axios";

export default function Attendance() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [attendanceData, setAttendanceData] = useState([]);
  const [showWebcam, setShowWebcam] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentAction, setCurrentAction] = useState("check_in");
  const [isLoading, setIsLoading] = useState(true);
  const webcamRef = useRef(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // ✅ FIXED: Changed to port 5001
  const API_URL = "http://127.0.0.1:5001";

  // Get employee ID from localStorage
  const empId = localStorage.getItem("emp_id") || "";

  const today = new Date();
  const isSameDay = (d1, d2) =>
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear();

  // Fetch attendance data on component mount
  useEffect(() => {
    if (!empId) {
      toast.error("Employee ID not found. Please login again.");
      navigate("/login");
      return;
    }
    fetchAttendanceData();
  }, [empId]);

  const fetchAttendanceData = async () => {
    try {
      setIsLoading(true);
      console.log("📡 Fetching attendance for:", empId);
      
      const response = await axios.get(`${API_URL}/get_attendance`, {
        params: { emp_id: empId },
      });
      
      console.log("✅ Fetched attendance data:", response.data);
      
      if (response.data && response.data.records) {
        const formattedData = response.data.records.map((record) => ({
          date: new Date(record.date).toDateString(),
          checkIn: record.check_in_time || "--:--:--",
          checkOut: record.check_out_time || "--:--:--",
          status: record.status,
          updatedAt: record.updated_at,
        }));
        
        setAttendanceData(formattedData);
        console.log("📊 Formatted attendance data:", formattedData);
      } else {
        setAttendanceData([]);
      }
    } catch (error) {
      console.error("❌ Error fetching attendance:", error);
      toast.error("Failed to fetch attendance data");
      setAttendanceData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (date) => {
    if (!isSameDay(date, today)) {
      toast.warning("You can only mark attendance for today!");
      return;
    }
    setSelectedDate(date);
  };

  const captureAndMarkAttendance = async () => {
    if (!webcamRef.current) {
      toast.error("Webcam not ready");
      return;
    }

    if (!empId) {
      toast.error("Employee ID not found. Please login again.");
      return;
    }

    setIsProcessing(true);

    try {
      const imageSrc = webcamRef.current.getScreenshot();
      
      if (!imageSrc) {
        toast.error("Failed to capture image");
        setIsProcessing(false);
        return;
      }

      console.log("📤 Sending attendance request:", {
        action: currentAction,
        emp_id: empId,
        imageLength: imageSrc.length
      });

      // ✅ FIXED: Added emp_id to the request
      const response = await axios.post(`${API_URL}/mark_attendance`, {
        image: imageSrc,
        action: currentAction,
        emp_id: empId,  // ✅ This was missing!
      });

      console.log("✅ Attendance response:", response.data);

      if (response.data.success) {
        toast.success(response.data.message);
        setShowWebcam(false);
        
        // Wait a bit for the database to update, then refresh
        setTimeout(async () => {
          await fetchAttendanceData();
        }, 500);
      }
    } catch (error) {
      console.error("❌ Attendance error:", error);
      
      if (error.response) {
        const errorMsg = error.response.data.error || "Face recognition failed";
        console.error("Server error:", error.response.data);
        toast.error(errorMsg);
      } else if (error.request) {
        console.error("Network error - no response from server");
        toast.error("Cannot connect to server. Please check if Flask is running on port 5001.");
      } else {
        console.error("Request error:", error.message);
        toast.error("Network error. Please try again.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheckIn = () => {
    if (!empId) {
      toast.error("Employee ID not found. Please login again.");
      navigate("/login");
      return;
    }

    const dateStr = selectedDate.toDateString();
    const exists = attendanceData.find((d) => d.date === dateStr);
    
    if (exists && exists.checkIn !== "--:--:--") {
      toast.info("You have already checked in today.");
      return;
    }

    setCurrentAction("check_in");
    setShowWebcam(true);
  };

  const handleCheckOut = () => {
    if (!empId) {
      toast.error("Employee ID not found. Please login again.");
      navigate("/login");
      return;
    }

    const dateStr = selectedDate.toDateString();
    const exists = attendanceData.find((d) => d.date === dateStr);
    
    if (!exists || exists.checkIn === "--:--:--") {
      toast.warning("Please check in first!");
      return;
    }

    if (exists.checkOut !== "--:--:--") {
      toast.info("You have already checked out today.");
      return;
    }

    setCurrentAction("check_out");
    setShowWebcam(true);
  };

  const handleLeaveRequest = () => {
    navigate("/employee/leave");
  };

  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const entry = attendanceData.find((d) => d.date === date.toDateString());
      if (entry) {
        return (
          <div
            className={`attendance-tile-status ${
              entry.status === "Present" 
                ? "attendance-present" 
                : entry.status === "Leave" 
                ? "attendance-leave" 
                : ""
            } ${isSameDay(date, selectedDate) ? "attendance-selected" : ""}`}
          >
            {entry.status}
          </div>
        );
      }
    }
    return null;
  };

  const tileDisabled = ({ date, view }) => {
    if (view === "month") {
      // Disable all dates except today
      return !isSameDay(date, today);
    }
    return false;
  };

  return (
    <Box className="attendance-container">
      <Grid container spacing={4}>
        {/* Left Side - Calendar */}
        <Grid item xs={12} md={4}>
          <Card className="attendance-calendar-card">
            <Calendar
              onClickDay={handleDateChange}
              value={selectedDate}
              tileContent={tileContent}
              tileDisabled={tileDisabled}
              calendarType="gregory"
              nextLabel="›"
              prevLabel="‹"
              next2Label={null}
              prev2Label={null}
              showNeighboringMonth={false}
              formatShortWeekday={(locale, date) =>
                ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"][date.getDay()]
              }
              tileClassName={({ date, view }) => {
                if (view === "month") {
                  if (isSameDay(date, selectedDate)) {
                    return "react-calendar__tile--active";
                  }
                  
                  const entry = attendanceData.find((d) => d.date === date.toDateString());
                  if (entry) {
                    return "attendance-marked-tile";
                  }
                  
                  if (tileDisabled({ date, view })) {
                    return "react-calendar__tile--disabled";
                  }
                }
                return null;
              }}
            />
          </Card>

          <Box className={`attendance-btn-group ${isMobile ? "mobile" : ""}`}>
            <Button
              variant="contained"
              className="attendance-btn attendance-check-in-btn"
              onClick={handleCheckIn}
              disabled={isLoading}
            >
              Check-In with Face
            </Button>

            <Button
              variant="contained"
              className="attendance-btn attendance-check-out-btn"
              onClick={handleCheckOut}
              disabled={isLoading}
            >
              Check-Out with Face
            </Button>

            <Button
              variant="outlined"
              className="attendance-btn attendance-leave-btn"
              onClick={handleLeaveRequest}
            >
              Mark Leave
            </Button>
          </Box>
        </Grid>

        {/* Right Side - Attendance Table */}
        <Grid item xs={12} md={8}>
          <TableContainer component={Paper} elevation={4}>
            <Table>
              <TableHead>
                <TableRow className="attendance-table-header">
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Check-In Time</TableCell>
                  <TableCell>Check-Out Time</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <CircularProgress size={24} />
                      <span style={{ marginLeft: 10 }}>Loading...</span>
                    </TableCell>
                  </TableRow>
                ) : attendanceData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No attendance records found
                    </TableCell>
                  </TableRow>
                ) : (
                  attendanceData.map((row, index) => (
                    <TableRow 
                      key={index} 
                      hover
                      className={row.checkOut !== "--:--:--" ? "recently-updated-row" : ""}
                    >
                      <TableCell>{row.date}</TableCell>
                      <TableCell>
                        <span
                          className={
                            row.status === "Present"
                              ? "status-badge status-present"
                              : row.status === "Leave"
                              ? "status-badge status-leave"
                              : "status-badge"
                          }
                        >
                          {row.status}
                        </span>
                      </TableCell>
                      <TableCell>{row.checkIn}</TableCell>
                      <TableCell>
                        <span className={row.checkOut !== "--:--:--" ? "checkout-time-updated" : ""}>
                          {row.checkOut}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Button
            variant="contained"
            className="attendance-cancel-btn"
            onClick={() => navigate("/employee/dashboard")}
          >
            Back to Dashboard
          </Button>
        </Grid>
      </Grid>

      {/* Webcam Dialog */}
      <Dialog
        open={showWebcam}
        onClose={() => !isProcessing && setShowWebcam(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {currentAction === "check_in" ? "Check-In" : "Check-Out"} - Face Recognition
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: "center", py: 2 }}>
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
                maxWidth: "500px",
                borderRadius: "8px",
              }}
            />
            {isProcessing && (
              <Box sx={{ mt: 2 }}>
                <CircularProgress />
                <p>Processing face recognition...</p>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setShowWebcam(false)}
            disabled={isProcessing}
            className="attendance-cancel-btn"
          >
            Cancel
          </Button>
          <Button
            onClick={captureAndMarkAttendance}
            variant="contained"
            className="attendance-btn"
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "Capture & Mark"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Debug Info Box (only in development) */}
      {process.env.NODE_ENV === "development" && (
        <Box
          sx={{
            position: "fixed",
            bottom: 10,
            right: 10,
            p: 2,
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            borderRadius: 2,
            border: "1px solid #ccc",
            fontSize: "12px",
            maxWidth: "300px",
          }}
        >
          <div><strong>Debug Info:</strong></div>
          <div>API URL: {API_URL}</div>
          <div>Employee ID: {empId || "Not set"}</div>
          <div>Records: {attendanceData.length}</div>
        </Box>
      )}
    </Box>
  );
}