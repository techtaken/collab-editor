// src/App.tsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import DocPage from "./pages/DocPage";
import Home from "./pages/Home";
import RegisterUser from "./pages/RegisterUser";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/doc/:id" element={<DocPage />} />
      <Route path="/home" element={<Home />} />
      <Route path="/register" element={<RegisterUser />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
