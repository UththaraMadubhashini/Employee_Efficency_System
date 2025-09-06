import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Grid,
  MenuItem,
  Select,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  useMediaQuery,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  TablePagination
} from "@mui/material";
import { Add, Edit, Delete } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { rtdb } from "../../firebase/firebase";
import { ref, onValue, update } from "firebase/database";

export default function Ad_Profile() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [empIdFilter, setEmpIdFilter] = useState("");
  const [tableType, setTableType] = useState("Employee"); // <-- Added
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, employee: null });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const departments = ["HR", "Food & Beverages", "IT", "FrontDesk", "HouseKeeping"];

  // Fetch Employees
  useEffect(() => {
    const employeesRef = ref(rtdb, "employees");
    const unsubscribeEmp = onValue(employeesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const employeesArray = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value,
        }));
        setEmployees(employeesArray);
      } else {
        setEmployees([]);
      }
    });

    const adminsRef = ref(rtdb, "admins");
    const unsubscribeAdmin = onValue(adminsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const adminsArray = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value,
        }));
        setAdmins(adminsArray);
      } else {
        setAdmins([]);
      }
    });

    return () => {
      unsubscribeEmp();
      unsubscribeAdmin();
    };
  }, []);

  const handleUpdate = (id) => {
    const emp = (tableType === "Employee" ? employees : admins).find((e) => e.id === id);
    setSelectedEmployee(emp);
    setOpenEditDialog(true);
  };

  const handleFieldChange = (e) => {
    setSelectedEmployee({ ...selectedEmployee, [e.target.name]: e.target.value });
  };

  const handleSaveUpdate = async () => {
    try {
      const node = tableType === "Employee" ? "employees" : "admins";
      await update(ref(rtdb, `${node}/${selectedEmployee.id}`), {
        ...selectedEmployee,
        updatedAt: new Date().toISOString(),
      });
      setSnackbar({ open: true, message: `${tableType} updated successfully!`, severity: "success" });
      setOpenEditDialog(false);
    } catch (error) {
      setSnackbar({ open: true, message: "Failed to update: " + error.message, severity: "error" });
    }
  };

  const handleDeleteClick = (employee) => setDeleteConfirm({ open: true, employee });
  const handleConfirmDelete = () => {
    const emp = deleteConfirm.employee;
    if (!emp) return;
    if (tableType === "Employee") setEmployees(employees.filter((e) => e.id !== emp.id));
    else setAdmins(admins.filter((a) => a.id !== emp.id));

    setSnackbar({ open: true, message: `${tableType} ${emp.employeeId} removed!`, severity: "success" });
    setDeleteConfirm({ open: false, employee: null });
  };
  const handleCancelDelete = () => setDeleteConfirm({ open: false, employee: null });

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filter and sort table data
  const displayedData = (tableType === "Employee" ? employees : admins)
    .filter((item) => {
      if (tableType === "Employee") {
        const matchesDept = departmentFilter ? item.department === departmentFilter : true;
        const matchesId = empIdFilter ? item.employeeId === empIdFilter : true;
        return matchesDept && matchesId;
      } else {
        return true; // show all admins
      }
    })
    .sort((a, b) => b.employeeId.localeCompare(a.employeeId)); // descending

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        All {tableType}s
      </Typography>

      {/* Filters & Add Button */}
      <Grid container spacing={2} alignItems="center" mb={3}>
        <Grid item xs={12} sm={3}>
          <Select fullWidth value={tableType} onChange={(e) => setTableType(e.target.value)}>
            <MenuItem value="Employee">Employee</MenuItem>
            <MenuItem value="Admin">Admin</MenuItem>
          </Select>
        </Grid>

        {tableType === "Employee" && (
          <>
            <Grid item xs={12} sm={3}>
              <Select fullWidth displayEmpty value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}>
                <MenuItem value="">Department</MenuItem>
                {departments.map((dep) => <MenuItem key={dep} value={dep}>{dep}</MenuItem>)}
              </Select>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Select fullWidth displayEmpty value={empIdFilter} onChange={(e) => setEmpIdFilter(e.target.value)}>
                <MenuItem value="">Emp_ID</MenuItem>
                {employees.map((emp) => <MenuItem key={emp.id} value={emp.employeeId}>{emp.employeeId}</MenuItem>)}
              </Select>
            </Grid>
          </>
        )}

        <Grid item xs={12} sm={6}>
          <Box display="flex" justifyContent={isMobile ? "center" : "flex-end"}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate("/admin/profile-form")}
              sx={{ bgcolor: "#74C0E3", ":hover": { bgcolor: "#ffffff" }, border: "2px solid #000", borderRadius: "25px", color: "#000", px: 3, textTransform: "none" }}
            >
              Add New {tableType}
            </Button>
          </Box>
        </Grid>
      </Grid>

      {/* Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table sx={{ borderCollapse: "collapse" }} aria-label="employee table">
          <TableHead sx={{ backgroundColor: "#A1A3DC" }}>
            <TableRow>
              <TableCell sx={{ border: "1px solid #999" }}>Employee_ID</TableCell>
              <TableCell sx={{ border: "1px solid #999" }}>Employee Name</TableCell>
              <TableCell sx={{ border: "1px solid #999" }}>Department</TableCell>
              <TableCell align="center" sx={{ border: "1px solid #999" }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedData.length > 0 ? (
              displayedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((emp) => (
                <TableRow key={emp.id || emp.employeeId}>
                  <TableCell sx={{ border: "1px solid #999" }}>{emp.employeeId}</TableCell>
                  <TableCell sx={{ border: "1px solid #999" }}>{emp.fullName}</TableCell>
                  <TableCell sx={{ border: "1px solid #999" }}>{emp.department || "-"}</TableCell>
                  <TableCell align="center" sx={{ border: "1px solid #999" }}>
                    <IconButton color="primary" onClick={() => handleUpdate(emp.id)} sx={{ mr: 1 }}><Edit /></IconButton>
                    <IconButton color="error" onClick={() => handleDeleteClick(emp)}><Delete /></IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ border: "1px solid #999" }}>No records found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 15]}
          component="div"
          count={displayedData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Edit Employee/Admin Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ color: "#67BCE0", textAlign: "center", fontWeight: "bold", fontSize: "1.25rem", py: 2 }}>Edit {tableType}</DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {selectedEmployee && (
            <Box sx={{ boxShadow: 3, p: 3, backgroundColor: "#fff", border: "5px solid #67BCE0", borderRadius: "20px" }}>
              <Grid container spacing={2}>
                {["employeeId","fullName","address","tel","email","department","designation","joiningDate"].map((field) => (
                  <Grid item xs={12} sm={field==="department"?12:6} key={field}>
                    {field==="department" ? (
                      <Select fullWidth size="small" name="department" value={selectedEmployee.department||""} onChange={handleFieldChange}>
                        {departments.map((dep)=><MenuItem key={dep} value={dep}>{dep}</MenuItem>)}
                      </Select>
                    ) : (
                      <TextField
                        fullWidth
                        size="small"
                        label={field.replace(/([A-Z])/g," $1").replace(/^./,str=>str.toUpperCase())}
                        name={field}
                        type={field==="joiningDate"?"date":"text"}
                        value={selectedEmployee[field]||""}
                        onChange={handleFieldChange}
                        InputLabelProps={field==="joiningDate"?{shrink:true}:{}}
                        InputProps={{ readOnly: field==="employeeId" }}
                        sx={{ backgroundColor: field==="employeeId"?"#f0f0f0":"#fff", color: field==="employeeId"?"#999":"#000" }}
                      />
                    )}
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", p: 2 }}>
          <Button onClick={() => setOpenEditDialog(false)} 
          sx={{ bgcolor: "#67BCE0", ":hover": { bgcolor: "#fff" }, borderRadius: "60px", border: "3px solid #000", color: "#000", px: 4, textTransform:"none"}}>Cancel</Button>
          <Button onClick={handleSaveUpdate} variant="contained" 
          sx={{ bgcolor:"#4CAF50", ":hover":{bgcolor:"#fff"}, borderRadius:"60px", border:"3px solid #000", color:"#000", px:4, textTransform:"none"}}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirm.open}
        onClose={handleCancelDelete}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { border: "3px solid #E53935", borderRadius: "20px", backgroundColor: "#FFEBEE" } }}
      >
        <DialogTitle sx={{ color: "#E53935", textAlign: "center", fontWeight: "bold", fontSize: "1.3rem", py: 2 }}>Confirm Delete</DialogTitle>
        <DialogContent sx={{ p: 3, textAlign: "center", fontFamily: "'Roboto', sans-serif", fontSize: "1.1rem", fontWeight: 500, color: "#000" }}>
          Are you sure you want to remove {tableType} <strong>{deleteConfirm.employee?.employeeId}</strong> from the list?
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
          <Button onClick={handleCancelDelete} sx={{ bgcolor: "#B0BEC5", ":hover": { bgcolor: "#90A4AE" }, borderRadius: "60px", border: "3px solid #000", color: "#000", px: 4, textTransform: "none" }}>Cancel</Button>
          <Button onClick={handleConfirmDelete} sx={{ bgcolor: "#E53935", ":hover": { bgcolor: "#FF1744" }, borderRadius: "60px", border: "3px solid #000", color: "#000", px: 4, textTransform: "none" }}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
