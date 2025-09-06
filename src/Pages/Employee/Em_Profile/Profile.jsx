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
  useMediaQuery
} from "@mui/material";
import { Edit, Visibility, VisibilityOff } from "@mui/icons-material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTheme } from "@mui/material/styles";

export default function EmployeeProfileForm() {
  const [photo, setPhoto] = useState(null);
  const [tempPhoto, setTempPhoto] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

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
    setSnackbar({ open: true, message: "Profile photo updated successfully." });
  };

  const onSubmit = (data) => {
    console.log("Form Submitted:", data);
    setSnackbar({ open: true, message: "Profile details submitted successfully." });
  };

  return (
    <Box>
      {/* Password Dialog */}
      <Dialog open={openPasswordDialog} onClose={() => setOpenPasswordDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Create New Password</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" mb={2}>
            Employees can create their own password. Make sure it is strong and secure.
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
            onClick={handleSubmit((data) => {
              if (data.newPassword !== data.confirmPassword) {
                alert("Passwords do not match!");
              } else {
                setValue("password", data.newPassword);
                setIsEditingPassword(true);
                setOpenPasswordDialog(false);
                setSnackbar({ open: true, message: "Password updated successfully." });
              }
            })}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Form Body */}
      <Box sx={{ maxWidth: 600, mx: "auto", p: 2 }}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Photo Upload */}
          <Card sx={{ backgroundColor: "#e5f6fd", p: 2, mb: 2 }}>
            <Grid container spacing={2} alignItems="center" direction={isMobile ? "column" : "row"}>
              <Grid item>
                <Avatar src={photo} sx={{ width: 60, height: 60 }} />
              </Grid>
              <Grid item xs>
                <Typography>Upload Photo</Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={photo || ""}
                  InputProps={{ readOnly: true }}
                  sx={{ backgroundColor: "#fff" }}
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
            <Typography fontWeight="bold" mb={1}>Employee Details</Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container direction="column" spacing={2}>
              <Grid item>
                <TextField label="Employee ID" fullWidth size="small" {...register("employeeId", { required: true })} />
              </Grid>
              <Grid item>
                <TextField label="Full Name" fullWidth size="small" {...register("fullName")} />
              </Grid>
              <Grid item>
                <TextField label="Address" fullWidth size="small" {...register("address")} />
              </Grid>
              <Grid item>
                <TextField label="Telephone" fullWidth size="small" {...register("tel")} />
              </Grid>
              <Grid item>
                <TextField label="Email" fullWidth size="small" {...register("email")} />
              </Grid>
              <Grid item>
                <Box display="flex" alignItems="center">
                  <TextField
                    label="Change Password"
                    type={showPassword ? "text" : "password"}
                    fullWidth
                    size="small"
                    InputProps={{
                      readOnly: !isEditingPassword,
                      sx: { backgroundColor: "#fff" },
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    {...register("password")}
                  />
                  <IconButton onClick={() => setOpenPasswordDialog(true)}>
                    <Edit />
                  </IconButton>
                </Box>
              </Grid>
            </Grid>
          </Card>

          {/* Company Details */}
          <Card sx={{ backgroundColor: "#e5f6fd", p: 2, mb: 2 }}>
            <Typography fontWeight="bold" mb={1}>Company Details</Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container direction="column" spacing={2}>
              <Grid item>
                <TextField label="Department" fullWidth size="small" {...register("department")} />
              </Grid>
              <Grid item>
                <TextField label="Designation" fullWidth size="small" {...register("designation")} />
              </Grid>
              <Grid item>
                <TextField
                  label="Joining Date"
                  type="date"
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  {...register("joiningDate")}
                />
              </Grid>
            </Grid>
          </Card>

          {/* Submit Button */}
          <Box textAlign="right">
            <Button type="submit" variant="contained" sx={{ bgcolor: "#67BCE0",
              ":hover": { bgcolor: "#ffffff" },
              borderRadius: "60px",
              border: "3px solid #000000",
              color: "#000000",
              textTransform: "none",
              boxShadow: 2,
              width: { xs: "100%", sm: "auto" },
              marginTop: '20px' }}>
              OK
            </Button>
          </Box>
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
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ open: false, message: "" })}>
        <Alert severity="success" sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
