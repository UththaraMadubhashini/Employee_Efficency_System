import React, { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { Add, Edit, Delete, Visibility } from "@mui/icons-material";

const labelWithAsterisk = (label) => (
  <Box component="span">
    {label}
    <Box component="span" sx={{ color: "red" }}>*</Box>
  </Box>
);

export default function Ad_Task() {
  const [openDialog, setOpenDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);

  const [formData, setFormData] = useState({
    taskId: "",
    employeeId: "",
    employeeName: "",
    department: "",
    description: "",
    startDate: "",
    endDate: "",
  });

  const [selectedTaskIndex, setSelectedTaskIndex] = useState(null);
  const [taskList, setTaskList] = useState([
    {
      taskId: "TSK001",
      employeeId: "EMP001",
      employeeName: "John Doe",
      department: "IT",
      description: "Develop login module",
      startDate: "2025-08-01",
      endDate: "2025-08-05",
    },
    {
      taskId: "TSK002",
      employeeId: "EMP002",
      employeeName: "Jane Smith",
      department: "HR",
      description: "Prepare onboarding docs",
      startDate: "2025-08-03",
      endDate: "2025-08-06",
    },
    {
      taskId: "TSK003",
      employeeId: "EMP003",
      employeeName: "Michael Lee",
      department: "IT",
      description: "Update security patches",
      startDate: "2025-08-04",
      endDate: "2025-08-07",
    },
  ]);

  const handleOpen = () => {
    setFormData({
      taskId: "",
      employeeId: "",
      employeeName: "",
      department: "",
      description: "",
      startDate: "",
      endDate: "",
    });
    setOpenDialog(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddTask = () => {
    if (Object.values(formData).some((val) => val === "")) {
      alert("Please fill in all fields");
      return;
    }
    setTaskList([...taskList, formData]);
    setOpenDialog(false);
  };

  const handleView = (index) => {
    setFormData(taskList[index]);
    setViewDialog(true);
  };

  const handleEdit = (index) => {
    setSelectedTaskIndex(index);
    setFormData(taskList[index]);
    setEditDialog(true);
  };

  const handleSaveEdit = () => {
    const updated = [...taskList];
    updated[selectedTaskIndex] = formData;
    setTaskList(updated);
    setEditDialog(false);
  };

  const handleDelete = (index) => {
    setSelectedTaskIndex(index);
    setDeleteDialog(true);
  };

  const confirmDelete = () => {
    const updated = [...taskList];
    updated.splice(selectedTaskIndex, 1);
    setTaskList(updated);
    setDeleteDialog(false);
  };

  const renderFormFields = (readOnly = false) => (
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
        {["taskId", "employeeId", "employeeName", "department", "description"].map((field, idx) => (
          <Grid item xs={12} sm={6} key={idx}>
            <TextField
              fullWidth
              label={labelWithAsterisk(field.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase()))}
              name={field}
              value={formData[field]}
              onChange={handleChange}
              variant="outlined"
              InputProps={{ readOnly }}
              sx={{ bgcolor: "#fff" }}
            />
          </Grid>
        ))}

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="date"
            name="startDate"
            label={labelWithAsterisk("Start Date")}
            InputLabelProps={{ shrink: true }}
            value={formData.startDate}
            onChange={handleChange}
            InputProps={{ readOnly }}
            sx={{ bgcolor: "#fff" }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="date"
            name="endDate"
            label={labelWithAsterisk("End Date")}
            InputLabelProps={{ shrink: true }}
            value={formData.endDate}
            onChange={handleChange}
            InputProps={{ readOnly }}
            sx={{ bgcolor: "#fff" }}
          />
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <Box p={4}>
      <Grid container spacing={2} alignItems="center" mb={3}>
        <Grid item xs={12} sm={2}>
          <Select fullWidth defaultValue="" displayEmpty>
            <MenuItem value="" disabled>Department</MenuItem>
            <MenuItem value="HR">HR</MenuItem>
            <MenuItem value="IT">IT</MenuItem>
          </Select>
        </Grid>
        <Grid item xs={12} sm={2}>
          <Select fullWidth defaultValue="" displayEmpty>
            <MenuItem value="" disabled>Emp_ID</MenuItem>
            <MenuItem value="EMP001">EMP001</MenuItem>
            <MenuItem value="EMP002">EMP002</MenuItem>
          </Select>
        </Grid>
        <Grid item xs={12} sm={8} textAlign="right">
          <Button
            variant="contained"
            onClick={handleOpen}
            sx={{
              backgroundColor: "#74C0E3",
              borderRadius: "30px",
              border: "2px solid #000000",
              color: "#000",
              fontWeight: "bold",
              fontSize: "1rem",
              px: 4,
              py: 1,
              textTransform: "none",
              "&:hover": { backgroundColor: "#ffffff" },
            }}
          >
            + New Task
          </Button>
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ background: "#b4a7d6" }}>
            <TableRow>
              <TableCell>Task_ID</TableCell>
              <TableCell>Emp_Name</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {taskList.map((task, idx) => (
              <TableRow key={idx}>
                <TableCell>{task.taskId}</TableCell>
                <TableCell>{task.employeeName}</TableCell>
                <TableCell>{task.department}</TableCell>
                <TableCell>{task.description}</TableCell>
                <TableCell>{task.startDate}</TableCell>
                <TableCell>{task.endDate}</TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => handleView(idx)}><Visibility /></IconButton>
                  <IconButton color="secondary" onClick={() => handleEdit(idx)}><Edit /></IconButton>
                  <IconButton color="error" onClick={() => handleDelete(idx)}><Delete /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add a New Task</DialogTitle>
        <DialogContent sx={{ p: 3 }}>{renderFormFields()}</DialogContent>
        <DialogActions>
          <Button onClick={handleAddTask}>Add</Button>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={viewDialog} onClose={() => setViewDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>View Task</DialogTitle>
        <DialogContent sx={{ p: 3 }}>{renderFormFields(true)}</DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editDialog} onClose={() => setEditDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Task</DialogTitle>
        <DialogContent sx={{ p: 3 }}>{renderFormFields()}</DialogContent>
        <DialogActions>
          <Button onClick={handleSaveEdit}>Save</Button>
          <Button onClick={() => setEditDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this task?</Typography>
        </DialogContent>
        <DialogActions>
          <Button color="error" onClick={confirmDelete}>Yes, Delete</Button>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
