import React, { useState, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import { Camera, Upload, CheckCircle, Warning } from "@mui/icons-material";

export default function Equipment() {
  const [preview, setPreview] = useState(null);
  const [fileObj, setFileObj] = useState(null);
  const [identification, setIdentification] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [topPredictions, setTopPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: "", 
    severity: "info" 
  });
  const [confirmDialog, setConfirmDialog] = useState({ 
    open: false, 
    action: null 
  });

  const webcamRef = useRef(null);
  const inputRef = useRef(null);

  const videoConstraints = {
    facingMode: "environment",
    width: 1280,
    height: 720,
  };

  // Capture photo from webcam
  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setPreview(imageSrc);
        setFileObj(null);
        setCameraOn(false);
        clearResults();
      }
    }
  }, [webcamRef]);

  // Handle image file upload
  const handleImageUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
    
      if (file.size > 5 * 1024 * 1024) {
        setSnackbar({
          open: true,
          message: "Image size too large. Please select an image under 5MB.",
          severity: "warning"
        });
        return;
      }
      
      setPreview(URL.createObjectURL(file));
      setFileObj(file);
      clearResults();
      setCameraOn(false);
    }
  };

  // Open camera
  const handleTakePhoto = () => {
    setCameraOn(true);
    setPreview(null);
    setFileObj(null);
    clearResults();
  };

  // Clear results
  const clearResults = () => {
    setIdentification("");
    setConfidence(0);
    setTopPredictions([]);
  };

  // Process and upload image
  const doDone = async () => {
    setConfirmDialog({ open: false, action: null });

    if (!fileObj && !preview) {
      setSnackbar({ 
        open: true, 
        message: "Please capture or select an image first.", 
        severity: "warning" 
      });
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();

      if (fileObj) {
        formData.append("image", fileObj);
      } else if (preview) {
        const res = await fetch(preview);
        const blob = await res.blob();
        formData.append("image", blob, "capture.jpg");
      }

      // Changed endpoint to match Flask backend
      const res = await fetch("http://127.0.0.1:5001/equipment/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setSnackbar({ 
          open: true, 
          message: data.error || "Upload failed", 
          severity: "error" 
        });
      } else {
        // Update state with results
        setIdentification(data.equipment_name || "Unknown");
        setConfidence(data.confidence || 0);
        setTopPredictions(data.top_predictions || []);
        
        // Show appropriate message based on confidence
        const severity = data.warning ? "warning" : "success";
        const message = data.warning 
          ? `${data.equipment_name} (${(data.confidence * 100).toFixed(1)}%) - Low confidence`
          : `Identified: ${data.equipment_name} (${(data.confidence * 100).toFixed(1)}%)`;
        
        setSnackbar({
          open: true,
          message: message,
          severity: severity,
        });
        
        // Optional: Save log to backend
        saveLogToBackend(data);
      }
    } catch (err) {
      console.error(err);
      setSnackbar({ 
        open: true, 
        message: "Error uploading - check backend connection", 
        severity: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  // Optional: Save recognition log to backend
  const saveLogToBackend = async (data) => {
    try {
      const empId = localStorage.getItem('emp_id') || sessionStorage.getItem('emp_id');
      
      if (!empId) return; // Skip if no employee logged in
      
      await fetch("http://127.0.0.1:5001/equipment/save_log", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emp_id: empId,
          equipment_name: data.equipment_name,
          confidence: data.confidence,
          top_predictions: data.top_predictions
        }),
      });
    } catch (err) {
      console.error("Failed to save log:", err);
      // Don't show error to user, this is optional background operation
    }
  };

  // Cancel and clear
  const doCancel = () => {
    setConfirmDialog({ open: false, action: null });
    setPreview(null);
    setFileObj(null);
    clearResults();
    setCameraOn(false);
  };

  // Open confirmation dialog
  const handleConfirm = (action) => {
    setConfirmDialog({ open: true, action });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleCloseDialog = () => {
    setConfirmDialog({ open: false, action: null });
  };

  // Get confidence color
  const getConfidenceColor = (conf) => {
    if (conf >= 0.8) return "success";
    if (conf >= 0.65) return "warning";
    return "error";
  };

  return (
    <Box
      sx={{
        p: 4,
        maxWidth: 600,
        mx: "auto",
        borderRadius: 3,
        boxShadow: 3,
        backgroundColor: "#f7f9fc",
        width: "90vw",
        maxHeight: "90vh",
        overflowY: "auto",
      }}
    >
      {/* Header */}
      <Typography
        variant="h5"
        mb={3}
        sx={{ 
          fontWeight: 600, 
          color: "#1976d2", 
          textAlign: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 1
        }}
      >
        <Camera /> Equipment Recognition
      </Typography>

      {/* Take Photo Button */}
      {!cameraOn && (
        <Button
          variant="contained"
          color="primary"
          onClick={handleTakePhoto}
          fullWidth
          startIcon={<Camera />}
          sx={{ mb: 3, py: 1.5 }}
        >
          Take Photo
        </Button>
      )}

      {/* Webcam View */}
      {cameraOn && (
        <Box sx={{ mb: 3, textAlign: "center" }}>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            style={{ 
              width: "100%", 
              borderRadius: 8, 
              maxHeight: 400, 
              objectFit: "cover" 
            }}
          />
          <Box sx={{ mt: 2, display: "flex", justifyContent: "center", gap: 2 }}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={capture}
              startIcon={<Camera />}
            >
              Capture
            </Button>
            <Button 
              variant="outlined" 
              color="error" 
              onClick={() => handleConfirm("cancel")}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      )}

      {/* Image Upload/Preview Area */}
      {!cameraOn && (
        <Paper
          variant="outlined"
          sx={{
            height: 280,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            mb: 3,
            borderRadius: 2,
            backgroundColor: "#e3f2fd",
            cursor: "pointer",
            overflow: "hidden",
            position: "relative",
            border: "2px dashed #1976d2",
          }}
          onClick={() => inputRef.current && inputRef.current.click()}
        >
          {preview ? (
            <img
              src={preview}
              alt="Uploaded"
              style={{ 
                maxHeight: "100%", 
                maxWidth: "100%", 
                objectFit: "contain" 
              }}
            />
          ) : (
            <Box sx={{ textAlign: "center", p: 3 }}>
              <Upload sx={{ fontSize: 48, color: "#1976d2", mb: 2 }} />
              <Typography
                sx={{ color: "#1976d2", fontWeight: 500 }}
              >
                Click to Upload Image
              </Typography>
              <Typography variant="caption" sx={{ color: "#666", mt: 1 }}>
                Supports: JPG, PNG (Max 5MB)
              </Typography>
            </Box>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleImageUpload}
          />
        </Paper>
      )}

      {/* Results Section */}
      {identification && (
        <Box sx={{ mb: 3 }}>
          <Paper sx={{ p: 2, backgroundColor: "#fff", borderRadius: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Identification Result:
            </Typography>
            
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
                {identification}
              </Typography>
              <Chip
                label={`${(confidence * 100).toFixed(1)}%`}
                color={getConfidenceColor(confidence)}
                icon={confidence >= 0.65 ? <CheckCircle /> : <Warning />}
              />
            </Box>

            {topPredictions.length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Top Predictions:
                </Typography>
                <List dense>
                  {topPredictions.slice(0, 3).map((pred, index) => (
                    <ListItem key={index} sx={{ py: 0.5 }}>
                      <ListItemText
                        primary={`${index + 1}. ${pred.class}`}
                        secondary={`${pred.percentage.toFixed(1)}%`}
                        primaryTypographyProps={{ 
                          variant: "body2",
                          fontWeight: index === 0 ? 600 : 400
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </>
            )}
          </Paper>
        </Box>
      )}

      {/* Identification TextField (Read-only) */}
      <TextField
        label="Identified Equipment"
        fullWidth
        value={identification}
        InputProps={{ 
          readOnly: true,
          endAdornment: confidence > 0 && (
            <Chip 
              label={`${(confidence * 100).toFixed(1)}%`} 
              size="small"
              color={getConfidenceColor(confidence)}
            />
          )
        }}
        sx={{ mb: 3 }}
        placeholder="No equipment identified yet"
      />

      {/* Action Buttons */}
      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleConfirm("done")}
          sx={{ flex: 1, py: 1.5, fontWeight: 500 }}
          disabled={loading || (!preview && !fileObj)}
        >
          {loading ? <CircularProgress size={20} color="inherit" /> : "Identify Equipment"}
        </Button>

        <Button
          variant="outlined"
          color="secondary"
          onClick={() => handleConfirm("cancel")}
          sx={{ flex: 1, py: 1.5, fontWeight: 500 }}
          disabled={loading}
        >
          Clear
        </Button>
      </Box>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={handleCloseDialog}
        PaperProps={{
          sx: { borderRadius: 3, overflow: "hidden" },
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: confirmDialog.action === "done" ? "primary.main" : "error.main",
            color: "common.white",
            fontWeight: "bold",
            fontSize: 18,
            textAlign: "center",
            py: 2,
          }}
        >
          {confirmDialog.action === "done" ? "Confirm Identification" : "Confirm Clear"}
        </DialogTitle>
        <DialogContent sx={{ px: 3, py: 3 }}>
          <DialogContentText
            sx={{ fontSize: 16, color: "text.primary", textAlign: "center" }}
          >
            {confirmDialog.action === "done"
              ? "Are you sure you want to identify this equipment image?"
              : "Are you sure you want to clear the current image and results?"}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 2, gap: 1 }}>
          <Button
            onClick={handleCloseDialog}
            variant="outlined"
            color="error"
            sx={{ minWidth: 100, fontWeight: 600 }}
          >
            No
          </Button>
          <Button
            onClick={() => {
              if (confirmDialog.action === "done") doDone();
              else if (confirmDialog.action === "cancel") doCancel();
            }}
            variant="contained"
            color="success"
            sx={{ minWidth: 100, fontWeight: 600 }}
            autoFocus
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}