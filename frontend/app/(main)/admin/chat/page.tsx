"use client";

import AsistenAIContent from "@/components/asisten-ai-content";
import AdminNavbar from "@/feature/layouts/AdminNavbar";
import AdminSidebar from "@/feature/layouts/AdminSidebar";
import AdminFooter from "@/feature/layouts/AdminFooter";
import AdminBackground from "@/feature/layouts/AdminBackground";
import { useState } from "react";

export default function AdminChatPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 transition-colors duration-300 dark:bg-[#070D18] dark:text-slate-100">
      <AdminSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-[275px] flex flex-col min-h-screen">
        <AdminNavbar
          onMenuClick={() => setSidebarOpen(true)}
          title="Asisten AI HDH"
          subtitle="Konsultasi dan analisis regulasi terintegrasi"
        />
        
        <main className="h-[calc(100vh-72px)] overflow-hidden">
          <AsistenAIContent />
        </main>
      </div>
    </div>
  );
}
