"use client";

export default function AdminFooter() {
  return (
    <footer className="border-t border-slate-200/90 bg-white/85 dark:border-white/10 dark:bg-[#0A111F]/90 backdrop-blur-xl transition-colors duration-300">
      <div className="flex min-h-[58px] flex-col sm:flex-row items-center justify-between gap-2 px-6 sm:px-8 py-3 text-xs text-slate-500 dark:text-slate-400">
        <p className="font-normal text-[11px] sm:text-xs">
          &copy; {new Date().getFullYear()} <span className="font-semibold text-slate-700 dark:text-slate-200">HDH</span> &bull; <span className="text-[#1358A8] dark:text-[#C9A15A] font-medium">Badan Intelijen Negara</span>. Seluruh hak cipta dilindungi.
        </p>

      </div>
    </footer>
  );
}
