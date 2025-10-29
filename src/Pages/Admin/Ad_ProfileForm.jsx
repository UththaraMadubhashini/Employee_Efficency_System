import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  Divider,
  Grid,
  TextField,
  Typography,
  Snackbar,
  Alert,
  useMediaQuery,
  MenuItem,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { useTheme } from "@mui/material/styles";
import { rtdb } from "../../firebase/firebase";
import { ref, set, get } from "firebase/database";
import { useNavigate } from "react-router-dom";

export default function Ad_ProfileForm() {
  
  const {
    handleSubmit,
    reset,
    register,
    formState: { errors },
    setValue,
    getValues,
    watch,
  } = useForm();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [autoEmpId, setAutoEmpId] = useState("");
  const [role, setRole] = useState("Employee");

  const whiteInputStyle = { backgroundColor: "#ffffff" };
  const requiredLabelProps = {
    required: true,
    sx: { "& .MuiFormLabel-asterisk": { color: "red" } },
  };
  const departments = ["HR", "Finance", "IT", "Operations", "Marketing"];

  // Watch the role field
  const selectedRole = watch("role", role);

  // Generate next ID automatically (separate for Admin & Employee)
  useEffect(() => {
    const node = selectedRole === "Admin" ? "admins" : "employees";
    const prefix = selectedRole === "Admin" ? "ADM" : "EMP";

    const employeesRef = ref(rtdb, node);
    get(employeesRef).then((snapshot) => {
      const data = snapshot.val();
      if (data) {
        const ids = Object.values(data).map((emp) =>
          parseInt(emp.employeeId.replace(prefix, ""), 10)
        );
        const nextId = Math.max(...ids) + 1;
        const newId = prefix + nextId.toString().padStart(3, "0");
        setAutoEmpId(newId);
        setValue("employeeId", newId);
      } else {
        setAutoEmpId(prefix + "001");
        setValue("employeeId", prefix + "001");
      }
    });
  }, [selectedRole, setValue]);

  // Add Employee/Admin
  const handleAddEmployee = async () => {
  const data = getValues();
  const { employeeId, role } = data;

  if (!employeeId) {
    setSnackbar({
      open: true,
      message: "Employee ID is required",
      severity: "error",
    });
    return;
  }

  try {
    const node = role === "Admin" ? "admins" : "employees";
    const employeeRef = ref(rtdb, `${node}/${employeeId}`);
    await set(employeeRef, {
      ...data,
      createdAt: new Date().toISOString(),
    });

    setSnackbar({
      open: true,
      message: `${role} added successfully.`,
      severity: "success",
    });
    reset();
    setRole(role);

    // Navigate to Ad_Profile page
    navigate("/admin/profile-form");
  } catch (error) {
    console.error("Error adding:", error);
    setSnackbar({
      open: true,
      message: `Failed to add ${role}.`,
      severity: "error",
    });
  }
};

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        px: 2,
        py: 4,
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 600,
          bgcolor: "#fff",
          p: 3,
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        <form noValidate onSubmit={handleSubmit(handleAddEmployee)}>
          {/* Role Selection */}
          <Card sx={{ backgroundColor: "#fce4ec", p: 2, mb: 2 }}>
            <Typography fontWeight="bold" mb={1}>
              User Role
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  select
                  label="Select Role"
                  fullWidth
                  size="small"
                  {...register("role", { required: "Role is required" })}
                  value={selectedRole}
                  onChange={(e) => {
                    setRole(e.target.value);
                    setValue("role", e.target.value);
                  }}
                  InputLabelProps={requiredLabelProps}
                  sx={whiteInputStyle}
                >
                  <MenuItem value="Employee">Employee</MenuItem>
                  <MenuItem value="Admin">Admin</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </Card>

          {/* Employee/Admin Details */}
          <Card sx={{ backgroundColor: "#e5f6fd", p: 2, mb: 2 }}>
            <Typography fontWeight="bold" mb={1}>
              {selectedRole} Details
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container direction="column" spacing={2}>
              <Grid item>
                <TextField
                  label="ID"
                  fullWidth
                  size="small"
                  {...register("employeeId")}
                  value={autoEmpId}
                  InputProps={{ readOnly: true }}
                  sx={whiteInputStyle}
                />
              </Grid>
              {["fullName", "address", "tel", "email", "password"].map(
                (field) => (
                  <Grid item key={field}>
                    <TextField
                      label={field
                        .replace(/([A-Z])/g, " $1")
                        .replace(/^./, (str) => str.toUpperCase())}
                      type={field === "password" ? "password" : "text"}
                      fullWidth
                      size="small"
                      {...register(field, {
                        required: `${field} is required`,
                        pattern:
                          field === "email"
                            ? {
                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message: "Invalid email format",
                              }
                            : field === "tel"
                            ? {
                                value: /^[0-9]{10}$/,
                                message: "Phone must be 10 digits",
                              }
                            : undefined,
                        minLength:
                          field === "password"
                            ? {
                                value: 6,
                                message:
                                  "Password must be at least 6 characters",
                              }
                            : undefined,
                      })}
                      error={!!errors[field]}
                      helperText={errors[field]?.message}
                      InputLabelProps={requiredLabelProps}
                      sx={whiteInputStyle}
                    />
                  </Grid>
                )
              )}
            </Grid>
          </Card>

          {/* Company Details only if Employee */}
          {selectedRole === "Employee" && (
            <Card sx={{ backgroundColor: "#f1f8e9", p: 2, mb: 2 }}>
              <Typography fontWeight="bold" mb={1}>
                Company Details
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container direction="column" spacing={2}>
                <Grid item>
                  <TextField
                    select
                    label="Department"
                    fullWidth
                    size="small"
                    {...register("department", {
                      required: "Department is required",
                    })}
                    error={!!errors.department}
                    helperText={errors.department?.message}
                    InputLabelProps={requiredLabelProps}
                    sx={whiteInputStyle}
                  >
                    {departments.map((dept) => (
                      <MenuItem key={dept} value={dept}>
                        {dept}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item>
                  <TextField
                    label="Designation"
                    fullWidth
                    size="small"
                    {...register("designation", {
                      required: "Designation is required",
                    })}
                    error={!!errors.designation}
                    helperText={errors.designation?.message}
                    InputLabelProps={requiredLabelProps}
                    sx={whiteInputStyle}
                  />
                </Grid>
                <Grid item>
                  <TextField
                    label="Joining Date"
                    type="date"
                    fullWidth
                    size="small"
                    {...register("joiningDate", {
                      required: "Joining Date is required",
                    })}
                    error={!!errors.joiningDate}
                    helperText={errors.joiningDate?.message}
                    InputLabelProps={{ shrink: true, ...requiredLabelProps }}
                    sx={whiteInputStyle}
                  />
                </Grid>
              </Grid>
            </Card>
          )}

          {/* Add Button */}
          <Box
            textAlign="right"
            display="flex"
            flexDirection={isMobile ? "column" : "row"}
            gap={2}
            justifyContent="flex-end"
          >
            <Button
              type="submit"
              variant="contained"
              sx={{
                bgcolor: "#74C0E3",
                ":hover": { bgcolor: "#ffffff" },
                border: "2px solid #000",
                borderRadius: "25px",
                color: "#000",
                px: 3,
                textTransform: "none",
              }}
            >
              Add {selectedRole}
            </Button>
          </Box>
        </form>
      </Box>

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
    </Box>
  );
}
