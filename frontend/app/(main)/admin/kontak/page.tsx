
"use client";

import { useState } from "react";

import AdminNavbar from "@/feature/layouts/AdminNavbar";
import AdminSidebar from "@/feature/layouts/AdminSidebar";
import AdminFooter from "@/feature/layouts/AdminFooter";
import KontakComponent from "@/feature/kontak/components/KontakPage";

export default function KontaksPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-[#070D18] dark:text-slate-100">
      <AdminSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-[275px] flex flex-col min-h-screen">
        <AdminNavbar
          onMenuClick={() => setSidebarOpen(true)}
          title="Pesan & Kontak"
          subtitle="Kotak masuk dan aspirasi masyarakat"
        />

        <main className="flex-1">
          <KontakComponent />
        </main>

        <AdminFooter />
      </div>
    </div>
  );
}
