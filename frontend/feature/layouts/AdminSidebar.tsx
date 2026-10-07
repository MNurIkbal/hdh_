
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
    label: "AI Chat",
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
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 z-50
          flex h-screen w-[270px] flex-col
          border-r border-slate-200 bg-white
          transition-transform duration-300
          lg:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
        style={{
          fontFamily:
            "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        }}
      >
        <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-slate-100 px-6">
          <Link
            href="/admin"
            onClick={onClose}
            className="flex items-center gap-3"
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
              style={{
                background:
                  "linear-gradient(135deg, #0D3B73 0%, #1358A8 100%)",
                boxShadow:
                  "0 8px 20px rgba(19, 88, 168, 0.18)",
              }}
            >
              <Image src="/images/log.png" alt="logo" height={70} width={70} />
            </div>

            <div>
              <div className="text-[18px] font-semibold tracking-tight text-slate-800">
                HDH
              </div>

              <div className="text-[10px] font-normal uppercase tracking-[0.14em] text-slate-400">
                Admin Portal
              </div>
            </div>
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 pt-5">
          <div className="flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50/70 px-3 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
              <ShieldCheck size={18} />
            </div>

            <div className="min-w-0">
              <p className="text-[12px] font-normal text-blue-800">
                Sistem Aktif
              </p>

              <div className="mt-1 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                <span className="text-[10px] font-normal text-blue-500">
                  Semua layanan normal
                </span>
              </div>
            </div>
          </div>
        </div>

        <nav className="mt-6 flex-1 overflow-y-auto px-4 pb-6">
          <div className="mb-3 px-3">
            <span className="text-[11px] font-normal uppercase tracking-[0.14em] text-slate-400">
              Menu Utama
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
                    text-[14px] font-normal
                    transition-all duration-200
                    ${active
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                    }
                  `}
                >
                  {active && (
                    <span
                      className="absolute left-0 h-6 w-[3px] rounded-r-full"
                      style={{
                        background: "#1358A8",
                      }}
                    />
                  )}

                  <span
                    className={`
                      flex h-9 w-9 shrink-0
                      items-center justify-center
                      rounded-lg
                      transition-all duration-200
                      ${active
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-slate-400 group-hover:bg-white group-hover:text-slate-600"
                      }
                    `}
                  >
                    <Icon
                      size={18}
                      strokeWidth={active ? 2 : 1.8}
                    />
                  </span>

                  <span className="truncate">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>

          <div className="mt-8 px-3 flex items-center justify-between">
            <span className="text-[11px] font-normal uppercase tracking-[0.14em] text-slate-400">
              AI Chat
            </span>
            <Link
              href="/admin/chat" 
              onClick={onClose}
              className="text-slate-400 hover:text-blue-600 transition-colors"
              title="Buat Sesi Baru"
            >
              <Plus size={16} />
            </Link>
          </div>

          <div className={`mt-2 space-y-1 pr-2 ${dropdownOpen ? 'overflow-visible' : 'overflow-y-auto'}`} style={{ maxHeight: '350px' }}>
            {chatHistory.length === 0 ? (
              <div className="px-3 py-2 text-xs text-slate-400 italic">Belum ada history</div>
            ) : (
              chatHistory.map((chat) => (
                <div key={chat.id} className="relative group flex items-center justify-between rounded-xl px-2 py-1 transition-all duration-200 hover:bg-slate-50">
                  <Link
                    href={`/admin/chat/${chat.id}`}
                    onClick={onClose}
                    className="flex items-center gap-3 flex-1 px-1 py-1 text-[13px] font-normal text-slate-500 hover:text-slate-800 min-w-0"
                  >
                    <MessageSquare size={14} className="text-slate-400 shrink-0" />
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
                      className="flex h-6 w-6 items-center cursor-pointer justify-center rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreHorizontal size={14} />
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
                        <div className="absolute right-0 top-full mt-1 z-50 w-36 rounded-xl border border-slate-200 bg-white py-1.5 shadow-xl">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setDropdownOpen(null);
                              setDeleteConfirmOpen(chat);
                            }}
                            className="flex w-full items-center cursor-pointer gap-3 px-4 py-2 text-left text-[13px] font-medium text-slate-800 hover:bg-red-50 hover:text-red-600 transition-colors group/delete"
                          >
                            <Trash2 size={15} className="text-slate-500 group-hover/delete:text-red-600" />
                            Hapus
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

        <div className="border-t border-slate-100 p-4 relative">
          <button
            type="button"
            onClick={() => setProfileOpen((value) => !value)}
            className="flex w-full items-center justify-between rounded-xl p-2 transition hover:bg-slate-50"
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
                style={{
                  background: "linear-gradient(135deg,#0D3B73,#1358A8)",
                }}
              >
                <User size={18} />
              </div>

              <div className="text-left min-w-0">
                <p className="truncate text-[13px] font-normal text-slate-700">
                  {nama}
                </p>
                <p className="truncate text-[11px] font-normal text-slate-400">
                  {userRole}
                </p>
              </div>
            </div>

            <ChevronDown
              size={16}
              className={`
                text-slate-400 shrink-0 transition-transform
                ${profileOpen ? "rotate-180" : ""}
              `}
            />
          </button>

          {profileOpen && (
            <div className="absolute bottom-[calc(100%+8px)] left-4 w-[calc(100%-32px)] overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
              <div className="px-3 py-2">
                <p className="text-[12px] font-normal text-slate-400">Akun</p>
                <p className="mt-0.5 text-[14px] font-normal text-slate-700">
                  {nama}
                </p>
              </div>
              <div className="my-1 h-px bg-slate-100" />
              <button
                type="button"
                onClick={handleOpenPasswordModal}
                className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-normal text-slate-600 transition hover:bg-blue-50 hover:text-blue-700"
              >
                <LockKeyhole size={17} className="text-slate-400" />
                <span>Ganti Password</span>
              </button>
              <div className="my-1 h-px bg-slate-100" />
              <button
                type="button"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <LogOut size={18} />
                {logoutMutation.isPending ? "Keluar..." : "Logout"}
              </button>
            </div>
          )}
        </div>
      </aside>

      {passwordModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <LockKeyhole size={19} />
                </div>
                <div>
                  <h2 className="text-[17px] font-normal text-slate-800">
                    Ganti Password
                  </h2>
                  <p className="mt-0.5 text-[11px] font-normal text-slate-400">
                    Perbarui password akun
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClosePasswordModal}
                disabled={isSubmitting}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4 px-6 py-6">
              <div>
                <label className="mb-1.5 block text-[13px] font-normal text-slate-700">
                  Password Baru
                </label>

                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Masukkan password baru"
                    disabled={isSubmitting}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 pr-11 text-[13px] font-normal text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 disabled:bg-slate-50"
                  />

                  <button
                    type="button"
                    onClick={() => setShowNewPassword((value) => !value)}
                    disabled={isSubmitting}
                    className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center text-slate-400 hover:text-slate-600"
                  >
                    {showNewPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[13px] font-normal text-slate-700">
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
                    className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center text-slate-400 hover:text-slate-600"
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
                  <p className="mt-1.5 text-[11px] text-emerald-600">
                    Password sudah sama
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-4">
              <button
                type="button"
                onClick={handleClosePasswordModal}
                disabled={isSubmitting}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[13px] font-normal text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 mb-4">
              <Trash2 size={24} />
            </div>
            <h2 className="text-lg font-semibold text-slate-800 mb-2">Hapus Sesi Chat?</h2>
            <p className="text-sm text-slate-500 mb-6">
              Apakah Anda yakin ingin menghapus "{deleteConfirmOpen.title}"? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={() => setDeleteConfirmOpen(null)}
                disabled={isDeleting}
                className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50"
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
