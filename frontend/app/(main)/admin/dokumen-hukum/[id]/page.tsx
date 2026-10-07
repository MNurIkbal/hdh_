"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

import AdminNavbar from "@/feature/layouts/AdminNavbar";
import AdminSidebar from "@/feature/layouts/AdminSidebar";
import AdminFooter from "@/feature/layouts/AdminFooter";
import { AdminProdukHukumDetail } from "@/components/admin-produk-hukum-detail";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AdminDokumenHukumDetailPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const params = useParams();
  const id = Number(params?.id);

  if (!id) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <AdminSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-[270px] flex flex-col min-h-screen">
        <div className="lg:hidden p-4 border-b border-slate-200 bg-white flex items-center justify-between">
          <h1 className="font-semibold text-slate-800">Detail Dokumen Hukum</h1>
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
          </button>
        </div>

        <div className="flex-1 p-4 lg:p-8">
          <div className="mb-6">
            <Link 
              href="/admin/dokumen-hukum"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali 
            </Link>
          </div>
          <AdminProdukHukumDetail id={id} />
        </div>

        <AdminFooter />
      </div>
    </div>
  );
}
