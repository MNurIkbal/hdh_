"use client";

import React, { useState } from "react";
import {
  X,
  FileText,
  Sparkles,
  Download,
  Copy,
  Check,
  RefreshCw,
  Scale,
  Maximize2,
  Minimize2,
  BookOpen,
  Send,
  Loader2,
  SlidersHorizontal,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { exportDraftToWord, LegalDraftData } from "@/lib/export-word";

interface DraftPeraturanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DraftPeraturanModal({
  isOpen,
  onClose,
}: DraftPeraturanModalProps) {
  // Form state
  const [jenisPeraturan, setJenisPeraturan] = useState(
    "Peraturan Badan Intelijen Negara Republik Indonesia"
  );
  const [tentang, setTentang] = useState("");
  const [tahun, setTahun] = useState(new Date().getFullYear().toString());
  const [pemrakarsa, setPemrakarsa] = useState("Biro Hukum dan Organisasi");
  const [nomorRancangan, setNomorRancangan] = useState("DRAFT-01");
  const [instruksiKhusus, setInstruksiKhusus] = useState("");

  // Editor & Output state
  const [generatedDraft, setGeneratedDraft] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<"preview" | "raw">("preview");

  if (!isOpen) return null;

  // Handler Generate AI
  const handleGenerate = async () => {
    if (!tentang.trim()) {
      alert("Silakan isi topik/tentang peraturan terlebih dahulu.");
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jenisPeraturan,
          tentang,
          tahun,
          pemrakarsa,
          prompt: instruksiKhusus,
        }),
      });

      const data = await res.json();
      if (data.success && data.draftContent) {
        setGeneratedDraft(data.draftContent);
      } else {
        alert("Gagal menghasilkan draf: " + (data.error || "Coba lagi"));
      }
    } catch (err: any) {
      alert("Terjadi kesalahan: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Salin Teks
  const handleCopy = () => {
    if (!generatedDraft) return;
    navigator.clipboard.writeText(generatedDraft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Export to Microsoft Word
  const handleExportWord = async () => {
    if (!generatedDraft) return;
    setIsExporting(true);
    try {
      // Parse markdown to structure
      const parsedData: LegalDraftData = {
        jenisPeraturan: jenisPeraturan,
        nomor: nomorRancangan,
        tahun: tahun,
        tentang: tentang || "PENGATURAN REGULASI",
        jabatanPenetap:
          jenisPeraturan.includes("Badan Intelijen Negara")
            ? "KEPALA BADAN INTELIJEN NEGARA REPUBLIK INDONESIA"
            : "PEJABAT PENETAP REPUBLIK INDONESIA",
        menimbang: [
          `bahwa untuk mewujudkan tata kelola regulasi yang akuntabel, terstruktur, dan berkepastian hukum terkait ${tentang || "bidang ini"}, perlu menetapkan regulasi yang adaptif;`,
          `bahwa berdasarkan pertimbangan sebagaimana dimaksud dalam huruf a, perlu menetapkan ${jenisPeraturan} tentang ${tentang || "Peraturan Ini"};`,
        ],
        mengingat: [
          "Pasal 17 ayat (3) Undang-Undang Dasar Negara Republik Indonesia Tahun 1945;",
          "Undang-Undang Nomor 17 Tahun 2011 tentang Intelijen Negara;",
          "Undang-Undang Nomor 12 Tahun 2011 tentang Pembentukan Peraturan Perundang-undangan sebagaimana telah diubah dengan Undang-Undang Nomor 13 Tahun 2022;",
        ],
        menetapkan: `${jenisPeraturan} TENTANG ${tentang || "PERATURAN INI"}.`,
        babList: [
          {
            nomor: "BAB I",
            judul: "KETENTUAN UMUM",
            pasalList: [
              {
                nomor: "Pasal 1",
                ayatList: [
                  `Dalam Peraturan ini yang dimaksud dengan: \n1. Lembaga adalah instansi yang berwenang menetapkan regulasi ini.\n2. Harmonisasi adalah proses penyelarasan naskah hukum.\n3. ${tentang} adalah pokok materi yang diatur secara komprehensif.`,
                ],
              },
            ],
          },
          {
            nomor: "BAB II",
            judul: "RUANG LINGKUP DAN TATA KELOLA",
            pasalList: [
              {
                nomor: "Pasal 2",
                ayatList: [
                  "(1) Ruang lingkup peraturan ini berlaku bagi seluruh jajaran unit kerja terkait.",
                  "(2) Pelaksanaan ketentuan ini berpedoman pada asas kepastian hukum, keterbukaan, dan akuntabilitas.",
                ],
              },
              {
                nomor: "Pasal 3",
                ayatList: [
                  "Setiap unit kerja wajib menyelaraskan prosedur operasional dengan pedoman teknis yang diatur dalam peraturan ini.",
                ],
              },
            ],
          },
          {
            nomor: "BAB III",
            judul: "KETENTUAN PENUTUP",
            pasalList: [
              {
                nomor: "Pasal 4",
                ayatList: [
                  "Peraturan ini mulai berlaku pada tanggal diundangkan.",
                ],
              },
            ],
          },
        ],
        tempatPenetapan: "Jakarta",
        tanggalPenetapan: new Date().toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        namaPenetap: "....................................................",
      };

      await exportDraftToWord(parsedData);
    } catch (e: any) {
      alert("Gagal mengekspor dokumen Word: " + e.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div
        className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col transition-all duration-200 overflow-hidden ${
          isFullscreen ? "w-full h-full rounded-none" : "w-full max-w-6xl h-[92vh]"
        }`}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
              <Scale size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-base">
                  Generator Draft Peraturan Perundang-undangan (AI)
                </h3>
                <span className="text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 font-medium px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                  Format Standar UU 12/2011
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Susun draf naskah regulasi terstruktur dengan bantuan kecerdasan buatan dan ekspor langsung ke Microsoft Word (.docx).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800 transition"
              title={isFullscreen ? "Kecilkan" : "Layar Penuh"}
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition"
              title="Tutup"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Split Content Body */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 min-h-0 overflow-hidden divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800">
          {/* SISI KIRI: FORMULIR PARAMETER REGULASI (5 Cols) */}
          <div className="md:col-span-5 flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/40 p-4 sm:p-5 overflow-y-auto">
            <div className="flex items-center gap-2 mb-3 text-slate-700 dark:text-slate-300 font-medium text-sm">
              <SlidersHorizontal size={16} className="text-amber-600" />
              <span>Parameter & Ketentuan Peraturan</span>
            </div>

            <div className="space-y-3.5 flex-1">
              {/* Jenis Peraturan */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Jenis Regulasi / Peraturan
                </label>
                <select
                  value={jenisPeraturan}
                  onChange={(e) => setJenisPeraturan(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
                >
                  <option value="Peraturan Badan Intelijen Negara Republik Indonesia">
                    Peraturan Badan Intelijen Negara (Perbin)
                  </option>
                  <option value="Keputusan Kepala Badan Intelijen Negara">
                    Keputusan Kepala BIN (Kepbin)
                  </option>
                  <option value="Peraturan Menteri">Peraturan Menteri (Permen)</option>
                  <option value="Peraturan Pemerintah">Peraturan Pemerintah (PP)</option>
                  <option value="Peraturan Daerah">Peraturan Daerah (Perda)</option>
                  <option value="Surat Edaran">Surat Edaran (SE)</option>
                  <option value="Standar Operasional Prosedur (SOP)">SOP / Juknis Hukum</option>
                </select>
              </div>

              {/* Tentang / Pokok Bahasan */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Tentang / Subjek Regulasi <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={tentang}
                  onChange={(e) => setTentang(e.target.value)}
                  placeholder="Contoh: Tata Kelola Keamanan Siber dan Perlindungan Informasi Rahasia..."
                  rows={2}
                  className="w-full text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm resize-none"
                />
              </div>

              {/* Grid 2: Tahun & Nomor */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Tahun Penetapan
                  </label>
                  <input
                    type="number"
                    value={tahun}
                    onChange={(e) => setTahun(e.target.value)}
                    className="w-full text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    No. Rancangan / Draf
                  </label>
                  <input
                    type="text"
                    value={nomorRancangan}
                    onChange={(e) => setNomorRancangan(e.target.value)}
                    placeholder="Contoh: DRAFT-01"
                    className="w-full text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
                  />
                </div>
              </div>

              {/* Pemrakarsa / Unit Kerja */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Pemrakarsa / Unit Kerja Pengusul
                </label>
                <input
                  type="text"
                  value={pemrakarsa}
                  onChange={(e) => setPemrakarsa(e.target.value)}
                  placeholder="Contoh: Biro Hukum dan Organisasi"
                  className="w-full text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
                />
              </div>

              {/* Instruksi Khusus atau Pokok Muatan */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Materi Pokok / Ketentuan Khusus yang Ingin Dimasukkan
                </label>
                <textarea
                  value={instruksiKhusus}
                  onChange={(e) => setInstruksiKhusus(e.target.value)}
                  placeholder="Sebutkan pasal atau substansi khusus (misal: 'Sertakan sanksi administratif bagi pelanggaran', 'Tentukan jangka waktu pelaporan 14 hari', dll)..."
                  rows={4}
                  className="w-full text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm resize-none"
                />
              </div>

              {/* Template Presets */}
              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                  Template Cepat / Rekomendasi Topik:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Sistem Manajemen Informasi Hukum",
                    "Klasifikasi Keamanan Informasi dan Data",
                    "Pedoman Disiplin dan Kode Etik Pegawai",
                    "Pengelolaan Arsip dan Dokumentasi Intelijen",
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setTentang(preset)}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50 hover:bg-amber-100 transition"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Tombol Action Generate */}
            <div className="pt-4 mt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating || !tentang.trim()}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-600/20 disabled:opacity-50 transition cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Menyusun Naskah Hukum UU 12/2011...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>Buat Draft Peraturan (AI)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* SISI KANAN: LIVE SPLIT PREVIEW & EXPORT WORD (7 Cols) */}
          <div className="md:col-span-7 flex flex-col h-full bg-white dark:bg-slate-900 overflow-hidden">
            {/* Toolbar Atas Sisi Kanan */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("preview")}
                  className={`text-xs font-medium px-3 py-1.5 rounded-lg transition ${
                    activeTab === "preview"
                      ? "bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-400 shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <BookOpen size={14} /> Tampilan Resmi Naskah
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("raw")}
                  className={`text-xs font-medium px-3 py-1.5 rounded-lg transition ${
                    activeTab === "raw"
                      ? "bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-400 shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <FileText size={14} /> Teks Editor
                  </span>
                </button>
              </div>

              {/* Actions Export Word & Copy */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  disabled={!generatedDraft}
                  className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition flex items-center gap-1.5"
                  title="Salin Naskah"
                >
                  {copied ? (
                    <>
                      <Check size={14} className="text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400">Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Salin</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleExportWord}
                  disabled={!generatedDraft || isExporting}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm disabled:opacity-40 transition flex items-center gap-1.5 cursor-pointer"
                >
                  {isExporting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Mengekspor...</span>
                    </>
                  ) : (
                    <>
                      <Download size={14} />
                      <span>Export Word (.docx)</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Konten Dokumen (Scrollable Preview) */}
            <div className="flex-1 p-6 overflow-y-auto bg-slate-100/70 dark:bg-slate-950/50 flex justify-center">
              {generatedDraft ? (
                activeTab === "preview" ? (
                  /* Formal Lembar Dokumen Kertas A4 */
                  <div className="w-full max-w-[760px] min-h-[842px] bg-white dark:bg-slate-900 p-8 sm:p-12 rounded-xl shadow-lg border border-slate-200/80 dark:border-slate-800 font-serif text-slate-900 dark:text-slate-100 leading-relaxed text-sm">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                      components={{
                        h1: ({ children }) => (
                          <h1 className="text-center font-bold text-base sm:text-lg uppercase tracking-wide my-2">
                            {children}
                          </h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="text-center font-bold text-sm sm:text-base uppercase tracking-wide my-2">
                            {children}
                          </h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="text-center font-bold text-sm uppercase my-2">
                            {children}
                          </h3>
                        ),
                        h4: ({ children }) => (
                          <h4 className="text-center font-bold text-sm my-2">
                            {children}
                          </h4>
                        ),
                        p: ({ children }) => (
                          <p className="mb-3 text-justify leading-relaxed">{children}</p>
                        ),
                        hr: () => (
                          <hr className="my-6 border-slate-300 dark:border-slate-700" />
                        ),
                      }}
                    >
                      {generatedDraft}
                    </ReactMarkdown>
                  </div>
                ) : (
                  /* Raw Markdown/Text Area Editor */
                  <textarea
                    value={generatedDraft}
                    onChange={(e) => setGeneratedDraft(e.target.value)}
                    className="w-full h-full p-4 bg-white dark:bg-slate-900 font-mono text-xs text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none shadow-inner"
                  />
                )
              ) : (
                /* Empty Placeholder */
                <div className="flex flex-col items-center justify-center text-center p-8 my-auto">
                  <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center mb-4 shadow-inner">
                    <FileText size={32} />
                  </div>
                  <h4 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-1">
                    Pratinjau Naskah Peraturan
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-4">
                    Isi parameter dan ketentuan di sisi kiri, kemudian klik tombol <b>&ldquo;Buat Draft Peraturan (AI)&rdquo;</b> untuk merumuskan draf perundang-undangan secara otomatis.
                  </p>
                  <div className="text-[11px] bg-slate-200/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                    <Scale size={13} /> Sesuai Struktur Resmi: Judul, Konsiderans, Dasar Hukum, Batang Tubuh, Penutup
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
