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
} from "@mui/material";

export default function Equipment() {
  const [preview, setPreview] = useState(null);
  const [fileObj, setFileObj] = useState(null);
  const [identification, setIdentification] = useState("");
  const [loading, setLoading] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });

  // Dialog state
  const [confirmDialog, setConfirmDialog] = useState({ open: false, action: null });

  const webcamRef = useRef(null);
  const inputRef = useRef(null);

  const videoConstraints = {
    facingMode: "environment",
  };

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setPreview(imageSrc);
        setFileObj(null);
        setCameraOn(false);
        setIdentification("");
      }
    }
  }, [webcamRef]);

  const handleImageUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPreview(URL.createObjectURL(file));
      setFileObj(file);
      setIdentification("");
      setCameraOn(false);
    }
  };

  const handleTakePhoto = () => {
    setCameraOn(true);
    setPreview(null);
    setFileObj(null);
    setIdentification("");
  };

  // Actual done action after confirmation
  const doDone = async () => {
    setConfirmDialog({ open: false, action: null });

    if (!fileObj && !preview) {
      setSnackbar({ open: true, message: "Please capture or select an image first.", severity: "warning" });
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

      const res = await fetch("http://127.0.0.1:5000/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setSnackbar({ open: true, message: data.error || "Upload failed", severity: "error" });
      } else {
        setIdentification(data.equipment_name || "Unknown");
        setSnackbar({
          open: true,
          message: `Identified: ${data.equipment_name} (${(data.confidence * 100).toFixed(1)}%)`,
          severity: "success",
        });
      }
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: "Error uploading - check backend logs", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Actual cancel action after confirmation
  const doCancel = () => {
    setConfirmDialog({ open: false, action: null });
    setPreview(null);
    setFileObj(null);
    setIdentification("");
    setCameraOn(false);
  };

  // Open confirmation dialog for Done or Cancel
  const handleConfirm = (action) => {
    setConfirmDialog({ open: true, action });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleCloseDialog = () => {
    setConfirmDialog({ open: false, action: null });
  };

  return (
    <Box
      sx={{
        p: 4,
        maxWidth: 500,
        mx: "auto",
        borderRadius: 3,
        boxShadow: 3,
        backgroundColor: "#f7f9fc",
        width: "90vw",
        maxHeight: "90vh",
        overflowY: "auto",
      }}
    >
      <Typography
        variant="h5"
        mb={3}
        sx={{ fontWeight: 600, color: "#1976d2", textAlign: "center" }}
      >
        Image Processing
      </Typography>

      {!cameraOn && (
        <Button
          variant="contained"
          color="primary"
          onClick={handleTakePhoto}
          fullWidth
          sx={{ mb: 3, py: 1.5 }}
        >
          Take Photo
        </Button>
      )}

      {cameraOn && (
        <Box sx={{ mb: 3, textAlign: "center" }}>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            style={{ width: "100%", borderRadius: 8, maxHeight: 400, objectFit: "cover" }}
          />
          <Box sx={{ mt: 2, display: "flex", justifyContent: "center", gap: 2 }}>
            <Button variant="contained" color="primary" onClick={capture}>
              Capture
            </Button>
            <Button variant="outlined" color="secondary" onClick={() => handleConfirm("cancel")}>
              Cancel
            </Button>
          </Box>
        </Box>
      )}

      {!cameraOn && (
        <Paper
          variant="outlined"
          sx={{
            height: 220,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            mb: 3,
            borderRadius: 2,
            backgroundColor: "#e3f2fd",
            cursor: "pointer",
            overflow: "hidden",
          }}
          onClick={() => inputRef.current && inputRef.current.click()}
        >
          {preview ? (
            <img
              src={preview}
              alt="Uploaded"
              style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }}
            />
          ) : (
            <Typography
              sx={{ color: "#1976d2", fontWeight: 500, textAlign: "center" }}
            >
              Click to Upload Image
            </Typography>
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

      <TextField
        label="Identification"
        fullWidth
        value={identification}
        InputProps={{ readOnly: true }}
        sx={{ mb: 3 }}
      />

      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleConfirm("done")}
          sx={{ flex: 1, py: 1.5, fontWeight: 500 }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={20} /> : "Done"}
        </Button>

        <Button
          variant="outlined"
          color="secondary"
          onClick={() => handleConfirm("cancel")}
          sx={{ flex: 1, py: 1.5, fontWeight: 500 }}
        >
          Cancel
        </Button>
      </Box>

      {/* Confirmation Dialog */}
            <Dialog
        open={confirmDialog.open}
        onClose={handleCloseDialog}
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        PaperProps={{
          sx: { borderRadius: 3, overflow: "hidden" },
        }}
      >
        <DialogTitle
          id="confirm-dialog-title"
          sx={{
            backgroundColor: confirmDialog.action === "done" ? "primary.main" : "error.main",
            color: "common.white",
            fontWeight: "bold",
            fontSize: 18,
            textAlign: "center",
            py: 1.5,
          }}
        >
          {confirmDialog.action === "done" ? "Confirm Upload" : "Confirm Cancel"}
        </DialogTitle>
        <DialogContent sx={{ px: 3, py: 2 }}>
          <DialogContentText
            id="confirm-dialog-description"
            sx={{ fontSize: 16, color: "text.primary", textAlign: "center" }}
          >
            {confirmDialog.action === "done"
              ? "Are you sure you want to upload and identify this image?"
              : "Are you sure you want to cancel and clear the current image?"}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
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