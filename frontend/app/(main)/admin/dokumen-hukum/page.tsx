
"use client";

import { useState } from "react";

import AdminNavbar from "@/feature/layouts/AdminNavbar";
import AdminSidebar from "@/feature/layouts/AdminSidebar";
import AdminFooter from "@/feature/layouts/AdminFooter";
import DokumenHukumComponent from "@/feature/dokumen-hukum/components/DokumenHukumComponent";
import { ProdukHukumTable } from "@/components/produk-hukum-table";
import { SessionHook } from "@/feature/web";

export default function DokumenHukumPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const session = SessionHook();
  const userRole = session?.data?.data?.role;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">

      <AdminSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-[270px] flex flex-col min-h-screen">

        <div className="lg:hidden p-4 border-b border-slate-200 bg-white flex items-center justify-between">
          <h1 className="font-semibold text-slate-800">Dokumen Hukum</h1>
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
          </button>
        </div>

        <div className="flex-1 p-4 lg:p-8">
          {userRole === "Pengguna" ? (
            <div className="space-y-4">
              <div>
                <h1 className="text-2xl font-semibold text-slate-800">Dokumen Hukum</h1>
                <p className="mt-1 text-sm text-slate-500">
                  Kelola pengguna yang digunakan untuk mengelola website HDH.
                </p>
              </div>
              <ProdukHukumTable />
            </div>
          ) : (
            <DokumenHukumComponent />
          )}
        </div>

        <AdminFooter />
      </div>
    </div>
  );
}
