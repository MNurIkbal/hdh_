"use client";

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  type CSSProperties,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Scale,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  FileText,
  Shield,
  Palette,
} from "lucide-react";

import { LoginHook, SessionHook } from "@/feature/web";
import { ThemeToggle } from "@/components/theme-toggle";

type Status = "idle" | "loading" | "success";

interface CursorPos {
  x: number;
  y: number;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [status, setStatus] = useState<Status>("idle");

  const [errors, setErrors] = useState<FormErrors>({});
  const [showHelpModal, setShowHelpModal] = useState(false);

  const [pos, setPos] = useState<CursorPos>({
    x: 50,
    y: 50,
  });

  const [checkingSession, setCheckingSession] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const loginMutation = LoginHook();
  const sessionQuery = SessionHook();

  useEffect(() => {
    if (sessionQuery.isLoading) {
      return;
    }

    if (sessionQuery.data?.success) {
      router.replace("/admin/dokumen-hukum");
      return;
    }

    setCheckingSession(false);
  }, [sessionQuery.isLoading, sessionQuery.data, router]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setPos({ x, y });
  }, []);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    const cleanEmail = email.trim();

    if (!cleanEmail) {
      newErrors.email = "Email wajib diisi";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanEmail)) {
        newErrors.email = "Format email tidak valid";
      }
    }

    if (!password) {
      newErrors.password = "Kata sandi wajib diisi";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loginMutation.isPending || status === "success") {
      return;
    }

    setErrors({});
    const isValid = validateForm();

    if (!isValid) {
      setStatus("idle");
      return;
    }

    try {
      setStatus("loading");
      const cleanEmail = email.trim();

      await loginMutation.mutateAsync({
        email: cleanEmail,
        password,
        remember,
      });

      setErrors({});
      setStatus("success");

      setTimeout(() => {
        router.replace("/admin/dokumen-hukum");
        router.refresh();
      }, 600);
    } catch (error: any) {
      setStatus("idle");

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Email atau kata sandi tidak valid";

      if (
        error?.response?.status === 401 ||
        message.toLowerCase().includes("email") ||
        message.toLowerCase().includes("password") ||
        message.toLowerCase().includes("salah")
      ) {
        setErrors({
          general: "Email atau kata sandi yang Anda masukkan salah.",
        });
        return;
      }

      setErrors({
        general:
          "Terjadi kendala saat menghubungkan ke server. Silakan coba beberapa saat lagi.",
      });
    }
  };

  if (checkingSession || sessionQuery.isLoading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#071326]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(19,88,168,0.25)_0%,transparent_70%)]" />
        <div className="relative z-10 flex flex-col items-center gap-4 text-center">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-2xl">
            <Loader2 size={32} className="animate-spin text-[#60A5FA]" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold tracking-wide text-white">Memverifikasi Sesi Autentikasi</p>
            <p className="text-xs text-slate-400">Menghubungkan ke Portal HDH BIN...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative flex min-h-screen w-full items-center justify-center overflow-x-hidden bg-slate-100 text-slate-900 transition-colors duration-300 selection:bg-[#1358A8] selection:text-white dark:bg-[#0A111F] dark:text-slate-100"
    >
      <style>{`
        @keyframes shine-sweep {
          0% {
            transform: translateX(-100%) skewX(-15deg);
          }
          100% {
            transform: translateX(200%) skewX(-15deg);
          }
        }

        @keyframes pulse-subtle {
          0%, 100% {
            opacity: 0.55;
            transform: scale(1);
          }
          50% {
            opacity: 0.85;
            transform: scale(1.03);
          }
        }

        @keyframes float-gentle {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        .animate-shine-sweep {
          animation: shine-sweep 3.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        .animate-pulse-subtle {
          animation: pulse-subtle 7s ease-in-out infinite;
        }

        .animate-float-gentle {
          animation: float-gentle 5s ease-in-out infinite;
        }
      `}</style>

      {/* =========================================================
          BACKGROUND AMBIENCE & LIGHTING
          ========================================================= */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {/* Dynamic Interactive Cursor Glow */}
        <div
          className="absolute inset-0 opacity-30 transition-opacity duration-700 dark:opacity-40"
          style={{
            background: `radial-gradient(750px circle at ${pos.x}% ${pos.y}%, rgba(19, 88, 168, 0.18), transparent 70%)`,
          }}
        />

        {/* Radiant spheres */}
        <div className="animate-pulse-subtle absolute -top-40 -left-40 h-[620px] w-[620px] rounded-full bg-[radial-gradient(circle,rgba(19,88,168,0.25)_0%,transparent_70%)] blur-3xl dark:bg-[radial-gradient(circle,rgba(13,59,115,0.45)_0%,transparent_70%)]" />
        <div className="animate-pulse-subtle absolute -bottom-48 -right-40 h-[680px] w-[680px] rounded-full bg-[radial-gradient(circle,rgba(201,161,90,0.2)_0%,transparent_70%)] blur-3xl dark:bg-[radial-gradient(circle,rgba(201,161,90,0.18)_0%,transparent_70%)]" />
        <div className="absolute top-1/3 right-1/4 h-[450px] w-[450px] rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.15)_0%,transparent_70%)] blur-3xl" />

        {/* Subtle geometric grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.035] dark:opacity-[0.045]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(100, 116, 139, 0.4) 1px, transparent 1px),
              linear-gradient(90deg, rgba(100, 116, 139, 0.4) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />

        {/* Subtle vignette border */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(15,23,42,0.08)_100%)] dark:bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(10,17,31,0.75)_100%)]" />
      </div>

      {/* =========================================================
          MAIN CONTAINER
          ========================================================= */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Top Floating Bar */}
        <div className="mb-6 flex items-center justify-end">
          <div className="flex items-center gap-2.5">
            <span className="hidden text-xs font-medium text-slate-500 sm:inline dark:text-slate-400">Mode Tema</span>
            <ThemeToggle variant="outline" size="sm" showDropdown={true} />
          </div>
        </div>

        {/* Card Grid Layout */}
        <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white/90 shadow-[0_25px_80px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.02] dark:shadow-[0_30px_100px_rgba(0,0,0,0.6)] lg:grid lg:grid-cols-12">
          <div className="relative flex flex-col justify-between overflow-hidden border-b border-slate-200/80 p-8 sm:p-12 dark:border-white/10 lg:col-span-7 lg:border-b-0 lg:border-r lg:p-14">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#0B2545] via-[#0D3B73] to-[#124D94] dark:from-[#0F223D]/95 dark:via-[#0A1628]/95 dark:to-[#070D18]" />
            <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[#1358A8]/30 blur-3xl dark:bg-[#1358A8]/20" />
            <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-[#C9A15A]/20 blur-3xl dark:bg-[#C9A15A]/10" />

            <div className="relative z-10 text-white">
              {/* Header Badge */}
              <div className="inline-flex items-center gap-2.5 rounded-full border border-[#C9A15A]/40 bg-gradient-to-r from-[#C9A15A]/20 to-transparent px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#F3E2B8] shadow-sm">
                <Sparkles size={13} className="text-[#C9A15A]" />
                <span>Portal Resmi HDH BIN</span>
              </div>

              {/* Logo & Identity */}
              <div className="mt-8 flex items-center gap-5">
                <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-[#C9A15A]/40 bg-gradient-to-br from-[#0F2D54] to-[#08172C] p-3 shadow-[0_12px_32px_rgba(19,88,168,0.35)]">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-[#C9A15A]/15 via-transparent to-white/10 opacity-80" />
                  <Image
                    src="/images/log.png"
                    alt="Logo BIN"
                    width={64}
                    height={64}
                    priority
                    className="relative z-10 h-full w-full object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)]"
                  />
                </div>

                <div>
                  <h2 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">
                    HDH
                  </h2>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E0C084]">
                    Badan Intelijen Negara
                  </p>
                  <p className="mt-1 text-xs text-slate-300">
                    Harmonisasi Dokumentasi & Informasi Hukum
                  </p>
                </div>
              </div>

              {/* Headline */}
              <div className="mt-10 space-y-3">
                <h1 className="text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl lg:text-[40px]">
                  Integrasi Informasi Hukum yang{" "}
                  <span className="bg-gradient-to-r from-[#93C5FD] via-[#BFDBFE] to-[#F3E2B8] bg-clip-text text-transparent">
                    Akurat & Andal
                  </span>
                </h1>
                <p className="max-w-xl text-sm leading-relaxed text-slate-200/90 sm:text-base">
                  Pusat layanan autentikasi terpadu untuk pengelola, penyusun regulasi, dan administrator dalam manajemen produk hukum nasional.
                </p>
              </div>

              {/* Feature Highlights Grid */}
              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                <div className="group rounded-2xl border border-white/15 bg-white/[0.08] p-4.5 backdrop-blur-md transition-all duration-300 hover:border-[#93C5FD]/60 hover:bg-white/[0.12]">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-300/30 bg-blue-500/20 text-blue-200 shadow-inner">
                    <Scale size={20} />
                  </div>
                  <h2 className="mt-3 text-xs font-bold uppercase tracking-wider text-white">
                    Produk Hukum
                  </h2>
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-300">
                    Peraturan, penetapan, dan keputusan terpusat.
                  </p>
                </div>

                <div className="group rounded-2xl border border-white/15 bg-white/[0.08] p-4.5 backdrop-blur-md transition-all duration-300 hover:border-[#C9A15A]/60 hover:bg-white/[0.12]">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-300/30 bg-amber-500/20 text-[#F3E2B8] shadow-inner">
                    <ShieldCheck size={20} />
                  </div>
                  <h2 className="mt-3 text-xs font-bold uppercase tracking-wider text-white">
                    Tervalidasi
                  </h2>
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-300">
                    Otentikasi aman berbasis izin akses khusus.
                  </p>
                </div>

                <div className="group rounded-2xl border border-white/15 bg-white/[0.08] p-4.5 backdrop-blur-md transition-all duration-300 hover:border-emerald-300/60 hover:bg-white/[0.12]">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-300/30 bg-emerald-500/20 text-emerald-200 shadow-inner">
                    <FileText size={20} />
                  </div>
                  <h2 className="mt-3 text-xs font-bold uppercase tracking-wider text-white">
                    Harmonisasi
                  </h2>
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-300">
                    Penyelarasan dokumentasi secara terpadu.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* =========================================================
              RIGHT COLUMN: SLEEK AUTH FORM
              ========================================================= */}
          <div className="relative flex flex-col justify-center bg-white/95 p-8 sm:p-12 transition-colors duration-300 dark:bg-[#0C1527]/95 lg:col-span-5 lg:p-12">
            {/* Top ambient glow inside form */}
            <div className="pointer-events-none absolute top-0 right-0 h-72 w-72 rounded-full bg-[#1358A8]/10 blur-2xl dark:bg-[#1358A8]/15" />

            <div className="relative z-10">
              {/* Form Title & Subtitle */}
              <div className="mb-8">
                <div className="mb-2 inline-flex items-center gap-2 rounded-md border border-blue-500/20 bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                  <span>Autentikasi Petugas</span>
                </div>
                <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                  Masuk ke Akun
                </h2>
                <p className="mt-2 text-xs leading-relaxed text-slate-500 sm:text-sm dark:text-slate-400">
                  Silakan masukkan kredensial terdaftar untuk mengakses dashboard administrasi.
                </p>
              </div>

              {/* General Error Banner */}
              {errors.general && (
                <div className="mb-6 flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-800 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200 dark:text-rose-200">
                  <AlertCircle size={18} className="mt-0.5 shrink-0 text-rose-500 dark:text-rose-400" />
                  <div className="text-xs leading-relaxed">
                    <p className="font-semibold text-rose-700 dark:text-rose-300">Autentikasi Gagal</p>
                    <p className="mt-0.5 text-rose-600 dark:text-rose-200/90">{errors.general}</p>
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                {/* Email Field */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="login-email"
                      className="text-xs font-semibold tracking-wide text-slate-700 dark:text-slate-200"
                    >
                      Alamat Email
                    </label>
                    {errors.email && (
                      <span className="text-[11px] font-medium text-rose-500 dark:text-rose-400">
                        {errors.email}
                      </span>
                    )}
                  </div>

                  <div
                    className={[
                      "group relative flex h-13 items-center rounded-xl border px-4 transition-all duration-200 backdrop-blur-md",
                      errors.email
                        ? "border-rose-500/60 shadow-[0_0_15px_rgba(244,63,94,0.15)] ring-1 ring-rose-500/40"
                        : emailFocused
                        ? "border-[#1358A8] shadow-[0_0_20px_rgba(19,88,168,0.2)] ring-2 ring-[#1358A8]/30 bg-white dark:bg-white/[0.06]"
                        : "border-slate-200 bg-slate-50/80 hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-white/20 dark:hover:bg-white/[0.05]",
                    ].join(" ")}
                  >
                    <Mail
                      size={18}
                      className={[
                        "shrink-0 transition-colors duration-200",
                        errors.email
                          ? "text-rose-500"
                          : emailFocused
                          ? "text-[#1358A8] dark:text-[#60A5FA]"
                          : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300",
                      ].join(" ")}
                    />

                    <input
                      id="login-email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) {
                          setErrors((prev) => ({ ...prev, email: undefined }));
                        }
                        if (errors.general) {
                          setErrors((prev) => ({ ...prev, general: undefined }));
                        }
                      }}
                      onFocus={() => setEmailFocused(true)}
                      onBlur={() => setEmailFocused(false)}
                      placeholder="admin@hdh.go.id"
                      autoComplete="email"
                      disabled={loginMutation.isPending}
                      className="ml-3 w-full bg-transparent text-sm font-medium text-slate-800 placeholder-slate-400 outline-none dark:text-white dark:placeholder-slate-500"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="login-password"
                      className="text-xs font-semibold tracking-wide text-slate-700 dark:text-slate-200"
                    >
                      Kata Sandi
                    </label>
                    {errors.password && (
                      <span className="text-[11px] font-medium text-rose-500 dark:text-rose-400">
                        {errors.password}
                      </span>
                    )}
                  </div>

                  <div
                    className={[
                      "group relative flex h-13 items-center rounded-xl border px-4 transition-all duration-200 backdrop-blur-md",
                      errors.password
                        ? "border-rose-500/60 shadow-[0_0_15px_rgba(244,63,94,0.15)] ring-1 ring-rose-500/40"
                        : passwordFocused
                        ? "border-[#1358A8] shadow-[0_0_20px_rgba(19,88,168,0.2)] ring-2 ring-[#1358A8]/30 bg-white dark:bg-white/[0.06]"
                        : "border-slate-200 bg-slate-50/80 hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-white/20 dark:hover:bg-white/[0.05]",
                    ].join(" ")}
                  >
                    <Lock
                      size={18}
                      className={[
                        "shrink-0 transition-colors duration-200",
                        errors.password
                          ? "text-rose-500"
                          : passwordFocused
                          ? "text-[#1358A8] dark:text-[#60A5FA]"
                          : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300",
                      ].join(" ")}
                    />

                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) {
                          setErrors((prev) => ({ ...prev, password: undefined }));
                        }
                        if (errors.general) {
                          setErrors((prev) => ({ ...prev, general: undefined }));
                        }
                      }}
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(false)}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      disabled={loginMutation.isPending}
                      className="ml-3 w-full bg-transparent text-sm font-medium tracking-wide text-slate-800 placeholder-slate-400 outline-none dark:text-white dark:placeholder-slate-500"
                    />

                    <button
                      type="button"
                      disabled={loginMutation.isPending}
                      onClick={() => setShowPassword((prev) => !prev)}
                      tabIndex={-1}
                      aria-label={showPassword ? "Sembunyikan sandi" : "Tampilkan sandi"}
                      className="shrink-0 p-1 text-slate-400 transition-colors duration-150 hover:text-slate-700 dark:hover:text-white"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loginMutation.isPending || status === "success"}
                  className={[
                    "relative mt-2 flex h-13 w-full items-center justify-center overflow-hidden rounded-xl text-sm font-bold text-white transition-all duration-300 shadow-xl",
                    status === "success"
                      ? "bg-gradient-to-r from-emerald-600 to-teal-500 shadow-emerald-500/30"
                      : "bg-gradient-to-r from-[#0D3B73] via-[#1358A8] to-[#1E6BCE] hover:from-[#0B3363] hover:via-[#114E96] hover:to-[#1A5FB7] hover:shadow-[0_10px_30px_rgba(19,88,168,0.4)] active:scale-[0.99]",
                    loginMutation.isPending || status === "success"
                      ? "cursor-default"
                      : "cursor-pointer",
                  ].join(" ")}
                >
                  {/* Sheen animation layer */}
                  {status === "idle" && (
                    <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent animate-shine-sweep" />
                  )}

                  {status === "idle" && (
                    <span className="flex items-center gap-2">
                      <span>Masuk ke Portal</span>
                      <ArrowRight size={17} className="transition-transform duration-200 group-hover:translate-x-1" />
                    </span>
                  )}

                  {status === "loading" && (
                    <span className="flex items-center gap-2.5">
                      <Loader2 size={18} className="animate-spin text-white" />
                      <span>Mengautentikasi...</span>
                    </span>
                  )}

                  {status === "success" && (
                    <span className="flex items-center gap-2 text-white animate-in zoom-in-95 duration-200">
                      <CheckCircle2 size={19} className="text-white" strokeWidth={2.5} />
                      <span>Berhasil! Mengalihkan...</span>
                    </span>
                  )}
                </button>
              </form>


              {/* Disclaimer & Footer */}
              <div className="mt-6 border-t border-slate-200/80 pt-5 text-center dark:border-white/10">
                <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                  Akses ini khusus diperuntukkan bagi pegawai dan pengelola yang berwenang. Segala aktivitas pencatatan dan akses diawasi sesuai ketentuan hukum yang berlaku.
                </p>

                <div className="mt-3 flex items-center justify-center gap-2 text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  <span>Sistem HDH</span>
                  <span>&bull;</span>
                  <span className="font-semibold text-[#1358A8] dark:text-[#E0C084]">Badan Intelijen Negara</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          HELP MODAL (FOR FORGOT PASSWORD / ACCESS)
          ========================================================= */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setShowHelpModal(false)}
          />

          <div className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-200 dark:border-white/15 dark:bg-[#0C172B]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-white/10">
              <div className="flex items-center gap-2.5 text-slate-900 dark:text-white">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-50 text-[#C9A15A] dark:border-amber-400/20 dark:bg-amber-500/10">
                  <HelpCircle size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Bantuan Akses Akun</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Portal HDH BIN</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
              >
                &times;
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              <p>
                Untuk alasan keamanan institusional, pembuatan akun baru serta reset kata sandi dikelola secara tersentralisasi oleh administrator sistem.
              </p>
              <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-3.5 text-slate-700 dark:border-white/5 dark:bg-white/[0.03] dark:text-slate-300">
                <p className="font-semibold text-slate-900 dark:text-white">Langkah Pemulihan Akses:</p>
                <ol className="mt-2 list-inside list-decimal space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                  <li>Hubungi Unit Pengelola TIK / Hukum BIN terkait.</li>
                  <li>Sertakan alamat email dinas resmi yang terdaftar.</li>
                  <li>Petugas administrator akan melakukan verifikasi dan pembaruan kredensial Anda.</li>
                </ol>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="rounded-xl bg-gradient-to-r from-[#1358A8] to-[#1E6BCE] px-4 py-2 text-xs font-semibold text-white shadow-md hover:from-[#114E96] hover:to-[#1A5FB7]"
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
