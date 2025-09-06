import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { toast } from "react-toastify";

// Custom CSS styles for react-calendar
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
  navigationLabel: {
    fontWeight: "600",
    fontSize: "18px",
    color: "#4544B4",
  },
  tile: {
    borderRadius: 8,
    margin: 3,
    padding: 8,
    fontWeight: "600",
    color: "#4544B4",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
  tileActive: {
    backgroundColor: "#0D07C0",
    color: "#fff",
  },
  tileDisabled: {
    color: "#ccc",
    cursor: "not-allowed",
  },
};

export default function Attendance() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [attendanceData, setAttendanceData] = useState([]);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const today = new Date();
  const isSameDay = (d1, d2) =>
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear();

  const handleDateChange = (date) => {
    if (!isSameDay(date, today)) {
      toast.warning("You can only mark attendance for today!");
      return;
    }

    setSelectedDate(date);
    const dateStr = date.toDateString();

    const exists = attendanceData.find((d) => d.date === dateStr);
    if (!exists) {
      const newEntry = {
        date: dateStr,
        checkIn: new Date().toLocaleTimeString(),
        checkOut: "--:--:--",
        status: "Present",
      };
      setAttendanceData((prev) => [...prev, newEntry]);
      toast.success("Check-In recorded!");
    } else {
      toast.info("You have already marked attendance today.");
    }
  };

  const handleCheckOut = () => {
    const dateStr = selectedDate.toDateString();
    const updated = attendanceData.map((entry) =>
      entry.date === dateStr
        ? { ...entry, checkOut: new Date().toLocaleTimeString() }
        : entry
    );

    setAttendanceData(updated);
    toast.success("Checked out successfully!");
  };

  const handleLeaveRequest = () => {
    const dateStr = selectedDate.toDateString();
    const alreadyMarked = attendanceData.find(
      (entry) => entry.date === dateStr
    );

    if (!alreadyMarked) {
      setAttendanceData((prev) => [
        ...prev,
        {
          date: dateStr,
          checkIn: "--:--:--",
          checkOut: "--:--:--",
          status: "Leave",
        },
      ]);
      toast.success("Leave requested!");
    } else {
      toast.info("Leave already marked or attendance already exists.");
    }
  };

  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const entry = attendanceData.find((d) => d.date === date.toDateString());
      if (entry) {
        return (
          <div
          style={{
            marginTop: 2,
            fontSize: 11,
            color:
              isSameDay(date, selectedDate) && entry.status === "Present"
                ? "#fff"
                : entry.status === "Present"
                ? "#2e7d32"
                : "#d32f2f",
            fontWeight: "700",
            textAlign: "center",
            userSelect: "none",
          }}
        >
          {entry.status}
        </div>
        );
      }
    }
    return null;
  };

  const tileDisabled = ({ date, view }) => {
    return view === "month" && !isSameDay(date, today);
  };

  return (
    <Box p={isMobile ? 2 : 4} minHeight="100vh" bgcolor="#f5f7fa">
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              p: 2,
              border: "3px solid #67BCE0",
              borderRadius: "12px",
              boxShadow: "0 3px 12px rgb(103 188 224 / 0.3)",
              ...calendarStyles.calendarContainer,
              height: 'auto',
              overflowY: 'visible',
            }}
          >
            <Calendar
              onClickDay={handleDateChange}
              value={selectedDate}
              tileContent={tileContent}
              tileDisabled={tileDisabled}
              calendarType="gregory"
              calendarClassName="custom-calendar"
              nextLabel="›"
              prevLabel="‹"
              next2Label={null}
              prev2Label={null}
              showNeighboringMonth={false}
              formatShortWeekday={(locale, date) =>
                ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"][date.getDay()]
              }
              // Add tileClassName for active and disabled styling
              tileClassName={({ date, view }) => {
                if (view === "month") {
                  if (isSameDay(date, selectedDate)) {
                    return "react-calendar__tile--active";
                  }
                  if (tileDisabled({ date, view })) {
                    return "react-calendar__tile--disabled";
                  }
                }
                return null;
              }}
              sx={calendarStyles.calendar}
            />
          </Card>

          <Box
            mt={3}
            display="flex"
            flexDirection={isMobile ? "column" : "row"}
            gap={2}
          >
            <Button
              variant="contained"
              sx={{
                bgcolor: "#67BCE0",
                color: "#000",
                borderRadius: "60px",
                border: "3px solid #000",
                textTransform: "none",
                fontWeight: "600",
                boxShadow: 2,
                width: { xs: "100%", sm: "auto" },
                flex: 1,
                ":hover": {
                  bgcolor: "#ffffff",
                  color: "#67BCE0",
                  borderColor: "#67BCE0",
                },
              }}
              onClick={() => navigate("/employee/leave")}
            >
              Leave Request
            </Button>

            <Button
              variant="outlined"
              sx={{
                bgcolor: "#67BCE0",
                color: "#000",
                borderRadius: "60px",
                border: "3px solid #000",
                textTransform: "none",
                fontWeight: "600",
                boxShadow: 2,
                width: { xs: "100%", sm: "auto" },
                flex: 1,
                ":hover": {
                  bgcolor: "#ffffff",
                  color: "#67BCE0",
                  borderColor: "#67BCE0",
                },
              }}
              onClick={handleCheckOut}
            >
              Check-Out
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12} md={8}>
          <TableContainer component={Paper} elevation={4}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#cfe2f3" }}>
                  <TableCell sx={{ fontWeight: "700" }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: "700" }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: "700" }}>Check-In Time</TableCell>
                  <TableCell sx={{ fontWeight: "700" }}>Check-Out Time</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attendanceData.map((row, index) => (
                  <TableRow key={index} hover>
                    <TableCell>{row.date}</TableCell>
                    <TableCell
                      sx={{
                        color:
                          row.status === "Present" ? "#2e7d32" : "#d32f2f",
                        fontWeight: "600",
                      }}
                    >
                      {row.status}
                    </TableCell>
                    <TableCell>{row.checkIn}</TableCell>
                    <TableCell>{row.checkOut}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Button
            variant="contained"
            sx={{
              bgcolor: "#67BCE0",
              color: "#000",
              borderRadius: "60px",
              border: "3px solid #000",
              textTransform: "none",
              fontWeight: "600",
              boxShadow: 2,
              width: { xs: "100%", sm: "auto" },
              mt: 3,
              ":hover": {
                bgcolor: "#ffffff",
                color: "#67BCE0",
                borderColor: "#67BCE0",
              },
            }}
          >
            Cancel
          </Button>
        </Grid>
      </Grid>

      {/* Add custom CSS for react-calendar */}
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
