import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  IconButton,
  Snackbar,
  Alert,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  Select,
  Grid,
  FormControl,
  InputLabel,
  Paper,
  Chip,
  CircularProgress,
} from "@mui/material";
import { Edit, Delete, Add, Visibility } from "@mui/icons-material";

const API_BASE_URL = "http://127.0.0.1:5001";

const labelWithAsterisk = (label) => (
  <Box component="span">
    {label}
    <Box component="span" style={{ color: 'red', marginLeft: '4px' }}>*</Box>
  </Box>
);

/* ---------------- Reusable Confirm Dialog ---------------- */
function ConfirmDialog({
  open,
  title,
  message,
  confirmColor = "primary",
  onCancel,
  onConfirm,
  loading = false,
}) {
  return (
    <Dialog open={open} onClose={onCancel} fullWidth maxWidth="xs">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography>{message}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button 
          variant="contained" 
          color={confirmColor} 
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Confirm'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/* ---------------- Reusable Form Fields ---------------- */
function FormFields({
  formData,
  handleChange,
  employees = [],
  handleEmployeeSelect,
  readOnly = false,
}) {
  return (
    <Box sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        {/* Task ID */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Task ID"
            name="task_id"
            value={formData.task_id}
            InputProps={{ readOnly: true }}
          />
        </Grid>

        {/* Employee Selection */}
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required>
            <InputLabel>{labelWithAsterisk("Employee")}</InputLabel>
            <Select
              name="emp_id"
              value={formData.emp_id}
              onChange={handleEmployeeSelect}
              label="Employee"
              disabled={readOnly}
            >
              <MenuItem value="">Select Employee</MenuItem>
              {employees.map((emp) => (
                <MenuItem key={emp.emp_id} value={emp.emp_id}>
                  {emp.emp_id} - {emp.fullName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Task Name */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            required
            label={labelWithAsterisk("Task Name")}
            name="task_name"
            value={formData.task_name}
            onChange={handleChange}
            InputProps={{ readOnly }}
          />
        </Grid>

        {/* Description */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            required
            multiline
            rows={3}
            label={labelWithAsterisk("Description")}
            name="description"
            value={formData.description}
            onChange={handleChange}
            InputProps={{ readOnly }}
          />
        </Grid>

        {/* Priority */}
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required>
            <InputLabel>{labelWithAsterisk("Priority")}</InputLabel>
            <Select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              label="Priority"
              disabled={readOnly}
            >
              <MenuItem value="Low">Low</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="High">High</MenuItem>
              <MenuItem value="Critical">Critical</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Status */}
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              name="status"
              value={formData.status}
              onChange={handleChange}
              label="Status"
              disabled={readOnly}
            >
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
              <MenuItem value="Overdue">Overdue</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Start Date */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            required
            type="date"
            name="start_date"
            label={labelWithAsterisk("Start Date")}
            InputLabelProps={{ shrink: true }}
            value={formData.start_date}
            onChange={handleChange}
            InputProps={{ readOnly }}
          />
        </Grid>

        {/* Due Date */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            required
            type="date"
            name="due_date"
            label={labelWithAsterisk("Due Date")}
            InputLabelProps={{ shrink: true }}
            value={formData.due_date}
            onChange={handleChange}
            InputProps={{ readOnly }}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

/* ---------------- Main Component ---------------- */
export default function Ad_Task() {
  const [formData, setFormData] = useState({
    task_id: "",
    emp_id: "",
    task_name: "",
    description: "",
    status: "Pending",
    priority: "Medium",
    start_date: "",
    due_date: "",
  });

  const [employees, setEmployees] = useState([]);
  const [taskList, setTaskList] = useState([]);
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;

  const [selectedTask, setSelectedTask] = useState(null);

  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const [openConfirmAdd, setOpenConfirmAdd] = useState(false);
  const [openConfirmEdit, setOpenConfirmEdit] = useState(false);
  const [openConfirmDelete, setOpenConfirmDelete] = useState(false);

  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [filterDept, setFilterDept] = useState("");
  const [filterEmp, setFilterEmp] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  /* Load Employees from backend */
  useEffect(() => {
    fetchEmployees();
  }, []);

  /* Load Tasks from backend */
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchEmployees = async () => {
    try {
      console.log("Fetching employees from:", `${API_BASE_URL}/get_all_employees`);
      
      const response = await fetch(`${API_BASE_URL}/get_all_employees`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Employees data:", data);
      
      if (data.success) {
        setEmployees(data.employees || []);
      } else {
        throw new Error(data.error || "Failed to fetch employees");
      }
    } catch (err) {
      console.error("Error fetching employees:", err);
      setSnack({ 
        open: true, 
        message: `Failed to load employees: ${err.message}`, 
        severity: "error" 
      });
      setEmployees([]);
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      console.log("Fetching tasks from:", `${API_BASE_URL}/get_tasks?role=admin`);
      
      const response = await fetch(`${API_BASE_URL}/get_tasks?role=admin`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Tasks data:", data);
      
      if (data.success) {
        setTaskList(data.tasks.sort((a, b) => b.task_id.localeCompare(a.task_id)));
      } else {
        throw new Error(data.error || "Failed to fetch tasks");
      }
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setSnack({ 
        open: true, 
        message: `Failed to load tasks: ${err.message}`, 
        severity: "error" 
      });
      setTaskList([]);
    } finally {
      setLoading(false);
    }
  };

  /* Handle Change */
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  /* Auto-fill employee info */
  const handleEmployeeSelect = (e) => {
    const selectedId = e.target.value;
    setFormData((prev) => ({
      ...prev,
      emp_id: selectedId,
    }));
  };

  // Generate Task ID
  const generateTaskId = () => {
    const adminId = sessionStorage.getItem("emp_id") || localStorage.getItem("emp_id") || "ADMIN";
    const timestamp = Date.now().toString().slice(-6);
    return `TSK_${adminId}_${timestamp}`;
  };

  // Unique options for filters
  const departmentOptions = useMemo(
    () =>
      Array.from(
        new Set(
          taskList
            .map(t => {
              const emp = employees.find(e => e.emp_id === t.emp_id);
              return emp?.department;
            })
            .filter(Boolean)
        )
      ).sort(),
    [taskList, employees]
  );

  const employeeIdOptions = useMemo(
    () =>
      Array.from(
        new Set(taskList.map((t) => t.emp_id).filter(Boolean))
      ).sort(),
    [taskList]
  );

  // Apply filters
  const filtered = useMemo(() => {
    return taskList.filter((t) => {
      const emp = employees.find(e => e.emp_id === t.emp_id);
      const deptOk = filterDept ? emp?.department === filterDept : true;
      const empOk = filterEmp ? t.emp_id === filterEmp : true;
      const statusOk = filterStatus ? t.status === filterStatus : true;
      return deptOk && empOk && statusOk;
    });
  }, [taskList, filterDept, filterEmp, filterStatus, employees]);

  // Paginate
  const paged = useMemo(() => {
    const start = page * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page]);

  const resetForm = () =>
    setFormData({
      task_id: "",
      emp_id: "",
      task_name: "",
      description: "",
      status: "Pending",
      priority: "Medium",
      start_date: "",
      due_date: "",
    });

  /* Basic validation */
  const validateForm = () => {
    console.log("Validating form data:", formData);
    
    if (!formData.emp_id || formData.emp_id === "") {
      setSnack({ open: true, message: "Please select an employee.", severity: "warning" });
      return false;
    }
    if (!formData.task_name || formData.task_name.trim() === "") {
      setSnack({ open: true, message: "Task name is required.", severity: "warning" });
      return false;
    }
    if (!formData.description || formData.description.trim() === "") {
      setSnack({ open: true, message: "Description is required.", severity: "warning" });
      return false;
    }
    if (!formData.start_date) {
      setSnack({ open: true, message: "Start date is required.", severity: "warning" });
      return false;
    }
    if (!formData.due_date) {
      setSnack({ open: true, message: "Due date is required.", severity: "warning" });
      return false;
    }
    if (new Date(formData.due_date) < new Date(formData.start_date)) {
      setSnack({ open: true, message: "Due date cannot be before start date.", severity: "warning" });
      return false;
    }
    return true;
  };

  /* Add Task */
  const handleAdd = () => {
    resetForm();
    const today = new Date().toISOString().split('T')[0];
    setFormData((prev) => ({
      ...prev,
      task_id: generateTaskId(),
      start_date: today,
      due_date: today,
    }));
    setOpenAddDialog(true);
  };

  const confirmAdd = async () => {
    console.log("Confirm add called with formData:", formData);
    
    if (!validateForm()) {
      console.log("Validation failed");
      return;
    }
    
    try {
      setActionLoading(true);
      const adminId = sessionStorage.getItem("emp_id") || localStorage.getItem("emp_id") || "ADMIN";
      
      const payload = {
        task_id: formData.task_id,
        emp_id: formData.emp_id,
        task_name: formData.task_name.trim(),
        description: formData.description.trim(),
        status: formData.status || "Pending",
        priority: formData.priority || "Medium",
        start_date: formData.start_date,
        due_date: formData.due_date,
        assigned_by: adminId,
      };
      
      console.log("Sending payload:", payload);
      
      const response = await fetch(`${API_BASE_URL}/create_task`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      console.log("Response status:", response.status);
      
      const responseText = await response.text();
      console.log("Response text:", responseText);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = responseText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = JSON.parse(responseText);
      console.log("Response data:", data);

      if (data.success) {
        setSnack({ open: true, message: "Task created successfully!", severity: "success" });
        setOpenConfirmAdd(false);
        setOpenAddDialog(false);
        fetchTasks();
        resetForm();
      } else {
        setSnack({ open: true, message: data.error || "Failed to create task", severity: "error" });
      }
    } catch (err) {
      console.error("Error creating task:", err);
      setSnack({ open: true, message: `Failed to create task: ${err.message}`, severity: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  /* View Task Details */
  const handleViewClick = (task) => {
    setSelectedTask(task);
    setOpenViewDialog(true);
  };

  /* Edit Task */
  const handleEditClick = (task) => {
    setFormData({
      task_id: task.task_id,
      emp_id: task.emp_id,
      task_name: task.task_name,
      description: task.description || "",
      status: task.status,
      priority: task.priority,
      start_date: task.start_date,
      due_date: task.due_date,
    });
    setSelectedTask(task);
    setOpenEditDialog(true);
  };

  const confirmEdit = async () => {
    if (!validateForm()) return;
    
    try {
      setActionLoading(true);
      const response = await fetch(`${API_BASE_URL}/update_task_status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task_id: formData.task_id,
          status: formData.status,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setSnack({ open: true, message: "Task updated successfully!", severity: "info" });
        setOpenConfirmEdit(false);
        setOpenEditDialog(false);
        fetchTasks();
      } else {
        setSnack({ open: true, message: data.error || "Failed to update task", severity: "error" });
      }
    } catch (err) {
      setSnack({ open: true, message: `Failed to update task: ${err.message}`, severity: "error" });
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  /* Delete Task */
  const handleDeleteClick = (task) => {
    setSelectedTask(task);
    setOpenDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!selectedTask) return;
    
    try {
      setActionLoading(true);
      const response = await fetch(`${API_BASE_URL}/delete_task`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task_id: selectedTask.task_id,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setSnack({ open: true, message: "Task deleted successfully!", severity: "error" });
        setOpenConfirmDelete(false);
        setOpenDeleteDialog(false);
        fetchTasks();
      } else {
        setSnack({ open: true, message: data.error || "Failed to delete task", severity: "error" });
      }
    } catch (err) {
      setSnack({ open: true, message: `Failed to delete task: ${err.message}`, severity: "error" });
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return '#4CAF50';
      case 'In Progress': return '#2196F3';
      case 'Overdue': return '#F44336';
      case 'Pending': return '#FF9800';
      default: return '#757575';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical': return '#D32F2F';
      case 'High': return '#F57C00';
      case 'Medium': return '#FBC02D';
      case 'Low': return '#388E3C';
      default: return '#757575';
    }
  };

  const getEmployeeName = (empId) => {
    const emp = employees.find(e => e.emp_id === empId);
    return emp ? emp.fullName : empId;
  };

  return (
    <Box sx={{ p: 4, bgcolor: '#f5f7fa', minHeight: '100vh' }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: '#4445B4' }}>
        Task Management
      </Typography>

      {/* Filters and Add Button */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={3}>
          <FormControl fullWidth>
            <InputLabel>Filter by Department</InputLabel>
            <Select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              label="Filter by Department"
            >
              <MenuItem value="">All Departments</MenuItem>
              {departmentOptions.map(dept => (
                <MenuItem key={dept} value={dept}>{dept}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={3}>
          <FormControl fullWidth>
            <InputLabel>Filter by Employee</InputLabel>
            <Select
              value={filterEmp}
              onChange={(e) => setFilterEmp(e.target.value)}
              label="Filter by Employee"
            >
              <MenuItem value="">All Employees</MenuItem>
              {employeeIdOptions.map(empId => (
                <MenuItem key={empId} value={empId}>
                  {empId} - {getEmployeeName(empId)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={3}>
          <FormControl fullWidth>
            <InputLabel>Filter by Status</InputLabel>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              label="Filter by Status"
            >
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
              <MenuItem value="Overdue">Overdue</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Button 
            variant="contained" 
            fullWidth
            startIcon={<Add />}
            onClick={handleAdd}
            sx={{ height: '56px', bgcolor: '#4445B4' }}
          >
            Add New Task
          </Button>
        </Grid>
      </Grid>

      {/* Loading State */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={60} />
        </Box>
      ) : (
        <>
          {/* Table */}
          <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Table>
              <TableHead sx={{ bgcolor: '#4445B4' }}>
                <TableRow>
                  <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Task ID</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Employee</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Task Name</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Priority</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Due Date</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paged.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography variant="body1" sx={{ py: 4 }}>
                        No tasks found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paged.map((task) => (
                    <TableRow key={task.task_id} hover>
                      <TableCell>{task.task_id}</TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {getEmployeeName(task.emp_id)}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {task.emp_id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {task.task_name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={task.priority}
                          size="small"
                          style={{
                            backgroundColor: getPriorityColor(task.priority),
                            color: '#fff',
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={task.status}
                          size="small"
                          style={{
                            backgroundColor: getStatusColor(task.status),
                            color: '#fff',
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography 
                          variant="body2"
                          color={task.status === 'Overdue' ? 'error' : 'inherit'}
                        >
                          {new Date(task.due_date).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <IconButton
                          color="primary"
                          onClick={() => handleViewClick(task)}
                          size="small"
                        >
                          <Visibility />
                        </IconButton>
                        <IconButton
                          color="secondary"
                          onClick={() => handleEditClick(task)}
                          size="small"
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteClick(task)}
                          size="small"
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Paper>

          {/* Pagination */}
          <TablePagination
            component="div"
            count={filtered.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[rowsPerPage]}
          />
        </>
      )}

      {/* Add Dialog */}
      <Dialog
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ bgcolor: '#4445B4', color: '#fff' }}>
          Add New Task
        </DialogTitle>
        <DialogContent>
          <FormFields
            formData={formData}
            handleChange={handleChange}
            employees={employees}
            handleEmployeeSelect={handleEmployeeSelect}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
          <Button onClick={() => setOpenConfirmAdd(true)} variant="contained" color="primary">
            Add Task
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ bgcolor: '#4445B4', color: '#fff' }}>
          Edit Task
        </DialogTitle>
        <DialogContent>
          <FormFields
            formData={formData}
            handleChange={handleChange}
            employees={employees}
            handleEmployeeSelect={handleEmployeeSelect}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button onClick={() => setOpenConfirmEdit(true)} variant="contained" color="secondary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Dialog */}
      <Dialog
        open={openViewDialog}
        onClose={() => setOpenViewDialog(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ bgcolor: '#4445B4', color: '#fff' }}>
          Task Details
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedTask && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Paper elevation={2} sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">Task ID</Typography>
                  <Typography variant="body1" fontWeight="bold">{selectedTask.task_id}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Paper elevation={2} sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">Employee</Typography>
                  <Typography variant="body1">{getEmployeeName(selectedTask.emp_id)}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper elevation={2} sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">Task Name</Typography>
                  <Typography variant="h6">{selectedTask.task_name}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper elevation={2} sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">Description</Typography>
                  <Typography variant="body1">{selectedTask.description || 'No description'}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper elevation={2} sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">Priority</Typography>
                  <Chip
                    label={selectedTask.priority}
                    style={{
                      backgroundColor: getPriorityColor(selectedTask.priority),
                      color: '#fff',
                      marginTop: '8px',
                    }}
                  />
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper elevation={2} sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">Status</Typography>
                  <Chip
                    label={selectedTask.status}
                    style={{
                      backgroundColor: getStatusColor(selectedTask.status),
                      color: '#fff',
                      marginTop: '8px',
                    }}
                  />
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper elevation={2} sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">Start Date</Typography>
                  <Typography variant="body1">
                    {new Date(selectedTask.start_date).toLocaleDateString()}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper elevation={2} sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">Due Date</Typography>
                  <Typography 
                    variant="body1" 
                    color={selectedTask.status === 'Overdue' ? 'error' : 'inherit'}
                  >
                    {new Date(selectedTask.due_date).toLocaleDateString()}
                  </Typography>
                </Paper>
              </Grid>
              {selectedTask.completion_date && (
                <Grid item xs={12}>
                  <Paper elevation={2} sx={{ p: 2, bgcolor: '#e8f5e9' }}>
                    <Typography variant="subtitle2" color="textSecondary">Completion Date</Typography>
                    <Typography variant="body1">
                      {new Date(selectedTask.completion_date).toLocaleDateString()}
                    </Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenViewDialog(false)}
            variant="contained"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle sx={{ color: '#f44336' }}>
          Delete Task
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this task?
          </Typography>
          {selectedTask && (
            <Box sx={{ mt: 2, p: 2, bgcolor: '#ffebee', borderRadius: 1 }}>
              <Typography variant="body2" fontWeight="bold">
                Task: {selectedTask.task_name}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                ID: {selectedTask.task_id}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={() => setOpenConfirmDelete(true)} color="error" variant="contained">
            Yes, Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Dialogs */}
      <ConfirmDialog
        open={openConfirmAdd}
        title="Confirm Add Task"
        message="Are you sure you want to create this task?"
        onCancel={() => setOpenConfirmAdd(false)}
        onConfirm={confirmAdd}
        loading={actionLoading}
      />
      <ConfirmDialog
        open={openConfirmEdit}
        title="Confirm Save Changes"
        message="Save changes to this task?"
        onCancel={() => setOpenConfirmEdit(false)}
        onConfirm={confirmEdit}
        loading={actionLoading}
      />
      <ConfirmDialog
        open={openConfirmDelete}
        title="Confirm Delete"
        message="This action cannot be undone. Delete task permanently?"
        confirmColor="error"
        onCancel={() => setOpenConfirmDelete(false)}
        onConfirm={confirmDelete}
        loading={actionLoading}
      />

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          severity={snack.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}