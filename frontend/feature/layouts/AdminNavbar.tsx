"use client";

import { Menu, Sparkles } from "lucide-react";
import { useParams, usePathname } from "next/navigation";
import { getSessionById } from "@/services/chat-service";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

interface AdminNavbarProps {
  onMenuClick?: () => void;
  title?: string;
  subtitle?: string;
}

export default function AdminNavbar({ onMenuClick, title, subtitle }: AdminNavbarProps) {
  const [chatTitle, setChatTitle] = useState("");
  const params = useParams();
  const pathname = usePathname();

  useEffect(() => {
    const fetchChatTitle = async () => {
      const id = params.id;
      if (id && typeof id === "string") {
        try {
          const sessionData = await getSessionById(id);
          if (sessionData && sessionData.title) {
            setChatTitle(sessionData.title);
          } else {
            setChatTitle("Sesi Chat Baru");
          }
        } catch {
          setChatTitle("Sesi Chat Baru");
        }
      } else if (pathname === "/admin/chat") {
        setChatTitle("Asisten HDH");
      }
    };

    fetchChatTitle();
  }, [params.id, pathname]);

  // Route-based title detection when title prop is not provided
  const getRouteInfo = () => {
    if (pathname.startsWith("/admin/dokumen-hukum/")) {
      return { title: "Detail Dokumen Hukum", subtitle: "Informasi & Metadata Regulasi" };
    }
    if (pathname === "/admin/dokumen-hukum") {
      return { title: "Dokumen Hukum", subtitle: "Harmonisasi & Manajemen Regulasi" };
    }
    if (pathname === "/admin/pengguna") {
      return { title: "Manajemen Pengguna", subtitle: "Kelola Akses & Petugas" };
    }
    if (pathname.startsWith("/admin/chat")) {
      return { title: chatTitle || "Asisten HDH", subtitle: "Konsultasi & Analisis Regulasi Cerdas" };
    }
    if (pathname === "/admin/berita") {
      return { title: "Berita & Publikasi", subtitle: "Kelola Siaran & Berita Hukum" };
    }
    if (pathname === "/admin/slider") {
      return { title: "Pengaturan Banner", subtitle: "Banner & Visual Beranda" };
    }
    if (pathname === "/admin/kontak") {
      return { title: "Pesan & Kontak", subtitle: "Kotak Masuk Saran Publik" };
    }
    if (pathname === "/admin/pengaturan") {
      return { title: "Pengaturan Sistem", subtitle: "Konfigurasi Portal & Sistem" };
    }
    return { title: "Dashboard", subtitle: "Statistik & Ringkasan Dokumen" };
  };

  const routeInfo = getRouteInfo();
  const displayTitle = title || routeInfo.title;
  const displaySubtitle = subtitle || routeInfo.subtitle;

  return (
    <header className="sticky top-0 z-40 h-[72px] border-b border-slate-200/90 bg-white/85 backdrop-blur-2xl transition-colors duration-300 dark:border-white/10 dark:bg-[#0A111F]/90 shadow-[0_4px_24px_rgba(15,23,42,0.03)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      {/* Luxurious hairline ambient accent */}
      <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#C9A15A]/40 to-transparent dark:via-[#C9A15A]/35 pointer-events-none" />

      <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left Side: Mobile Menu Button + Page Titles */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Buka Menu Sidebar"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/90 bg-slate-50 text-slate-600 transition-all duration-200 hover:border-[#C9A15A]/40 hover:bg-white hover:text-slate-900 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:border-[#C9A15A]/40 dark:hover:bg-slate-900 dark:hover:text-[#F3E2B8] lg:hidden"
          >
            <Menu size={20} />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-block h-2 w-2 rounded-full bg-[#C9A15A]" />
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 truncate max-w-[240px] sm:max-w-[480px]">
                {displayTitle}
              </h1>
            </div>

            <p className="hidden sm:block text-[12px] font-normal text-slate-500 dark:text-slate-400">
              {displaySubtitle}
            </p>
          </div>
        </div>

        {/* Right Side: Sleek Theme Toggle with luxury styling */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50/70 px-2.5 py-1.5 backdrop-blur-md dark:border-white/10 dark:bg-slate-900/60 shadow-xs">
            <span className="hidden sm:inline-block text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Tema
            </span>
            <ThemeToggle variant="ghost" size="sm" showDropdown={true} />
          </div>
        </div>
      </div>
    </header>
  );
}
