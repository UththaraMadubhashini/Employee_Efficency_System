import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
} from "@mui/material";

export default function Equipment() {
  const [image, setImage] = useState(null);
  const [identification, setIdentification] = useState("");

  const handleImageUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleTakePhoto = () => {
    alert("Camera functionality can be implemented here.");
  };

  const handleDone = () => {
    console.log("Uploaded Image:", image);
    console.log("Identification:", identification);
    alert("Process completed.");
  };

  const handleCancel = () => {
    setImage(null);
    setIdentification("");
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
      }}
    >
      <Typography
        variant="h5"
        mb={3}
        sx={{ fontWeight: 600, color: "#1976d2", textAlign: "center" }}
      >
        Image Processing
      </Typography>

      <Button
        variant="contained"
        color="primary"
        onClick={handleTakePhoto}
        fullWidth
        sx={{
          mb: 3,
          py: 1.5,
          fontWeight: 500,
          boxShadow: "0 4px 12px rgba(25, 118, 210, 0.3)",
          transition: "transform 0.2s",
          "&:hover": { transform: "scale(1.05)" },
        }}
      >
        Take Photo
      </Button>

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
          boxShadow: image
            ? "0 8px 20px rgba(0,0,0,0.2)"
            : "0 2px 8px rgba(0,0,0,0.1)",
          transition: "all 0.3s",
          "&:hover": { boxShadow: "0 12px 24px rgba(0,0,0,0.25)" },
        }}
        onClick={() => document.getElementById("upload-input").click()}
      >
        {image ? (
          <img
            src={image}
            alt="Uploaded"
            style={{ maxHeight: "100%", maxWidth: "100%" }}
          />
        ) : (
          <Typography
            sx={{
              color: "#1976d2",
              fontWeight: 500,
              textAlign: "center",
            }}
          >
            Click to Upload Image
          </Typography>
        )}
        <input
          id="upload-input"
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleImageUpload}
        />
      </Paper>

      <TextField
        label="Identification"
        fullWidth
        value={identification}
        onChange={(e) => setIdentification(e.target.value)}
        sx={{
          mb: 3,
          borderRadius: 2,
          backgroundColor: "#e3f2fd",
          "& .MuiOutlinedInput-root": {
            borderRadius: 2,
          },
        }}
      />

      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleDone}
          sx={{ flex: 1, py: 1.5, fontWeight: 500 }}
        >
          Done
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          onClick={handleCancel}
          sx={{
            flex: 1,
            py: 1.5,
            fontWeight: 500,
            borderColor: "#f50057",
            color: "#f50057",
            "&:hover": {
              backgroundColor: "#f50057",
              color: "#fff",
            },
          }}
        >
          Cancel
        </Button>
      </Box>
    </Box>
  );
}
