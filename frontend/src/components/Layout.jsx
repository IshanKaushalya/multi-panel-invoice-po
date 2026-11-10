import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

const Layout = () => {
  return (
    <div className="layout-container">
      <Sidebar />
      <main className="main-content">
        {/* The current route's component will render here */}
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
