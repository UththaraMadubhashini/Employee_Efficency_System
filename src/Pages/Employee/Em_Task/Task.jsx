import React, { useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Checkbox,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';

const topTableData = [
  { id: 'T001', task: 'Room Cleaning' },
  { id: 'T002', task: 'Fix AC Unit' },
  { id: 'T003', task: 'Reception Backup' },
  { id: 'T004', task: 'Room Service' },
  { id: 'T005', task: 'Inventory Audit' },
];

const bottomTableData = [
  {
    id: 'T001',
    title: 'Room Cleaning',
    description: 'Clean Room 203 and restock toiletries',
    start: '2025-08-01',
    end: '2025-08-01',
    due: '2025-08-01',
    status: 'In Progress',
  },
  {
    id: 'T002',
    title: 'Fix AC Unit',
    description: 'Repair AC unit in Suite 502',
    start: '2025-08-01',
    end: '2025-08-02',
    due: '2025-08-02',
    status: 'Pending',
  },
  {
    id: 'T003',
    title: 'Reception Backup',
    description: 'Assist with morning shift at reception',
    start: '2025-08-01',
    end: '2025-08-01',
    due: '2025-08-01',
    status: 'Completed',
  },
  {
    id: 'T004',
    title: 'Room Service',
    description: 'Deliver lunch order to Room 310',
    start: '2025-08-01',
    end: '2025-08-01',
    due: '2025-08-01',
    status: 'In Review',
  },
  {
    id: 'T005',
    title: 'Inventory Audit',
    description: 'Check and record minibar stock in all rooms',
    start: '2025-08-01',
    end: '2025-08-02',
    due: '2025-08-02',
    status: 'In Progress',
  },
];

const Task = () => {
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  const handleCheckboxChange = (id) => {
    setSelectedTaskId(id);
  };

  const handleOkClick = () => {
    if (selectedTaskId) {
      setOpenDialog(true);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const selectedTask = bottomTableData.find((task) => task.id === selectedTaskId);

  return (
    <Box
  sx={{
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    py: 5,
  }}
>
  <Box
    sx={{
      width: '90%',
      maxWidth: '1000px',
      marginTop: '-280px',
      overflowX: 'auto', // Added to handle table overflow on small screens
    }}
  >
    {/* Top Table */}
    <Table
      sx={{
        border: '1px solid #ccc',
        mb: 2,
        minWidth: '600px', // Ensures horizontal scroll on small devices
      }}
    >
      <TableHead sx={{ backgroundColor: '#cfe2f3' }}>
        <TableRow>
          <TableCell sx={{ fontSize: { xs: '12px', sm: '14px' } }}>Task ID</TableCell>
          <TableCell sx={{ fontSize: { xs: '12px', sm: '14px' } }}>Assigned Task</TableCell>
          <TableCell align="center" sx={{ fontSize: { xs: '12px', sm: '14px' } }}>
            Select
          </TableCell>
          <TableCell align="center" sx={{ fontSize: { xs: '12px', sm: '14px' } }}>
            Action
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {topTableData.map((row) => (
          <TableRow key={row.id}>
            <TableCell sx={{ fontSize: { xs: '12px', sm: '14px' } }}>{row.id}</TableCell>
            <TableCell sx={{ fontSize: { xs: '12px', sm: '14px' } }}>{row.task}</TableCell>
            <TableCell align="center">
              <Checkbox
                checked={selectedTaskId === row.id}
                onChange={() => handleCheckboxChange(row.id)}
              />
            </TableCell>
            <TableCell align="center">
              <Button
                variant="outlined"
                size="small"
                onClick={handleOkClick}
                disabled={selectedTaskId !== row.id}
                sx={{
                  borderRadius: 5,
                  px: 2,
                  borderColor: '#000',
                  color: '#000',
                  backgroundColor: '#b2f296',
                  fontSize: { xs: '11px', sm: '13px' },
                  '&:hover': {
                    backgroundColor: '#8ae078',
                  },
                }}
              >
                OK
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>

    {/* Popup Dialog */}
    <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontSize: { xs: '16px', sm: '20px' } }}>
        Selected Task Details
      </DialogTitle>
      <DialogContent>
        {selectedTask ? (
          <DialogContentText component="div">
            <Typography sx={{ fontSize: { xs: '13px', sm: '15px' } }}>
              <strong>Task ID:</strong> {selectedTask.id}
            </Typography>
            <Typography sx={{ fontSize: { xs: '13px', sm: '15px' } }}>
              <strong>Title:</strong> {selectedTask.title}
            </Typography>
            <Typography sx={{ fontSize: { xs: '13px', sm: '15px' } }}>
              <strong>Description:</strong> {selectedTask.description}
            </Typography>
            <Typography sx={{ fontSize: { xs: '13px', sm: '15px' } }}>
              <strong>Start Date:</strong> {selectedTask.start}
            </Typography>
            <Typography sx={{ fontSize: { xs: '13px', sm: '15px' } }}>
              <strong>End Date:</strong> {selectedTask.end}
            </Typography>
            <Typography sx={{ fontSize: { xs: '13px', sm: '15px' } }}>
              <strong>Due Date:</strong> {selectedTask.due}
            </Typography>
            <Typography sx={{ fontSize: { xs: '13px', sm: '15px' } }}>
              <strong>Status:</strong> {selectedTask.status}
            </Typography>
          </DialogContentText>
        ) : (
          <DialogContentText>No task selected.</DialogContentText>
        )}
      </DialogContent>
      <DialogActions
        sx={{
          px: 3,
          pb: 2,
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 1,
        }}
      >
        <Button
          onClick={handleCloseDialog}
          sx={{
            width: { xs: '100%', sm: 'auto' },
            textTransform: 'none',
            bgcolor: '#67BCE0',
            ":hover": { bgcolor: "#ffffff" },
            borderRadius: "60px",
            border: "3px solid #000000",
            color: "#000000",
            boxShadow: 2,
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  </Box>
</Box>
  );
};

export default Task;