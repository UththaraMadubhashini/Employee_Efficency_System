import React, { useState } from "react";
import "./adminSidebar.css";
import { Drawer, IconButton, Box, useMediaQuery } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { NavLink } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import BarChartIcon from "@mui/icons-material/BarChart";
import AssignmentIcon from "@mui/icons-material/Assignment";
import Logo from "../../assets/Logo.png";

export default function AdminSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width:768px)");
  const SIDEBAR_WIDTH = 241;

  const toggleDrawer = () => setMobileOpen(!mobileOpen);

  const navItems = [
    { to: "/admin", label: "Dashboard", icon: <DashboardIcon />, exact: true },
    { to: "/admin/profile-management", label: "Profile Management", icon: <PeopleIcon /> },
    { to: "/admin/attendance-management", label: "Attendance Management", icon: <CalendarMonthIcon /> },
    { to: "/admin/performance-management", label: "Performance Management", icon: <BarChartIcon /> },
    { to: "/admin/task-management", label: "Tasks Management", icon: <AssignmentIcon /> },
  ];

  const sidebarContent = (
    <div className="admin-sidebar-container" style={{ width: `${SIDEBAR_WIDTH}px` }}>
      {/* Logo */}
      <div className="admin-sidebar-logo">
        <img src={Logo} alt="Logo" />
      </div>

      {/* Navigation */}
      <nav className="admin-sidebar-nav">
        {navItems.map(({ to, label, icon, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) =>
              `admin-sidebar-link ${isActive ? "admin-active" : ""}`
            }
          >
            <Box className="admin-sidebar-icon">{icon}</Box>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );

  if (isMobile) {
    return (
      <>
        <IconButton onClick={toggleDrawer} className="admin-hamburger-btn">
          <MenuIcon style={{ color: "#fff" }} />
        </IconButton>

        <Drawer
          anchor="left"
          open={mobileOpen}
          onClose={toggleDrawer}
          ModalProps={{ keepMounted: true }}
        >
          {sidebarContent}
        </Drawer>
      </>
    );
  }

  return (
    <div className="admin-sidebar-fixed" style={{ width: `${SIDEBAR_WIDTH}px` }}>
      {sidebarContent}
    </div>
  );
}
