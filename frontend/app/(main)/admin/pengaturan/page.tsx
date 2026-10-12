
"use client";

import { useState } from "react";

import AdminNavbar from "@/feature/layouts/AdminNavbar";
import AdminSidebar from "@/feature/layouts/AdminSidebar";
import AdminFooter from "@/feature/layouts/AdminFooter";
import PengaturanForm from "@/feature/pengaturan/components/PengaturanForm";

export default function PengaturanPage() {
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
          title="Pengaturan Sistem"
          subtitle="Konfigurasi parameter dan aplikasi HDH"
        />

        <main className="flex-1">
          <PengaturanForm />
        </main>

        <AdminFooter />
      </div>
    </div>
  );
}
