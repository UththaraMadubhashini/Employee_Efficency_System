import React, { useState } from "react";
import {
  Box,
  Button,
  Grid,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  Rating,
  Divider,
} from "@mui/material";

export default function Ad_Perfomance() {
  
  const [openDialog, setOpenDialog] = useState(false);

  const [isNewFeedback, setIsNewFeedback] = useState(false);

  const [feedbackData, setFeedbackData] = useState({
    feedbackId: "",
    employeeId: "",
    employeeName: "",
    department: "",
    date: "",
    ratings: 0,
    score: "",
    engagementLevel: "",
    comments: "",
  });

  const labelWithAsterisk = (label) => (
    <Box component="span">
      {label}
      <Box component="span" sx={{ color: "red" }}>*</Box>
    </Box>
  );

  const handleViewClick = () => {
    setFeedbackData({
      feedbackId: "FB001",
      employeeId: "EMP001",
      employeeName: "John Doe",
      department: "IT",
      date: "2025-08-05",
      ratings: 3,
      score: "80",
      engagementLevel: "High",
      comments: "Great work and consistent performance.",
    });
    setIsNewFeedback(false);
    setOpenDialog(true);
  };

  const handleNewFeedbackClick = () => {
    setFeedbackData({
      feedbackId: "",
      employeeId: "",
      employeeName: "",
      department: "",
      date: "",
      ratings: 0,
      score: "",
      engagementLevel: "",
      comments: "",
    });
    setIsNewFeedback(true);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleChange = (e) => {
    setFeedbackData({ ...feedbackData, [e.target.name]: e.target.value });
  };

  return (
    <Box p={4}>
      {/* Filters */}
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
            onClick={handleNewFeedbackClick}
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
              "&:hover": {
                backgroundColor: "#ffffff",
              },
            }}
          >
            + New Feedback
          </Button>
        </Grid>
      </Grid>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#B9B9F2" }}>
              <TableCell>Feedback_ID</TableCell>
              <TableCell>Emp_Name</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Rating</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[...Array(6)].map((_, idx) => (
              <TableRow key={idx}>
                <TableCell>FB00{idx + 1}</TableCell>
                <TableCell>Employee {idx + 1}</TableCell>
                <TableCell>IT</TableCell>
                <TableCell><Rating value={4} readOnly /></TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    sx={{
                      borderRadius: "20px",
                      textTransform: "none",
                      fontWeight: "bold",
                    }}
                    onClick={handleViewClick}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle
          sx={{
            color: "#67BCE0",
            textAlign: "center",
            fontWeight: "bold",
            fontSize: "1.25rem",
            py: 2,
          }}
        >
          Feedback Details
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
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
              {["feedbackId", "employeeId", "employeeName", "department", "score"].map((key, idx) => (
                <Grid item xs={12} sm={6} key={idx}>
                  <TextField
                    fullWidth
                    label={labelWithAsterisk(key.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase()))}
                    name={key}
                    value={feedbackData[key]}
                    onChange={handleChange}
                    InputProps={{ readOnly: !isNewFeedback }}
                    variant="outlined"
                    sx={{ bgcolor: "#fff" }}
                  />
                </Grid>
              ))}

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={labelWithAsterisk("Date")}
                  type="date"
                  name="date"
                  value={feedbackData.date}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{ readOnly: !isNewFeedback }}
                  sx={{ bgcolor: "#fff" }}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography fontSize={14} fontWeight="bold" mb={0.5}>
                  Rating<Box component="span" sx={{ color: "red" }}>*</Box>
                </Typography>
                <Rating
                  name="ratings"
                  value={feedbackData.ratings}
                  readOnly={!isNewFeedback}
                  onChange={(e, newVal) =>
                    isNewFeedback && setFeedbackData({ ...feedbackData, ratings: newVal })
                  }
                />
              </Grid>

              <Grid item xs={12}>
                <Typography fontSize={14} fontWeight="bold" mb={0.5}>
                  Engagement Level<Box component="span" sx={{ color: "red" }}>*</Box>
                </Typography>
                <FormControl fullWidth>
                  <Select
                    name="engagementLevel"
                    value={feedbackData.engagementLevel}
                    onChange={handleChange}
                    disabled={!isNewFeedback}
                    sx={{ bgcolor: "#ffffff" }}
                  >
                    <MenuItem value="High">High</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="Low">Low</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Typography fontSize={14} fontWeight="bold" mb={0.5}>
                  Comments<Box component="span" sx={{ color: "red" }}>*</Box>
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  name="comments"
                  value={feedbackData.comments}
                  onChange={handleChange}
                  InputProps={{ readOnly: !isNewFeedback }}
                  sx={{ bgcolor: "#ffffff" }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>

        <DialogActions sx={{ justifyContent: "center", p: 2 }}>
          <Button
            variant="contained"
            onClick={handleCloseDialog}
            sx={{
              bgcolor: "#67BCE0",
              ":hover": { bgcolor: "#ffffff" },
              borderRadius: "60px",
              border: "3px solid #000000",
              color: "#000000",
              textTransform: "none",
              boxShadow: 2,
              px: 4,
            }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
