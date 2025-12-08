import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './Ad_Dashboard.css';

const API_BASE_URL = 'http://127.0.0.1:5001';

const Ad_Dashboard = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for real-time data
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    onLeave: 0,
    avgPerformance: 0
  });
  
  const [departmentPerformance, setDepartmentPerformance] = useState([]);
  const [employeeStatus, setEmployeeStatus] = useState([]);
  const [taskOverview, setTaskOverview] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [serverConnected, setServerConnected] = useState(true);

  const STATUS_COLORS = ['#17F255', '#FFA500', '#6659e8'];
  const TASK_COLORS = ['#6659e8', '#67BCE0', '#78d1ec'];

  // Fetch all dashboard data
  useEffect(() => {
    fetchDashboardData();
    // Refresh data every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [date]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const today = date.toISOString().split('T')[0];

      // Check if server is running first
      const healthCheck = await fetch(`${API_BASE_URL}/health`).catch(() => null);
      
      if (!healthCheck || !healthCheck.ok) {
        setServerConnected(false);
        throw new Error('Server is not running. Please start the Flask server on port 5001.');
      }
      
      setServerConnected(true);

      // Fetch all data in parallel with error handling
      const [
        employeesRes,
        attendanceRes,
        statsRes,
        tasksRes,
        leaveRes,
        scoresRes
      ] = await Promise.all([
        fetch(`${API_BASE_URL}/get_all_employees`).catch(err => ({ ok: false, error: err })),
        fetch(`${API_BASE_URL}/get_all_attendance?date=${today}`).catch(err => ({ ok: false, error: err })),
        fetch(`${API_BASE_URL}/get_attendance_statistics?date=${today}`).catch(err => ({ ok: false, error: err })),
        fetch(`${API_BASE_URL}/get_tasks?role=admin`).catch(err => ({ ok: false, error: err })),
        fetch(`${API_BASE_URL}/get_leave_requests?role=admin&status=Pending`).catch(err => ({ ok: false, error: err })),
        fetch(`${API_BASE_URL}/get_all_employee_scores`).catch(err => ({ ok: false, error: err }))
      ]);

      // Parse responses with error handling
      const employees = employeesRes.ok ? await employeesRes.json() : { success: false, employees: [] };
      const attendance = attendanceRes.ok ? await attendanceRes.json() : { success: false };
      const statistics = statsRes.ok ? await statsRes.json() : { success: false };
      const tasks = tasksRes.ok ? await tasksRes.json() : { success: false, tasks: [] };
      const leaves = leaveRes.ok ? await leaveRes.json() : { success: false, requests: [] };
      const scores = scoresRes.ok ? await scoresRes.json() : { success: false, scores: [] };

      // Process employees data
      if (employees.success) {
        const totalEmp = employees.employees.length;
        setStats(prev => ({ ...prev, totalEmployees: totalEmp }));
      }

      // Process attendance statistics
      if (statistics.success) {
        const statData = statistics.statistics;
        setStats(prev => ({
          ...prev,
          presentToday: statData.present || 0,
          onLeave: statData.leave || 0
        }));

        // Employee status for pie chart
        const statusData = [
          { name: 'Present', value: statData.present || 0 },
          { name: 'On Leave', value: statData.leave || 0 },
          { name: 'Absent', value: statData.absent || 0 }
        ];
        setEmployeeStatus(statusData.filter(item => item.value > 0));
      }

      // Process tasks for overview
      if (tasks.success) {
        const tasksList = tasks.tasks;
        const completed = tasksList.filter(t => t.status === 'Completed').length;
        const inProgress = tasksList.filter(t => t.status === 'In Progress').length;
        const pending = tasksList.filter(t => t.status === 'Pending').length;

        setTaskOverview([
          { name: 'Completed', value: completed },
          { name: 'In Progress', value: inProgress },
          { name: 'Pending', value: pending }
        ].filter(item => item.value > 0));
      }

      // Process leave requests
      if (leaves.success) {
        setLeaveRequests(leaves.requests || []);
      }

      // Process performance scores by department
      if (scores.success && scores.scores.length > 0) {
        const deptScores = {};
        let totalScore = 0;
        let scoreCount = 0;

        scores.scores.forEach(emp => {
          const dept = emp.department || 'Unknown';
          if (!deptScores[dept]) {
            deptScores[dept] = { total: 0, count: 0 };
          }
          deptScores[dept].total += emp.score || 0;
          deptScores[dept].count += 1;
          totalScore += emp.score || 0;
          scoreCount += 1;
        });

        // Calculate average performance
        const avgPerf = scoreCount > 0 ? (totalScore / scoreCount / 10).toFixed(1) : 0;
        setStats(prev => ({ ...prev, avgPerformance: avgPerf }));

        // Department performance data
        const deptData = Object.keys(deptScores).map(dept => ({
          name: dept,
          performance: Math.round(deptScores[dept].total / deptScores[dept].count)
        }));
        setDepartmentPerformance(deptData.slice(0, 6)); // Top 6 departments
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      let errorMessage = 'Failed to load dashboard data.';
      
      if (err.message.includes('Server is not running')) {
        errorMessage = ' Server Error: Flask server is not running on port 5001. Please start the server using: python app.py';
      } else if (err.message.includes('NetworkError') || err.message.includes('Failed to fetch')) {
        errorMessage = ' Network Error: Cannot connect to the server. Please ensure Flask server is running on http://localhost:5001';
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  if (loading && stats.totalEmployees === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      {/* Header Section */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h4" fontWeight="bold">
            Admin Dashboard
          </Typography>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 2,
              py: 0.5,
              borderRadius: '20px',
              bgcolor: serverConnected ? '#f0fff4' : '#fff0f0',
              border: `2px solid ${serverConnected ? '#17F255' : '#e63946'}`
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: serverConnected ? '#17F255' : '#e63946',
              }}
            />
            <Typography variant="caption" fontWeight="bold">
              {serverConnected ? 'Server Online' : 'Server Offline'}
            </Typography>
          </Box>
        </Box>
        
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }} 
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={() => fetchDashboardData()}
            >
              RETRY
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* Stats Cards Row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ border: '2px solid #67BCE0', bgcolor: '#f0f9ff' }}>
            <CardContent>
              <Typography variant="body2" color="textSecondary">
                Total Employees
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="#6659e8">
                {stats.totalEmployees}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ border: '2px solid #17F255', bgcolor: '#f0fff4' }}>
            <CardContent>
              <Typography variant="body2" color="textSecondary">
                Present Today
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="#17F255">
                {stats.presentToday}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ border: '2px solid #FFA500', bgcolor: '#fff7ed' }}>
            <CardContent>
              <Typography variant="body2" color="textSecondary">
                On Leave
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="#FFA500">
                {stats.onLeave}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ border: '2px solid #6659e8', bgcolor: '#faf5ff' }}>
            <CardContent>
              <Typography variant="body2" color="textSecondary">
                Avg Performance
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="#6659e8">
                {stats.avgPerformance}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Dashboard Cards */}
      <Grid container spacing={2}>
        {/* Department Performance Bar Chart */}
        <Grid item xs={12} md={6}>
          <Card sx={{ border: '2px solid #67BCE0', height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Department Performance
              </Typography>
              {departmentPerformance.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={departmentPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="performance" fill="#6659e8" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 250 }}>
                  <Typography color="textSecondary">No performance data available</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Employee Status Pie Chart */}
        <Grid item xs={12} md={6}>
          <Card sx={{ border: '2px solid #67BCE0', height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Employee Status
              </Typography>
              {employeeStatus.length > 0 ? (
                <>
                  <Box display="flex" justifyContent="center" alignItems="center">
                    <PieChart width={250} height={200}>
                      <Pie
                        data={employeeStatus}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label
                      >
                        {employeeStatus.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={STATUS_COLORS[index % STATUS_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </Box>
                  <Box display="flex" justifyContent="space-evenly" sx={{ mt: 2 }}>
                    {employeeStatus.map((entry, index) => (
                      <Box key={index} display="flex" alignItems="center">
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            bgcolor: STATUS_COLORS[index],
                            mr: 1,
                            borderRadius: '2px',
                          }}
                        />
                        <Typography variant="caption">
                          {entry.name}: {entry.value}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 250 }}>
                  <Typography color="textSecondary">No attendance data available</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Task Overview */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ border: '2px solid #67BCE0' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Task Overview
              </Typography>
              {taskOverview.length > 0 ? (
                <>
                  <PieChart width={200} height={150}>
                    <Pie
                      data={taskOverview}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {taskOverview.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={TASK_COLORS[index % TASK_COLORS.length]}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                  <Box display="flex" flexDirection="column" gap={1} sx={{ mt: 2 }}>
                    {taskOverview.map((entry, index) => (
                      <Box key={index} display="flex" alignItems="center" justifyContent="space-between">
                        <Box display="flex" alignItems="center">
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              bgcolor: TASK_COLORS[index],
                              mr: 1,
                              borderRadius: '2px',
                            }}
                          />
                          <Typography variant="caption">{entry.name}</Typography>
                        </Box>
                        <Typography variant="caption" fontWeight="bold">
                          {entry.value}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                  <Typography color="textSecondary">No task data</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Calendar Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ border: '2px solid #67BCE0' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Calendar
              </Typography>
              <Calendar
                className="admin-calendar"
                value={date}
                onChange={setDate}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions & Pending Leaves Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ border: '2px solid #67BCE0' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Quick Actions
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/admin/add-employee')}
                  sx={{
                    bgcolor: '#67BCE0',
                    ':hover': { bgcolor: '#ffffff' },
                    borderRadius: '60px',
                    border: '2px solid #000000',
                    color: '#000000',
                    textTransform: 'none',
                    boxShadow: 1,
                  }}
                >
                  Add New Employee
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/admin/attendance')}
                  sx={{
                    bgcolor: '#6659e8',
                    ':hover': { bgcolor: '#ffffff' },
                    borderRadius: '60px',
                    border: '2px solid #000000',
                    color: '#ffffff',
                    textTransform: 'none',
                    boxShadow: 1,
                  }}
                >
                  View Attendance
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/admin/tasks')}
                  sx={{
                    bgcolor: '#78d1ec',
                    ':hover': { bgcolor: '#ffffff' },
                    borderRadius: '60px',
                    border: '2px solid #000000',
                    color: '#000000',
                    textTransform: 'none',
                    boxShadow: 1,
                  }}
                >
                  Manage Tasks
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/admin/leave-requests')}
                  sx={{
                    bgcolor: '#FFA500',
                    ':hover': { bgcolor: '#ffffff' },
                    borderRadius: '60px',
                    border: '2px solid #000000',
                    color: '#000000',
                    textTransform: 'none',
                    boxShadow: 1,
                    position: 'relative'
                  }}
                >
                  Leave Requests
                  {leaveRequests.length > 0 && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -5,
                        right: -5,
                        bgcolor: '#e63946',
                        color: 'white',
                        borderRadius: '50%',
                        width: 24,
                        height: 24,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}
                    >
                      {leaveRequests.length}
                    </Box>
                  )}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Ad_Dashboard;