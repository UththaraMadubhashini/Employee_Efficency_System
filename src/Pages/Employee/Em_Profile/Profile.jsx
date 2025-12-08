import React, { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  Divider,
  Grid,
  IconButton,
  TextField,
  Typography,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  useMediaQuery,
  CircularProgress,
} from "@mui/material";
import { Edit, Visibility, VisibilityOff } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { useTheme } from "@mui/material/styles";
import { rtdb } from "../../../Firebase/firebase";
import { ref, get, update } from "firebase/database";

export default function EmployeeProfileView() {
  const [photo, setPhoto] = useState(null);
  const [tempPhoto, setTempPhoto] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [loading, setLoading] = useState(true);
  const [employeeData, setEmployeeData] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm();

  // Fetch logged-in employee data from Firebase
  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        setLoading(true);
      
        const employeeId = localStorage.getItem("emp_id");
        
        if (!employeeId) {
          setSnackbar({
            open: true,
            message: "No employee ID found. Please login again.",
            severity: "error"
          });
          setLoading(false);
          return;
        }

        // Fetch employee data from Firebase
        const employeeRef = ref(rtdb, `employees/${employeeId}`);
        const snapshot = await get(employeeRef);
        
        if (snapshot.exists()) {
          const data = snapshot.val();
          setEmployeeData(data);
          
          // Set form values
          Object.keys(data).forEach(key => {
            setValue(key, data[key]);
          });
          
          if (data.photo) {
            setPhoto(data.photo);
          }
        } else {
          setSnackbar({
            open: true,
            message: "Employee data not found",
            severity: "error"
          });
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching employee data:", error);
        setSnackbar({
          open: true,
          message: "Failed to load profile data: " + error.message,
          severity: "error"
        });
        setLoading(false);
      }
    };

    fetchEmployeeData();
  }, [setValue]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setTempPhoto(URL.createObjectURL(file));
    }
  };

  const handleEditClick = () => {
    setTempPhoto(photo);
    setOpenEditDialog(true);
  };

  const handleEditSave = () => {
    setPhoto(tempPhoto);
    setOpenEditDialog(false);
    setSnackbar({ 
      open: true, 
      message: "Profile photo updated successfully.",
      severity: "success"
    });
  };

  const onSubmit = async (data) => {
    try {
      // Get employee ID from localStorage
      const employeeId = localStorage.getItem("emp_id");
      
      if (!employeeId) {
        setSnackbar({
          open: true,
          message: "No employee ID found",
          severity: "error"
        });
        return;
      }

      // Update employee data in Firebase
      const employeeRef = ref(rtdb, `employees/${employeeId}`);
      await update(employeeRef, {
        fullName: data.fullName,
        address: data.address,
        tel: data.tel,
        email: data.email,
        photo: photo,
        updatedAt: new Date().toISOString(),
      });
      localStorage.setItem("email", data.email);
      localStorage.setItem("name", data.fullName);
      console.log("Profile updated:", data);
      setSnackbar({ 
        open: true, 
        message: "Profile updated successfully.",
        severity: "success"
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      setSnackbar({
        open: true,
        message: "Failed to update profile: " + error.message,
        severity: "error"
      });
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Password Dialog */}
      <Dialog open={openPasswordDialog} onClose={() => setOpenPasswordDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" mb={2}>
            Create a new password. Make sure it is strong and secure.
          </Typography>
          <TextField
            label="New Password"
            type={showPassword ? "text" : "password"}
            fullWidth
            size="small"
            margin="dense"
            {...register("newPassword", { required: true, minLength: 6 })}
            error={!!errors.newPassword}
            helperText={errors.newPassword ? "Password must be at least 6 characters" : ""}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="Confirm Password"
            type={showPassword ? "text" : "password"}
            fullWidth
            size="small"
            margin="dense"
            {...register("confirmPassword", { required: true })}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword ? "Please confirm your password" : ""}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPasswordDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit(async (data) => {
              if (data.newPassword !== data.confirmPassword) {
                setSnackbar({
                  open: true,
                  message: "Passwords do not match!",
                  severity: "error"
                });
              } else {
                try {
                  // Get employee ID from localStorage
                  const employeeId = localStorage.getItem("emp_id");
                  
                  if (!employeeId) {
                    setSnackbar({
                      open: true,
                      message: "No employee ID found",
                      severity: "error"
                    });
                    return;
                  }

                  // Update password in Firebase
                  const employeeRef = ref(rtdb, `employees/${employeeId}`);
                  await update(employeeRef, {
                    password: data.newPassword,
                    updatedAt: new Date().toISOString(),
                  });

                  setValue("password", data.newPassword);
                  setIsEditingPassword(true);
                  setOpenPasswordDialog(false);
                  setSnackbar({ 
                    open: true, 
                    message: "Password updated successfully.",
                    severity: "success"
                  });
                } catch (error) {
                  console.error("Error updating password:", error);
                  setSnackbar({
                    open: true,
                    message: "Failed to update password: " + error.message,
                    severity: "error"
                  });
                }
              }
            })}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Form Body */}
      <Box sx={{ maxWidth: 600, mx: "auto", p: 2 }}>
        <Typography variant="h5" fontWeight="bold" mb={3} textAlign="center">
          My Profile
        </Typography>
        
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Photo Upload */}
          <Card sx={{ backgroundColor: "#e5f6fd", p: 2, mb: 2 }}>
            <Grid container spacing={2} alignItems="center" direction={isMobile ? "column" : "row"}>
              <Grid item>
                <Avatar src={photo} sx={{ width: 80, height: 80 }} />
              </Grid>
              <Grid item xs>
                <Typography fontWeight="bold">Profile Photo</Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={photo ? "Photo uploaded" : "No photo"}
                  InputProps={{ readOnly: true }}
                  sx={{ backgroundColor: "#fff", mt: 1 }}
                />
              </Grid>
              <Grid item>
                <IconButton onClick={handleEditClick} sx={{ mt: isMobile ? 0 : 2 }}>
                  <Edit />
                </IconButton>
              </Grid>
            </Grid>
          </Card>

          {/* Employee Details */}
          <Card sx={{ backgroundColor: "#e5f6fd", p: 2, mb: 2 }}>
            <Typography fontWeight="bold" mb={1}>Personal Details</Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container direction="column" spacing={2}>
              <Grid item>
                <TextField 
                  label="Employee ID" 
                  fullWidth 
                  size="small" 
                  {...register("employeeId")} 
                  InputProps={{ readOnly: true }}
                  sx={{ backgroundColor: "#f0f0f0" }}
                />
              </Grid>
              <Grid item>
                <TextField 
                  label="Full Name" 
                  fullWidth 
                  size="small" 
                  {...register("fullName", { required: "Full name is required" })}
                  error={!!errors.fullName}
                  helperText={errors.fullName?.message}
                  sx={{ backgroundColor: "#fff" }}
                />
              </Grid>
              <Grid item>
                <TextField 
                  label="Address" 
                  fullWidth 
                  size="small" 
                  {...register("address")}
                  sx={{ backgroundColor: "#fff" }}
                />
              </Grid>
              <Grid item>
                <TextField 
                  label="Telephone" 
                  fullWidth 
                  size="small" 
                  {...register("tel", {
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: "Phone must be 10 digits"
                    }
                  })}
                  error={!!errors.tel}
                  helperText={errors.tel?.message}
                  sx={{ backgroundColor: "#fff" }}
                />
              </Grid>
              <Grid item>
                <TextField 
                  label="Email" 
                  fullWidth 
                  size="small" 
                  {...register("email", {
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Invalid email format"
                    }
                  })}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  sx={{ backgroundColor: "#fff" }}
                />
              </Grid>
              <Grid item>
                <Box display="flex" alignItems="center">
                  <TextField
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    fullWidth
                    size="small"
                    value="••••••••"
                    InputProps={{
                      readOnly: true,
                      sx: { backgroundColor: "#fff" },
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <IconButton onClick={() => setOpenPasswordDialog(true)}>
                    <Edit />
                  </IconButton>
                </Box>
              </Grid>
            </Grid>
          </Card>

          {/* Company Details */}
          <Card sx={{ backgroundColor: "#f1f8e9", p: 2, mb: 2 }}>
            <Typography fontWeight="bold" mb={1}>Company Details</Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container direction="column" spacing={2}>
              <Grid item>
                <TextField 
                  label="Department" 
                  fullWidth 
                  size="small" 
                  {...register("department")}
                  InputProps={{ readOnly: true }}
                  sx={{ backgroundColor: "#f0f0f0" }}
                />
              </Grid>
              <Grid item>
                <TextField 
                  label="Designation" 
                  fullWidth 
                  size="small" 
                  {...register("designation")}
                  InputProps={{ readOnly: true }}
                  sx={{ backgroundColor: "#f0f0f0" }}
                />
              </Grid>
              <Grid item>
                <TextField
                  label="Joining Date"
                  type="date"
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  InputProps={{ readOnly: true }}
                  {...register("joiningDate")}
                  sx={{ backgroundColor: "#f0f0f0" }}
                />
              </Grid>
            </Grid>
          </Card>
        </form>
      </Box>

      {/* Profile Photo Edit Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Edit Profile Photo</DialogTitle>
        <DialogContent dividers>
          <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
            <Avatar src={tempPhoto} sx={{ width: 100, height: 100 }} />
            <Button variant="outlined" component="label">
              Upload New Photo
              <input type="file" accept="image/*" hidden onChange={handlePhotoChange} />
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleEditSave}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={3000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}