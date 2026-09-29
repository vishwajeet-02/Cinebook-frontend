import { useState } from "react";
import { Outlet } from "react-router-dom";

import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";
import "./Admin.css";

const AdminLayout = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="admin-layout">
      <AdminSidebar
        open={open}
        setOpen={setOpen}
      />

      <div className="admin-main">
        <AdminNavbar setOpen={setOpen} />

        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;