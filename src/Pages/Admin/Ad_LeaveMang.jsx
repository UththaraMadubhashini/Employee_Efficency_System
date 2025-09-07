import React, { useState } from "react";
import {
  Box,
  Button,
  Grid,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  TextField,
  Divider,
  InputLabel,
  FormControl,
} from "@mui/material";

export default function Ad_LeaveMang() {
  const [openConfirm, setOpenConfirm] = useState(false);
  const [confirmType, setConfirmType] = useState(null);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: "",
    designation: "",
    leaveType: "",
    startDate: "",
    endDate: "",
  });

  const handleConfirm = (type) => {
    setConfirmType(type);
    setOpenConfirm(true);
  };

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
    setConfirmType(null);
  };

  const handleView = () => {
    setOpenViewDialog(true);
  };

  const handleCloseView = () => {
    setOpenViewDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = () => {
    console.log("Form Submitted", formData);
    setOpenDialog(false);
  };

  return (
    <Box p={4}>
      <Typography variant="h6" mb={3}>
        All Leave Request
      </Typography>

      <Grid container spacing={2} alignItems="center" mb={3}>
        <Grid item xs={12} sm={3}>
          <Select fullWidth defaultValue="" displayEmpty>
            <MenuItem value="" disabled>
              Department
            </MenuItem>
            <MenuItem value="HR">HR</MenuItem>
            <MenuItem value="IT">IT</MenuItem>
          </Select>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Select fullWidth defaultValue="" displayEmpty>
            <MenuItem value="" disabled>
              Emp_ID
            </MenuItem>
            <MenuItem value="EMP001">EMP001</MenuItem>
            <MenuItem value="EMP002">EMP002</MenuItem>
          </Select>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Select fullWidth defaultValue="" displayEmpty>
            <MenuItem value="" disabled>
              Date
            </MenuItem>
            <MenuItem value="2025-08-04">2025-08-04</MenuItem>
            <MenuItem value="2025-08-03">2025-08-03</MenuItem>
          </Select>
        </Grid>
        <Grid item xs={12} sm={3} textAlign={{ xs: "left", sm: "right" }}>
          <Button
            variant="contained"
            onClick={() => setOpenDialog(true)}
            sx={{
              bgcolor: "#67BCE0",
              ":hover": { bgcolor: "#ffffff" },
              borderRadius: "60px",
              border: "3px solid #000000",
              color: "#000000",
              textTransform: "none",
              boxShadow: 2,
              width: { xs: "100%", sm: "auto" },
            }}
          >
            + Leave
          </Button>
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#B9B9F2" }}>
              <TableCell padding="checkbox">
                <Checkbox />
              </TableCell>
              <TableCell>Attendance_ID</TableCell>
              <TableCell>Employee_ID</TableCell>
              <TableCell>Employee Name</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[...Array(5)].map((_, idx) => (
              <TableRow key={idx}>
                <TableCell padding="checkbox">
                  <Checkbox />
                </TableCell>
                <TableCell>AT00{idx + 1}</TableCell>
                <TableCell>EMP00{idx + 1}</TableCell>
                <TableCell>Employee {idx + 1}</TableCell>
                <TableCell>
                  <Button
                    onClick={() => handleConfirm("Reject")}
                    size="small"
                    sx={{
                      color: "#fff",
                      bgcolor: "#f44336",
                      mr: 1,
                      ":hover": { bgcolor: "#d32f2f" },
                    }}
                  >
                    Reject
                  </Button>
                  <Button
                    onClick={() => handleConfirm("Approve")}
                    size="small"
                    sx={{
                      color: "#fff",
                      bgcolor: "#4CAF50",
                      mr: 1,
                      ":hover": { bgcolor: "#388E3C" },
                    }}
                  >
                    Approve
                  </Button>
                  <Button
                    onClick={handleView}
                    size="small"
                    variant="outlined"
                    sx={{ borderRadius: "20px" }}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openConfirm} onClose={handleCloseConfirm}>
        <DialogTitle>{confirmType} Confirmation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to {confirmType?.toLowerCase()} this leave request?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirm}>Cancel</Button>
          <Button onClick={handleCloseConfirm} autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openViewDialog} onClose={handleCloseView} fullWidth maxWidth="sm">
        <DialogTitle>Leave Request Details</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body1">Employee ID: EMP001</Typography>
          <Typography variant="body1">Name: John Doe</Typography>
          <Typography variant="body1">Department: IT</Typography>
          <Typography variant="body1">Date: 2025-08-04</Typography>
          <Typography variant="body1">Reason: Sick Leave</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseView}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Leave Request Form */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>Leave Request Form</DialogTitle>
        <DialogContent>
          <Box mt={2}>
            <TextField
              fullWidth
              margin="normal"
              label="Employee ID"
              name="employeeId"
              value={formData.employeeId}
              onChange={handleInputChange}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Designation"
              name="designation"
              value={formData.designation}
              onChange={handleInputChange}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Leave Type</InputLabel>
              <Select
                name="leaveType"
                value={formData.leaveType}
                onChange={handleInputChange}
                label="Leave Type"
              >
                <MenuItem value="Sick Off">Sick Off</MenuItem>
                <MenuItem value="Half Day">Half Day</MenuItem>
                <MenuItem value="Morning">Morning</MenuItem>
                <MenuItem value="Evening">Evening</MenuItem>
                <MenuItem value="Unpaid">Unpaid</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              margin="normal"
              label="Start Date"
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              margin="normal"
              label="End Date"
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleInputChange}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSubmit}>Submit</Button>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
