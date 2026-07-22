import { Navigate, Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { useAuth } from "../context/AuthContext";

export function AppShell() {
  const { session, loading } = useAuth();
  if (loading) return <div className="loading-page">Sırdaş AI açılıyor...</div>;
  if (!session) return <Navigate to="/giris" replace />;
  return <div className="app-shell"><Sidebar /><main className="app-main"><Outlet /></main></div>;
}
