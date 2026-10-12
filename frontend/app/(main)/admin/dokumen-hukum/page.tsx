
"use client";

import { useState } from "react";

import AdminNavbar from "@/feature/layouts/AdminNavbar";
import AdminSidebar from "@/feature/layouts/AdminSidebar";
import AdminFooter from "@/feature/layouts/AdminFooter";
import AdminBackground from "@/feature/layouts/AdminBackground";
import DokumenHukumComponent from "@/feature/dokumen-hukum/components/DokumenHukumComponent";
import { ProdukHukumTable } from "@/components/produk-hukum-table";
import { SessionHook } from "@/feature/web";

export default function DokumenHukumPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const session = SessionHook();
  const userRole = session?.data?.data?.role;

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 transition-colors duration-300 dark:bg-[#070D18] dark:text-slate-100">
      <AdminSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-[275px] flex flex-col min-h-screen">
        <AdminNavbar
          onMenuClick={() => setSidebarOpen(true)}
          title="Dokumen Hukum"
          subtitle="Manajemen dan harmonisasi dokumen hukum"
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {userRole === "Pengguna" ? (
            <div className="space-y-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Dokumen Hukum</h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Daftar dokumen hukum yang dipublikasikan di portal HDH BIN.
                </p>
              </div>
              <ProdukHukumTable />
            </div>
          ) : (
            <DokumenHukumComponent />
          )}
        </main>

        <AdminFooter />
      </div>
    </div>
  );
}
