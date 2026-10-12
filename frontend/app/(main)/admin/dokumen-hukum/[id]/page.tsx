"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

import AdminNavbar from "@/feature/layouts/AdminNavbar";
import AdminSidebar from "@/feature/layouts/AdminSidebar";
import AdminFooter from "@/feature/layouts/AdminFooter";
import AdminBackground from "@/feature/layouts/AdminBackground";
import { AdminProdukHukumDetail } from "@/components/admin-produk-hukum-detail";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AdminDokumenHukumDetailPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const params = useParams();
  const id = Number(params?.id);

  if (!id) return null;

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 transition-colors duration-300 dark:bg-[#070D18] dark:text-slate-100">
      <AdminSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-[275px] flex flex-col min-h-screen">
        <AdminNavbar
          onMenuClick={() => setSidebarOpen(true)}
          title="Detail Dokumen Hukum"
          subtitle="Informasi dan metadata produk hukum"
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mb-6">
            <Link 
              href="/admin/dokumen-hukum"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-xs transition hover:border-blue-500/40 hover:text-blue-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-blue-400"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Kembali ke Daftar Dokumen</span>
            </Link>
          </div>
          <AdminProdukHukumDetail id={id} />
        </main>

        <AdminFooter />
      </div>
    </div>
  );
}
