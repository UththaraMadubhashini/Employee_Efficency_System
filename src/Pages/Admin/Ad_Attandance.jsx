// src/pages/Admin/Ad_Attendance.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  MenuItem,
  FormControl,
  Select,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Avatar,
  Button,
  useMediaQuery,
  useTheme,
  Paper,
  TableContainer,
  Grid,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
} from "@mui/material";
import { styled } from "@mui/system";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import VisibilityIcon from "@mui/icons-material/Visibility";
import RefreshIcon from "@mui/icons-material/Refresh";
import PeopleIcon from "@mui/icons-material/People";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import "./Ad_Attendance.css";

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  marginTop: 20,
  marginBottom: 40,
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
}));

const TableHeadCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: "#4445B4",
  color: "#fff",
  fontWeight: "bold",
  fontSize: "14px",
  padding: "16px",
}));

const TableBodyRow = styled(TableRow)(({ theme }) => ({
  backgroundColor: "#fff",
  "&:nth-of-type(even)": {
    backgroundColor: "#f9f9f9",
  },
  "&:hover": {
    backgroundColor: "#f0f0ff",
  },
}));

const FilterSection = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: "16px",
  marginBottom: "24px",
  flexWrap: "wrap",
  alignItems: "center",
}));

const StatsCard = styled(Card)(({ theme }) => ({
  height: "100%",
  borderRadius: "12px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  transition: "transform 0.2s",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
  },
}));

const StatusDot = styled(Box)(({ color }) => ({
  display: "inline-block",
  width: 10,
  height: 10,
  borderRadius: "50%",
  backgroundColor: color,
  marginRight: 8,
}));

const EmployeeCard = styled(Card)(({ theme }) => ({
  width: 220,
  height: 180,
  borderRadius: "12px",
  border: "2px solid #74C0E3",
  position: "relative",
  backgroundColor: "#ffffff",
  transition: "transform 0.2s, box-shadow 0.2s",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
  },
}));

const CardTopSection = styled(Box)(() => ({
  height: 50,
  backgroundColor: "#f2f2f2",
  borderTopLeftRadius: "10px",
  borderTopRightRadius: "10px",
  position: "relative",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
}));

const StyledAvatar = styled(Avatar)(() => ({
  width: 60,
  height: 60,
  backgroundColor: "#74C0E3",
  position: "absolute",
  top: -5,
  left: "50%",
  transform: "translateX(-50%)",
  zIndex: 2,
  border: "3px solid white",
  fontSize: "24px",
  fontWeight: "bold",
}));

