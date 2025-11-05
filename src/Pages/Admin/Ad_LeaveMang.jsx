// src/pages/Admin/Ad_LeaveMang.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Grid,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  TextField,
  Divider,
  InputLabel,
  FormControl,
  Chip,
  CircularProgress,
  Card,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Ad_LeaveMang() {
  const [openConfirm, setOpenConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);

  // Filters
  const [filters, setFilters] = useState({
    department: "",
    empId: "",
    status: "",
  });

  const [formData, setFormData] = useState({
    employeeId: "",
    designation: "",
    leaveType: "",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const API_URL = "http://127.0.0.1:5001";
  const adminId = localStorage.getItem("emp_id") || "";

  useEffect(() => {
    if (!adminId) {
      toast.error("Admin ID not found. Please login again.");
      navigate("/login");
      return;
    }
    fetchLeaveRequests();
  }, [adminId]);

  useEffect(() => {
    applyFilters();
  }, [filters, leaveRequests]);

  const fetchLeaveRequests = async () => {
    try {
      setIsLoading(true);
      console.log("📡 Fetching all leave requests...");

      const response = await axios.get(`${API_URL}/get_leave_requests`, {
        params: {
          role: "admin",
        },
      });

      console.log("✅ Leave requests fetched:", response.data);

      if (response.data && response.data.requests) {
        setLeaveRequests(response.data.requests);
        setFilteredRequests(response.data.requests);
      } else {
        setLeaveRequests([]);
        setFilteredRequests([]);
      }
    } catch (error) {
      console.error("❌ Error fetching leave requests:", error);
      toast.error("Failed to fetch leave requests");
      setLeaveRequests([]);
      setFilteredRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...leaveRequests];

    if (filters.department) {
      filtered = filtered.filter((req) => req.department === filters.department);
    }

    if (filters.empId) {
      filtered = filtered.filter((req) => req.emp_id.includes(filters.empId));
    }

    if (filters.status) {
      filtered = filtered.filter((req) => req.status === filters.status);
    }

    setFilteredRequests(filtered);
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleConfirm = (leave, action) => {
    setSelectedLeave(leave);
    setConfirmAction(action);
    setOpenConfirm(true);
  };

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
    setSelectedLeave(null);
    setConfirmAction(null);
  };

  const handleConfirmAction = async () => {
    if (!selectedLeave || !confirmAction) return;

    try {
      setIsProcessing(true);
      console.log(`📝 ${confirmAction} leave ${selectedLeave.id}`);

      const response = await axios.post(`${API_URL}/update_leave_status`, {
        leave_id: selectedLeave.id,
        status: confirmAction === "Approve" ? "Approved" : "Rejected",
        admin_id: adminId,
      });

      if (response.data.success) {
        toast.success(`Leave ${confirmAction.toLowerCase()}d successfully!`);
        handleCloseConfirm();
        await fetchLeaveRequests();
      }
    } catch (error) {
      console.error(`❌ ${confirmAction} error:`, error);
      
      if (error.response && error.response.data) {
        toast.error(error.response.data.error || `Failed to ${confirmAction.toLowerCase()} leave`);
      } else {
        toast.error("Network error. Please try again.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleView = (leave) => {
    setSelectedLeave(leave);
    setOpenViewDialog(true);
  };

  const handleCloseView = () => {
    setOpenViewDialog(false);
    setSelectedLeave(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    const { employeeId, designation, leaveType, startDate, endDate, reason } = formData;

    if (!employeeId || !designation || !leaveType || !startDate || !endDate) {
      toast.error("Please fill all required fields");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast.error("End date cannot be before start date");
      return;
    }

    try {
      setIsProcessing(true);
      console.log("📤 Admin submitting leave for employee:", formData);

      const response = await axios.post(`${API_URL}/submit_leave`, {
        emp_id: employeeId,
        leave_type: leaveType,
        start_date: startDate,
        end_date: endDate,
        reason: reason,
      });

      if (response.data.success) {
        toast.success("Leave request created successfully!");
        setOpenAddDialog(false);
        setFormData({
          employeeId: "",
          designation: "",
          leaveType: "",
          startDate: "",
          endDate: "",
          reason: "",
        });
        await fetchLeaveRequests();
      }
    } catch (error) {
      console.error("❌ Submit leave error:", error);
      
      if (error.response && error.response.data) {
        toast.error(error.response.data.error || "Failed to create leave request");
      } else {
        toast.error("Network error. Please try again.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(filteredRequests.map((req) => req.id));
    } else {
      setSelectedRows([]);
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

  // Get unique departments and emp IDs for filters
  const uniqueDepartments = [...new Set(leaveRequests.map((req) => req.department))];
  const uniqueEmpIds = [...new Set(leaveRequests.map((req) => req.emp_id))];

  return (
    <Box p={isMobile ? 2 : 4} bgcolor="#f5f7fa" minHeight="100vh">
      <Typography variant="h4" mb={3} sx={{ fontWeight: "bold", color: "#4544B4" }}>
        Leave Management
      </Typography>

      {/* Statistics Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ p: 2, bgcolor: "#FFF3CD", borderLeft: "4px solid #FFC107" }}>
            <Typography variant="h6">Pending Requests</Typography>
            <Typography variant="h4" fontWeight="bold">
              {leaveRequests.filter((req) => req.status === "Pending").length}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ p: 2, bgcolor: "#D4EDDA", borderLeft: "4px solid #28A745" }}>
            <Typography variant="h6">Approved</Typography>
            <Typography variant="h4" fontWeight="bold">
              {leaveRequests.filter((req) => req.status === "Approved").length}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ p: 2, bgcolor: "#F8D7DA", borderLeft: "4px solid #DC3545" }}>
            <Typography variant="h6">Rejected</Typography>
            <Typography variant="h4" fontWeight="bold">
              {leaveRequests.filter((req) => req.status === "Rejected").length}
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Filters and Add Button */}
      <Grid container spacing={2} alignItems="center" mb={3}>
        <Grid item xs={12} sm={3}>
          <FormControl fullWidth>
            <InputLabel>Department</InputLabel>
            <Select
              value={filters.department}
              onChange={(e) => handleFilterChange("department", e.target.value)}
              label="Department"
            >
              <MenuItem value="">All Departments</MenuItem>
              {uniqueDepartments.map((dept) => (
                <MenuItem key={dept} value={dept}>
                  {dept}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={3}>
          <FormControl fullWidth>
            <InputLabel>Employee ID</InputLabel>
            <Select
              value={filters.empId}
              onChange={(e) => handleFilterChange("empId", e.target.value)}
              label="Employee ID"
            >
              <MenuItem value="">All Employees</MenuItem>
              {uniqueEmpIds.map((id) => (
                <MenuItem key={id} value={id}>
                  {id}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={3}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              label="Status"
            >
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Approved">Approved</MenuItem>
              <MenuItem value="Rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={3} textAlign={{ xs: "left", sm: "right" }}>
          <Button
            variant="contained"
            onClick={() => setOpenAddDialog(true)}
            sx={{
              bgcolor: "#67BCE0",
              ":hover": { bgcolor: "#5AACCE" },
              borderRadius: "60px",
              border: "3px solid #000000",
              color: "#000000",
              textTransform: "none",
              boxShadow: 2,
              width: { xs: "100%", sm: "auto" },
              fontWeight: "bold",
            }}
          >
            + Add Leave
          </Button>
        </Grid>
      </Grid>

      {/* Leave Requests Table */}
      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#B9B9F2" }}>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={
                    selectedRows.length > 0 && selectedRows.length < filteredRequests.length
                  }
                  checked={
                    filteredRequests.length > 0 && selectedRows.length === filteredRequests.length
                  }
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell><strong>Leave ID</strong></TableCell>
              <TableCell><strong>Employee ID</strong></TableCell>
              <TableCell><strong>Employee Name</strong></TableCell>
              <TableCell><strong>Department</strong></TableCell>
              <TableCell><strong>Leave Type</strong></TableCell>
              <TableCell><strong>Date Range</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Action</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  <CircularProgress size={24} />
                  <Typography sx={{ ml: 2 }}>Loading...</Typography>
                </TableCell>
              </TableRow>
            ) : filteredRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  No leave requests found
                </TableCell>
              </TableRow>
            ) : (
              filteredRequests.map((leave) => (
                <TableRow
                  key={leave.id}
                  hover
                  selected={selectedRows.includes(leave.id)}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedRows.includes(leave.id)}
                      onChange={() => handleSelectRow(leave.id)}
                    />
                  </TableCell>
                  <TableCell>LV{String(leave.id).padStart(4, "0")}</TableCell>
                  <TableCell>{leave.emp_id}</TableCell>
                  <TableCell>{leave.employee_name}</TableCell>
                  <TableCell>{leave.department}</TableCell>
                  <TableCell>{leave.leave_type}</TableCell>
                  <TableCell>{formatDateRange(leave.start_date, leave.end_date)}</TableCell>
                  <TableCell>
                    <Chip
                      label={leave.status}
                      color={getStatusColor(leave.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      {leave.status === "Pending" && (
                        <>
                          <Button
                            onClick={() => handleConfirm(leave, "Reject")}
                            size="small"
                            startIcon={<CancelIcon />}
                            sx={{
                              color: "#fff",
                              bgcolor: "#f44336",
                              ":hover": { bgcolor: "#d32f2f" },
                              textTransform: "none",
                            }}
                          >
                            Reject
                          </Button>
                          <Button
                            onClick={() => handleConfirm(leave, "Approve")}
                            size="small"
                            startIcon={<CheckCircleIcon />}
                            sx={{
                              color: "#fff",
                              bgcolor: "#4CAF50",
                              ":hover": { bgcolor: "#388E3C" },
                              textTransform: "none",
                            }}
                          >
                            Approve
                          </Button>
                        </>
                      )}
                      <Button
                        onClick={() => handleView(leave)}
                        size="small"
                        variant="outlined"
                        startIcon={<VisibilityIcon />}
                        sx={{
                          borderRadius: "20px",
                          textTransform: "none",
                        }}
                      >
                        View
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Confirmation Dialog */}
      <Dialog open={openConfirm} onClose={handleCloseConfirm}>
        <DialogTitle>{confirmAction} Confirmation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to {confirmAction?.toLowerCase()} this leave request for{" "}
            <strong>{selectedLeave?.employee_name}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirm} disabled={isProcessing}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmAction}
            autoFocus
            disabled={isProcessing}
            color={confirmAction === "Approve" ? "success" : "error"}
          >
            {isProcessing ? <CircularProgress size={20} /> : "Confirm"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={openViewDialog} onClose={handleCloseView} fullWidth maxWidth="sm">
        <DialogTitle sx={{ bgcolor: "#67BCE0", color: "#000" }}>
          Leave Request Details
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          {selectedLeave && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Leave ID
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    LV{String(selectedLeave.id).padStart(4, "0")}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Status
                  </Typography>
                  <Chip
                    label={selectedLeave.status}
                    color={getStatusColor(selectedLeave.status)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Employee ID
                  </Typography>
                  <Typography variant="body1">{selectedLeave.emp_id}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Name
                  </Typography>
                  <Typography variant="body1">{selectedLeave.employee_name}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Department
                  </Typography>
                  <Typography variant="body1">{selectedLeave.department}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Designation
                  </Typography>
                  <Typography variant="body1">{selectedLeave.designation}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Leave Type
                  </Typography>
                  <Typography variant="body1">{selectedLeave.leave_type}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Date Range
                  </Typography>
                  <Typography variant="body1">
                    {formatDateRange(selectedLeave.start_date, selectedLeave.end_date)}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Reason
                  </Typography>
                  <Typography variant="body1">
                    {selectedLeave.reason || "No reason provided"}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Submitted At
                  </Typography>
                  <Typography variant="body2">
                    {new Date(selectedLeave.created_at).toLocaleString()}
                  </Typography>
                </Grid>
                {selectedLeave.reviewed_at && (
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Reviewed At
                    </Typography>
                    <Typography variant="body2">
                      {new Date(selectedLeave.reviewed_at).toLocaleString()}
                    </Typography>
                  </Grid>
                )}
                {selectedLeave.reviewed_by && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Reviewed By
                    </Typography>
                    <Typography variant="body2">{selectedLeave.reviewed_by}</Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseView}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Add Leave Dialog */}
      <Dialog
        open={openAddDialog}
        onClose={() => !isProcessing && setOpenAddDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ color: "#67BCE0", fontWeight: "bold" }}>
          Create Leave Request (Admin)
        </DialogTitle>
        <DialogContent>
          <Box mt={2}>
            <TextField
              fullWidth
              margin="normal"
              label="Employee ID *"
              name="employeeId"
              value={formData.employeeId}
              onChange={handleInputChange}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Designation *"
              name="designation"
              value={formData.designation}
              onChange={handleInputChange}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Leave Type *</InputLabel>
              <Select
                name="leaveType"
                value={formData.leaveType}
                onChange={handleInputChange}
                label="Leave Type *"
              >
                <MenuItem value="Sick Off">Sick Off</MenuItem>
                <MenuItem value="Half Day">Half Day</MenuItem>
                <MenuItem value="Morning">Morning</MenuItem>
                <MenuItem value="Evening">Evening</MenuItem>
                <MenuItem value="Unpaid">Unpaid</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              margin="normal"
              label="Start Date *"
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              margin="normal"
              label="End Date *"
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleInputChange}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Reason (Optional)"
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSubmit} disabled={isProcessing}>
            {isProcessing ? <CircularProgress size={20} /> : "Submit"}
          </Button>
          <Button onClick={() => setOpenAddDialog(false)} disabled={isProcessing}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}