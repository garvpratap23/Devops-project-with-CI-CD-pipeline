import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';

export const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
};
