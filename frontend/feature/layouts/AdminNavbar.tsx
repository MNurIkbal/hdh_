"use client";

import {
  Menu,
  ChevronDown,
  User,
  LogOut,
  X,
  LockKeyhole,
  Eye,
  EyeOff,
} from "lucide-react";

import { useParams, usePathname } from "next/navigation";
import { getSessionById } from "@/services/chat-service";
import { useEffect, useState } from "react";

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
          const session = await getSessionById(id);
          if (session && session.title) {
            setChatTitle(session.title);
          } else {
            setChatTitle("Sesi Chat Baru");
          }
        } catch (error) {
          setChatTitle("Sesi Chat Baru");
        }
      } else if (pathname === "/admin/chat") {
        setChatTitle("Asisten AI Chat");
      }
    };
    
    fetchChatTitle();
  }, [params.id, pathname]);

  const displayTitle = title || chatTitle || "Dashboard";
  const displaySubtitle = subtitle || "Asisten AI - HDH";

  return (
    <>
      <header className="sticky top-0 z-40 h-[72px] border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="flex h-full items-center justify-between px-4 lg:px-7">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onMenuClick}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 lg:hidden"
            >
              <Menu size={21} />
            </button>

            <div className="hidden md:block">
              <h1 className="text-[17px] font-semibold text-slate-800 truncate max-w-[400px]">
                {displayTitle}
              </h1>

              <p className="mt-0.5 text-[12px] font-normal text-slate-400">
                {displaySubtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Kept empty on purpose, user profile moved to Sidebar */}
          </div>
        </div>
      </header>
    </>
  );
}