export default function Ad_Attendance() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [employees, setEmployees] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [pendingLeaveCount, setPendingLeaveCount] = useState(0);

  // Filters
  const [filters, setFilters] = useState({
    department: "",
    empId: "",
    date: new Date().toISOString().split("T")[0],
    status: "",
  });

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    present: 0,
    absent: 0,
    leave: 0,
  });

  const API_URL = "http://127.0.0.1:5001";

  useEffect(() => {
    fetchData();
    fetchPendingLeaveCount();
    // Poll for pending leaves every 30 seconds
    const interval = setInterval(fetchPendingLeaveCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    applyFilters();
    calculateStats();
  }, [filters, attendanceData]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchEmployeesFromFirebase(),
        fetchAttendanceRecords(),
      ]);
    } catch (error) {
      console.error("❌ Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEmployeesFromFirebase = async () => {
    try {
      const response = await axios.get(`${API_URL}/get_all_employees`);

      if (response.data && response.data.employees) {
        setEmployees(response.data.employees);
      }
    } catch (error) {
      console.error("❌ Error fetching employees:", error);
      toast.warning("Employee data unavailable. Using attendance records only.");
    }
  };

  const fetchAttendanceRecords = async () => {
    try {
      const response = await axios.get(`${API_URL}/get_all_attendance`, {
        params: {
          date: filters.date,
        },
      });

      if (response.data && response.data.records) {
        setAttendanceData(response.data.records);
      } else {
        setAttendanceData([]);
      }
    } catch (error) {
      console.error("❌ Error fetching attendance:", error);
      toast.error("Failed to fetch attendance records");
      setAttendanceData([]);
    }
  };

  const fetchPendingLeaveCount = async () => {
    try {
      const response = await axios.get(`${API_URL}/get_leave_requests`, {
        params: {
          role: "admin",
          status: "Pending",
        },
      });

      if (response.data && response.data.requests) {
        setPendingLeaveCount(response.data.requests.length);
      }
    } catch (error) {
      console.error("❌ Error fetching pending leaves:", error);
    }
  };

  const applyFilters = () => {
    let filtered = [...attendanceData];

    if (filters.department) {
      filtered = filtered.filter(
        (record) => record.department === filters.department
      );
    }

    if (filters.empId) {
      filtered = filtered.filter((record) =>
        record.emp_id.toLowerCase().includes(filters.empId.toLowerCase())
      );
    }

    if (filters.status) {
      filtered = filtered.filter((record) => record.status === filters.status);
    }

    setFilteredData(filtered);
  };

  const calculateStats = () => {
    const present = attendanceData.filter((r) => r.status === "Present").length;
    const leave = attendanceData.filter((r) => r.status === "Leave").length;
    const absent = attendanceData.filter((r) => r.status === "Absent").length;

    setStats({
      total: attendanceData.length,
      present,
      leave,
      absent,
    });
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));

    // If date changes, refetch attendance data
    if (field === "date") {
      fetchAttendanceRecords();
    }
  };

  const handleViewDetails = (record) => {
    setSelectedEmployee(record);
    setOpenViewDialog(true);
  };

  const handleRefresh = () => {
    fetchData();
    fetchPendingLeaveCount();
    toast.success("Data refreshed successfully");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Present":
        return "#4CAF50";
      case "Absent":
        return "#f44336";
      case "Leave":
        return "#FF9800";
      default:
        return "#9E9E9E";
    }
  };

  const getStatusChipColor = (status) => {
    switch (status) {
      case "Present":
        return "success";
      case "Absent":
        return "error";
      case "Leave":
        return "warning";
      default:
        return "default";
    }
  };

  // Get unique departments
  const uniqueDepartments = [
    ...new Set(
      attendanceData.map((record) => record.department).filter(Boolean)
    ),
  ];

  return (
    <Box p={isMobile ? 2 : 4} bgcolor="#f5f7fa" minHeight="100vh">
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" sx={{ fontWeight: "bold", color: "#4445B4" }}>
          Attendance Management
        </Typography>

        {/* Action Buttons */}
        <Box display="flex" gap={2} alignItems="center">
          <Box position="relative">
            <Button
              variant="outlined"
              onClick={() => navigate("/admin/leave-management")}
              className="ad-att-leave-mgmt-btn"
              startIcon={pendingLeaveCount > 0 ? <NotificationsActiveIcon /> : null}
            >
              Leave Management
            </Button>
            {pendingLeaveCount > 0 && (
              <Box className="ad-att-notification-badge">
                {pendingLeaveCount}
              </Box>
            )}
          </Box>

          <Tooltip title="Refresh Data">
            <IconButton
              onClick={handleRefresh}
              className="ad-att-refresh-icon-btn"
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard>
            <CardContent>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    Total Employees
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="#4445B4">
                    {stats.total}
                  </Typography>
                </Box>
                <PeopleIcon
                  sx={{ fontSize: 48, color: "#4445B4", opacity: 0.3 }}
                />
              </Box>
            </CardContent>
          </StatsCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatsCard>
            <CardContent>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    Present
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="#4CAF50">
                    {stats.present}
                  </Typography>
                </Box>
                <CheckCircleIcon
                  sx={{ fontSize: 48, color: "#4CAF50", opacity: 0.3 }}
                />
              </Box>
            </CardContent>
          </StatsCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatsCard>
            <CardContent>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    On Leave
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="#FF9800">
                    {stats.leave}
                  </Typography>
                </Box>
                <EventBusyIcon
                  sx={{ fontSize: 48, color: "#FF9800", opacity: 0.3 }}
                />
              </Box>
            </CardContent>
          </StatsCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatsCard>
            <CardContent>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    Absent
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="#f44336">
                    {stats.absent}
                  </Typography>
                </Box>
                <CancelIcon
                  sx={{ fontSize: 48, color: "#f44336", opacity: 0.3 }}
                />
              </Box>
            </CardContent>
          </StatsCard>
        </Grid>
      </Grid>

      {/* Filters */}
      <FilterSection>
        <FormControl sx={{ minWidth: 200 }}>
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

        <TextField
          label="Employee ID"
          value={filters.empId}
          onChange={(e) => handleFilterChange("empId", e.target.value)}
          sx={{ minWidth: 200 }}
        />

        <TextField
          label="Date"
          type="date"
          value={filters.date}
          onChange={(e) => handleFilterChange("date", e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 200 }}
        />

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            label="Status"
          >
            <MenuItem value="">All Status</MenuItem>
            <MenuItem value="Present">Present</MenuItem>
            <MenuItem value="Absent">Absent</MenuItem>
            <MenuItem value="Leave">Leave</MenuItem>
          </Select>
        </FormControl>
      </FilterSection>

      {/* Attendance Table */}
      <StyledTableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeadCell>Employee ID</TableHeadCell>
              <TableHeadCell>Name</TableHeadCell>
              <TableHeadCell>Department</TableHeadCell>
              <TableHeadCell>Designation</TableHeadCell>
              <TableHeadCell>Date</TableHeadCell>
              <TableHeadCell>Check In</TableHeadCell>
              <TableHeadCell>Check Out</TableHeadCell>
              <TableHeadCell>Status</TableHeadCell>
              <TableHeadCell>Actions</TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                  <CircularProgress size={40} />
                  <Typography sx={{ mt: 2 }}>
                    Loading attendance data...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                  <Typography color="textSecondary">
                    No attendance records found for selected filters
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((record, idx) => (
                <TableBodyRow key={idx}>
                  <TableCell>{record.emp_id}</TableCell>
                  <TableCell>{record.employee_name || "N/A"}</TableCell>
                  <TableCell>{record.department || "N/A"}</TableCell>
                  <TableCell>{record.designation || "N/A"}</TableCell>
                  <TableCell>{record.date}</TableCell>
                  <TableCell>{record.check_in_time || "-"}</TableCell>
                  <TableCell>{record.check_out_time || "-"}</TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <StatusDot color={getStatusColor(record.status)} />
                      <Chip
                        label={record.status}
                        color={getStatusChipColor(record.status)}
                        size="small"
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetails(record)}
                          sx={{ color: "#4445B4" }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableBodyRow>
              ))
            )}
          </TableBody>
        </Table>
      </StyledTableContainer>

      {/* Employee Cards Grid */}
      <Typography
        variant="h5"
        mb={3}
        sx={{ fontWeight: "bold", color: "#4445B4" }}
      >
        All Employees Overview
      </Typography>
      <Box
        display="flex"
        flexWrap="wrap"
        justifyContent="center"
        gap={3}
        mb={4}
      >
        {employees.slice(0, 8).map((emp, i) => (
          <EmployeeCard key={i}>
            <CardTopSection>
              <StyledAvatar>
                {emp.fullName ? emp.fullName.charAt(0).toUpperCase() : "E"}
              </StyledAvatar>
              <Box position="absolute" top={10} right={10}>
                <StatusDot color={emp.isActive ? "limegreen" : "red"} />
              </Box>
            </CardTopSection>
            <Box mt={2} px={2} textAlign="center">
              <Typography fontWeight="bold" fontSize={18} noWrap>
                {emp.fullName || "Employee"}
              </Typography>
              <Typography fontSize={13} color="textSecondary" noWrap>
                {emp.designation || "N/A"}
              </Typography>
              <Typography fontSize={15} color="textSecondary" noWrap>
                {emp.emp_id}
              </Typography>
            </Box>
          </EmployeeCard>
        ))}
      </Box>

      {/* View Details Dialog */}
      <Dialog
        open={openViewDialog}
        onClose={() => setOpenViewDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: "#4445B4", color: "#fff" }}>
          Attendance Details
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          {selectedEmployee && (
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Employee ID
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {selectedEmployee.emp_id}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Name
                </Typography>
                <Typography variant="body1">
                  {selectedEmployee.employee_name || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Department
                </Typography>
                <Typography variant="body1">
                  {selectedEmployee.department || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Designation
                </Typography>
                <Typography variant="body1">
                  {selectedEmployee.designation || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Date
                </Typography>
                <Typography variant="body1">{selectedEmployee.date}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Status
                </Typography>
                <Chip
                  label={selectedEmployee.status}
                  color={getStatusChipColor(selectedEmployee.status)}
                  size="small"
                />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Check In Time
                </Typography>
                <Typography variant="body1">
                  {selectedEmployee.check_in_time || "Not checked in"}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Check Out Time
                </Typography>
                <Typography variant="body1">
                  {selectedEmployee.check_out_time || "Not checked out"}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenViewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}