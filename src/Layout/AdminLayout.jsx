import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/Sidebar/AdminSidebar';
import Ad_Header from '../components/Header/Ad_Header'; // ✅ fixed import name

const AdminLayout = () => {
  return (
    <div style={{ display: 'flex' }}>
      <AdminSidebar />

      <div
        style={{
          flexGrow: 1,
          padding: '20px',
          marginLeft: '240px',
          minHeight: '100vh',
          
        }}
      >
        <Ad_Header />
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
