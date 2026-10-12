"use client";

import React, { useMemo, useRef, useEffect } from "react";
import { Search, X, Scale, FileText, AlertCircle, ChevronDown, CheckCircle2 } from "lucide-react";
import { useWebDokumenHukumHookAll } from "@/feature/web";
import { DokumenHukum } from "@/feature/dokumen-hukum/types/DokumenHukum.type";

interface DocumentComparisonSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  doc1: DokumenHukum | null;
  doc2: DokumenHukum | null;
  setDoc1: (doc: DokumenHukum | null) => void;
  setDoc2: (doc: DokumenHukum | null) => void;
  search1: string;
  setSearch1: (val: string) => void;
  search2: string;
  setSearch2: (val: string) => void;
  dropdownOpen1: boolean;
  setDropdownOpen1: (val: boolean) => void;
  dropdownOpen2: boolean;
  setDropdownOpen2: (val: boolean) => void;
  errorMsg: string | null;
  setErrorMsg: (val: string | null) => void;
}

export default function DocumentComparisonSelector({
  isOpen,
  onClose,
  doc1,
  doc2,
  setDoc1,
  setDoc2,
  search1,
  setSearch1,
  search2,
  setSearch2,
  dropdownOpen1,
  setDropdownOpen1,
  dropdownOpen2,
  setDropdownOpen2,
  errorMsg,
  setErrorMsg,
}: DocumentComparisonSelectorProps) {
  const { data: rawDokumenList = [], isLoading } = useWebDokumenHukumHookAll();

  // Pastikan data array valid baik langsung array maupun membungkus data: result.data
  const dokumenList: DokumenHukum[] = useMemo(() => {
    if (Array.isArray(rawDokumenList)) return rawDokumenList;
    if (rawDokumenList && Array.isArray((rawDokumenList as any).data)) {
      return (rawDokumenList as any).data;
    }
    return [];
  }, [rawDokumenList]);

  const dropdownRef1 = useRef<HTMLDivElement>(null);
  const dropdownRef2 = useRef<HTMLDivElement>(null);

  // Close dropdown when clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef1.current && !dropdownRef1.current.contains(event.target as Node)) {
        setDropdownOpen1(false);
      }
      if (dropdownRef2.current && !dropdownRef2.current.contains(event.target as Node)) {
        setDropdownOpen2(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setDropdownOpen1, setDropdownOpen2]);

  // Filter list 1
  const filteredList1 = useMemo(() => {
    if (!dokumenList || !Array.isArray(dokumenList)) return [];
    const q = search1.toLowerCase().trim();
    return dokumenList.filter((d) => {
      if (!q) return true;
      return (
        d.judul?.toLowerCase().includes(q) ||
        d.nomor?.toLowerCase().includes(q) ||
        d.tahun?.toLowerCase().includes(q) ||
        d.subject?.toLowerCase().includes(q)
      );
    });
  }, [dokumenList, search1]);

  // Filter list 2
  const filteredList2 = useMemo(() => {
    if (!dokumenList || !Array.isArray(dokumenList)) return [];
    const q = search2.toLowerCase().trim();
    return dokumenList.filter((d) => {
      if (!q) return true;
      return (
        d.judul?.toLowerCase().includes(q) ||
        d.nomor?.toLowerCase().includes(q) ||
        d.tahun?.toLowerCase().includes(q) ||
        d.subject?.toLowerCase().includes(q)
      );
    });
  }, [dokumenList, search2]);

  const handleSelectDoc1 = (selected: DokumenHukum) => {
    setErrorMsg(null);
    if (doc2 && (doc2.id === selected.id || doc2.judul.trim().toLowerCase() === selected.judul.trim().toLowerCase())) {
      setErrorMsg("Dokumen pertama tidak boleh sama dengan dokumen kedua. Silakan pilih judul yang berbeda.");
      return;
    }
    setDoc1(selected);
    setDropdownOpen1(false);
    setSearch1("");
  };

  const handleSelectDoc2 = (selected: DokumenHukum) => {
    setErrorMsg(null);
    if (doc1 && (doc1.id === selected.id || doc1.judul.trim().toLowerCase() === selected.judul.trim().toLowerCase())) {
      setErrorMsg("Dokumen kedua tidak boleh sama dengan dokumen pertama. Silakan pilih judul yang berbeda.");
      return;
    }
    setDoc2(selected);
    setDropdownOpen2(false);
    setSearch2("");
  };

  const handleReset = () => {
    setDoc1(null);
    setDoc2(null);
    setSearch1("");
    setSearch2("");
    setErrorMsg(null);
  };

  if (!isOpen) return null;

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/50 rounded-2xl shadow-xl p-5 mb-4 transition-all animate-in fade-in">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold">
            <Scale size={20} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              Perbandingan Dokumen Hukum
            </h3>
            
          </div>
        </div>

        <div className="flex items-center gap-2">
          {(doc1 || doc2) && (
            <button
              onClick={handleReset}
              className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 px-2.5 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition"
            >
              Reset Pilihan
            </button>
          )}
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition"
            title="Tutup Panel Perbandingan"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="mt-3.5 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-start gap-2.5 text-xs text-red-600 dark:text-red-400 animate-in fade-in">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 2-Column Select Search Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {/* KOLOM 1: DOKUMEN 1 */}
        <div className="relative" ref={dropdownRef1}>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center">
                1
              </span>
              Dokumen Hukum Pertama
            </span>
            {doc1 && (
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 size={13} /> Terpilih
              </span>
            )}
          </label>

          {doc1 ? (
            <div className="p-3 rounded-xl border border-blue-200 bg-blue-50/60 dark:bg-blue-950/30 dark:border-blue-900/60 relative">
              <button
                onClick={() => setDoc1(null)}
                className="absolute top-2.5 right-2.5 text-slate-400 hover:text-red-500 p-1 rounded-md hover:bg-white dark:hover:bg-slate-800 transition"
                title="Ganti Dokumen 1"
              >
                <X size={15} />
              </button>
              <div className="flex items-start gap-2.5 pr-6">
                <FileText className="text-blue-600 shrink-0 mt-0.5" size={18} />
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 line-clamp-2 leading-snug">
                    {doc1.judul}
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {doc1.nomor && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300">
                        Nomor {doc1.nomor}
                      </span>
                    )}
                    {doc1.tahun && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300">
                        Tahun {doc1.tahun}
                      </span>
                    )}
                    <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                      doc1.status?.toLowerCase().includes("tidak") || doc1.status?.toLowerCase().includes("cabut")
                        ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                    }`}>
                      {doc1.status || "Berlaku"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder={isLoading ? "Memuat dokumen..." : "Ketik judul / nomor dokumen pertama..."}
                  value={search1}
                  onFocus={() => setDropdownOpen1(true)}
                  onChange={(e) => {
                    setSearch1(e.target.value);
                    setDropdownOpen1(true);
                  }}
                  className="w-full pl-9 pr-8 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-100"
                />
                <button
                  type="button"
                  onClick={() => setDropdownOpen1(!dropdownOpen1)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  <ChevronDown size={16} />
                </button>
              </div>

              {/* Dropdown Options List (Muncul ke ATAS input agar tidak tertutup) */}
              {dropdownOpen1 && (
                <div className="absolute z-[70] left-0 right-0 bottom-full mb-1.5 max-h-60 overflow-y-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl py-1 text-xs">
                  {filteredList1.length === 0 ? (
                    <div className="p-3 text-center text-slate-400">
                      {isLoading ? "Mengambil daftar dokumen..." : "Tidak ada dokumen hukum yang cocok."}
                    </div>
                  ) : (
                    filteredList1.map((item) => {
                      const isSelectedOther = doc2?.id === item.id;
                      return (
                        <div
                          key={item.id}
                          onClick={() => {
                            if (!isSelectedOther) handleSelectDoc1(item);
                          }}
                          className={`p-2.5 px-3 border-b border-slate-100 dark:border-white/5 last:border-b-0 cursor-pointer transition ${
                            isSelectedOther
                              ? "opacity-40 bg-slate-50 dark:bg-slate-900 cursor-not-allowed"
                              : "hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-800 dark:text-slate-200"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-medium line-clamp-2 leading-tight">
                              {item.judul}
                            </span>
                            {isSelectedOther && (
                              <span className="shrink-0 text-[10px] text-amber-600 bg-amber-50 dark:bg-amber-950/50 px-1.5 py-0.5 rounded">
                                Dipilih di Kolom 2
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                            <span>No: {item.nomor || "-"}</span>
                            <span>•</span>
                            <span>Thn: {item.tahun || "-"}</span>
                            <span>•</span>
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">{item.status || "Berlaku"}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* KOLOM 2: DOKUMEN 2 */}
        <div className="relative" ref={dropdownRef2}>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center">
                2
              </span>
              Dokumen Hukum Kedua
            </span>
            {doc2 && (
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 size={13} /> Terpilih
              </span>
            )}
          </label>

          {doc2 ? (
            <div className="p-3 rounded-xl border border-blue-200 bg-blue-50/60 dark:bg-blue-950/30 dark:border-blue-900/60 relative">
              <button
                onClick={() => setDoc2(null)}
                className="absolute top-2.5 right-2.5 text-slate-400 hover:text-red-500 p-1 rounded-md hover:bg-white dark:hover:bg-slate-800 transition"
                title="Ganti Dokumen 2"
              >
                <X size={15} />
              </button>
              <div className="flex items-start gap-2.5 pr-6">
                <FileText className="text-blue-600 shrink-0 mt-0.5" size={18} />
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 line-clamp-2 leading-snug">
                    {doc2.judul}
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {doc2.nomor && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300">
                        Nomor {doc2.nomor}
                      </span>
                    )}
                    {doc2.tahun && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300">
                        Tahun {doc2.tahun}
                      </span>
                    )}
                    <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                      doc2.status?.toLowerCase().includes("tidak") || doc2.status?.toLowerCase().includes("cabut")
                        ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                    }`}>
                      {doc2.status || "Berlaku"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder={isLoading ? "Memuat dokumen..." : "Ketik judul / nomor dokumen kedua..."}
                  value={search2}
                  onFocus={() => setDropdownOpen2(true)}
                  onChange={(e) => {
                    setSearch2(e.target.value);
                    setDropdownOpen2(true);
                  }}
                  className="w-full pl-9 pr-8 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-100"
                />
                <button
                  type="button"
                  onClick={() => setDropdownOpen2(!dropdownOpen2)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  <ChevronDown size={16} />
                </button>
              </div>

              {/* Dropdown Options List (Muncul ke ATAS input agar tidak tertutup) */}
              {dropdownOpen2 && (
                <div className="absolute z-[70] left-0 right-0 bottom-full mb-1.5 max-h-60 overflow-y-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl py-1 text-xs">
                  {filteredList2.length === 0 ? (
                    <div className="p-3 text-center text-slate-400">
                      {isLoading ? "Mengambil daftar dokumen..." : "Tidak ada dokumen hukum yang cocok."}
                    </div>
                  ) : (
                    filteredList2.map((item) => {
                      const isSelectedOther = doc1?.id === item.id;
                      return (
                        <div
                          key={item.id}
                          onClick={() => {
                            if (!isSelectedOther) handleSelectDoc2(item);
                          }}
                          className={`p-2.5 px-3 border-b border-slate-100 dark:border-white/5 last:border-b-0 cursor-pointer transition ${
                            isSelectedOther
                              ? "opacity-40 bg-slate-50 dark:bg-slate-900 cursor-not-allowed"
                              : "hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-800 dark:text-slate-200"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-medium line-clamp-2 leading-tight">
                              {item.judul}
                            </span>
                            {isSelectedOther && (
                              <span className="shrink-0 text-[10px] text-amber-600 bg-amber-50 dark:bg-amber-950/50 px-1.5 py-0.5 rounded">
                                Dipilih di Kolom 1
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                            <span>No: {item.nomor || "-"}</span>
                            <span>•</span>
                            <span>Thn: {item.tahun || "-"}</span>
                            <span>•</span>
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">{item.status || "Berlaku"}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
