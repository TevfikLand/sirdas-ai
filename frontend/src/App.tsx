import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";

const LandingPage = lazy(() => import("./pages/LandingPage").then(module => ({ default: module.LandingPage })));
const LoginPage = lazy(() => import("./pages/AuthPages").then(module => ({ default: module.LoginPage })));
const RegisterPage = lazy(() => import("./pages/AuthPages").then(module => ({ default: module.RegisterPage })));
const DiaryPage = lazy(() => import("./pages/DiaryPage").then(module => ({ default: module.DiaryPage })));
const CalendarPage = lazy(() => import("./pages/CalendarPage").then(module => ({ default: module.CalendarPage })));
const MoodHistoryPage = lazy(() => import("./pages/MoodHistoryPage").then(module => ({ default: module.MoodHistoryPage })));
const SettingsPage = lazy(() => import("./pages/SettingsPage").then(module => ({ default: module.SettingsPage })));
const AdminDashboardPage = lazy(() => import("./pages/AdminDashboardPage").then(module => ({ default: module.AdminDashboardPage })));

export default function App(){return <Suspense fallback={<div className="loading-page">Sırdaş AI açılıyor...</div>}><Routes><Route path="/" element={<LandingPage/>}/><Route path="/giris" element={<LoginPage/>}/><Route path="/kayit" element={<RegisterPage/>}/><Route path="/app" element={<AppShell/>}><Route index element={<Navigate to="gunluk" replace/>}/><Route path="gunluk" element={<DiaryPage/>}/><Route path="takvim" element={<CalendarPage/>}/><Route path="ruh-hali" element={<MoodHistoryPage/>}/><Route path="ayarlar" element={<SettingsPage/>}/><Route path="yonetim" element={<AdminDashboardPage/>}/></Route><Route path="*" element={<Navigate to="/" replace/>}/></Routes></Suspense>}
