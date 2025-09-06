import { Outlet } from 'react-router-dom';
import EmployeeSidebar from '../components/Sidebar/EmployeeSidebar';
import Emp_Header from '../components/Header/Emp_Header';

export default function EmployeeLayout() {
  return (
    <div>
      <EmployeeSidebar />
      <div style={{ marginLeft: '240px', padding: '1.5rem' }}>
        <Emp_Header />
        <Outlet />
      </div>
    </div>
  );
}
