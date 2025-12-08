import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  IconButton,
  useMediaQuery,
  useTheme,
  Drawer,
  Badge,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Button,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import CloseIcon from "@mui/icons-material/Close";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { Link, useNavigate } from "react-router-dom";
import "./Emp_Header.css";

const API_BASE_URL = "http://127.0.0.1:5001";

function Employee_Header() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  // Notification states
  const [notificationDrawer, setNotificationDrawer] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastFetchTime, setLastFetchTime] = useState(null);
  const [employeeName, setEmployeeName] = useState("Employee");

  // Get employee info from localStorage
  useEffect(() => {
    const name = localStorage.getItem("emp_name") || sessionStorage.getItem("emp_name") || "Employee";
    setEmployeeName(name);
    
    // Initial fetch
    fetchTaskNotifications();
    
    // Poll for new tasks every 30 seconds
    const interval = setInterval(() => {
      fetchTaskNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchTaskNotifications = async () => {
    try {
      const empId = sessionStorage.getItem("emp_id") || localStorage.getItem("emp_id");
      
      if (!empId) return;

      const response = await fetch(
        `${API_BASE_URL}/get_tasks?emp_id=${empId}&role=employee`
      );

      if (!response.ok) return;

      const data = await response.json();

      if (data.success) {
        // Check for new tasks since last fetch
        if (lastFetchTime) {
          const newTasks = data.tasks.filter(task => {
            const taskCreated = new Date(task.created_at);
            return taskCreated > lastFetchTime;
          });
          
          if (newTasks.length > 0) {
            const newNotifications = newTasks.map(task => ({
              ...task,
              isNew: true,
              timestamp: new Date(task.created_at)
            }));
            
            setNotifications(prev => [...newNotifications, ...prev]);
            setUnreadCount(prev => prev + newTasks.length);
          }
        } else {
          // First load - show all pending/in-progress tasks as notifications
          const activeNotifications = data.tasks
            .filter(task => task.status === 'Pending' || task.status === 'In Progress')
            .map(task => ({
              ...task,
              isNew: false,
              timestamp: new Date(task.created_at)
            }));
          
          setNotifications(activeNotifications);
        }
        
        setLastFetchTime(new Date());
      }
    } catch (err) {
      console.error("Notification fetch error:", err);
    }
  };

  const handleNotificationClick = () => {
    setNotificationDrawer(true);
  };

  const handleNotificationClose = () => {
    setNotificationDrawer(false);
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isNew: false })));
    setUnreadCount(0);
  };

  const handleNotificationItemClick = (taskId) => {
    // Mark as read
    setNotifications(prev => 
      prev.map(n => n.task_id === taskId ? { ...n, isNew: false } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
    
    // Navigate to tasks page
    setNotificationDrawer(false);
    navigate("/employee/task");
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical':
        return '#D32F2F';
      case 'High':
        return '#F57C00';
      case 'Medium':
        return '#FBC02D';
      case 'Low':
        return '#388E3C';
      default:
        return '#757575';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return '#4CAF50';
      case 'In Progress':
        return '#2196F3';
      case 'Overdue':
        return '#F44336';
      case 'Pending':
        return '#FF9800';
      default:
        return '#757575';
    }
  };

  return (
    <>
      <Box className={`employee-header ${isMobile ? "mobile" : ""}`}>
        {/* Left side - title */}
        <Typography
          variant={isMobile ? "subtitle1" : "h6"}
          className="employee-header-title"
        >
          Employee - {employeeName}
        </Typography>

        {/* Right side - icons */}
        <Box className="employee-header-icons">
          {/* Notification Bell with Badge */}
          <IconButton 
            className="employee-icon-btn" 
            aria-label="notifications" 
            size="large"
            onClick={handleNotificationClick}
          >
            <Badge 
              badgeContent={unreadCount} 
              color="error"
              sx={{
                '& .MuiBadge-badge': {
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  animation: unreadCount > 0 ? 'pulse 2s infinite' : 'none',
                }
              }}
            >
              <NotificationsIcon fontSize="inherit" />
            </Badge>
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

      {/* Notification Drawer */}
      <Drawer
        anchor="right"
        open={notificationDrawer}
        onClose={handleNotificationClose}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 400 },
            maxWidth: '100%',
          }
        }}
      >
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Drawer Header */}
          <Box
            sx={{
              p: 2,
              backgroundColor: '#7675E3',
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant="h6" fontWeight="600">
              Task Notifications
            </Typography>
            <IconButton onClick={handleNotificationClose} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Mark All Read Button */}
          {unreadCount > 0 && (
            <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
              <Button
                fullWidth
                variant="outlined"
                size="small"
                onClick={handleMarkAllRead}
                sx={{
                  borderColor: '#7675E3',
                  color: '#7675E3',
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                    borderColor: '#5f5ec9',
                  },
                }}
              >
                Mark All as Read
              </Button>
            </Box>
          )}

          {/* Notification List */}
          <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
            {notifications.length === 0 ? (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  p: 4,
                  color: 'text.secondary',
                }}
              >
                <AssignmentIcon sx={{ fontSize: 64, mb: 2, color: '#ddd' }} />
                <Typography variant="body1">No new task notifications</Typography>
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {notifications.map((notification, index) => (
                  <React.Fragment key={notification.task_id}>
                    <ListItem
                      button
                      onClick={() => handleNotificationItemClick(notification.task_id)}
                      sx={{
                        backgroundColor: notification.isNew ? '#fff5f5' : 'white',
                        borderLeft: notification.isNew ? '4px solid #ff4757' : 'none',
                        '&:hover': {
                          backgroundColor: '#f8f9fa',
                        },
                        py: 2,
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1} mb={1}>
                            <Typography variant="subtitle2" fontWeight="600">
                              {notification.task_name}
                            </Typography>
                            {notification.isNew && (
                              <Chip
                                label="NEW"
                                size="small"
                                sx={{
                                  backgroundColor: '#ff4757',
                                  color: 'white',
                                  height: 20,
                                  fontSize: '0.7rem',
                                  fontWeight: 'bold',
                                }}
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Box display="flex" gap={1} mb={1}>
                              <Chip
                                label={notification.priority}
                                size="small"
                                sx={{
                                  backgroundColor: getPriorityColor(notification.priority),
                                  color: 'white',
                                  fontSize: '0.7rem',
                                  height: 20,
                                }}
                              />
                              <Chip
                                label={notification.status}
                                size="small"
                                sx={{
                                  backgroundColor: getStatusColor(notification.status),
                                  color: 'white',
                                  fontSize: '0.7rem',
                                  height: 20,
                                }}
                              />
                            </Box>
                            <Box display="flex" alignItems="center" gap={0.5} color="text.secondary">
                              <CalendarTodayIcon sx={{ fontSize: 14 }} />
                              <Typography variant="caption">
                                Due: {new Date(notification.due_date).toLocaleDateString()}
                              </Typography>
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < notifications.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </Box>

          {/* Footer - View All Tasks Button */}
          <Box 
            sx={{ 
              p: 2, 
              borderTop: '1px solid #e0e0e0',
              backgroundColor: '#f8f9fa'
            }}
          >
            <Button
              fullWidth
              variant="contained"
              onClick={() => {
                setNotificationDrawer(false);
                navigate("/employee/task");
              }}
              sx={{
                backgroundColor: '#7675E3',
                '&:hover': {
                  backgroundColor: '#5f5ec9',
                },
              }}
            >
              View All Tasks
            </Button>
          </Box>
        </Box>
      </Drawer>

      {/* Add pulse animation to CSS */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
        }
      `}</style>
    </>
  );
}

export default Employee_Header;