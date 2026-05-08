import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { Outlet } from "react-router-dom";

const AdminLayout = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      
      <Sidebar />

      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar />

        <main className="flex-1 p-4 lg:p-6 overflow-y-auto pt-16 lg:pt-6">
          <Outlet />
        </main>
      </div>

    </div>
  );
};

export default AdminLayout;