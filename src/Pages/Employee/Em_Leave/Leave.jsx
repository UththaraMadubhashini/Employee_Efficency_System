// src/pages/Employee/Leave.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  useMediaQuery,
  useTheme,
  CircularProgress,
  Chip,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const calendarStyles = {
  calendarContainer: {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    borderRadius: 10,
    overflow: "hidden",
  },
  calendar: {
    width: "100%",
    border: "none",
  },
};

export default function Leave() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [openDialog, setOpenDialog] = useState(false);
  const [leaveList, setLeaveList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const API_URL = "http://127.0.0.1:5001";
  const empId = localStorage.getItem("emp_id") || "";
  const empName = localStorage.getItem("name") || "";
  const empDesignation = localStorage.getItem("designation") || "";
  const empDepartment = localStorage.getItem("department") || "";

  const [formData, setFormData] = useState({
    employeeId: empId,
    leaveType: "",
    designation: empDesignation,
    startDate: "",
    endDate: "",
    reason: "",
  });

  useEffect(() => {
    if (!empId) {
      toast.error("Employee ID not found. Please login again.");
      navigate("/login");
      return;
    }
    fetchLeaveRequests();
  }, [empId]);

  const fetchLeaveRequests = async () => {
    try {
      setIsLoading(true);
      console.log("📡 Fetching leave requests for:", empId);

      const response = await axios.get(`${API_URL}/get_leave_requests`, {
        params: {
          emp_id: empId,
          role: "employee",
        },
      });

      console.log("✅ Leave requests fetched:", response.data);

      if (response.data && response.data.requests) {
        setLeaveList(response.data.requests);
      } else {
        setLeaveList([]);
      }
    } catch (error) {
      console.error("❌ Error fetching leave requests:", error);
      toast.error("Failed to fetch leave requests");
      setLeaveList([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    const formattedDate = date.toISOString().split("T")[0];
    setFormData((prev) => ({
      ...prev,
      startDate: formattedDate,
      endDate: formattedDate,
    }));
    setOpenDialog(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const { leaveType, designation, startDate, endDate, reason } = formData;

    if (!leaveType || !designation || !startDate || !endDate) {
      toast.error("Please fill all required fields");
      return;
    }

    // Validate dates
    if (new Date(startDate) > new Date(endDate)) {
      toast.error("End date cannot be before start date");
      return;
    }

    try {
      setIsSubmitting(true);
      console.log("📤 Submitting leave request:", formData);

      const response = await axios.post(`${API_URL}/submit_leave`, {
        emp_id: empId,
        leave_type: leaveType,
        start_date: startDate,
        end_date: endDate,
        reason: reason,
      });

      console.log("✅ Leave submitted:", response.data);

      if (response.data.success) {
        toast.success("Leave request submitted successfully!");
        setOpenDialog(false);
        
        // Reset form
        setFormData({
          employeeId: empId,
          leaveType: "",
          designation: "",
          startDate: "",
          endDate: "",
          reason: "",
        });

        // Refresh leave list
        await fetchLeaveRequests();
      }
    } catch (error) {
      console.error("❌ Submit leave error:", error);
      
      if (error.response && error.response.data) {
        toast.error(error.response.data.error || "Failed to submit leave request");
      } else {
        toast.error("Network error. Please check if the server is running.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLeave = async (leaveId) => {
    if (!window.confirm("Are you sure you want to delete this leave request?")) {
      return;
    }

    try {
      console.log("🗑️ Deleting leave:", leaveId);

      const response = await axios.post(`${API_URL}/delete_leave`, {
        leave_id: leaveId,
        emp_id: empId,
      });

      if (response.data.success) {
        toast.success("Leave request deleted successfully!");
        await fetchLeaveRequests();
      }
    } catch (error) {
      console.error("❌ Delete leave error:", error);
      
      if (error.response && error.response.data) {
        toast.error(error.response.data.error || "Failed to delete leave request");
      } else {
        toast.error("Network error. Please try again.");
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "success";
      case "Rejected":
        return "error";
      case "Pending":
        return "warning";
      default:
        return "default";
    }
  };

  const formatDateRange = (startDate, endDate) => {
    const start = new Date(startDate).toLocaleDateString();
    const end = new Date(endDate).toLocaleDateString();
    return start === end ? start : `${start} - ${end}`;
  };

  return (
    <Box p={isMobile ? 2 : 4} display="flex" justifyContent="center" bgcolor="#f5f7fa" minHeight="100vh">
      <Box maxWidth="1200px" width="100%">
        <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: "bold", color: "#4544B4" }}>
          Leave Management
        </Typography>

        <Grid container spacing={4} justifyContent="center">
          {/* Calendar Section */}
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                p: 2,
                border: "3px solid #67BCE0",
                borderRadius: "12px",
                boxShadow: "0 3px 12px rgb(103 188 224 / 0.3)",
                ...calendarStyles.calendarContainer,
              }}
            >
              <Calendar
                onClickDay={handleDateClick}
                value={selectedDate}
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
                  if (view === "month" && selectedDate.toDateString() === date.toDateString()) {
                    return "react-calendar__tile--active";
                  }
                  return null;
                }}
                sx={calendarStyles.calendar}
              />
            </Card>
          </Grid>

          {/* Leave Table Section */}
          <Grid item xs={12} md={8}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">My Leave Requests</Typography>
              <Button
                variant="contained"
                onClick={() => setOpenDialog(true)}
                sx={{
                  bgcolor: "#67BCE0",
                  ":hover": { bgcolor: "#5AACCE" },
                  borderRadius: "60px",
                  border: "2px solid #000000",
                  color: "#000000",
                  textTransform: "none",
                  fontWeight: "bold",
                }}
              >
                + New Leave
              </Button>
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead sx={{ background: "#cfe2f3" }}>
                  <TableRow>
                    <TableCell>Date Range</TableCell>
                    <TableCell>Leave Type</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        <CircularProgress size={24} />
                        <Typography sx={{ ml: 2 }}>Loading...</Typography>
                      </TableCell>
                    </TableRow>
                  ) : leaveList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        No leave requests found
                      </TableCell>
                    </TableRow>
                  ) : (
                    leaveList.map((leave) => (
                      <TableRow key={leave.id}>
                        <TableCell>{formatDateRange(leave.start_date, leave.end_date)}</TableCell>
                        <TableCell>{leave.leave_type}</TableCell>
                        <TableCell>
                          <Chip
                            label={leave.status}
                            color={getStatusColor(leave.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {leave.status === "Pending" && (
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() => handleDeleteLeave(leave.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          )}
                          {leave.status !== "Pending" && (
                            <Typography variant="caption" color="textSecondary">
                              {leave.reviewed_at
                                ? `Reviewed: ${new Date(leave.reviewed_at).toLocaleDateString()}`
                                : "-"}
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>

        {/* Leave Request Dialog */}
        <Dialog open={openDialog} onClose={() => !isSubmitting && setOpenDialog(false)} fullWidth maxWidth="sm">
          <DialogTitle
            sx={{
              color: "#67BCE0",
              textAlign: "center",
              fontWeight: "bold",
              fontSize: "1.25rem",
              py: 2,
            }}
          >
            Leave Request Form
          </DialogTitle>

          <DialogContent sx={{ p: 3 }}>
            <Box
              sx={{
                boxShadow: 3,
                p: 3,
                backgroundColor: "#ffffff",
                border: "5px solid #67BCE0",
                borderRadius: "20px",
              }}
            >
              {/* Section 1: Employee Info */}
              <Typography variant="subtitle2" color="primary" gutterBottom>
                Employee Information
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Employee ID"
                    name="employeeId"
                    value={formData.employeeId}
                    disabled
                    variant="outlined"
                    sx={{ bgcolor: "#f5f5f5" }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={
                      <Box component="span">
                        Designation
                        <Box component="span" sx={{ color: "red" }}>
                          *
                        </Box>
                      </Box>
                    }
                    name="designation"
                    value={formData.designation}
                    onChange={handleInputChange}
                    variant="outlined"
                    sx={{ bgcolor: "#fff" }}
                  />
                </Grid>
              </Grid>

              {/* Section 2: Leave Details */}
              <Typography variant="subtitle2" color="primary" sx={{ mt: 4 }} gutterBottom>
                Leave Details
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid item xs={12}>
                <FormControl fullWidth sx={{ bgcolor: "#fff" }}>
                  <InputLabel id="leaveType-label">
                    Leave Type{" "}
                    <Box component="span" sx={{ color: "red", display: "inline" }}>
                      *
                    </Box>
                  </InputLabel>
                  <Select
                    id="leaveType"
                    labelId="leaveType-label"
                    name="leaveType"
                    value={formData.leaveType}
                    onChange={handleInputChange}
                    label="Leave Type"
                  >
                    <MenuItem value="Sick Off">Sick Off</MenuItem>
                    <MenuItem value="Half Day">Half Day</MenuItem>
                    <MenuItem value="Morning">Morning</MenuItem>
                    <MenuItem value="Evening">Evening</MenuItem>
                    <MenuItem value="Unpaid">Unpaid</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Section 3: Date Range */}
              <Typography variant="subtitle2" color="primary" sx={{ mt: 4 }} gutterBottom>
                Leave Duration
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={
                      <Box component="span">
                        Start Date
                        <Box component="span" sx={{ color: "red", display: "inline" }}>
                          *
                        </Box>
                      </Box>
                    }
                    type="date"
                    name="startDate"
                    InputLabelProps={{ shrink: true }}
                    value={formData.startDate}
                    onChange={handleInputChange}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={
                      <Box component="span">
                        End Date
                        <Box component="span" sx={{ color: "red", display: "inline" }}>
                          *
                        </Box>
                      </Box>
                    }
                    type="date"
                    name="endDate"
                    InputLabelProps={{ shrink: true }}
                    value={formData.endDate}
                    onChange={handleInputChange}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Reason (Optional)"
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    multiline
                    rows={3}
                    variant="outlined"
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: 2,
                width: "100%",
                justifyContent: "flex-end",
              }}
            >
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={isSubmitting}
                sx={{
                  bgcolor: "#67BCE0",
                  ":hover": { bgcolor: "#5AACCE" },
                  borderRadius: "60px",
                  border: "3px solid #000000",
                  color: "#000000",
                  textTransform: "none",
                  boxShadow: 2,
                  width: { xs: "100%", sm: "auto" },
                }}
              >
                {isSubmitting ? <CircularProgress size={24} /> : "Submit"}
              </Button>

              <Button
                variant="outlined"
                onClick={() => setOpenDialog(false)}
                disabled={isSubmitting}
                sx={{
                  bgcolor: "#ffffff",
                  ":hover": { bgcolor: "#f5f5f5" },
                  borderRadius: "60px",
                  border: "3px solid #000000",
                  color: "#000000",
                  textTransform: "none",
                  boxShadow: 2,
                  width: { xs: "100%", sm: "auto" },
                }}
              >
                Cancel
              </Button>
            </Box>
          </DialogActions>
        </Dialog>
      </Box>

      {/* Custom CSS for react-calendar */}
      <style>
        {`
          .react-calendar {
            border: none;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          }
          .react-calendar__navigation button {
            color: #4544B4;
            font-weight: 700;
            min-width: 44px;
            background: none;
            border: none;
            border-radius: 6px;
            margin: 4px;
            transition: background-color 0.3s ease;
          }
          .react-calendar__navigation button:hover,
          .react-calendar__navigation button:focus {
            background-color: #67BCE0;
            color: white;
          }
          .react-calendar__month-view__weekdays {
            text-transform: uppercase;
            font-weight: 700;
            font-size: 12px;
            color: #4544B4;
            border-bottom: 2px solid #67BCE0;
            padding-bottom: 8px;
          }
          .react-calendar__tile {
            border-radius: 8px !important;
            margin: 3px !important;
            padding: 8px !important;
            font-weight: 600 !important;
            color: #4544B4 !important;
            transition: background-color 0.3s ease !important;
          }
          .react-calendar__tile--active {
            background-color: #0D07C0 !important;
            color: white !important;
          }
          .react-calendar__tile--disabled {
            color: #ccc !important;
            cursor: not-allowed !important;
          }
          .react-calendar__tile:enabled:hover,
          .react-calendar__tile:enabled:focus {
            background-color: #67BCE0 !important;
            color: white !important;
          }
        `}
      </style>
    </Box>
  );
}