import { BarChart3, BookOpen, CalendarDays, LogOut, Menu, Settings, ShieldCheck, X } from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const userLinks = [
  { to: "/app/gunluk", label: "Günlük", icon: BookOpen },
  { to: "/app/takvim", label: "Geçmiş günlüklerim", icon: CalendarDays },
  { to: "/app/ruh-hali", label: "Ruh hali geçmişim", icon: BarChart3 },
  { to: "/app/ayarlar", label: "Ayarlar", icon: Settings }
];

export function Sidebar() {
  const { session, logout } = useAuth(); const [open, setOpen] = useState(false);
  const links = session?.role === "admin" ? [{ to: "/app/gunluk", label: "Özel günlüğüm", icon: BookOpen }, { to: "/app/yonetim", label: "Yönetim paneli", icon: ShieldCheck }] : userLinks;
  return <>
    <button className="mobile-menu" onClick={() => setOpen(true)} aria-label="Menüyü aç"><Menu /></button>
    {open && <button className="sidebar-backdrop" onClick={() => setOpen(false)} aria-label="Menüyü kapat" />}
    <aside className={`sidebar ${open ? "is-open" : ""}`}>
      <button className="mobile-close" onClick={() => setOpen(false)} aria-label="Menüyü kapat"><X /></button>
      <div className="sidebar-brand"><span className="brand-mark"><BookOpen size={19} /></span><strong>Sırdaş AI</strong></div>
      <nav>{links.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} onClick={() => setOpen(false)} title={label}><Icon /><span>{label}</span></NavLink>)}</nav>
      <button className="sidebar-logout" onClick={logout} title="Çıkış yap"><LogOut /><span>Çıkış yap</span></button>
    </aside>
  </>;
}
