import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Checkbox,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Chip,
  Paper,
  Grid,
  Card,
  CardContent,
  TableContainer,
} from '@mui/material';
import { CheckCircle, HourglassEmpty, Warning } from '@mui/icons-material';
import { toast } from "react-toastify";

const API_BASE_URL = "http://127.0.0.1:5001";

const Task = () => {
  const [tasks, setTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();


  const empId = localStorage.getItem("emp_id") || "";

  // Fetch tasks on component mount
  useEffect(() => {
    if (!empId) {
      toast.error("Employee ID not found. Please login again.");
      navigate("/login");
      return;
    }
    fetchTasks();
  }, [empId]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("📡 Fetching tasks for:", empId);

      const response = await fetch(
        `${API_BASE_URL}/get_tasks?emp_id=${empId}&role=employee`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }

      const data = await response.json();

      console.log("✅ Fetched tasks data:", data);

      if (data.success) {
        setTasks(data.tasks);
        console.log("📊 Total tasks:", data.tasks.length);
      } else {
        throw new Error(data.error || "Failed to load tasks");
      }
    } catch (err) {
      console.error("❌ Task fetch error:", err);
      setError(err.message);
      toast.error("Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (taskId) => {
    setSelectedTaskId(taskId);
  };

  const handleViewDetails = () => {
    if (selectedTaskId) {
      setOpenDialog(true);
    } else {
      toast.warning("Please select a task first");
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      setUpdating(true);
      
      console.log("📤 Updating task status:", {
        task_id: selectedTaskId,
        status: newStatus
      });

      const response = await fetch(`${API_BASE_URL}/update_task_status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task_id: selectedTaskId,
          status: newStatus,
        }),
      });

      const data = await response.json();

      console.log("✅ Update response:", data);

      if (data.success) {
        toast.success(`Task marked as ${newStatus}`);
        setSuccessMsg(`Task marked as ${newStatus}`);
        setOpenDialog(false);
        setSelectedTaskId(null);
        
        // Refresh tasks after a brief delay
        setTimeout(() => {
          fetchTasks();
        }, 500);
      } else {
        setError(data.error || "Failed to update task");
        toast.error(data.error || "Failed to update task");
      }
    } catch (err) {
      console.error("❌ Update error:", err);
      setError("Failed to update task status");
      toast.error("Failed to update task status");
    } finally {
      setUpdating(false);
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle />;
      case 'In Progress':
        return <HourglassEmpty />;
      case 'Overdue':
        return <Warning />;
      default:
        return <HourglassEmpty />;
    }
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

  const selectedTask = tasks.find((task) => task.task_id === selectedTaskId);

  // Calculate task statistics
  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'Completed').length,
    inProgress: tasks.filter(t => t.status === 'In Progress').length,
    overdue: tasks.filter(t => t.status === 'Overdue').length,
    pending: tasks.filter(t => t.status === 'Pending').length,
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
        <Typography sx={{ ml: 2 }}>Loading tasks...</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f9ff 0%, #e8f4f8 100%)',
        py: 4,
        px: 2,
      }}
    >
      <Box
        sx={{
          width: '95%',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        {/* Header */}
        <Typography variant="h4" fontWeight="700" mb={3} color="#1f2a65">
          My Tasks
        </Typography>

        {/* Error/Success Messages */}
        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {successMsg && (
          <Alert severity="success" onClose={() => setSuccessMsg(null)} sx={{ mb: 2 }}>
            {successMsg}
          </Alert>
        )}

        {/* Task Statistics Cards */}
        <Grid container spacing={2} mb={4}>
          <Grid item xs={6} sm={4} md={2.4}>
            <Card sx={{ backgroundColor: '#e3f2fd', boxShadow: 2 }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" fontWeight="700" color="#1976d2">
                  {taskStats.total}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Tasks
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={4} md={2.4}>
            <Card sx={{ backgroundColor: '#e8f5e9', boxShadow: 2 }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" fontWeight="700" color="#4CAF50">
                  {taskStats.completed}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Completed
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={4} md={2.4}>
            <Card sx={{ backgroundColor: '#e1f5fe', boxShadow: 2 }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" fontWeight="700" color="#2196F3">
                  {taskStats.inProgress}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  In Progress
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={4} md={2.4}>
            <Card sx={{ backgroundColor: '#fff3e0', boxShadow: 2 }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" fontWeight="700" color="#FF9800">
                  {taskStats.pending}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={4} md={2.4}>
            <Card sx={{ backgroundColor: '#ffebee', boxShadow: 2 }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" fontWeight="700" color="#F44336">
                  {taskStats.overdue}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Overdue
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tasks Table */}
        <TableContainer component={Paper} elevation={4}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ backgroundColor: '#7675E3' }}>
              <TableRow>
                <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Task ID</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Task Name</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Priority</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Due Date</TableCell>
                <TableCell align="center" sx={{ color: '#fff', fontWeight: 'bold' }}>
                  Select
                </TableCell>
                <TableCell align="center" sx={{ color: '#fff', fontWeight: 'bold' }}>
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress size={24} />
                    <span style={{ marginLeft: 10 }}>Loading...</span>
                  </TableCell>
                </TableRow>
              ) : tasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body1" color="text.secondary" py={3}>
                      No tasks assigned yet
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                tasks.map((task) => (
                  <TableRow 
                    key={task.task_id}
                    hover
                    sx={{ 
                      '&:hover': { backgroundColor: '#f5f5f5' },
                      backgroundColor: selectedTaskId === task.task_id ? '#e3f2fd' : 'inherit'
                    }}
                  >
                    <TableCell>{task.task_id}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="600">
                        {task.task_name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={task.priority}
                        size="small"
                        sx={{
                          backgroundColor: getPriorityColor(task.priority),
                          color: '#fff',
                          fontWeight: 'bold',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(task.status)}
                        label={task.status}
                        size="small"
                        sx={{
                          backgroundColor: getStatusColor(task.status),
                          color: '#fff',
                          fontWeight: 'bold',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        color={task.status === 'Overdue' ? 'error' : 'text.primary'}
                        fontWeight={task.status === 'Overdue' ? 'bold' : 'normal'}
                      >
                        {new Date(task.due_date).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Checkbox
                        checked={selectedTaskId === task.task_id}
                        onChange={() => handleCheckboxChange(task.task_id)}
                        sx={{
                          color: '#7675E3',
                          '&.Mui-checked': {
                            color: '#7675E3',
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        variant="contained"
                        size="small"
                        onClick={handleViewDetails}
                        disabled={selectedTaskId !== task.task_id}
                        sx={{
                          borderRadius: '20px',
                          px: 3,
                          backgroundColor: '#67BCE0',
                          color: '#000',
                          fontWeight: 'bold',
                          '&:hover': {
                            backgroundColor: '#5aa8cc',
                          },
                          '&:disabled': {
                            backgroundColor: '#e0e0e0',
                          },
                        }}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Task Details Dialog */}
        <Dialog 
          open={openDialog} 
          onClose={handleCloseDialog} 
          fullWidth 
          maxWidth="md"
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: 10,
            }
          }}
        >
          <DialogTitle 
            sx={{ 
              backgroundColor: '#7675E3', 
              color: '#fff',
              fontWeight: 'bold',
              fontSize: '1.5rem'
            }}
          >
            Task Details
          </DialogTitle>
          <DialogContent sx={{ mt: 3 }}>
            {selectedTask ? (
              <Box>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={{ p: 2, backgroundColor: '#f8f9fa' }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Task ID
                      </Typography>
                      <Typography variant="body1" fontWeight="600">
                        {selectedTask.task_id}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={{ p: 2, backgroundColor: '#f8f9fa' }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Priority
                      </Typography>
                      <Chip
                        label={selectedTask.priority}
                        sx={{
                          backgroundColor: getPriorityColor(selectedTask.priority),
                          color: '#fff',
                          fontWeight: 'bold',
                        }}
                      />
                    </Paper>
                  </Grid>
                  <Grid item xs={12}>
                    <Paper elevation={2} sx={{ p: 2, backgroundColor: '#f8f9fa' }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Task Name
                      </Typography>
                      <Typography variant="h6" fontWeight="700">
                        {selectedTask.task_name}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12}>
                    <Paper elevation={2} sx={{ p: 2, backgroundColor: '#f8f9fa' }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Description
                      </Typography>
                      <Typography variant="body1">
                        {selectedTask.description || 'No description provided'}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper elevation={2} sx={{ p: 2, backgroundColor: '#f8f9fa' }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Start Date
                      </Typography>
                      <Typography variant="body1" fontWeight="600">
                        {new Date(selectedTask.start_date).toLocaleDateString()}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper elevation={2} sx={{ p: 2, backgroundColor: '#f8f9fa' }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Due Date
                      </Typography>
                      <Typography 
                        variant="body1" 
                        fontWeight="600"
                        color={selectedTask.status === 'Overdue' ? 'error' : 'inherit'}
                      >
                        {new Date(selectedTask.due_date).toLocaleDateString()}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper elevation={2} sx={{ p: 2, backgroundColor: '#f8f9fa' }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Status
                      </Typography>
                      <Chip
                        icon={getStatusIcon(selectedTask.status)}
                        label={selectedTask.status}
                        sx={{
                          backgroundColor: getStatusColor(selectedTask.status),
                          color: '#fff',
                          fontWeight: 'bold',
                        }}
                      />
                    </Paper>
                  </Grid>
                  {selectedTask.assigned_by && (
                    <Grid item xs={12}>
                      <Paper elevation={2} sx={{ p: 2, backgroundColor: '#f8f9fa' }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Assigned By
                        </Typography>
                        <Typography variant="body1" fontWeight="600">
                          {selectedTask.assigned_by}
                        </Typography>
                      </Paper>
                    </Grid>
                  )}
                </Grid>
              </Box>
            ) : (
              <Typography>No task selected.</Typography>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 2 }}>
            {selectedTask && selectedTask.status !== 'Completed' && (
              <>
                {selectedTask.status === 'Pending' && (
                  <Button
                    variant="contained"
                    onClick={() => handleUpdateStatus('In Progress')}
                    disabled={updating}
                    sx={{
                      backgroundColor: '#2196F3',
                      '&:hover': { backgroundColor: '#1976D2' },
                      borderRadius: '30px',
                      px: 3,
                    }}
                  >
                    {updating ? <CircularProgress size={24} /> : 'Start Task'}
                  </Button>
                )}
                {selectedTask.status === 'In Progress' && (
                  <Button
                    variant="contained"
                    onClick={() => handleUpdateStatus('Completed')}
                    disabled={updating}
                    sx={{
                      backgroundColor: '#4CAF50',
                      '&:hover': { backgroundColor: '#45a049' },
                      borderRadius: '30px',
                      px: 3,
                    }}
                  >
                    {updating ? <CircularProgress size={24} /> : 'Mark as Completed'}
                  </Button>
                )}
              </>
            )}
            <Button
              variant="outlined"
              onClick={handleCloseDialog}
              sx={{
                borderRadius: '30px',
                px: 3,
                borderColor: '#000',
                color: '#000',
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Box>

      {/* Debug Info Box (only in development) */}
      {process.env.NODE_ENV === "development" && (
        <Box
          sx={{
            position: "fixed",
            bottom: 10,
            right: 10,
            p: 2,
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            borderRadius: 2,
            border: "1px solid #ccc",
            fontSize: "12px",
            maxWidth: "300px",
          }}
        >
          <div><strong>Debug Info:</strong></div>
          <div>API URL: {API_BASE_URL}</div>
          <div>Employee ID: {empId || "Not set"}</div>
          <div>Total Tasks: {tasks.length}</div>
        </Box>
      )}
    </Box>
  );
};

export default Task;