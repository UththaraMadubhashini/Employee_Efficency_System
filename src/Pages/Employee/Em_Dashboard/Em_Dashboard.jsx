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
  Chip,
} from '@mui/material';
import { PieChart, Pie, Cell } from 'recharts';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './Em_Dashboard.css';

const API_BASE_URL = 'http://127.0.0.1:5001';

const Dashboard = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get employee ID from localStorage or session
  const empId = localStorage.getItem('emp_id') || 'EMP001';
  
  // State for real-time data
  const [performanceScore, setPerformanceScore] = useState(0);
  const [performanceGrade, setPerformanceGrade] = useState('N/A');
  const [taskData, setTaskData] = useState([]);
  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState({
    checkedIn: false,
    checkInTime: null,
    checkOutTime: null
  });
  const [serverConnected, setServerConnected] = useState(true);

  const COLORS = ['#6659e8', '#78d1ec', '#FFA500'];

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

      // Check server health
      const healthCheck = await fetch(`${API_BASE_URL}/health`).catch(() => null);
      
      if (!healthCheck || !healthCheck.ok) {
        setServerConnected(false);
        throw new Error('Server is not running');
      }
      
      setServerConnected(true);

      // Fetch employee data in parallel
      const [
        scoreRes,
        tasksRes,
        attendanceRes
      ] = await Promise.all([
        fetch(`${API_BASE_URL}/calculate_employee_score?emp_id=${empId}`).catch(err => ({ ok: false })),
        fetch(`${API_BASE_URL}/get_tasks?emp_id=${empId}&role=employee`).catch(err => ({ ok: false })),
        fetch(`${API_BASE_URL}/get_attendance?emp_id=${empId}`).catch(err => ({ ok: false }))
      ]);

      // Parse responses
      const scoreData = scoreRes.ok ? await scoreRes.json() : { success: false };
      const tasksData = tasksRes.ok ? await tasksRes.json() : { success: false, tasks: [] };
      const attendanceData = attendanceRes.ok ? await attendanceRes.json() : { success: false, records: [] };

      // Process performance score
      if (scoreData.success) {
        setPerformanceScore(scoreData.score || 0);
        setPerformanceGrade(scoreData.grade || 'N/A');
      }

      // Process tasks
      if (tasksData.success && tasksData.tasks.length > 0) {
        const tasks = tasksData.tasks;
        const completed = tasks.filter(t => t.status === 'Completed').length;
        const inProgress = tasks.filter(t => t.status === 'In Progress').length;
        const pending = tasks.filter(t => t.status === 'Pending' || t.status === 'Overdue').length;

        const chartData = [
          { name: 'Completed', value: completed },
          { name: 'In Progress', value: inProgress },
          { name: 'Pending', value: pending }
        ].filter(item => item.value > 0);

        setTaskData(chartData.length > 0 ? chartData : [{ name: 'No Tasks', value: 1 }]);
      } else {
        setTaskData([{ name: 'No Tasks', value: 1 }]);
      }

      // Process attendance
      if (attendanceData.success && attendanceData.records.length > 0) {
        const records = attendanceData.records;
        const todayRecord = records.find(r => r.date === today);
        
        if (todayRecord) {
          setTodayAttendance({
            checkedIn: !!todayRecord.check_in_time,
            checkInTime: todayRecord.check_in_time,
            checkOutTime: todayRecord.check_out_time
          });
          setAttendanceStatus(todayRecord.status);
        } else {
          setTodayAttendance({
            checkedIn: false,
            checkInTime: null,
            checkOutTime: null
          });
          setAttendanceStatus('Not Marked');
        }
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Unable to load dashboard data. Please check server connection.');
      setLoading(false);
    }
  };

  const handleCheckIn = () => {
    navigate('/employee/attendance');
  };

  if (loading && performanceScore === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      {/* Top Section with Status and Check-In */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
          flexWrap: 'wrap',
          gap: 2
        }}
      >
        {/* Server Status */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 2,
              py: 1,
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
              {serverConnected ? 'Connected' : 'Offline'}
            </Typography>
          </Box>

          {/* Attendance Status Chip */}
          {attendanceStatus && (
            <Chip
              label={attendanceStatus}
              color={
                attendanceStatus === 'Present' ? 'success' :
                attendanceStatus === 'Leave' ? 'warning' :
                attendanceStatus === 'Absent' ? 'error' : 'default'
              }
              size="small"
              sx={{ fontWeight: 'bold' }}
            />
          )}
        </Box>

        {/* Check-In Button */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {todayAttendance.checkedIn && (
            <Box sx={{ textAlign: 'right', mr: 2 }}>
              <Typography variant="caption" color="textSecondary" display="block">
                Check-in: {todayAttendance.checkInTime || 'N/A'}
              </Typography>
              {todayAttendance.checkOutTime && (
                <Typography variant="caption" color="textSecondary" display="block">
                  Check-out: {todayAttendance.checkOutTime}
                </Typography>
              )}
            </Box>
          )}
          <Box
            sx={{
              width: 12,
              height: 12,
              bgcolor: todayAttendance.checkedIn ? '#17F255' : '#FFA500',
              borderRadius: '50%',
              animation: !todayAttendance.checkedIn ? 'pulse 2s infinite' : 'none'
            }}
          />
          <Button
            variant="outlined"
            onClick={handleCheckIn}
            sx={{
              bgcolor: todayAttendance.checkedIn ? '#17F255' : '#67BCE0',
              ':hover': { bgcolor: '#ffffff' },
              borderRadius: '60px',
              border: '3px solid #000000',
              color: '#000000',
              textTransform: 'none',
              boxShadow: 2,
              fontWeight: 'bold'
            }}
          >
            {todayAttendance.checkedIn ? 'Check Out' : 'Check In'}
          </Button>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={fetchDashboardData}>
              RETRY
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* Dashboard Cards */}
      <Grid container spacing={3}>
        {/* Performance Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Card 
            sx={{ 
              border: '2px solid #6659e8',
              background: 'linear-gradient(135deg, #faf5ff 0%, #ffffff 100%)',
              height: '100%'
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold" color="#6659e8">
                  Performance
                </Typography>
                <Chip 
                  label={performanceGrade} 
                  color="primary" 
                  size="small"
                  sx={{ 
                    fontWeight: 'bold',
                    bgcolor: '#6659e8'
                  }}
                />
              </Box>
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography 
                  variant="h2" 
                  fontWeight="bold" 
                  color="#6659e8"
                  sx={{
                    textShadow: '0px 2px 4px rgba(102, 89, 232, 0.2)'
                  }}
                >
                  {performanceScore.toFixed(1)}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Out of 100
                </Typography>
              </Box>
              <Box 
                sx={{ 
                  mt: 2, 
                  height: 8, 
                  bgcolor: '#e0e0e0', 
                  borderRadius: 4,
                  overflow: 'hidden'
                }}
              >
                <Box
                  sx={{
                    height: '100%',
                    width: `${performanceScore}%`,
                    background: 'linear-gradient(90deg, #6659e8, #67BCE0)',
                    borderRadius: 4,
                    transition: 'width 1s ease'
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Attendance Calendar Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Card 
            sx={{ 
              border: '2px solid #67BCE0',
              background: 'linear-gradient(135deg, #f0f9ff 0%, #ffffff 100%)',
              height: '100%'
            }}
          >
            <CardContent>
              <Typography variant="h6" fontWeight="bold" color="#67BCE0" sx={{ mb: 2 }}>
                Calendar
              </Typography>
              <Calendar
                className="employee-dashboard-calendar"
                value={date}
                onChange={setDate}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Task Pie Chart Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Card 
            sx={{ 
              border: '2px solid #78d1ec',
              background: 'linear-gradient(135deg, #f0f9ff 0%, #ffffff 100%)',
              height: '100%'
            }}
          >
            <CardContent>
              <Typography variant="h6" fontWeight="bold" color="#6659e8" sx={{ mb: 2 }}>
                Tasks Overview
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <PieChart width={220} height={180}>
                  <Pie
                    data={taskData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {taskData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </Box>
              <Box display="flex" flexDirection="column" gap={1}>
                {taskData.map((entry, index) => (
                  <Box 
                    key={index} 
                    display="flex" 
                    alignItems="center" 
                    justifyContent="space-between"
                    sx={{
                      p: 1,
                      borderRadius: 1,
                      bgcolor: `${COLORS[index % COLORS.length]}15`,
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateX(4px)',
                        bgcolor: `${COLORS[index % COLORS.length]}25`
                      }
                    }}
                  >
                    <Box display="flex" alignItems="center">
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          bgcolor: COLORS[index % COLORS.length],
                          mr: 1,
                          borderRadius: '2px',
                        }}
                      />
                      <Typography variant="body2" fontWeight="600">
                        {entry.name}
                      </Typography>
                    </Box>
                    <Chip 
                      label={entry.value}
                      size="small"
                      sx={{
                        bgcolor: COLORS[index % COLORS.length],
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;