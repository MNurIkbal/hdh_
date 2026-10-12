
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  Users,
  MessageSquare,
  X,
  ShieldCheck,
  Plus,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { SessionHook, LogoutHook } from "@/feature/web";
import { getSessions, deleteSession } from "@/services/chat-service";
import { useRouter } from "next/navigation";
import { useUpdatePassword } from "@/feature/pengguna/hooks/Pengguna.hooks";
import Toast from "@/components/ui/Toast";
import {
  ChevronDown,
  User,
  LogOut,
  LockKeyhole,
  Eye,
  EyeOff,
  MoreHorizontal,
  Trash2
} from "lucide-react";

interface AdminSidebarProps {
  open?: boolean;
  onClose?: () => void;
}

const MENU = [
  {
    label: "Dokumen Hukum",
    href: "/admin/dokumen-hukum",
    icon: FileText,
  },
  {
    label: "Pengguna",
    href: "/admin/pengguna",
    icon: Users,
  },
  {
    label: "Chat",
    href: "/admin/chat",
    icon: MessageSquare,
  },
];


export default function AdminSidebar({
  open = false,
  onClose,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const [chatHistory, setChatHistory] = useState<{ id: string, title: string }[]>([]);
  const session = SessionHook();
  const userId = session?.data?.data?.id ?? "guest";
  const userRole = session?.data?.data?.role ?? "";

  const filteredMenu = MENU.filter(item => {
    if (item.label === "Pengguna" && userRole !== "Admin") {
      return false;
    }
    return true;
  });

  const [profileOpen, setProfileOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<{ id: string, title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const logoutMutation = LogoutHook();
  const nama = session?.data?.data?.nama ?? "Admin";

  const handleLogout = async () => {
    if (logoutMutation.isPending) return;

    try {
      await logoutMutation.mutateAsync();
      router.replace("/auth");
    } catch (error) { }
  };

  const [toast, setToast] = useState({
    open: false,
    type: "success" as "success" | "error" | "info",
    title: "",
    message: "",
  });

  const updatePassword = useUpdatePassword();

  const handleOpenPasswordModal = () => {
    setProfileOpen(false);
    setPasswordModalOpen(true);
  };

  const handleClosePasswordModal = () => {
    setPasswordModalOpen(false);
    setNewPassword("");
    setConfirmPassword("");
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const handleChangePassword = (id: any) => {
    if (!newPassword.trim()) {
      setToast({
        open: true,
        type: "error",
        title: "Gagal",
        message: "Password baru wajib diisi.",
      });
      return;
    }

    if (!confirmPassword.trim()) {
      setToast({
        open: true,
        type: "error",
        title: "Gagal",
        message: "Ulangi password wajib diisi.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setToast({
        open: true,
        type: "error",
        title: "Gagal",
        message: "Password baru dan ulangi password harus sama.",
      });
      return;
    }

    updatePassword.mutate(
      {
        id,
        password: newPassword,
      },
      {
        onSuccess: () => {
          setToast({
            open: true,
            type: "success",
            title: "Berhasil",
            message: "Password berhasil diperbarui.",
          });
          handleClosePasswordModal();
        },
        onError: (error: any) => {
          setToast({
            open: true,
            type: "error",
            title: "Gagal",
            message:
              error?.response?.data?.message ?? "Gagal memperbarui password.",
          });
        },
      }
    );
  };

  const isSubmitting = updatePassword.isPending;

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getSessions();
        setChatHistory(data || []);
      } catch (e) {
        setChatHistory([]);
      }
    };

    if (userId !== "guest") {
      fetchHistory();
      window.addEventListener("chat-history-updated", fetchHistory);
      return () => window.removeEventListener("chat-history-updated", fetchHistory);
    }
  }, [userId]);

  const handleDeleteSession = async () => {
    if (!deleteConfirmOpen) return;
    setIsDeleting(true);
    try {
      await deleteSession(deleteConfirmOpen.id);
      setToast({
        open: true,
        type: "success",
        title: "Berhasil",
        message: "Sesi chat berhasil dihapus.",
      });

      const newData = await getSessions();
      setChatHistory(newData || []);

      if (pathname.includes(deleteConfirmOpen.id)) {
        router.push("/admin/chat");
      }
    } catch (e) {
      setToast({
        open: true,
        type: "error",
        title: "Gagal",
        message: "Gagal menghapus sesi chat.",
      });
    } finally {
      setIsDeleting(false);
      setDeleteConfirmOpen(null);
    }
  };

  return (
    <>
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 z-50
          flex h-screen w-[275px] flex-col overflow-hidden
          border-r border-[#1B3A60]/80 bg-gradient-to-b from-[#08182B] via-[#0B2342] to-[#061424]
          text-white
          shadow-[6px_0_35px_rgba(2,8,18,0.35)]
          transition-transform duration-300
          lg:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
        style={{
          fontFamily:
            "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        }}
      >
        {/* Subtle Ambient Glow for Luxury Sidebar (Matching Auth Showcase) */}
        <div className="pointer-events-none absolute -top-24 -left-20 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(19,88,168,0.35)_0%,transparent_70%)] blur-2xl" />
        <div className="pointer-events-none absolute bottom-12 -right-16 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(201,161,90,0.22)_0%,transparent_70%)] blur-2xl" />

        {/* Subtle geometric grid texture inside sidebar */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.4) 1px, transparent 1px)
            `,
            backgroundSize: "32px 32px",
          }}
        />

        {/* Brand Header */}
        <div className="relative z-10 flex h-[72px] shrink-0 items-center justify-between border-b border-white/10 px-5 bg-black/10 backdrop-blur-xs">
          <Link
            href="/admin"
            onClick={onClose}
            className="group flex items-center gap-3"
          >
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl p-1 text-white border border-[#C9A15A]/40 transition-transform duration-200 group-hover:scale-105"
              style={{
                background:
                  "linear-gradient(135deg, #0B2545 0%, #1358A8 100%)",
                boxShadow:
                  "0 8px 22px rgba(19, 88, 168, 0.35)",
              }}
            >
              <Image src="/images/log.png" alt="logo" height={70} width={70} className="object-contain" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[17px] font-bold tracking-tight text-white">
                  HDH
                </span>
              </div>

              <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#F3E2B8]">
                Harmonisasi Dokumen Hukum
              </div>
            </div>
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 transition hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* System Status Pill Banner */}
        <div className="relative z-10 px-4 pt-4">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] px-3.5 py-2.5 backdrop-blur-md shadow-xs">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[#C9A15A]/40 bg-[#C9A15A]/15 text-[#F3E2B8] shadow-xs">
              <ShieldCheck size={16} />
            </div>

            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-white">
                Sistem Terlindungi
              </p>

              <div className="flex items-center gap-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#10B981]" />
                </span>

                <span className="text-[10px] text-slate-300">
                  Layanan Normal
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="relative z-10 mt-5 flex-1 overflow-y-auto px-3.5 pb-6">
          <div className="mb-2.5 px-3">
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Navigasi Utama
            </span>
          </div>

          <div className="space-y-1">
            {filteredMenu.map((item) => {
              const Icon = item.icon;

              const active =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`
                    group relative flex items-center
                    gap-3 rounded-xl px-3 py-2.5
                    text-[13px] font-medium
                    transition-all duration-200
                    ${active
                      ? "bg-gradient-to-r from-[#1358A8] to-[#1E6BCE] text-white shadow-[0_4px_18px_rgba(19,88,168,0.45)] border border-blue-400/20"
                      : "text-slate-300 hover:bg-white/[0.08] hover:text-white"
                    }
                  `}
                >
                  {active && (
                    <span
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3.5px] rounded-r-full bg-[#C9A15A] shadow-[0_0_8px_#C9A15A]"
                    />
                  )}

                  <span
                    className={`
                      flex h-8 w-8 shrink-0
                      items-center justify-center
                      rounded-lg
                      transition-all duration-200
                      ${active
                        ? "bg-white/20 text-white shadow-xs backdrop-blur-sm"
                        : "text-slate-400 group-hover:bg-white/10 group-hover:text-white"
                      }
                    `}
                  >
                    <Icon
                      size={17}
                      strokeWidth={active ? 2.2 : 1.8}
                    />
                  </span>

                  <span className="truncate">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Chat History */}
          <div className="mt-7 px-3 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Riwayat Chat
            </span>
            <button
              type="button"
              onClick={() => {
                onClose?.();
                window.dispatchEvent(new Event("chat-new-session"));
                router.push("/admin/chat");
              }}
              className="flex h-5 w-5 items-center justify-center rounded-md border border-white/10 bg-white/[0.06] text-slate-300 hover:border-[#C9A15A]/50 hover:text-[#F3E2B8] hover:bg-white/10 transition-colors"
              title="Buat Sesi Baru"
            >
              <Plus size={13} />
            </button>
          </div>

          <div className={`mt-2 space-y-1 pr-1 ${dropdownOpen ? 'overflow-visible' : 'overflow-y-auto'}`} style={{ maxHeight: '350px' }}>
            {chatHistory.length === 0 ? (
              <div className="px-3 py-2 text-xs text-slate-400 italic">Belum ada riwayat chat</div>
            ) : (
              chatHistory.map((chat) => (
                <div key={chat.id} className="relative group flex items-center justify-between rounded-xl px-2 py-1 transition-all duration-200 hover:bg-white/[0.07]">
                  <Link
                    href={`/admin/chat/${chat.id}`}
                    onClick={onClose}
                    className="flex items-center gap-2.5 flex-1 px-1 py-1 text-[12px] font-normal text-slate-300 hover:text-white min-w-0"
                  >
                    <MessageSquare size={13} className="text-slate-400 shrink-0" />
                    <span className="truncate">{chat.title}</span>
                  </Link>

                  <div className="relative z-[9999]">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDropdownOpen(dropdownOpen === chat.id ? null : chat.id);
                      }}
                      className="flex h-6 w-6 items-center cursor-pointer justify-center rounded-lg text-slate-400 hover:bg-white/15 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreHorizontal size={13} />
                    </button>
                    {dropdownOpen === chat.id && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setDropdownOpen(null);
                          }}
                        />
                        <div className="absolute right-0 top-full mt-1 z-50 w-36 rounded-xl border border-white/15 bg-[#0C1E36]/95 backdrop-blur-xl py-1.5 shadow-2xl">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setDropdownOpen(null);
                              setDeleteConfirmOpen(chat);
                            }}
                            className="flex w-full items-center cursor-pointer gap-2.5 px-3 py-1.5 text-left text-[12px] font-medium text-slate-200 hover:bg-red-950/60 hover:text-red-300 transition-colors group/delete"
                          >
                            <Trash2 size={14} className="text-slate-400 group-hover/delete:text-red-400" />
                            Hapus Sesi
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </nav>

        {/* User Profile Card at Bottom */}
        <div className="relative z-10 border-t border-white/10 p-3.5 bg-black/10 backdrop-blur-xs">
          <button
            type="button"
            onClick={() => setProfileOpen((value) => !value)}
            className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.05] p-2 transition-all duration-200 hover:border-[#C9A15A]/40 hover:bg-white/[0.09] hover:shadow-sm"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white border border-[#C9A15A]/40 shadow-xs"
                style={{
                  background: "linear-gradient(135deg,#0B2545,#1358A8)",
                }}
              >
                <User size={16} />
              </div>

              <div className="text-left min-w-0">
                <p className="truncate text-[12px] font-semibold text-white">
                  {nama}
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_5px_#10B981]" />
                  <p className="truncate text-[10px] text-slate-300">
                    {userRole || "Petugas"}
                  </p>
                </div>
              </div>
            </div>

            <ChevronDown
              size={15}
              className={`
                text-slate-400 shrink-0 transition-transform duration-200
                ${profileOpen ? "rotate-180 text-[#F3E2B8]" : ""}
              `}
            />
          </button>

          {profileOpen && (
            <div className="absolute bottom-[calc(100%+8px)] left-3.5 w-[calc(100%-28px)] overflow-hidden rounded-2xl border border-white/15 bg-[#0C1E36]/95 p-2 shadow-2xl backdrop-blur-2xl">
              <div className="px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Profil Akun</p>
                <p className="mt-0.5 text-[13px] font-bold text-white truncate">
                  {nama}
                </p>
              </div>
              <div className="my-1 h-px bg-white/10" />
              <button
                type="button"
                onClick={handleOpenPasswordModal}
                className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[12px] font-medium text-slate-200 transition hover:bg-white/10 hover:text-[#F3E2B8]"
              >
                <LockKeyhole size={15} className="text-slate-400" />
                <span>Ganti Password</span>
              </button>
              <div className="my-1 h-px bg-white/10" />
              <button
                type="button"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-[12px] font-medium text-red-400 transition hover:bg-red-950/50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <LogOut size={15} />
                {logoutMutation.isPending ? "Keluar..." : "Logout"}
              </button>
            </div>
          )}
        </div>
      </aside>

      {passwordModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:border dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                  <LockKeyhole size={19} />
                </div>
                <div>
                  <h2 className="text-[17px] font-normal text-slate-800 dark:text-slate-100">
                    Ganti Password
                  </h2>
                  <p className="mt-0.5 text-[11px] font-normal text-slate-400 dark:text-slate-500">
                    Perbarui password akun
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClosePasswordModal}
                disabled={isSubmitting}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4 px-6 py-6">
              <div>
                <label className="mb-1.5 block text-[13px] font-normal text-slate-700 dark:text-slate-300">
                  Password Baru
                </label>

                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Masukkan password baru"
                    disabled={isSubmitting}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 pr-11 text-[13px] font-normal text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 disabled:bg-slate-50"
                  />

                  <button
                    type="button"
                    onClick={() => setShowNewPassword((value) => !value)}
                    disabled={isSubmitting}
                    className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showNewPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[13px] font-normal text-slate-700 dark:text-slate-300">
                  Ulangi Password
                </label>

                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi password baru"
                    disabled={isSubmitting}
                    className={`
                      h-11
                      w-full
                      rounded-xl
                      border
                      bg-white
                      px-3
                      pr-11
                      text-[13px]
                      font-normal
                      text-slate-700
                      outline-none
                      transition
                      placeholder:text-slate-400
                      focus:ring-2
                      focus:ring-blue-500/10
                      dark:border-slate-700
                      dark:bg-slate-800
                      dark:text-slate-100
                      dark:placeholder:text-slate-500
                      disabled:bg-slate-50
                      ${confirmPassword && newPassword !== confirmPassword
                        ? "border-red-400 focus:border-red-500"
                        : "border-slate-200 focus:border-blue-500"
                      }
                    `}
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((value) => !value)}
                    disabled={isSubmitting}
                    className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>
                </div>

                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="mt-1.5 text-[11px] text-red-500">
                    Password tidak sama
                  </p>
                )}

                {confirmPassword && newPassword === confirmPassword && (
                  <p className="mt-1.5 text-[11px] text-emerald-600 dark:text-emerald-400">
                    Password sudah sama
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/60">
              <button
                type="button"
                onClick={handleClosePasswordModal}
                disabled={isSubmitting}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[13px] font-normal text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={() => handleChangePassword(userId)}
                disabled={isSubmitting}
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-[13px] font-normal text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? "Menyimpan..." : "Simpan Password"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl p-6 text-center dark:border dark:border-slate-800 dark:bg-slate-900">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400 mb-4">
              <Trash2 size={24} />
            </div>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">Hapus Sesi Chat?</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Apakah Anda yakin ingin menghapus "{deleteConfirmOpen.title}"? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={() => setDeleteConfirmOpen(null)}
                disabled={isDeleting}
                className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteSession}
                disabled={isDeleting}
                className="rounded-xl px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isDeleting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast
        open={toast.open}
        type={toast.type}
        title={toast.title}
        message={toast.message}
        onClose={() =>
          setToast((prev) => ({
            ...prev,
            open: false,
          }))
        }
      />
    </>
  );
}
