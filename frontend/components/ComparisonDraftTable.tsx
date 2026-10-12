"use client";

import React, { useRef } from "react";
import { Printer, FileText, CheckCircle2, AlertCircle, ArrowRightLeft, Scale, Layers } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { ComparisonData } from "@/types/chat";

interface ComparisonDraftTableProps {
  data: ComparisonData;
}

function formatTanggalIndo(dateStr?: string): string {
  if (!dateStr || dateStr === "-") return "-";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function ComparisonDraftTable({ data }: ComparisonDraftTableProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      window.print();
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Hasil Perbandingan Dokumen Hukum - HDH BIN</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 15mm 15mm 15mm 15mm;
            }
            body {
              font-family: Arial, Helvetica, sans-serif;
              color: #111827;
              line-height: 1.5;
              padding: 10px;
              font-size: 11pt;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #0B2545;
              padding-bottom: 12px;
              margin-bottom: 20px;
            }
            .logo-title {
              font-size: 14pt;
              font-weight: bold;
              color: #0B2545;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .subtitle {
              font-size: 10pt;
              color: #4B5563;
              margin-top: 4px;
            }
            .doc-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
              margin-bottom: 20px;
            }
            .doc-box {
              border: 1px solid #D1D5DB;
              border-radius: 6px;
              padding: 12px;
              background-color: #F9FAFB;
            }
            .doc-box h4 {
              margin: 0 0 6px 0;
              font-size: 10.5pt;
              color: #1F2937;
            }
            .doc-box p {
              margin: 3px 0;
              font-size: 9.5pt;
              color: #4B5563;
            }
            .doc-label {
              font-weight: bold;
              color: #111827;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 15px;
              margin-bottom: 20px;
              font-size: 9.5pt;
            }
            th, td {
              border: 1px solid #9CA3AF;
              padding: 8px 10px;
              text-align: left;
              vertical-align: top;
            }
            th {
              background-color: #0D3B73;
              color: white;
              font-weight: bold;
            }
            tr:nth-child(even) td {
              background-color: #F9FAFB;
            }
            .col-aspect { width: 22%; font-weight: 600; color: #1F2937; }
            .col-doc1 { width: 28%; }
            .col-doc2 { width: 28%; }
            .col-diff { width: 22%; background-color: #FEF3C7; }
            .section-box {
              border-left: 4px solid #0D3B73;
              background-color: #F8FAFC;
              padding: 12px 14px;
              margin-top: 15px;
              margin-bottom: 14px;
              border-radius: 0 6px 6px 0;
              font-size: 10pt;
            }
            .section-box h3, .section-box h4 {
              margin: 10px 0 6px 0;
              color: #0B2545;
              font-size: 11pt;
            }
            .section-box p {
              margin: 4px 0 8px 0;
            }
            .section-box ul, .section-box ol {
              margin: 4px 0 8px 18px;
              padding: 0;
            }
            .section-box li {
              margin-bottom: 4px;
            }
            .footer-info {
              margin-top: 30px;
              text-align: right;
              font-size: 9pt;
              color: #6B7280;
              border-top: 1px solid #E5E7EB;
              padding-top: 10px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo-title">Harmonisasi Dokumen Hukum (HDH)</div>
            <div class="subtitle">BADAN INTELIJEN NEGARA &bull; LEMBAR RESMI DRAFT PERBANDINGAN DOKUMEN HUKUM</div>
            <div style="font-size: 8.5pt; color: #6B7280; margin-top: 4px;">Tanggal Cetak: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })} WIB</div>
          </div>

          ${printContent.innerHTML}

        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 400);
  };

  return (
    <div className="w-full my-3">
      {/* Action Bar */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200/80 dark:border-white/10">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-[#1358A8] dark:bg-blue-950/60 dark:text-blue-300">
            <Layers size={15} />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
            Perbandingan Dokumen Hukum
          </span>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs transition hover:border-[#C9A15A] hover:bg-slate-50 hover:text-slate-900 dark:border-white/15 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-[#C9A15A] dark:hover:bg-slate-700 cursor-pointer"
          title="Cetak Draft Perbandingan"
        >
          <Printer size={14} className="text-[#1358A8] dark:text-[#E0C084]" />
          <span>Cetak / Print Draft</span>
        </button>
      </div>

      {/* Main Print and Display Container */}
      <div
        ref={printRef}
        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-900/90 sm:p-5"
      >
        {/* Document Overview Header Cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mb-4">
          {/* Doc 1 Card */}
          <div className="rounded-xl border border-blue-200/80 bg-blue-50/50 p-3.5 dark:border-blue-900/40 dark:bg-blue-950/30">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 mb-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white text-[10px]">1</span>
              <span>Dokumen Pembanding Pertama</span>
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2" title={data.doc1.judul}>
              {data.doc1.judul}
            </h4>
          </div>

          {/* Doc 2 Card */}
          <div className="rounded-xl border border-amber-200/80 bg-amber-50/50 p-3.5 dark:border-amber-900/40 dark:bg-amber-950/30">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 mb-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-600 text-white text-[10px]">2</span>
              <span>Dokumen Pembanding Kedua</span>
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2" title={data.doc2.judul}>
              {data.doc2.judul}
            </h4>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/10 shadow-2xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-white/10">
                <th className="p-3 font-bold w-[22%]">Aspek / Parameter</th>
                <th className="p-3 font-bold w-[26%] bg-blue-50/60 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200">
                  Dokumen 1 ({data.doc1.tahun || "Terkait"})
                </th>
                <th className="p-3 font-bold w-[26%] bg-amber-50/60 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200">
                  Dokumen 2 ({data.doc2.tahun || "Terkait"})
                </th>
                <th className="p-3 font-bold w-[26%] bg-slate-50 dark:bg-slate-800/80">
                  Perbedaan & Implikasi Harmonisasi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {data.items.map((item, idx) => (
                <tr
                  key={idx}
                  className="transition hover:bg-slate-50/80 dark:hover:bg-white/[0.02]"
                >
                  <td className="p-3 font-semibold text-slate-900 dark:text-white align-top bg-slate-50/50 dark:bg-white/[0.01]">
                    {item.kategori}
                  </td>
                  <td className="p-3 text-slate-700 dark:text-slate-300 align-top leading-relaxed">
                    {item.doc1Value}
                  </td>
                  <td className="p-3 text-slate-700 dark:text-slate-300 align-top leading-relaxed">
                    {item.doc2Value}
                  </td>
                  <td className="p-3 text-slate-800 dark:text-slate-200 align-top leading-relaxed bg-amber-50/20 dark:bg-amber-950/10">
                    {item.analisis}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Conclusion / Harmonization Notes rendered with rich Markdown */}
        {data.kesimpulan && (
          <div className="mt-4 rounded-xl border border-slate-200/90 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-slate-800/40 section-box">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white mb-2.5 pb-1.5 border-b border-slate-200/60 dark:border-white/10">
              <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
              <span>Kesimpulan & Harmonisasi Regulasi:</span>
            </div>
            <div className="prose prose-sm dark:prose-invert max-w-none text-xs leading-relaxed text-slate-700 dark:text-slate-200">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  h1: ({ children }) => (
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-3 mb-1.5 pb-1 border-b border-slate-200 dark:border-white/10">
                      {children}
                    </h3>
                  ),
                  h2: ({ children }) => (
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-3 mb-1.5">
                      {children}
                    </h4>
                  ),
                  h3: ({ children }) => (
                    <h5 className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-2 mb-1">
                      {children}
                    </h5>
                  ),
                  p: ({ children }) => (
                    <p className="mb-2 leading-relaxed text-xs text-slate-700 dark:text-slate-300">
                      {children}
                    </p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc pl-4 mb-2.5 space-y-1 text-xs text-slate-700 dark:text-slate-300">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal pl-4 mb-2.5 space-y-1 text-xs text-slate-700 dark:text-slate-300">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-3 rounded-lg border border-slate-200 dark:border-slate-700">
                      <table className="w-full text-xs border-collapse">{children}</table>
                    </div>
                  ),
                  th: ({ children }) => (
                    <th className="border border-slate-200 dark:border-slate-700 px-3 py-2 bg-slate-100 dark:bg-slate-800 font-bold text-slate-800 dark:text-slate-200 text-left">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="border border-slate-200 dark:border-slate-700 px-3 py-2 align-top text-slate-700 dark:text-slate-300">
                      {children}
                    </td>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold text-slate-900 dark:text-white">
                      {children}
                    </strong>
                  ),
                  hr: () => (
                    <hr className="my-3 border-slate-200 dark:border-slate-700" />
                  ),
                }}
              >
                {data.kesimpulan}
              </ReactMarkdown>
            </div>
          </div>
        )}

        {/* Recommendations */}
        {/* {data.rekomendasi && (
          <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-900/30 dark:bg-blue-950/20">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-900 dark:text-blue-200 mb-1.5 pb-1 border-b border-blue-200/50 dark:border-blue-900/40">
              <Scale size={16} className="text-[#1358A8] dark:text-[#E0C084] shrink-0" />
              <span>Rekomendasi Tindak Lanjut Unit Kerja:</span>
            </div>
            <div className="prose prose-sm dark:prose-invert max-w-none text-xs leading-relaxed text-slate-700 dark:text-slate-300">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  p: ({ children }) => <p className="mb-1 text-xs">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc pl-4 space-y-0.5 text-xs">{children}</ul>,
                  li: ({ children }) => <li>{children}</li>,
                  strong: ({ children }) => (
                    <strong className="font-semibold text-blue-950 dark:text-blue-200">
                      {children}
                    </strong>
                  ),
                }}
              >
                {data.rekomendasi}
              </ReactMarkdown>
            </div>
          </div>
        )} */}
      </div>
    </div>
  );
}
