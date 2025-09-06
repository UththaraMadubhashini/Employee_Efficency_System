import React, { useState } from "react";
import "./employeesideBar.css";
import { Drawer, IconButton, Box, useMediaQuery } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { NavLink } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonIcon from "@mui/icons-material/Person";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import BarChartIcon from "@mui/icons-material/BarChart";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ConstructionIcon from "@mui/icons-material/Construction";
import Logo from "../../assets/Logo.png";

export default function EmployeeSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width:768px)");
  const SIDEBAR_WIDTH = 243;

  const toggleDrawer = () => setMobileOpen(!mobileOpen);

  const navItems = [
    { to: "/employee", label: "Dashboard", icon: <DashboardIcon />, exact: true },
    { to: "/employee/profile", label: "Profile", icon: <PersonIcon /> },
    { to: "/employee/attendance", label: "Attendance", icon: <CalendarMonthIcon /> },
    { to: "/employee/performance", label: "Performance", icon: <BarChartIcon /> },
    { to: "/employee/task", label: "Task", icon: <AssignmentIcon /> },
    { to: "/employee/equipment", label: "Equipment Identify", icon: <ConstructionIcon /> },
  ];

  const sidebarContent = (
    <div className="sidebar-container" style={{ width: `${SIDEBAR_WIDTH}px` }}>
      {/* Logo */}
      <div className="sidebar-logo">
        <img src={Logo} alt="Logo" />
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map(({ to, label, icon, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <Box className="sidebar-icon">
              {icon}
            </Box>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );

  // Mobile Drawer
  if (isMobile) {
    return (
      <>
        <IconButton onClick={toggleDrawer} className="hamburger-btn">
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

  // Desktop fixed sidebar
  return (
    <div className="sidebar-fixed" style={{ width: `${SIDEBAR_WIDTH}px` }}>
      {sidebarContent}
    </div>
  );
}
