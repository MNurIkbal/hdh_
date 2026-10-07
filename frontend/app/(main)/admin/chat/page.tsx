"use client";

import AsistenAIContent from "@/components/asisten-ai-content";
import AdminNavbar from "@/feature/layouts/AdminNavbar";
import AdminSidebar from "@/feature/layouts/AdminSidebar";
import AdminFooter from "@/feature/layouts/AdminFooter";
import { useState } from "react";

export default function AdminChatPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <AdminSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-[270px]">
        <AdminNavbar
          onMenuClick={() => setSidebarOpen(true)}
        />
        
        <div className="h-[calc(100vh-72px)] overflow-hidden">
          <AsistenAIContent />
        </div>
      </div>
    </div>
  );
}
