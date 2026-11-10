import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar"; // or your existing sidebar component

export default function Layout() {
  return (
    <div
      className="app-container"
      style={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        backgroundColor: "#0f172a",
      }}
    >
      {/* Sidebar on the left */}
      <div
        className="sidebar-wrapper"
        style={{ width: "260px", flexShrink: 0, height: "100%" }}
      >
        <Sidebar />
      </div>

      {/* Main content area on the right */}
      <div
        className="main-content"
        style={{
          flex: 1,
          height: "100%",
          overflowY: "auto",
          backgroundColor: "#f8fafc",
          padding: "2rem",
        }}
      >
        <Outlet />
      </div>
    </div>
  );
}
