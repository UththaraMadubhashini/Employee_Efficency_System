import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Grid,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  Rating,
  CircularProgress,
  Alert,
  Chip,
  InputLabel,
  Tabs,
  Tab,
  Card,
  CardContent,
  LinearProgress,
  Divider,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import "./Ad_Performance.css";

const API_BASE_URL = "http://127.0.0.1:5001";

export default function Ad_Performance() {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  
  // Feedback Management State
  const [openDialog, setOpenDialog] = useState(false);
  const [isNewFeedback, setIsNewFeedback] = useState(false);
  const [feedbackList, setFeedbackList] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  
  // Performance Overview State
  const [allEmployeesPerformance, setAllEmployeesPerformance] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  // Individual Performance View State
  const [viewPerformanceDialog, setViewPerformanceDialog] = useState(false);
  const [selectedPerformanceData, setSelectedPerformanceData] = useState(null);
  
  // Statistics State
  const [statistics, setStatistics] = useState({
    totalEmployees: 0,
    avgPerformance: 0,
    avgAttendance: 0,
    avgTaskCompletion: 0,
  });
  
  const [feedbackData, setFeedbackData] = useState({
    feedbackId: "",
    employeeId: "",
    employeeName: "",
    department: "",
    date: new Date().toISOString().split('T')[0],
    ratings: 0,
    score: "",
    engagementLevel: "Medium",
    comments: "",
  });

  useEffect(() => {
    fetchEmployees();
    fetchFeedbackList();
  }, []);

  useEffect(() => {
    if (tabValue === 1) {
      fetchAllPerformance();
    }
  }, [tabValue, selectedDepartment, selectedMonth, selectedYear]);

  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/get_all_employees`);
      const data = await response.json();
      
      if (data.success) {
        setEmployees(data.employees);
        const uniqueDepts = [...new Set(data.employees.map(e => e.department))];
        setDepartments(uniqueDepts);
        setStatistics(prev => ({ ...prev, totalEmployees: data.employees.length }));
      }
    } catch (err) {
      console.error("Error fetching employees:", err);
      setError("Failed to fetch employees");
    }
  };

  const fetchFeedbackList = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/get_feedback_list`);
      const data = await response.json();
      
      if (data.success) {
        setFeedbackList(data.feedback_list || []);
      } else {
        console.log("No feedback data:", data.error);
        setFeedbackList([]);
      }
    } catch (err) {
      console.error("Error fetching feedback:", err);
      setFeedbackList([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllPerformance = async () => {
    try {
      setLoading(true);
      
      // Use get_all_employee_scores endpoint
      const startDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`;
      const lastDay = new Date(selectedYear, selectedMonth, 0).getDate();
      const endDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${lastDay}`;
      
      let url = `${API_BASE_URL}/get_all_employee_scores?start_date=${startDate}&end_date=${endDate}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success && data.scores) {
        // Transform data to match expected format
        const transformedData = await Promise.all(data.scores.map(async (emp) => {
          // Fetch additional attendance data for each employee
          let attendancePercentage = 85; // Default
          let leaveCount = 0;
          
          try {
            const attResponse = await fetch(`${API_BASE_URL}/get_attendance?emp_id=${emp.emp_id}`);
            const attData = await attResponse.json();
            if (attData.success && attData.records.length > 0) {
              const presentDays = attData.records.filter(r => r.status === 'Present').length;
              attendancePercentage = Math.round((presentDays / attData.records.length) * 100);
              leaveCount = attData.records.filter(r => r.status === 'Leave').length;
            }
          } catch (err) {
            console.log("Could not fetch attendance for", emp.emp_id);
          }
          
          return {
            emp_id: emp.emp_id,
            name: emp.employee_name,
            department: emp.department,
            designation: emp.designation,
            performance: {
              overall_performance_score: emp.score,
              attendance: {
                present: Math.round(emp.total_tasks * 0.8),
                total_days: 22,
                attendance_percentage: attendancePercentage,
                leave: leaveCount,
                absent: 22 - Math.round(emp.total_tasks * 0.8) - leaveCount,
              },
              tasks: {
                completed: emp.completed_tasks,
                total: emp.total_tasks,
                completion_percentage: emp.completion_rate,
                in_progress: Math.floor(emp.total_tasks * 0.2),
                pending: Math.floor(emp.total_tasks * 0.1),
                overdue: emp.total_tasks - emp.completed_tasks - Math.floor(emp.total_tasks * 0.3),
              },
              rating: {
                score: emp.score / 20,
                count: emp.total_tasks,
                engagement_level: "Medium",
                last_feedback_date: null,
              },
              leave_count: leaveCount,
            },
          };
        }));

        // Filter by department if selected
        let filtered = transformedData;
        if (selectedDepartment) {
          filtered = filtered.filter(emp => emp.department === selectedDepartment);
        }
        
        setAllEmployeesPerformance(filtered);
        
        // Calculate statistics
        if (filtered.length > 0) {
          const avgPerf = filtered.reduce((acc, emp) => acc + emp.performance.overall_performance_score, 0) / filtered.length;
          const avgAtt = filtered.reduce((acc, emp) => acc + emp.performance.attendance.attendance_percentage, 0) / filtered.length;
          const avgTask = filtered.reduce((acc, emp) => acc + emp.performance.tasks.completion_percentage, 0) / filtered.length;
          
          setStatistics(prev => ({
            ...prev,
            avgPerformance: avgPerf,
            avgAttendance: avgAtt,
            avgTaskCompletion: avgTask,
          }));
        }
      } else {
        setAllEmployeesPerformance([]);
        setError("No performance data available");
      }
    } catch (err) {
      setError("Failed to fetch performance data");
      console.error(err);
      setAllEmployeesPerformance([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchIndividualPerformance = async (empId) => {
    try {
      setLoading(true);
      
      // Find employee in current performance data
      const empData = allEmployeesPerformance.find(e => e.emp_id === empId);
      
      if (empData) {
        // Create detailed performance data structure
        const detailedData = {
          employee: {
            name: empData.name,
            designation: empData.designation,
            department: empData.department,
          },
          period: {
            start_date: `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`,
            end_date: new Date(selectedYear, selectedMonth, 0).toISOString().split('T')[0],
          },
          performance: empData.performance,
        };
        
        setSelectedPerformanceData(detailedData);
        setViewPerformanceDialog(true);
      } else {
        setError("Employee performance data not found");
      }
    } catch (err) {
      setError("Failed to fetch employee performance");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewFeedback = (feedback) => {
    setFeedbackData({
      feedbackId: feedback.feedback_id,
      employeeId: feedback.emp_id,
      employeeName: feedback.employee_name,
      department: feedback.department,
      date: feedback.feedback_date,
      ratings: feedback.rating,
      score: feedback.score || "",
      engagementLevel: feedback.engagement_level,
      comments: feedback.comments,
    });
    setIsNewFeedback(false);
    setOpenDialog(true);
  };

  const handleNewFeedbackClick = () => {
    const adminId = sessionStorage.getItem("emp_id") || localStorage.getItem("emp_id");
    setFeedbackData({
      feedbackId: `FB${Date.now()}`,
      employeeId: "",
      employeeName: "",
      department: "",
      date: new Date().toISOString().split('T')[0],
      ratings: 0,
      score: "",
      engagementLevel: "Medium",
      comments: "",
      reviewedBy: adminId,
    });
    setIsNewFeedback(true);
    setOpenDialog(true);
  };

  const handleSubmitFeedback = async () => {
    try {
      if (!feedbackData.employeeId || !feedbackData.ratings || !feedbackData.comments) {
        setError("Please fill all required fields");
        return;
      }

      setLoading(true);
      const adminId = sessionStorage.getItem("emp_id") || localStorage.getItem("emp_id");
      
      const payload = {
        emp_id: feedbackData.employeeId,
        rating: feedbackData.ratings,
        score: feedbackData.score || 0,
        engagement_level: feedbackData.engagementLevel,
        comments: feedbackData.comments,
        feedback_date: feedbackData.date,
        reviewed_by: adminId,
      };

      const response = await fetch(`${API_BASE_URL}/submit_feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMsg("Feedback submitted successfully!");
        setOpenDialog(false);
        fetchFeedbackList();
        setFeedbackData({
          feedbackId: "",
          employeeId: "",
          employeeName: "",
          department: "",
          date: new Date().toISOString().split('T')[0],
          ratings: 0,
          score: "",
          engagementLevel: "Medium",
          comments: "",
        });
      } else {
        setError(data.error || "Failed to submit feedback");
      }
    } catch (err) {
      setError("Failed to submit feedback");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeChange = (empId) => {
    const employee = employees.find(e => e.emp_id === empId);
    if (employee) {
      setFeedbackData({
        ...feedbackData,
        employeeId: empId,
        employeeName: employee.fullName,
        department: employee.department,
      });
    }
  };

  const getPerformanceColor = (score) => {
    if (score >= 90) return "#4CAF50";
    if (score >= 75) return "#2196F3";
    if (score >= 60) return "#FF9800";
    return "#F44336";
  };

  const getPerformanceGrade = (score) => {
    if (score >= 90) return "A+";
    if (score >= 80) return "A";
    if (score >= 70) return "B";
    if (score >= 60) return "C";
    return "D";
  };

  const labelWithAsterisk = (label) => (
    <Box component="span">
      {label}
      <Box component="span" sx={{ color: "red" }}> *</Box>
    </Box>
  );

  const getDepartmentStats = () => {
    const stats = {};
    allEmployeesPerformance.forEach(emp => {
      if (!stats[emp.department]) {
        stats[emp.department] = {
          count: 0,
          totalScore: 0,
          avgAttendance: 0,
          avgTaskCompletion: 0,
        };
      }
      stats[emp.department].count++;
      stats[emp.department].totalScore += emp.performance.overall_performance_score;
      stats[emp.department].avgAttendance += emp.performance.attendance.attendance_percentage;
      stats[emp.department].avgTaskCompletion += emp.performance.tasks.completion_percentage;
    });

    return Object.keys(stats).map(dept => ({
      department: dept,
      avgScore: parseFloat((stats[dept].totalScore / stats[dept].count).toFixed(1)),
      avgAttendance: parseFloat((stats[dept].avgAttendance / stats[dept].count).toFixed(1)),
      avgTaskCompletion: parseFloat((stats[dept].avgTaskCompletion / stats[dept].count).toFixed(1)),
      employees: stats[dept].count,
    }));
  };

  const getPerformanceDistribution = () => {
    const ranges = {
      "Excellent (90-100)": 0,
      "Good (75-89)": 0,
      "Average (60-74)": 0,
      "Poor (0-59)": 0,
    };

    allEmployeesPerformance.forEach(emp => {
      const score = emp.performance.overall_performance_score;
      if (score >= 90) ranges["Excellent (90-100)"]++;
      else if (score >= 75) ranges["Good (75-89)"]++;
      else if (score >= 60) ranges["Average (60-74)"]++;
      else ranges["Poor (0-59)"]++;
    });

    const COLORS = ['#4CAF50', '#2196F3', '#FF9800', '#F44336'];
    return Object.keys(ranges).map((range, index) => ({
      name: range,
      value: ranges[range],
      color: COLORS[index],
    }));
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper className="perf-custom-tooltip">
          <Typography variant="body2" fontWeight="bold">
            {label}
          </Typography>
          {payload.map((entry, index) => (
            <Typography key={index} variant="body2" sx={{ color: entry.color }}>
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}
            </Typography>
          ))}
        </Paper>
      );
    }
    return null;
  };

  return (
    <Box className="perf-dashboard-container">
      {error && (
        <Alert severity="error" onClose={() => setError(null)} className="perf-alert">
          {error}
        </Alert>
      )}
      {successMsg && (
        <Alert severity="success" onClose={() => setSuccessMsg(null)} className="perf-alert">
          {successMsg}
        </Alert>
      )}

      <Typography variant="h4" className="perf-dashboard-title">
        Performance Management Dashboard
      </Typography>

      {/* Statistics Cards */}
      <Grid container spacing={3} className="perf-stats-container">
        <Grid item xs={12} sm={6} md={3}>
          <Card className="perf-stat-card">
            <CardContent>
              <Typography variant="body2" className="perf-stat-label">
                Total Employees
              </Typography>
              <Typography variant="h3" className="perf-stat-value">
                {statistics.totalEmployees}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="perf-stat-card">
            <CardContent>
              <Typography variant="body2" className="perf-stat-label">
                Avg Performance
              </Typography>
              <Typography variant="h3" className="perf-stat-value" style={{ color: getPerformanceColor(statistics.avgPerformance) }}>
                {statistics.avgPerformance.toFixed(1)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="perf-stat-card">
            <CardContent>
              <Typography variant="body2" className="perf-stat-label">
                Avg Attendance
              </Typography>
              <Typography variant="h3" className="perf-stat-value" style={{ color: "#2196F3" }}>
                {statistics.avgAttendance.toFixed(1)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="perf-stat-card">
            <CardContent>
              <Typography variant="body2" className="perf-stat-label">
                Avg Task Completion
              </Typography>
              <Typography variant="h3" className="perf-stat-value" style={{ color: "#FF9800" }}>
                {statistics.avgTaskCompletion.toFixed(1)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Tabs 
        value={tabValue} 
        onChange={(e, newValue) => setTabValue(newValue)} 
        className="perf-tabs"
      >
        <Tab label="Feedback Management" className="perf-tab" />
        <Tab label="Performance Overview" className="perf-tab" />
        <Tab label="Department Analytics" className="perf-tab" />
      </Tabs>

      {/* Tab 0: Feedback Management */}
      {tabValue === 0 && (
        <Box className="perf-tab-content">
          <Grid container spacing={2} alignItems="center" className="perf-filter-container">
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Filter by Department</InputLabel>
                <Select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  label="Filter by Department"
                >
                  <MenuItem value="">All Departments</MenuItem>
                  {departments.map(dept => (
                    <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Filter by Employee</InputLabel>
                <Select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  label="Filter by Employee"
                >
                  <MenuItem value="">All Employees</MenuItem>
                  {employees
                    .filter(emp => !selectedDepartment || emp.department === selectedDepartment)
                    .map(emp => (
                      <MenuItem key={emp.emp_id} value={emp.emp_id}>
                        {emp.fullName}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} textAlign="right">
              <Button
                variant="contained"
                onClick={handleNewFeedbackClick}
                className="perf-new-feedback-btn"
              >
                + New Feedback
              </Button>
            </Grid>
          </Grid>

          {loading ? (
            <Box className="perf-loading-container">
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper} className="perf-table-container">
              <Table>
                <TableHead>
                  <TableRow className="perf-table-header">
                    <TableCell><strong>Feedback ID</strong></TableCell>
                    <TableCell><strong>Employee Name</strong></TableCell>
                    <TableCell><strong>Department</strong></TableCell>
                    <TableCell><strong>Rating</strong></TableCell>
                    <TableCell><strong>Engagement</strong></TableCell>
                    <TableCell><strong>Date</strong></TableCell>
                    <TableCell><strong>Action</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {feedbackList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Typography className="perf-no-data">
                          No feedback records found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    feedbackList
                      .filter(f => !selectedDepartment || f.department === selectedDepartment)
                      .filter(f => !selectedEmployee || f.emp_id === selectedEmployee)
                      .map((feedback) => (
                        <TableRow key={feedback.id} hover className="perf-table-row">
                          <TableCell>{feedback.feedback_id}</TableCell>
                          <TableCell>
                            <Typography fontWeight={600}>{feedback.employee_name}</Typography>
                          </TableCell>
                          <TableCell>{feedback.department}</TableCell>
                          <TableCell>
                            <Rating value={feedback.rating} readOnly size="small" precision={0.5} />
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={feedback.engagement_level} 
                              size="small"
                              className={`perf-engagement-chip perf-engagement-${feedback.engagement_level.toLowerCase()}`}
                            />
                          </TableCell>
                          <TableCell>
                            {new Date(feedback.feedback_date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => handleViewFeedback(feedback)}
                              className="perf-view-btn"
                            >
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      {/* Tab 1: Performance Overview */}
      {tabValue === 1 && (
        <Box className="perf-tab-content">
          <Grid container spacing={2} className="perf-filter-container">
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Department</InputLabel>
                <Select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  label="Department"
                >
                  <MenuItem value="">All Departments</MenuItem>
                  {departments.map(dept => (
                    <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Month</InputLabel>
                <Select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  label="Month"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <MenuItem key={i + 1} value={i + 1}>
                      {new Date(2000, i).toLocaleString('default', { month: 'long' })}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Year</InputLabel>
                <Select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  label="Year"
                >
                  {[2023, 2024, 2025, 2026].map(year => (
                    <MenuItem key={year} value={year}>{year}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Button
                variant="contained"
                onClick={fetchAllPerformance}
                className="perf-refresh-btn"
                fullWidth
              >
                Refresh Data
              </Button>
            </Grid>
          </Grid>

          {loading ? (
            <Box className="perf-loading-container">
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* Performance Distribution Chart */}
              {allEmployeesPerformance.length > 0 && (
                <Grid container spacing={3} className="perf-charts-container">
                  <Grid item xs={12} md={6}>
                    <Paper className="perf-chart-paper">
                      <Typography variant="h6" className="perf-chart-title">
                        Performance Distribution
                      </Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={getPerformanceDistribution()}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value }) => `${name.split(" ")[0]}: ${value}`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {getPerformanceDistribution().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Paper className="perf-chart-paper">
                      <Typography variant="h6" className="perf-chart-title">
                        Department Performance Comparison
                      </Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={getDepartmentStats()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="department" />
                          <YAxis domain={[0, 100]} />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          <Bar dataKey="avgScore" fill="#4CAF50" name="Avg Score" />
                        </BarChart>
                      </ResponsiveContainer>
                    </Paper>
                  </Grid>
                </Grid>
              )}

              <TableContainer component={Paper} className="perf-table-container">
                <Table>
                  <TableHead>
                    <TableRow className="perf-table-header">
                      <TableCell><strong>Employee</strong></TableCell>
                      <TableCell><strong>Department</strong></TableCell>
                      <TableCell><strong>Overall Score</strong></TableCell>
                      <TableCell><strong>Grade</strong></TableCell>
                      <TableCell><strong>Attendance %</strong></TableCell>
                      <TableCell><strong>Task Completion %</strong></TableCell>
                      <TableCell><strong>Rating</strong></TableCell>
                      <TableCell><strong>Action</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {allEmployeesPerformance.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center">
                          <Typography className="perf-no-data">
                            No performance data available for selected period
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      allEmployeesPerformance.map((emp) => (
                        <TableRow key={emp.emp_id} hover className="perf-table-row">
                          <TableCell>
                            <Box>
                              <Typography fontWeight="600">{emp.name}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {emp.designation}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{emp.department}</TableCell>
                          <TableCell>
                            <Box>
                              <Typography 
                                fontWeight="700" 
                                fontSize="1.2rem" 
                                style={{ color: getPerformanceColor(emp.performance.overall_performance_score) }}
                              >
                                {emp.performance.overall_performance_score.toFixed(1)}
                              </Typography>
                              <LinearProgress 
                                variant="determinate" 
                                value={emp.performance.overall_performance_score} 
                                className="perf-progress-bar"
                                sx={{
                                  '& .MuiLinearProgress-bar': {
                                    backgroundColor: getPerformanceColor(emp.performance.overall_performance_score)
                                  }
                                }}
                              />
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={getPerformanceGrade(emp.performance.overall_performance_score)}
                              className="perf-grade-chip"
                              style={{
                                backgroundColor: getPerformanceColor(emp.performance.overall_performance_score),
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography fontWeight={600}>
                              {emp.performance.attendance.attendance_percentage}%
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography fontWeight={600}>
                              {emp.performance.tasks.completion_percentage.toFixed(1)}%
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Rating value={emp.performance.rating.score} readOnly size="small" precision={0.5} />
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => fetchIndividualPerformance(emp.emp_id)}
                              className="perf-view-btn"
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </Box>
      )}

      {/* Tab 2: Department Analytics */}
      {tabValue === 2 && (
        <Box className="perf-tab-content">
          {allEmployeesPerformance.length === 0 ? (
            <Paper className="perf-no-data-paper">
              <Typography className="perf-no-data">
                No data available. Please select a period in the Performance Overview tab first.
              </Typography>
              <Button
                variant="contained"
                onClick={() => setTabValue(1)}
                className="perf-refresh-btn"
                sx={{ mt: 2 }}
              >
                Go to Performance Overview
              </Button>
            </Paper>
          ) : (
            <>
              <Grid container spacing={3} className="perf-dept-cards-container">
                {getDepartmentStats().map((dept) => (
                  <Grid item xs={12} md={6} lg={4} key={dept.department}>
                    <Card className="perf-dept-card">
                      <CardContent>
                        <Typography variant="h6" className="perf-dept-title">
                          {dept.department}
                        </Typography>
                        <Typography variant="body2" className="perf-dept-subtitle">
                          👥 {dept.employees} Employees
                        </Typography>
                        <Divider sx={{ my: 2 }} />
                        <Box className="perf-dept-score-box">
                          <Typography variant="body2" className="perf-stat-label">
                            Average Performance Score
                          </Typography>
                          <Typography 
                            variant="h3" 
                            className="perf-dept-score"
                            style={{ color: getPerformanceColor(dept.avgScore) }}
                          >
                            {dept.avgScore}
                          </Typography>
                          <Chip 
                            label={getPerformanceGrade(dept.avgScore)}
                            className="perf-grade-chip"
                            style={{
                              backgroundColor: getPerformanceColor(dept.avgScore),
                              marginTop: '8px',
                            }}
                          />
                        </Box>
                        <Box className="perf-dept-metrics">
                          <Typography variant="body2">
                            📊 Avg Attendance: <strong>{dept.avgAttendance}%</strong>
                          </Typography>
                        </Box>
                        <Box className="perf-dept-metrics">
                          <Typography variant="body2">
                            ✅ Avg Task Completion: <strong>{dept.avgTaskCompletion}%</strong>
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              <Paper className="perf-chart-paper" sx={{ mt: 4 }}>
                <Typography variant="h6" className="perf-chart-title">
                  Department Performance Comparison
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={getDepartmentStats()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="department" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="avgScore" fill="#4CAF50" name="Avg Score" />
                    <Bar dataKey="avgAttendance" fill="#2196F3" name="Avg Attendance %" />
                    <Bar dataKey="avgTaskCompletion" fill="#FF9800" name="Avg Task Completion %" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>

              <Paper className="perf-chart-paper" sx={{ mt: 3 }}>
                <Typography variant="h6" className="perf-chart-title">
                  Department Metrics Radar
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={getDepartmentStats()}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="department" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar
                      name="Avg Score"
                      dataKey="avgScore"
                      stroke="#4CAF50"
                      fill="#4CAF50"
                      fillOpacity={0.6}
                    />
                    <Radar
                      name="Avg Attendance"
                      dataKey="avgAttendance"
                      stroke="#2196F3"
                      fill="#2196F3"
                      fillOpacity={0.6}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </Paper>
            </>
          )}
        </Box>
      )}

      {/* Feedback Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle className="perf-dialog-title">
          {isNewFeedback ? "📝 New Feedback" : "📄 Feedback Details"}
        </DialogTitle>
        <DialogContent className="perf-dialog-content">
          <Box className="perf-dialog-inner">
            <Grid container spacing={2}>
              {isNewFeedback ? (
                <Grid item xs={12}>
                  <FormControl fullWidth required>
                    <InputLabel>{labelWithAsterisk("Select Employee")}</InputLabel>
                    <Select
                      value={feedbackData.employeeId}
                      onChange={(e) => handleEmployeeChange(e.target.value)}
                      label={labelWithAsterisk("Select Employee")}
                    >
                      {employees.map(emp => (
                        <MenuItem key={emp.emp_id} value={emp.emp_id}>
                          {emp.fullName} - {emp.designation} ({emp.department})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              ) : (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Feedback ID"
                      value={feedbackData.feedbackId}
                      InputProps={{ readOnly: true }}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Employee Name"
                      value={feedbackData.employeeName}
                      InputProps={{ readOnly: true }}
                      size="small"
                    />
                  </Grid>
                </>
              )}

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Score (0-100)"
                  type="number"
                  value={feedbackData.score}
                  onChange={(e) => setFeedbackData({ ...feedbackData, score: e.target.value })}
                  InputProps={{ 
                    readOnly: !isNewFeedback,
                    inputProps: { min: 0, max: 100 }
                  }}
                  size="small"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={labelWithAsterisk("Date")}
                  type="date"
                  value={feedbackData.date}
                  onChange={(e) => setFeedbackData({ ...feedbackData, date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{ readOnly: !isNewFeedback }}
                  size="small"
                />
              </Grid>

              <Grid item xs={12}>
                <Typography fontSize={14} fontWeight="bold" mb={1}>
                  {labelWithAsterisk("Rating")}
                </Typography>
                <Rating
                  value={feedbackData.ratings}
                  readOnly={!isNewFeedback}
                  onChange={(e, newVal) => isNewFeedback && setFeedbackData({ ...feedbackData, ratings: newVal })}
                  size="large"
                  precision={0.5}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>{labelWithAsterisk("Engagement Level")}</InputLabel>
                  <Select
                    value={feedbackData.engagementLevel}
                    onChange={(e) => setFeedbackData({ ...feedbackData, engagementLevel: e.target.value })}
                    disabled={!isNewFeedback}
                    label={labelWithAsterisk("Engagement Level")}
                  >
                    <MenuItem value="High">High</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="Low">Low</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Typography fontSize={14} fontWeight="bold" mb={1}>
                  {labelWithAsterisk("Comments")}
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  value={feedbackData.comments}
                  onChange={(e) => setFeedbackData({ ...feedbackData, comments: e.target.value })}
                  InputProps={{ readOnly: !isNewFeedback }}
                  placeholder="Enter detailed feedback comments..."
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions className="perf-dialog-actions">
          {isNewFeedback ? (
            <>
              <Button
                variant="contained"
                onClick={handleSubmitFeedback}
                disabled={loading}
                className="perf-submit-btn"
              >
                {loading ? <CircularProgress size={24} /> : "Submit"}
              </Button>
              <Button
                variant="outlined"
                onClick={() => setOpenDialog(false)}
                className="perf-cancel-btn"
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button
              variant="contained"
              onClick={() => setOpenDialog(false)}
              className="perf-close-btn"
            >
              Close
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Performance Details Dialog */}
      <Dialog 
        open={viewPerformanceDialog} 
        onClose={() => setViewPerformanceDialog(false)} 
        fullWidth 
        maxWidth="md"
      >
        <DialogTitle className="perf-details-dialog-title">
          📊 Employee Performance Details
        </DialogTitle>
        <DialogContent className="perf-dialog-content">
          {selectedPerformanceData && (
            <Box>
              <Grid container spacing={2} mb={3}>
                <Grid item xs={12}>
                  <Paper className="perf-employee-info-paper">
                    <Typography variant="h6" fontWeight="700">
                      {selectedPerformanceData.employee.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedPerformanceData.employee.designation} - {selectedPerformanceData.employee.department}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Period: {selectedPerformanceData.period.start_date} to {selectedPerformanceData.period.end_date}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              <Grid container spacing={2} mb={3}>
                <Grid item xs={6} sm={3}>
                  <Card className="perf-metric-card">
                    <CardContent>
                      <Typography variant="body2" className="perf-stat-label">
                        Overall Score
                      </Typography>
                      <Typography 
                        variant="h3" 
                        fontWeight="700" 
                        style={{ color: getPerformanceColor(selectedPerformanceData.performance.overall_performance_score) }}
                      >
                        {selectedPerformanceData.performance.overall_performance_score.toFixed(1)}
                      </Typography>
                      <Chip 
                        label={getPerformanceGrade(selectedPerformanceData.performance.overall_performance_score)}
                        className="perf-grade-chip"
                        style={{
                          backgroundColor: getPerformanceColor(selectedPerformanceData.performance.overall_performance_score),
                          marginTop: '8px',
                        }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Card className="perf-metric-card">
                    <CardContent>
                      <Typography variant="body2" className="perf-stat-label">
                        Attendance
                      </Typography>
                      <Typography variant="h3" fontWeight="700" style={{ color: "#2196F3" }}>
                        {selectedPerformanceData.performance.attendance.attendance_percentage}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {selectedPerformanceData.performance.attendance.present}/{selectedPerformanceData.performance.attendance.total_days} days
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Card className="perf-metric-card">
                    <CardContent>
                      <Typography variant="body2" className="perf-stat-label">
                        Tasks
                      </Typography>
                      <Typography variant="h3" fontWeight="700" style={{ color: "#4CAF50" }}>
                        {selectedPerformanceData.performance.tasks.completion_percentage.toFixed(1)}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {selectedPerformanceData.performance.tasks.completed}/{selectedPerformanceData.performance.tasks.total} completed
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Card className="perf-metric-card">
                    <CardContent>
                      <Typography variant="body2" className="perf-stat-label">
                        Leave Count
                      </Typography>
                      <Typography variant="h3" fontWeight="700" style={{ color: "#FF9800" }}>
                        {selectedPerformanceData.performance.leave_count}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        days taken
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Paper className="perf-breakdown-paper">
                <Typography variant="h6" fontWeight="700" mb={2}>
                  📋 Task Status Breakdown
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Box textAlign="center">
                      <Typography variant="h4" fontWeight="700" style={{ color: "#4CAF50" }}>
                        {selectedPerformanceData.performance.tasks.completed}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Completed
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box textAlign="center">
                      <Typography variant="h4" fontWeight="700" style={{ color: "#2196F3" }}>
                        {selectedPerformanceData.performance.tasks.in_progress}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        In Progress
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box textAlign="center">
                      <Typography variant="h4" fontWeight="700" style={{ color: "#FF9800" }}>
                        {selectedPerformanceData.performance.tasks.pending}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Pending
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box textAlign="center">
                      <Typography variant="h4" fontWeight="700" style={{ color: "#F44336" }}>
                        {selectedPerformanceData.performance.tasks.overdue}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Overdue
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>

              <Paper className="perf-breakdown-paper" sx={{ mt: 2 }}>
                <Typography variant="h6" fontWeight="700" mb={2}>
                  📅 Attendance Breakdown
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Box textAlign="center">
                      <Typography variant="h4" fontWeight="700" style={{ color: "#4CAF50" }}>
                        {selectedPerformanceData.performance.attendance.present}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Present
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box textAlign="center">
                      <Typography variant="h4" fontWeight="700" style={{ color: "#FF9800" }}>
                        {selectedPerformanceData.performance.attendance.leave}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Leave
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box textAlign="center">
                      <Typography variant="h4" fontWeight="700" style={{ color: "#F44336" }}>
                        {selectedPerformanceData.performance.attendance.absent}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Absent
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>

              <Box mt={3}>
                <Typography variant="h6" fontWeight="700" mb={2}>
                  📈 Performance Visualization
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      { 
                        name: 'Attendance', 
                        percentage: selectedPerformanceData.performance.attendance.attendance_percentage
                      },
                      { 
                        name: 'Task Completion', 
                        percentage: selectedPerformanceData.performance.tasks.completion_percentage
                      },
                      { 
                        name: 'Overall Score', 
                        percentage: selectedPerformanceData.performance.overall_performance_score
                      },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="percentage" fill="#4CAF50" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions className="perf-dialog-actions">
          <Button 
            onClick={() => setViewPerformanceDialog(false)}
            variant="contained"
            className="perf-close-btn"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}