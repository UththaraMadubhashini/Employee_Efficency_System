import { Box, Typography, IconButton, useMediaQuery, useTheme } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { Link } from "react-router-dom";
import "./Emp_Header.css";

function Employee_Header() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box className={`employee-header ${isMobile ? "mobile" : ""}`}>
      {/* Left side - title */}
      <Typography
        variant={isMobile ? "subtitle1" : "h6"}
        className="employee-header-title"
      >
        Employee - Employee Name
      </Typography>

      {/* Right side - icons */}
      <Box className="employee-header-icons">
        <IconButton className="employee-icon-btn" aria-label="notifications" size="large">
          <NotificationsIcon fontSize="inherit" />
        </IconButton>
        <IconButton
          className="employee-icon-btn"
          aria-label="profile"
          size="large"
          component={Link}
          to="/employee/profile"
        >
          <AccountCircleIcon fontSize="inherit" />
        </IconButton>
      </Box>
    </Box>
  );
}

export default Employee_Header;
