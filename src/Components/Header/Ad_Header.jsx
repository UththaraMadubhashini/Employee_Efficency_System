import React from "react";
import { Box, Typography, IconButton, useMediaQuery, useTheme } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { Link } from "react-router-dom";
import "./Ad_Header.css"; // Import CSS

function Ad_Header() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box
      className={`ad-header ${isMobile ? "mobile" : ""}`}
    >
      {/* Left side - Title */}
      <Typography
        variant={isMobile ? "subtitle1" : "h6"}
        className="ad-header-title"
      >
        Admin
      </Typography>

      {/* Right side - Icons */}
      <Box className="ad-header-icons">
        <IconButton aria-label="notifications" size="large" className="ad-icon-btn">
          <NotificationsIcon fontSize="inherit" />
        </IconButton>
        <IconButton
          aria-label="profile"
          size="large"
          component={Link}
          to="/profile"
          className="ad-icon-btn"
        >
          <AccountCircleIcon fontSize="inherit" />
        </IconButton>
      </Box>
    </Box>
  );
}

export default Ad_Header;
