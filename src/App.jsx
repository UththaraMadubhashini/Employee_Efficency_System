import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

import AdminLayout from '../src/Layout/AdminLayout';
import EmployeeLayout from '../src/Layout/EmployeeLayout';
import Login from './Pages/Login/Login';

// Admin Components and Pages
import AdminSidebar from './components/Sidebar/AdminSidebar';
import AdminDashboard from './Pages/Admin/Ad_Dashboard';
import ProfileManagement from './Pages/Admin/Ad_Profile';
import AttendanceManagement from './Pages/Admin/Ad_Attandance';
import PerformanceManagement from './Pages/Admin/Ad_Perfomance';
import TaskManagement from './Pages/Admin/Ad_Task';
import Ad_ProfileForm from './Pages/Admin/Ad_ProfileForm';
import Ad_LeaveMang from './Pages/Admin/Ad_LeaveMang';
import EmployeeRegistration from './Pages/Employee/Em_Attendance/RegisterFace';

import Dashboard from './Pages/Employee/Em_Dashboard/Em_Dashboard';
import Profile from './Pages/Employee/Em_Profile/Profile';
import Attendance from './Pages/Employee/Em_Attendance/Attendance';
import Leave from './Pages/Employee/Em_Leave/Leave';
import Performance from './Pages/Employee/Perfomance/Perfomance';
import Task from './Pages/Employee/Em_Task/Task';
import Equipment from './Pages/Employee/Em_Equipment/Equipment';

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
          <Route path="Reg-face" element={<EmployeeRegistration />} />
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
