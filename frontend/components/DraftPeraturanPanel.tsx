"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  FileText,
  Sparkles,
  Download,
  Copy,
  Check,
  RefreshCw,
  Scale,
  BookOpen,
  Loader2,
  SlidersHorizontal,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { exportDraftToWord, parseDraftMarkdown } from "@/lib/export-word";

interface DraftPeraturanPanelProps {
  isOpen: boolean;
  onClose: () => void;
  initialTopic?: string;
  initialDraftContent?: string;
}

export default function DraftPeraturanPanel({
  isOpen,
  onClose,
  initialTopic = "",
  initialDraftContent = "",
}: DraftPeraturanPanelProps) {
  // Form fields yang diisi otomatis dari jawaban AI
  const [jenisPeraturan, setJenisPeraturan] = useState(
    "Peraturan Badan Intelijen Negara Republik Indonesia"
  );
  const [tentang, setTentang] = useState(initialTopic);
  const [tahun, setTahun] = useState(new Date().getFullYear().toString());
  const [pemrakarsa, setPemrakarsa] = useState("Biro Hukum dan Organisasi");
  const [nomorRancangan, setNomorRancangan] = useState("DRAFT-01");
  const [instruksiKhusus, setInstruksiKhusus] = useState("");

  // Editor & Output state
  const [generatedDraft, setGeneratedDraft] = useState<string>(initialDraftContent);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [activeTab, setActiveTab] = useState<"preview" | "raw">("preview");

  // Ketika ada respon draf dari AI, otomatis ekstrak isi respon AI ke form input
  useEffect(() => {
    if (initialDraftContent) {
      setGeneratedDraft(initialDraftContent);
      const parsed = parseDraftMarkdown(initialDraftContent, initialTopic);
      if (parsed.formFields.jenisPeraturan) setJenisPeraturan(parsed.formFields.jenisPeraturan);
      if (parsed.formFields.tentang) setTentang(parsed.formFields.tentang);
      if (parsed.formFields.tahun) setTahun(parsed.formFields.tahun);
      if (parsed.formFields.nomor) setNomorRancangan(parsed.formFields.nomor);
    }
  }, [initialDraftContent, initialTopic]);

  if (!isOpen) return null;

  // Handler Generate AI Mandiri di Panel jika user ingin menyusun ulang
  const handleGenerate = async () => {
    const topicToUse = tentang.trim() || initialTopic.trim();
    if (!topicToUse) {
      alert("Silakan isi subjek/topik peraturan terlebih dahulu.");
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jenisPeraturan,
          tentang: topicToUse,
          tahun,
          pemrakarsa,
          prompt: instruksiKhusus,
        }),
      });

      const data = await res.json();
      if (data.success && data.draftContent) {
        setGeneratedDraft(data.draftContent);
        // Ekstrak data baru
        const parsed = parseDraftMarkdown(data.draftContent, topicToUse);
        if (parsed.formFields.jenisPeraturan) setJenisPeraturan(parsed.formFields.jenisPeraturan);
        if (parsed.formFields.tentang) setTentang(parsed.formFields.tentang);
        if (parsed.formFields.tahun) setTahun(parsed.formFields.tahun);
      } else {
        alert("Gagal menyusun draf: " + (data.error || "Silakan coba lagi"));
      }
    } catch (err: any) {
      alert("Terjadi kesalahan: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Salin Naskah
  const handleCopy = () => {
    if (!generatedDraft) return;
    navigator.clipboard.writeText(generatedDraft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Ekspor Word (.docx)
  const handleExportWord = async () => {
    if (!generatedDraft) return;
    setIsExporting(true);
    try {
      const { parsedData } = parseDraftMarkdown(generatedDraft, tentang || initialTopic);
      // Sinkronisasi dengan nilai terkini form jika ada modifikasi user
      parsedData.jenisPeraturan = jenisPeraturan;
      parsedData.tentang = tentang || parsedData.tentang;
      parsedData.tahun = tahun || parsedData.tahun;
      parsedData.nomor = nomorRancangan || parsedData.nomor;

      await exportDraftToWord(parsedData);
    } catch (e: any) {
      alert("Gagal mengekspor dokumen Word: " + e.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-in slide-in-from-right duration-300">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/90 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-600 to-amber-500 text-white flex items-center justify-center shadow-xs">
            <Scale size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                Draft Peraturan
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Formulir terisi otomatis dari naskah resmi & ekspor Word (.docx)
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition cursor-pointer"
          title="Tutup Panel"
        >
          <X size={18} />
        </button>
      </div>

      {/* Panel Actions Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 shrink-0">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`text-xs font-medium px-2.5 py-1 rounded-md transition cursor-pointer ${
              activeTab === "preview"
                ? "bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-400 shadow-xs border border-slate-200 dark:border-slate-700"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <span className="flex items-center gap-1">
              <BookOpen size={13} /> Naskah Resmi
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("raw")}
            className={`text-xs font-medium px-2.5 py-1 rounded-md transition cursor-pointer ${
              activeTab === "raw"
                ? "bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-400 shadow-xs border border-slate-200 dark:border-slate-700"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <span className="flex items-center gap-1">
              <FileText size={13} /> Editor
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            disabled={!generatedDraft}
            className="px-2.5 py-1 text-xs font-medium rounded-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition flex items-center gap-1 cursor-pointer"
            title="Salin Naskah"
          >
            {copied ? (
              <>
                <Check size={13} className="text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">Tersalin</span>
              </>
            ) : (
              <>
                <Copy size={13} />
                <span>Salin</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleExportWord}
            disabled={!generatedDraft || isExporting}
            className="px-3 py-1 text-xs font-semibold rounded-md bg-blue-600 hover:bg-blue-700 text-white shadow-xs disabled:opacity-40 transition flex items-center gap-1.5 cursor-pointer"
            title="Ekspor ke Microsoft Word (.docx)"
          >
            {isExporting ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                <span>Mengekspor...</span>
              </>
            ) : (
              <>
                <Download size={13} />
                <span>Export Word (.docx)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Body: Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/40 dark:bg-slate-950/30">
        {/* Formulir Parameter Regulasi: Terisi Otomatis dari Jawaban AI */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-200">
            <span className="flex items-center gap-1.5">
              <SlidersHorizontal size={14} className="text-amber-600" />
              Parameter Isian Naskah Peraturan
            </span>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 font-medium px-2 py-0.5 rounded">
              ✓ Data dari AI
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Jenis Regulasi
              </label>
              <input
                type="text"
                value={jenisPeraturan}
                onChange={(e) => setJenisPeraturan(e.target.value)}
                placeholder="Jenis Peraturan"
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Tahun & No. Rancangan
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tahun}
                  onChange={(e) => setTahun(e.target.value)}
                  placeholder="Tahun"
                  className="w-1/2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                <input
                  type="text"
                  value={nomorRancangan}
                  onChange={(e) => setNomorRancangan(e.target.value)}
                  placeholder="No. Draf"
                  className="w-1/2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Tentang / Subjek Pokok Pengaturan
            </label>
            <textarea
              value={tentang}
              onChange={(e) => setTentang(e.target.value)}
              rows={2}
              placeholder="Subjek Pokok Pengaturan"
              className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none font-medium"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Pemrakarsa / Unit Kerja
            </label>
            <input
              type="text"
              value={pemrakarsa}
              onChange={(e) => setPemrakarsa(e.target.value)}
              placeholder="Unit Kerja Pemrakarsa"
              className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="pt-1 flex items-center justify-between">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating || !tentang.trim()}
              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs flex items-center gap-1.5 shadow-xs disabled:opacity-50 transition cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Menyusun Ulang...</span>
                </>
              ) : (
                <>
                  <RefreshCw size={13} />
                  <span>Perbarui Naskah</span>
                </>
              )}
            </button>

            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Ketik revisi di chat kiri untuk merombak draf
            </span>
          </div>
        </div>

        {/* Naskah Dokumen Pratinjau / Raw Editor */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-xs min-h-[450px]">
          {activeTab === "preview" ? (
            <div className="font-serif text-slate-900 dark:text-slate-100 leading-relaxed text-xs sm:text-sm max-w-[700px] mx-auto bg-white dark:bg-slate-900 p-6 sm:p-10 rounded-lg shadow-sm border border-slate-200/80 dark:border-slate-800">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-center font-bold text-sm sm:text-base uppercase tracking-wider my-3 text-slate-900 dark:text-slate-50 leading-snug">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-center font-bold text-xs sm:text-sm uppercase tracking-wide my-2.5 text-slate-800 dark:text-slate-200">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-center font-bold text-xs sm:text-sm uppercase my-2.5 text-slate-800 dark:text-slate-200">
                      {children}
                    </h3>
                  ),
                  h4: ({ children }) => (
                    <h4 className="text-center font-bold text-xs sm:text-sm my-2 text-slate-900 dark:text-slate-100">
                      {children}
                    </h4>
                  ),
                  p: ({ children }) => (
                    <p className="mb-3 text-justify leading-relaxed text-slate-800 dark:text-slate-200">
                      {children}
                    </p>
                  ),
                  ul: ({ children }) => (
                    <ul className="space-y-2 mb-4 pl-0 list-none text-justify">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="space-y-2 mb-4 pl-0 list-none text-justify">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="leading-relaxed pl-5 relative before:content-[''] before:absolute before:left-0 before:top-2 text-slate-800 dark:text-slate-200">
                      {children}
                    </li>
                  ),
                  hr: () => (
                    <hr className="my-5 border-slate-300 dark:border-slate-700" />
                  ),
                }}
              >
                {generatedDraft}
              </ReactMarkdown>
            </div>
          ) : (
            <textarea
              value={generatedDraft}
              onChange={(e) => setGeneratedDraft(e.target.value)}
              className="w-full h-full min-h-[420px] p-3 bg-slate-50 dark:bg-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 resize-y"
            />
          )}
        </div>
      </div>
    </div>
  );
}
