import React from "react";
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
} from "@mui/material";
import { styled } from "@mui/system";
import { useNavigate } from "react-router-dom";


const FilterRow = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: "20px",
  margin: "20px 0",
  flexWrap: "wrap",
}));

const StyledTable = styled(Table)(({ theme }) => ({
  minWidth: 800,
  backgroundColor: "#f2f2f2",
  marginBottom: "40px",
  [theme.breakpoints.down("sm")]: {
    minWidth: "100%",
    display: "block",
    overflowX: "auto",
  },
}));

const TableHeadCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: "rgba(68, 69, 180, 0.5)", // #4445B4 with 50% opacity
  color: "#fff",
  fontWeight: "bold",
  whiteSpace: "nowrap",
}));

const TableBodyRow = styled(TableRow)(({ theme }) => ({
  backgroundColor: "#fff",
  "&:nth-of-type(even)": {
    backgroundColor: "#f9f9f9",
  },
}));

const CardGrid = styled(Box)(() => ({
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "center",
  gap: "20px",
}));

const CardContainer = styled(Box)(() => ({
  width: 200,
  height: 140,
  border: "2px solid #74C0E3",
  borderRadius: "8px",
  textAlign: "center",
  position: "relative",
  backgroundColor: "#ffffff",
}));

const TopSection = styled(Box)(() => ({
  height: 40,
  backgroundColor: "#f2f2f2",
  borderTopLeftRadius: "6px",
  borderTopRightRadius: "6px",
}));

const StyledAvatar = styled(Avatar)(() => ({
  width: 50,
  height: 50,
  backgroundColor: "#74C0E3",
  position: "absolute",
  top: -25,
  left: "50%",
  transform: "translateX(-50%)",
  zIndex: 2,
}));

const StatusDot = styled(Box)(({ color }) => ({
  display: "inline-block",
  width: 10,
  height: 10,
  borderRadius: "50%",
  backgroundColor: color,
  marginRight: 6,
}));

const ActionButtons = styled(Box)(() => ({
  display: "flex",
  justifyContent: "center",
  gap: 20,
  marginTop: 30,
  flexWrap: "wrap",
}));

const EmployeeCard = ({ name = "Emp_Name", designation = "Designation" }) => (
  <CardContainer>
    <StyledAvatar />
    <TopSection />
    <Box position="absolute" top={10} right={10}>
      <StatusDot color="limegreen" />
    </Box>
    <Box mt={4.5}>
      <Typography fontWeight="bold" fontSize={13}>
        {name}
      </Typography>
      <Typography fontSize={16}>{designation}</Typography>
    </Box>
  </CardContainer>
);

// Dummy attendance data
const attendanceData = [
  {
    id: "A001",
    empId: "EMP001",
    date: "2025-08-01",
    checkIn: "08:45 AM",
    checkOut: "05:15 PM",
    attendance: "Present",
    status: "Active",
  },
  {
    id: "A002",
    empId: "EMP002",
    date: "2025-08-01",
    checkIn: "Absent",
    checkOut: "Absent",
    attendance: "Absent",
    status: "Inactive",
  },
  {
    id: "A003",
    empId: "EMP003",
    date: "2025-08-01",
    checkIn: "09:00 AM",
    checkOut: "05:00 PM",
    attendance: "Present",
    status: "Active",
  },
];

// ==== Main Component ====

export default function Attendance() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box p={4}>
      <Typography variant="h5" gutterBottom>
        All Employees
      </Typography>

      {/* Filters */}
      <FilterRow>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Department</InputLabel>
          <Select defaultValue="">
            <MenuItem value="HR">HR</MenuItem>
            <MenuItem value="IT">IT</MenuItem>
            <MenuItem value="Finance">Finance</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Emp_ID</InputLabel>
          <Select defaultValue="">
            <MenuItem value="EMP001">EMP001</MenuItem>
            <MenuItem value="EMP002">EMP002</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Date</InputLabel>
          <Select defaultValue="">
            <MenuItem value="2025-08-01">2025-08-01</MenuItem>
            <MenuItem value="2025-08-02">2025-08-02</MenuItem>
          </Select>
        </FormControl>
      </FilterRow>

      {/* Attendance Table */}
      <StyledTable>
        <TableHead>
          <TableRow>
            <TableHeadCell>Attendance_ID</TableHeadCell>
            <TableHeadCell>Employee_ID</TableHeadCell>
            <TableHeadCell>Date</TableHeadCell>
            <TableHeadCell>CheckIn_Time</TableHeadCell>
            <TableHeadCell>CheckOut_Time</TableHeadCell>
            <TableHeadCell>Attendance</TableHeadCell>
            <TableHeadCell>Status</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {attendanceData.map((row, idx) => (
            <TableBodyRow key={idx}>
              <TableCell>{row.id}</TableCell>
              <TableCell>{row.empId}</TableCell>
              <TableCell>{row.date}</TableCell>
              <TableCell>{row.checkIn}</TableCell>
              <TableCell>{row.checkOut}</TableCell>
              <TableCell>
                <StatusDot
                  color={row.attendance === "Present" ? "green" : "red"}
                />
                {row.attendance}
              </TableCell>
              <TableCell>
                <StatusDot color={row.status === "Active" ? "green" : "red"} />
                {row.status}
              </TableCell>
            </TableBodyRow>
          ))}
        </TableBody>
      </StyledTable>

      {/* Employee Cards Grid */}
      <CardGrid>
        {[...Array(8)].map((_, i) => (
          <EmployeeCard
            key={i}
            name={i % 2 === 0 ? "Administrator" : "Emp_Name"}
            designation={i % 2 === 0 ? "Administration" : "Designation"}
          />
        ))}
      </CardGrid>

      {/* Buttons */}
      <ActionButtons>
        <Button
        variant="outlined"
        onClick={() => navigate('/admin/leave-management')}
        sx={{
          bgcolor: "#74C0E3",
          ":hover": { bgcolor: "#ffffff" },
          border: "2px solid #000000",
          borderRadius: "25px",
          color: "#000",
          px: 3,
          textTransform: "none",
          marginLeft: '950px',
        }}
      >
          Leave
        </Button>
        <Button
          variant="outlined"
          sx={{
            bgcolor: "#74C0E3",
                ":hover": { bgcolor: "#ffffff" },
                border: "2px solid #000000",
                borderRadius: "25px",
                color: "#000",
                px: 3,
                textTransform: "none",
          }}
        >
          OK
        </Button>
      </ActionButtons>
    </Box>
  );
}
