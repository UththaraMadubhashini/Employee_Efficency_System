import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

import AdminLayout from '../src/Layout/AdminLayout';
import EmployeeLayout from '../src/Layout/EmployeeLayout';
import Login from './pages/Login/Login';

// Admin Components and Pages
import AdminSidebar from './components/Sidebar/AdminSidebar';
import AdminDashboard from './pages/Admin/Ad_Dashboard';
import ProfileManagement from './pages/Admin/Ad_Profile';
import AttendanceManagement from './pages/Admin/Ad_Attandance';
import PerformanceManagement from './pages/Admin/Ad_Perfomance';
import TaskManagement from './pages/Admin/Ad_Task';
import Ad_ProfileForm from './pages/Admin/Ad_ProfileForm';
import Ad_LeaveMang from './pages/Admin/Ad_LeaveMang';

import Dashboard from './pages/Employee/Em_Dashboard/Em_Dashboard';
import Profile from './pages/Employee/Em_Profile/Profile';
import Attendance from './pages/Employee/Em_Attandance/Attandance';
import Leave from './pages/Employee/Em_Leave/Leave';
import Performance from './pages/Employee/Perfomance/Perfomance';
import Task from './pages/Employee/Em_Task/Task';
import Equipment from './pages/Employee/Em_Equipment/Equipment';



function App() {
  return (
    <BrowserRouter>
    <ToastContainer position="top-right" autoClose={3000} />

      <Routes>

         <Route path="/login" element={<Login />} />

         {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/*  Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="profile-management" element={<ProfileManagement />} />
          <Route path="profile-form" element={<Ad_ProfileForm />} />
          <Route path="attendance-management" element={<AttendanceManagement />} />
          <Route path="Leave-management" element={<Ad_LeaveMang />} />
          <Route path="performance-management" element={<PerformanceManagement />} />
          <Route path="task-management" element={<TaskManagement />} />
        </Route>


        {/* Employee routes */}
        <Route path="/employee" element={<EmployeeLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="leave" element={<Leave />} />
          <Route path="performance" element={<Performance />} />
          <Route path="task" element={<Task />} />
          <Route path="equipment" element={<Equipment />} />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
