import * as React from "react";
import {
  Box,
  Typography,
  Grid,
  Button,
  Stack,
} from "@mui/material";

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import "./Performance.css";

export default function Performance() {
  const leaveCount = 8;
  const attendance = 25;
  const employeeRating = 4.5;

  const taskCompletionData = [
    { name: "Complete Tasks", value: 75 },
    { name: "Uncomplete Tasks", value: 25 },
  ];

  const pieColors = ["#4544B4CC", "#67BCE0"];

  const barChartData = [
    { name: "Present", value: 23 },
    { name: "Absent", value: 15 },
    { name: "Leaves", value: 7 },
  ];

  const barColors = ["#7675E3", "#67BCE0", "#4544B4"];

  return (
    <Box className="performance-container">
      <Grid container spacing={2} alignItems="stretch">
        {/* Employee Ratings - left tall box */}
        <Grid item xs={12} md={4}>
          <Box className="styled-box">
            <Typography variant="subtitle1" mb={1}>
              Employee Ratings
            </Typography>
            <Typography variant="h5" fontWeight="700">
              {employeeRating}
            </Typography>
            <Typography fontSize={24} sx={{ mb: 2 }}>
              ⭐⭐⭐⭐☆
            </Typography>
            <Typography variant="body2" fontWeight="700" mb={0.5}>
              Latest HR Comment
            </Typography>
            <Typography variant="body2">
              Great job on completing the task!
            </Typography>
          </Box>
        </Grid>

        {/* Right column with two small cards stacked vertically */}
        <Grid item xs={12} md={8}>
          <Stack direction="row" spacing={2} sx={{ height: "120px" }}>
            {/* Leave Count */}
            <Box className="small-card-container" sx={{ flex: 1 }}>
              <Typography variant="subtitle1" mb={1}>
                Leave Count per Month
              </Typography>
              <Typography variant="h4" color="#4544B4" fontWeight="700">
                {leaveCount}
              </Typography>
            </Box>

            {/* Attendance Count */}
            <Box className="small-card-container" sx={{ flex: 1 }}>
              <Typography variant="subtitle1" mb={1}>
                Attendance per Month
              </Typography>
              <Typography variant="h4" color="#4544B4" fontWeight="700">
                {attendance}
              </Typography>
            </Box>
          </Stack>
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={2} mt={3}>
        {/* Task Completion Chart */}
        <Grid item xs={12} md={6}>
          <Box className="chart-box" sx={{ height: "100%" }}>
            <Typography
              variant="subtitle1"
              fontWeight="700"
              textAlign="center"
              mb={2}
            >
              Task Completion
            </Typography>
            <Box display="flex" justifyContent="center" alignItems="center">
              <PieChart width={180} height={180}>
                <Pie
                  data={taskCompletionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={60}
                  dataKey="value"
                >
                  {taskCompletionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index]} />
                  ))}
                </Pie>
              </PieChart>
            </Box>
            <Box className="task-legend">
              <Box className="task-legend-item">
                <Box
                  className="task-legend-color"
                  sx={{ backgroundColor: "#4544B4" }}
                />
                <Typography variant="body2">Complete Tasks</Typography>
              </Box>
              <Box className="task-legend-item">
                <Box
                  className="task-legend-color"
                  sx={{ backgroundColor: "#67BCE0" }}
                />
                <Typography variant="body2">Uncomplete Tasks</Typography>
              </Box>
            </Box>
          </Box>
        </Grid>

        {/* Attendance Bar Chart - full width below */}
        <Grid item xs={12} mt={3}>
          <Box className="chart-box" sx={{ height: 400 }}>
            <Typography
              variant="subtitle1"
              fontWeight="700"
              textAlign="center"
              mb={2}
            >
              Attendance Breakdown
            </Typography>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={barChartData}>
                <XAxis dataKey="name" stroke="#000" />
                <YAxis stroke="#000" allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value">
                  {barChartData.map((entry, index) => (
                    <Cell key={`cell-bar-${index}`} fill={barColors[index]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Grid>
      </Grid>

      {/* Cancel Button */}
      <Box mt={5} display="flex" justifyContent="center">
        <Button className="cancel-btn" variant="contained">
          Cancel
        </Button>
      </Box>
    </Box>
  );
}
