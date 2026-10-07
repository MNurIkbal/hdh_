"use client";

import AsistenAIContent from "@/components/asisten-ai-content";
import AdminNavbar from "@/feature/layouts/AdminNavbar";
import AdminSidebar from "@/feature/layouts/AdminSidebar";
import { useState } from "react";
import { useParams } from "next/navigation";

export default function AdminChatIdPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const params = useParams();

  // Optionally use params.id to load specific chat in AsistenAIContent
  // For now it renders the main chat component

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
          <AsistenAIContent initialChatId={typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : null} />
        </div>
      </div>
    </div>
  );
}
