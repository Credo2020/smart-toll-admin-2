import React from "react";
import "../styles/dashboard.css";

function Navbar({ adminName }) {
  const displayName = adminName || "Administrator";

  return (
    <div className="navbar">
      <h3>Admin Dashboard</h3>
      <div className="admin-profile">
        <span>{displayName}</span>
      </div>
    </div>
  );
}

export default Navbar;
