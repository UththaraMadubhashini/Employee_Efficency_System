import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import { PieChart, Pie, Cell } from 'recharts';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './Em_Dashboard.css'; // <-- new CSS file for calendar

const Dashboard = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState(new Date());

  const pieData = [
    { name: 'Complete Tasks', value: 60 },
    { name: 'Uncomplete Tasks', value: 40 },
  ];

  const COLORS = ['#6659e8', '#78d1ec'];

  const handleCheckIn = () => {
    navigate('/employee/attendance');
  };

  return (
    <Box sx={{ p: 4 }}>
      {/* Top right Check-In */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          mt: 2,
          gap: 1,
          marginBottom: 5,
          marginTop: -5,
        }}
      >
        <Box
          sx={{
            width: 10,
            height: 10,
            bgcolor: '#17F255',
            borderRadius: '50%',
          }}
        />
        <Button
          variant="outlined"
          onClick={handleCheckIn}
          sx={{
            bgcolor: '#67BCE0',
            ':hover': { bgcolor: '#ffffff' },
            borderRadius: '60px',
            border: '3px solid #000000',
            color: '#000000',
            textTransform: 'none',
            boxShadow: 2,
            width: { xs: '100%', sm: 'auto' },
          }}
        >
          CheckIN
        </Button>
      </Box>

      {/* Dashboard Cards */}
      <Grid container spacing={2}>
        {/* Performance Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ border: '2px solid #67BCE0' }}>
            <CardContent>
              <Typography variant="body1">Performance Score</Typography>
              <Typography variant="h6" fontWeight="bold">8</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Attendance Calendar Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ border: '2px solid #67BCE0' }}>
            <CardContent>
              <Calendar
                className="dashboard-calendar" // <-- unique class
                value={date}
                onChange={setDate}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Task Pie Chart Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ border: '2px solid #67BCE0' }}>
            <CardContent>
              <Typography variant="body1">Task</Typography>
              <PieChart width={200} height={150}>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={60}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
              <Box display="flex" justifyContent="space-evenly">
                <Box display="flex" alignItems="center">
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      bgcolor: '#6659e8',
                      mr: 1,
                    }}
                  />
                  <Typography variant="caption">Complete Tasks</Typography>
                </Box>
                <Box display="flex" alignItems="center">
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      bgcolor: '#78d1ec',
                      mr: 1,
                    }}
                  />
                  <Typography variant="caption">Uncomplete Tasks</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* OK Button */}
        {/* <Grid item xs={12}>
          <Box display="flex" justifyContent="center">
            <Button
              variant="outlined"
              sx={{
            bgcolor: '#67BCE0',
            ':hover': { bgcolor: '#ffffff' },
            borderRadius: '60px',
            border: '3px solid #000000',
            color: '#000000',
            textTransform: 'none',
            boxShadow: 2,
            width: { xs: '100%', sm: 'auto' },
          }}
            >
              OK
            </Button>
          </Box>
        </Grid> */}
      </Grid>
    </Box>
  );
};

export default Dashboard;
