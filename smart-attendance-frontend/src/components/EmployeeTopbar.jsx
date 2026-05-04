import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function EmployeeTopbar() {

const { user } = useContext(AuthContext);

return ( <div className="h-16 bg-white border-b flex items-center justify-end px-6">


  <div className="flex items-center gap-3">

    <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
      {user?.name?.charAt(0)}
    </div>

    <span className="font-medium">
      {user?.name}
    </span>

  </div>

</div>


);
}
