import { Outlet } from "react-router-dom";
import EmployeeSidebar from "../components/EmployeeSidebar";
import EmployeeTopbar from "../components/EmployeeTopbar";

export default function EmployeeLayout() {
return ( <div className="flex h-screen bg-gray-100">


  <EmployeeSidebar />

  <div className="flex flex-col flex-1 overflow-hidden">
    <EmployeeTopbar />

    <main className="flex-1 p-6 overflow-y-auto">
      <Outlet />
    </main>
  </div>

</div>


);
}
