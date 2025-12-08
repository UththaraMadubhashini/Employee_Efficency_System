import React, { useState, useEffect } from "react";
import {
  Box, Typography, Grid, Button, Stack, CircularProgress, Alert, Paper, Chip,
  Card, CardContent, LinearProgress, Divider, MenuItem, Select, FormControl,
  InputLabel, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Rating,
} from "@mui/material";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Legend, LineChart, Line, CartesianGrid, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, AreaChart, Area,
} from "recharts";
import {
  TrendingUp, TrendingDown, CheckCircle, EventAvailable, Assignment, Star, Schedule, Person,
} from "@mui/icons-material";
import "./Performance.css";

const API_BASE_URL = "http://127.0.0.1:5001";

export default function Performance() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [performanceData, setPerformanceData] = useState(null);
  const [employeeInfo, setEmployeeInfo] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [tasksData, setTasksData] = useState([]);
  const [feedbackData, setFeedbackData] = useState([]);
  const [performanceScore, setPerformanceScore] = useState(null);

  useEffect(() => {
    fetchAllEmployeeData();
  }, [selectedMonth, selectedYear]);

  const fetchAllEmployeeData = async () => {
    try {
      setLoading(true);
      setError(null);
      const empId = sessionStorage.getItem("emp_id") || localStorage.getItem("emp_id");
      
      if (!empId) {
        setError("Employee ID not found. Please login again.");
        setLoading(false);
        return;
      }

      await Promise.all([
        fetchEmployeeInfo(empId),
        fetchPerformanceScore(empId),
        fetchAttendanceData(empId),
        fetchTasksData(empId),
        fetchFeedbackData(empId),
      ]);
    } catch (err) {
      console.error("Performance fetch error:", err);
      setError(err.message || "Failed to load performance data");
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeeInfo = async (empId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/get_all_employees`);
      const data = await response.json();
      if (data.success) {
        const employee = data.employees.find(emp => emp.emp_id === empId);
        if (employee) {
          setEmployeeInfo({
            name: employee.fullName,
            designation: employee.designation,
            department: employee.department,
            email: employee.email,
          });
        }
      }
    } catch (err) {
      console.error("Error fetching employee info:", err);
    }
  };

  const fetchPerformanceScore = async (empId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/calculate_employee_score?emp_id=${empId}`);
      const data = await response.json();
      if (data.success) {
        setPerformanceScore(data);
        const perfData = {
          overall_performance_score: data.score,
          attendance: {
            present: Math.round((data.completion_rate / 100) * 20),
            total_days: 22,
            attendance_percentage: 85,
            leave: 2,
            absent: 1,
          },
          tasks: {
            completed: data.completed_tasks,
            total: data.total_tasks,
            completion_percentage: data.completion_rate,
            pending: data.pending_tasks,
            in_progress: data.in_progress_tasks,
            overdue: data.overdue_tasks,
          },
          rating: {
            score: data.score / 20,
            engagement_level: data.performance_level,
            latest_comment: "Keep up the excellent work!",
            feedback_date: new Date().toISOString(),
          },
          leave_count: 2,
        };
        setPerformanceData(perfData);
      }
    } catch (err) {
      console.error("Error fetching performance score:", err);
    }
  };

  const fetchAttendanceData = async (empId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/get_attendance?emp_id=${empId}`);
      const data = await response.json();
      if (data.success) {
        setAttendanceRecords(data.records.slice(0, 10));
      }
    } catch (err) {
      console.error("Error fetching attendance:", err);
    }
  };

  const fetchTasksData = async (empId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/get_tasks?emp_id=${empId}&role=employee`);
      const data = await response.json();
      if (data.success) {
        setTasksData(data.tasks.slice(0, 10));
      }
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  const fetchFeedbackData = async (empId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/get_feedback_list`);
      const data = await response.json();
      if (data.success) {
        const myFeedback = data.feedback_list.filter(f => f.emp_id === empId);
        setFeedbackData(myFeedback.slice(0, 5));
      }
    } catch (err) {
      console.error("Error fetching feedback:", err);
    }
  };

  const getPerformanceLevel = (score) => {
    if (score >= 90) return { level: "Excellent", color: "#4CAF50" };
    if (score >= 75) return { level: "Good", color: "#2196F3" };
    if (score >= 60) return { level: "Average", color: "#FF9800" };
    return { level: "Needs Improvement", color: "#F44336" };
  };

  const getTaskStatusColor = (status) => {
    const colors = {
      Completed: "#4CAF50",
      "In Progress": "#2196F3",
      Pending: "#FF9800",
      Overdue: "#F44336",
    };
    return colors[status] || "#9E9E9E";
  };

  const getAttendanceTrend = () => {
    return attendanceRecords.slice(0, 7).reverse().map(record => ({
      date: new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      status: record.status === 'Present' ? 100 : record.status === 'Leave' ? 50 : 0,
      statusLabel: record.status,
    }));
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper className="emp-perf-tooltip">
          <Typography variant="body2" fontWeight="bold">{label}</Typography>
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

  if (loading) {
    return (
      <Box className="emp-perf-container" display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="emp-perf-container">
        <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>
        <Button variant="contained" onClick={fetchAllEmployeeData} className="emp-perf-retry-btn" sx={{ mt: 2 }}>
          Retry
        </Button>
      </Box>
    );
  }

  if (!performanceData) {
    return (
      <Box className="emp-perf-container">
        <Alert severity="info">No performance data available</Alert>
      </Box>
    );
  }

  const performanceLevel = getPerformanceLevel(performanceData.overall_performance_score);
  const taskCompletionData = [
    { name: "Completed", value: performanceData.tasks.completed, color: "#4CAF50" },
    { name: "In Progress", value: performanceData.tasks.in_progress, color: "#2196F3" },
    { name: "Pending", value: performanceData.tasks.pending, color: "#FF9800" },
    { name: "Overdue", value: performanceData.tasks.overdue, color: "#F44336" },
  ].filter(item => item.value > 0);

  const attendanceBarData = [
    { name: "Present", value: performanceData.attendance.present, fill: "#4CAF50" },
    { name: "Absent", value: performanceData.attendance.absent, fill: "#F44336" },
    { name: "Leave", value: performanceData.attendance.leave, fill: "#2196F3" },
  ];

  return (
    <Box className="emp-perf-container">
      {/* Header */}
      <Paper elevation={3} className="emp-perf-header">
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box display="flex" alignItems="center" gap={2}>
              <Box className="emp-perf-avatar">
                <Person sx={{ fontSize: 40, color: "#fff" }} />
              </Box>
              <Box>
                <Typography variant="h4" className="emp-perf-title">My Performance Dashboard</Typography>
                <Typography variant="subtitle1" color="text.secondary">{employeeInfo?.name} • {employeeInfo?.designation}</Typography>
                <Typography variant="body2" color="text.secondary">{employeeInfo?.department}</Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Month</InputLabel>
              <Select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} label="Month">
                {Array.from({ length: 12 }, (_, i) => (
                  <MenuItem key={i + 1} value={i + 1}>
                    {new Date(2000, i).toLocaleString('default', { month: 'long' })}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Year</InputLabel>
              <Select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} label="Year">
                {[2023, 2024, 2025, 2026].map(year => (
                  <MenuItem key={year} value={year}>{year}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Score Card */}
      <Paper elevation={4} className="emp-perf-score-card">
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Typography variant="h5" className="emp-perf-score-label">Overall Performance Score</Typography>
            <Box display="flex" alignItems="center" gap={2} mt={2}>
              <Typography variant="h1" className="emp-perf-score-value" style={{ color: performanceLevel.color }}>
                {performanceData.overall_performance_score.toFixed(1)}
              </Typography>
              <Box>
                <Chip label={performanceLevel.level} className="emp-perf-level-chip" style={{ backgroundColor: performanceLevel.color }} />
                {performanceScore && (
                  <Typography variant="body2" color="text.secondary" mt={1}>Grade: <strong>{performanceScore.grade}</strong></Typography>
                )}
              </Box>
            </Box>
            <LinearProgress variant="determinate" value={performanceData.overall_performance_score} className="emp-perf-progress"
              sx={{ mt: 2, '& .MuiLinearProgress-bar': { backgroundColor: performanceLevel.color } }} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Box className="emp-perf-score-breakdown">
              <Typography variant="body2" fontWeight="600" mb={1}>Performance Breakdown:</Typography>
              <Box className="emp-perf-breakdown-item">
                <Typography variant="caption">Attendance:</Typography>
                <Typography variant="body2" fontWeight="700">{performanceData.attendance.attendance_percentage}%</Typography>
              </Box>
              <Box className="emp-perf-breakdown-item">
                <Typography variant="caption">Tasks:</Typography>
                <Typography variant="body2" fontWeight="700">{performanceData.tasks.completion_percentage.toFixed(1)}%</Typography>
              </Box>
              <Box className="emp-perf-breakdown-item">
                <Typography variant="caption">Rating:</Typography>
                <Rating value={performanceData.rating.score} readOnly size="small" precision={0.5} />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Stats Cards */}
      <Grid container spacing={3} className="emp-perf-stats-grid">
        <Grid item xs={12} sm={6} md={3}>
          <Card className="emp-perf-stat-card emp-perf-stat-attendance">
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="body2" className="emp-perf-stat-label">Attendance Rate</Typography>
                  <Typography variant="h3" className="emp-perf-stat-value">{performanceData.attendance.attendance_percentage}%</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {performanceData.attendance.present}/{performanceData.attendance.total_days} days
                  </Typography>
                </Box>
                <Box className="emp-perf-stat-icon emp-perf-icon-attendance">
                  <EventAvailable sx={{ fontSize: 32 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="emp-perf-stat-card emp-perf-stat-tasks">
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="body2" className="emp-perf-stat-label">Tasks Completed</Typography>
                  <Typography variant="h3" className="emp-perf-stat-value">{performanceData.tasks.completed}</Typography>
                  <Typography variant="caption" color="text.secondary">{performanceData.tasks.completion_percentage.toFixed(1)}% completion</Typography>
                </Box>
                <Box className="emp-perf-stat-icon emp-perf-icon-tasks">
                  <CheckCircle sx={{ fontSize: 32 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="emp-perf-stat-card emp-perf-stat-rating">
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="body2" className="emp-perf-stat-label">Employee Rating</Typography>
                  <Typography variant="h3" className="emp-perf-stat-value">{performanceData.rating.score.toFixed(1)}</Typography>
                  <Rating value={performanceData.rating.score} readOnly size="small" precision={0.5} />
                </Box>
                <Box className="emp-perf-stat-icon emp-perf-icon-rating">
                  <Star sx={{ fontSize: 32 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="emp-perf-stat-card emp-perf-stat-overdue">
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="body2" className="emp-perf-stat-label">Overdue Tasks</Typography>
                  <Typography variant="h3" className="emp-perf-stat-value">{performanceData.tasks.overdue}</Typography>
                  <Typography variant="caption" color="text.secondary">{performanceData.tasks.pending} pending</Typography>
                </Box>
                <Box className="emp-perf-stat-icon emp-perf-icon-overdue">
                  <Schedule sx={{ fontSize: 32 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} className="emp-perf-charts-section">
        <Grid item xs={12} md={6} sx={{ mb: 4 }}>
          <Paper className="emp-perf-chart-paper">
            <Typography variant="h6" className="emp-perf-chart-title">Task Status Distribution</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={taskCompletionData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value"
                  label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}>
                  {taskCompletionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6} sx={{ mb: 4 }}>
          <Paper className="emp-perf-chart-paper">
            <Typography variant="h6" className="emp-perf-chart-title">Attendance Breakdown</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={attendanceBarData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {attendanceBarData.map((entry, index) => (
                    <Cell key={`cell-bar-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      
        {attendanceRecords.length > 0 && (
          <Grid item xs={12} md={6} sx={{ mb: 4 }}>
            <Paper className="emp-perf-chart-paper">
              <Typography variant="h6" className="emp-perf-chart-title">Recent Attendance Trend</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={getAttendanceTrend()}>
                  <defs>
                    <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#4CAF50" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="status" stroke="#4CAF50" fillOpacity={1} fill="url(#colorAttendance)" name="Attendance" />
                </AreaChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Tasks Table */}
      {tasksData.length > 0 && (
        <Paper className="emp-perf-table-paper">
          <Typography variant="h6" className="emp-perf-section-title">Recent Tasks</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow className="emp-perf-table-header">
                  <TableCell><strong>Task Name</strong></TableCell>
                  <TableCell><strong>Priority</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Due Date</strong></TableCell>
                  <TableCell><strong>Progress</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tasksData.map((task) => (
                  <TableRow key={task.id} hover className="emp-perf-table-row">
                    <TableCell>
                      <Typography variant="body2" fontWeight="600">{task.task_name}</Typography>
                      {task.description && (
                        <Typography variant="caption" color="text.secondary">
                          {task.description.substring(0, 50)}{task.description.length > 50 ? '...' : ''}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip label={task.priority} size="small"
                        className={`emp-perf-priority-chip emp-perf-priority-${task.priority.toLowerCase()}`} />
                    </TableCell>
                    <TableCell>
                      <Chip label={task.status} size="small"
                        style={{ backgroundColor: getTaskStatusColor(task.status), color: '#fff' }} />
                    </TableCell>
                    <TableCell>{task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell>
                      <Box sx={{ width: 100 }}>
                        <LinearProgress variant="determinate" 
                          value={task.status === 'Completed' ? 100 : task.status === 'In Progress' ? 50 : task.status === 'Pending' ? 10 : 0}
                          sx={{ height: 8, borderRadius: 4 }} />
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Feedback */}
      {feedbackData.length > 0 && (
        <Paper className="emp-perf-feedback-paper">
          <Typography variant="h6" className="emp-perf-section-title">Recent Feedback & Reviews</Typography>
          <Grid container spacing={2}>
            {feedbackData.map((feedback) => (
              <Grid item xs={12} md={6} key={feedback.id}>
                <Box className="emp-perf-feedback-card">
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body2" fontWeight="600">
                      {new Date(feedback.feedback_date).toLocaleDateString()}
                    </Typography>
                    <Rating value={feedback.rating} readOnly size="small" precision={0.5} />
                  </Box>
                  <Typography variant="body2" color="text.secondary" mb={1}>
                    Score: <strong>{feedback.score}</strong> | Engagement: <Chip label={feedback.engagement_level} size="small"
                      className={`emp-perf-engagement-chip emp-perf-engagement-${feedback.engagement_level.toLowerCase()}`} />
                  </Typography>
                  {feedback.comments && (
                    <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      "{feedback.comments}"
                    </Typography>
                  )}
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* Actions */}
      <Box className="emp-perf-actions">
        <Button variant="outlined" className="emp-perf-action-btn-outline" onClick={fetchAllEmployeeData}>
          Refresh Data
        </Button>
      </Box>
    </Box>
  );
}