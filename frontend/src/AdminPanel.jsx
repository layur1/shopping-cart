import { useState } from "react";
import AdminDashboard from "./AdminDashboard";
import ProductManagement from "./ProductManagement";
import OrderManagement from "./OrderManagement";

export default function AdminPanel({ user, onLogout }) {
  const [currentPage, setCurrentPage] = useState("dashboard");

  return (
    <>
      {currentPage === "dashboard" && (
        <AdminDashboard
          user={user}
          onLogout={onLogout}
          onNavigate={setCurrentPage}
          currentPage={currentPage}
        />
      )}
      {currentPage === "products" && (
        <ProductManagement
          user={user}
          onLogout={onLogout}
          onNavigate={setCurrentPage}
        />
      )}
      {currentPage === "orders" && (
        <OrderManagement
          user={user}
          onLogout={onLogout}
          onNavigate={setCurrentPage}
        />
      )}
    </>
  );
}
