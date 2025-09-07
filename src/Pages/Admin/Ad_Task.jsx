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
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { rtdb } from "../../firebase/firebase";
import { ref, set, update, remove, onValue } from "firebase/database";

const labelWithAsterisk = (label) => (
  <Box component="span">
    {label}
    <Box component="span" sx={{ color: "red" }}>
      {" "}
      *{" "}
    </Box>
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
}) {
  return (
    <Dialog open={open} onClose={onCancel} fullWidth maxWidth="xs">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography>{message}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button variant="contained" color={confirmColor} onClick={onConfirm}>
          Confirm
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
    <Box
      sx={{
        boxShadow: 3,
        p: 3,
        backgroundColor: "#ffffff",
        border: "5px solid #67BCE0",
        borderRadius: "20px",
      }}
    >
      <Grid container spacing={2}>
        {/* Task ID */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Task ID"
            name="taskId"
            value={formData.taskId}
            InputProps={{ readOnly: true }}
          />
        </Grid>

        {/* Employee ID */}
        <Grid item xs={12} sm={6}>
          <Select
            fullWidth
            name="employeeId"
            value={formData.employeeId}
            onChange={handleEmployeeSelect}
            displayEmpty
          >
            <MenuItem value="">Select Employee</MenuItem>
            {employees.map((emp) => (
              <MenuItem key={emp.employeeId} value={emp.employeeId}>
                {emp.employeeId} - {emp.fullName}
              </MenuItem>
            ))}
          </Select>
        </Grid>

        {/* Employee Name */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Employee Name"
            name="employeeName"
            value={formData.employeeName}
            InputProps={{ readOnly: true }}
          />
        </Grid>

        {/* Department */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Department"
            name="department"
            value={formData.department}
            InputProps={{ readOnly: true }}
          />
        </Grid>

        {/* Description */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={2}
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            InputProps={{ readOnly }}
          />
        </Grid>

        {/* Start Date */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            type="date"
            name="startDate"
            label="Start Date"
            InputLabelProps={{ shrink: true }}
            value={formData.startDate}
            onChange={handleChange}
            InputProps={{ readOnly }}
          />
        </Grid>

        {/* End Date */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            type="date"
            name="endDate"
            label="End Date"
            InputLabelProps={{ shrink: true }}
            value={formData.endDate}
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
    taskId: "",
    employeeId: "",
    employeeName: "",
    department: "",
    description: "",
    startDate: "",
    endDate: "",
  });

  const [employees, setEmployees] = useState([]);
  const [taskList, setTaskList] = useState([]);
  const [page, setPage] = useState(0);
  const rowsPerPage = 5;

  const [openAdd, setOpenAdd] = useState(false); // (unused but kept)
  const [openEdit, setOpenEdit] = useState(false); // (unused but kept)
  const [openDelete, setOpenDelete] = useState(false); // (unused but kept)
  const [selectedTask, setSelectedTask] = useState(null);

  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const [openConfirmAdd, setOpenConfirmAdd] = useState(false);
  const [openConfirmEdit, setOpenConfirmEdit] = useState(false);
  const [openConfirmDelete, setOpenConfirmDelete] = useState(false);

  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Minimal filter state to satisfy existing useMemo usage (UI not changed)
  const [filterDept] = useState("");
  const [filterEmp] = useState("");

  /* Load Employees */
  useEffect(() => {
    const employeesRef = ref(rtdb, "employees");
    return onValue(employeesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setEmployees(Object.values(data));
    });
  }, []);

  /* Load Tasks (newest first) */
  useEffect(() => {
    const tasksRef = ref(rtdb, "tasks");
    return onValue(tasksRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const loaded = Object.values(data).sort((a, b) =>
          b.taskId.localeCompare(a.taskId)
        );
        setTaskList(loaded);
      } else {
        setTaskList([]);
      }
      setPage(0);
    });
  }, []);

  /* Handle Change */
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  /* Auto-fill employee info */
  const handleEmployeeSelect = (e) => {
    const selectedId = e.target.value;
    const emp = employees.find((emp) => emp.employeeId === selectedId);
    if (emp) {
      setFormData((prev) => ({
        ...prev,
        employeeId: emp.employeeId,
        employeeName: emp.fullName,
        department: emp.department,
      }));
    } else {
      setFormData((prev) => ({ ...prev, employeeId: selectedId }));
    }
  };

  // Auto-generate TaskID when Add Dialog opens
  useEffect(() => {
    if (openAddDialog) {
      setFormData((prev) => ({ ...prev, taskId: generateTaskId() }));
    }
  }, [openAddDialog, taskList]);

  // Unique options for filters from current dataset (kept to match original code)
  const departmentOptions = useMemo(
    () =>
      Array.from(
        new Set(taskList.map((t) => t.department).filter(Boolean))
      ).sort(),
    [taskList]
  );
  const employeeIdOptions = useMemo(
    () =>
      Array.from(
        new Set(taskList.map((t) => t.employeeId).filter(Boolean))
      ).sort(),
    [taskList]
  );

  // Apply filters (kept for compatibility)
  const filtered = useMemo(() => {
    return taskList.filter((t) => {
      const deptOk = filterDept ? t.department === filterDept : true;
      const empOk = filterEmp ? t.employeeId === filterEmp : true;
      return deptOk && empOk;
    });
  }, [taskList, filterDept, filterEmp]);

  // Paginate (kept, even if not used in table below)
  const paged = useMemo(() => {
    const start = page * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const resetForm = () =>
    setFormData({
      taskId: "",
      employeeId: "",
      employeeName: "",
      department: "",
      description: "",
      startDate: "",
      endDate: "",
    });

  /* Generate Task ID */
  const generateTaskId = () => {
    if (taskList.length === 0) return "TSK001";
    const lastId = taskList[0].taskId;
    const number = parseInt(lastId.replace("TSK", ""), 10) + 1;
    return `TSK${number.toString().padStart(3, "0")}`;
  };

  /* Basic validation */
  const validateForm = () => {
    if (!formData.employeeId) {
      setSnack({ open: true, message: "Select an employee.", severity: "warning" });
      return false;
    }
    if (!formData.description) {
      setSnack({ open: true, message: "Description is required.", severity: "warning" });
      return false;
    }
    if (!formData.startDate || !formData.endDate) {
      setSnack({ open: true, message: "Start and End dates are required.", severity: "warning" });
      return false;
    }
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      setSnack({ open: true, message: "End date cannot be before start date.", severity: "warning" });
      return false;
    }
    return true;
  };

  /* Add Task */
  const handleAdd = () => {
    setFormData({
      taskId: generateTaskId(),
      employeeId: "",
      employeeName: "",
      department: "",
      description: "",
      startDate: "",
      endDate: "",
    });
    setOpenAdd(true); // kept as in original
    setOpenAddDialog(true); // actually opens the dialog
  };

  const confirmAdd = async () => {
    if (!validateForm()) return;
    const taskRef = ref(rtdb, `tasks/${formData.taskId}`);
    await set(taskRef, formData);
    setOpenConfirmAdd(false);
    setOpenAddDialog(false);
    setSnack({ open: true, message: "Task added successfully!", severity: "success" });
  };

  /* Edit Task */
  const handleEditClickOpen = (task) => {
    setFormData(task);
    setSelectedTask(task);
    setOpenEditDialog(true);
  };

  const confirmEdit = async () => {
    if (!validateForm()) return;
    if (selectedTask) {
      const taskRef = ref(rtdb, `tasks/${formData.taskId}`);
      await update(taskRef, formData);
      setOpenConfirmEdit(false);
      setOpenEditDialog(false);
      setSnack({ open: true, message: "Task updated successfully!", severity: "info" });
    }
  };

  /* Delete Task */
  const handleDeleteClickOpen = (task) => {
    setSelectedTask(task);
    setOpenDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (selectedTask) {
      const taskRef = ref(rtdb, `tasks/${selectedTask.taskId}`);
      await remove(taskRef);
      setOpenConfirmDelete(false);
      setOpenDeleteDialog(false);
      setSnack({ open: true, message: "Task deleted!", severity: "error" });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Task Management
      </Typography>

      {/* Add Task Button */}
      <Button variant="contained" sx={{ mb: 2 }} onClick={handleAdd}>
        Add Task
      </Button>

      {/* Table */}
      <Table>
        <TableHead sx={{ backgroundColor: "#A1A3DC" }}>
          <TableRow>
            <TableCell>Task ID</TableCell>
            <TableCell>Employee ID</TableCell>
            <TableCell>Employee Name</TableCell>
            <TableCell>Department</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Start / End Date</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {taskList
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((task) => (
              <TableRow key={task.taskId}>
                <TableCell>{task.taskId}</TableCell>
                <TableCell>{task.employeeId}</TableCell>
                <TableCell>{task.employeeName}</TableCell>
                <TableCell>{task.department}</TableCell>
                <TableCell>{task.description}</TableCell>
                <TableCell>
                  {task.startDate} / {task.endDate}
                </TableCell>
                <TableCell>
                  <IconButton
                    color="secondary"
                    onClick={() => handleEditClickOpen(task)}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDeleteClickOpen(task)}
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      <TablePagination
        component="div"
        count={taskList.length}
        page={page}
        onPageChange={(e, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[rowsPerPage]}
      />

      {/* Add Dialog */}
      <Dialog
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Add a New Task</DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <FormFields
            formData={formData}
            handleChange={handleChange}
            employees={employees}
            handleEmployeeSelect={handleEmployeeSelect}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmAdd(true)}>Add</Button>
          <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Edit Task</DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <FormFields
            formData={formData}
            handleChange={handleChange}
            employees={employees}
            handleEmployeeSelect={handleEmployeeSelect}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmEdit(true)}>Save</Button>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Delete Task</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this task?</Typography>
        </DialogContent>
        <DialogActions>
          <Button color="error" onClick={() => setOpenConfirmDelete(true)}>
            Yes, Delete
          </Button>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Dialogs */}
      <ConfirmDialog
        open={openConfirmAdd}
        title="Confirm Add"
        message="Are you sure you want to add this task?"
        onCancel={() => setOpenConfirmAdd(false)}
        onConfirm={confirmAdd}
      />
      <ConfirmDialog
        open={openConfirmEdit}
        title="Confirm Save"
        message="Save changes to this task?"
        onCancel={() => setOpenConfirmEdit(false)}
        onConfirm={confirmEdit}
      />
      <ConfirmDialog
        open={openConfirmDelete}
        title="Confirm Delete"
        message="This action cannot be undone. Delete task?"
        confirmColor="error"
        onCancel={() => setOpenConfirmDelete(false)}
        onConfirm={confirmDelete}
      />

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
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
