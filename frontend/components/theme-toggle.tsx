"use client";

import React, { useEffect, useRef, useState } from "react";
import { Sun, Moon, Laptop, Check, ChevronDown } from "lucide-react";
import { useTheme, Theme } from "@/providers/theme-provider";

interface ThemeToggleProps {
  className?: string;
  showDropdown?: boolean;
  variant?: "ghost" | "glass" | "outline";
  size?: "sm" | "md" | "lg";
}

export function ThemeToggle({
  className = "",
  showDropdown = false,
  variant = "glass",
  size = "md",
}: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme, toggleTheme, mounted } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Avoid layout shift before mount
  if (!mounted) {
    return (
      <div
        className={`h-9 w-9 rounded-xl border border-white/10 bg-white/5 opacity-0 ${className}`}
        aria-hidden="true"
      />
    );
  }

  const isDark = resolvedTheme === "dark";

  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-9 w-9 text-sm",
    lg: "h-10 w-10 text-base",
  }[size];

  const iconSizes = {
    sm: 16,
    md: 18,
    lg: 20,
  }[size];

  const variantClasses = {
    ghost:
      "text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white",
    glass:
      "border border-white/20 bg-white/10 text-white shadow-sm backdrop-blur-md hover:bg-white/20 hover:border-white/30 dark:border-white/15 dark:bg-white/10 dark:text-white dark:hover:bg-white/15",
    outline:
      "border border-slate-200 bg-white text-slate-700 shadow-xs hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white",
  }[variant];

  // If dropdown option is disabled, render sleek single-click toggle button
  if (!showDropdown) {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={
          isDark
            ? "Beralih ke tema terang (Light Mode)"
            : "Beralih ke tema gelap (Dark Mode)"
        }
        title={
          isDark
            ? "Beralih ke tema terang"
            : "Beralih ke tema gelap"
        }
        className={[
          "group relative inline-flex items-center justify-center overflow-hidden rounded-xl",
          "transition-all duration-300 active:scale-95",
          sizeClasses,
          variantClasses,
          className,
        ].join(" ")}
      >
        {/* Glow ambient background on hover */}
        <span
          className={[
            "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100",
            isDark
              ? "bg-[radial-gradient(circle_at_center,rgba(96,165,250,0.25)_0%,transparent_70%)]"
              : "bg-[radial-gradient(circle_at_center,rgba(201,161,90,0.3)_0%,transparent_70%)]",
          ].join(" ")}
        />

        {/* Sun Icon (shown in dark mode or transitioning) */}
        <Sun
          size={iconSizes}
          className={[
            "absolute transition-all duration-500",
            isDark
              ? "rotate-0 scale-100 text-amber-300 drop-shadow-[0_0_8px_rgba(252,211,77,0.6)]"
              : "-rotate-90 scale-0 opacity-0",
          ].join(" ")}
        />

        {/* Moon Icon (shown in light mode or transitioning) */}
        <Moon
          size={iconSizes}
          className={[
            "absolute transition-all duration-500",
            isDark
              ? "rotate-90 scale-0 opacity-0"
              : "rotate-0 scale-100 text-sky-400 group-hover:text-sky-300 drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]",
          ].join(" ")}
        />
      </button>
    );
  }

  // Dropdown variant with light, dark, and system options
  const options: { id: Theme; label: string; icon: React.ReactNode }[] = [
    {
      id: "light",
      label: "Tema Terang",
      icon: <Sun size={15} className="text-amber-500" />,
    },
    {
      id: "dark",
      label: "Tema Gelap",
      icon: <Moon size={15} className="text-sky-400" />,
    },
    {
      id: "system",
      label: "Ikuti Sistem",
      icon: <Laptop size={15} className="text-slate-400" />,
    },
  ];

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setDropdownOpen((prev) => !prev)}
        aria-haspopup="true"
        aria-expanded={dropdownOpen}
        aria-label="Pilih tema tampilan"
        className={[
          "group inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 font-medium",
          "transition-all duration-300 active:scale-95",
          sizeClasses.replace(/w-\d+/, ""), // allow auto width
          variantClasses,
        ].join(" ")}
      >
        {isDark ? (
          <Moon size={iconSizes} className="text-sky-400" />
        ) : (
          <Sun size={iconSizes} className="text-amber-400" />
        )}
        <ChevronDown
          size={13}
          className={`transition-transform duration-300 ${
            dropdownOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {dropdownOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-44 origin-top-right rounded-2xl border border-slate-200/80 bg-white/95 p-1.5 shadow-xl backdrop-blur-xl transition-all dark:border-slate-800 dark:bg-slate-900/95 animate-in fade-in zoom-in-95">
          <div className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Pilihan Tema
          </div>

          <div className="flex flex-col gap-0.5">
            {options.map((opt) => {
              const active = theme === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setTheme(opt.id);
                    setDropdownOpen(false);
                  }}
                  className={[
                    "flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs font-medium transition-colors",
                    active
                      ? "bg-slate-100 text-slate-900 font-semibold dark:bg-slate-800 dark:text-white"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-white",
                  ].join(" ")}
                >
                  <span className="flex items-center gap-2">
                    {opt.icon}
                    <span>{opt.label}</span>
                  </span>
                  {active && (
                    <Check
                      size={14}
                      className="text-primary dark:text-[#60A5FA]"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default ThemeToggle;
