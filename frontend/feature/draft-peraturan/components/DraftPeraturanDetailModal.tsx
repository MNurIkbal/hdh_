"use client";

import {
  X,
  Scale,
  Building2,
  Calendar,
  Clock,
  FileText,
  Paperclip,
  Download,
  ExternalLink,
  ShieldCheck,
  Tag,
  AlertCircle,
  FileCheck2,
} from "lucide-react";
import { DraftPeraturan } from "../types/DraftPeraturan.type";

interface DraftPeraturanDetailModalProps {
  open: boolean;
  data: DraftPeraturan | null;
  onClose: () => void;
  onEdit?: (data: DraftPeraturan) => void;
}

export default function DraftPeraturanDetailModal({
  open,
  data,
  onClose,
  onEdit,
}: DraftPeraturanDetailModalProps) {
  if (!open || !data) return null;

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Disetujui":
      case "Siap Diundangkan":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400";
      case "Dalam Pembahasan":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400";
      case "Perlu Revisi":
      case "Revisi":
        return "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400";
      case "Ditolak":
        return "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:bg-rose-500/20 dark:text-rose-400";
      default:
        return "bg-slate-500/10 text-slate-600 border-slate-500/20 dark:bg-slate-500/20 dark:text-slate-400";
    }
  };

  const getTahapanBadge = (tahapan: string) => {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-600 dark:bg-purple-500/20 dark:text-purple-400">
        <Clock className="h-3 w-3" />
        {tahapan}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-slate-100">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Detail Draft Peraturan
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                {data.nomor_rancangan ? `${data.nomor_rancangan} - ` : ""}
                {data.judul}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="py-5 space-y-6">
          {/* Status & Tahapan Bar */}
          <div className="flex flex-wrap items-center gap-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-100 dark:bg-slate-800/50 dark:border-slate-700/50">
            <div>
              <span className="text-xs text-slate-400 block mb-1">Status Dokumen:</span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${getStatusColor(
                  data.status
                )}`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {data.status}
              </span>
            </div>

            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2 hidden sm:block" />

            <div>
              <span className="text-xs text-slate-400 block mb-1">Tahapan Pembahasan:</span>
              {getTahapanBadge(data.tahapan)}
            </div>

            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2 hidden sm:block" />

            <div>
              <span className="text-xs text-slate-400 block mb-1">Tahun Regulasi:</span>
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {data.tahun}
              </span>
            </div>
          </div>

          {/* Judul Lengkap */}
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Judul Rancangan
            </span>
            <p className="mt-1 text-base font-semibold leading-relaxed text-slate-900 dark:text-slate-100">
              {data.judul}
            </p>
          </div>

          {/* Grid Informasi */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-100 p-3.5 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <span className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                <Tag className="h-3.5 w-3.5" /> Kategori Rancangan
              </span>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                {data.kategori || "-"}
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 p-3.5 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <span className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                <Building2 className="h-3.5 w-3.5" /> Instansi / Pemrakarsa
              </span>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                {data.pemrakarsa || "-"}
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 p-3.5 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <span className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                <ShieldCheck className="h-3.5 w-3.5" /> Penanggung Jawab
              </span>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                {data.penanggung_jawab || "-"}
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 p-3.5 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <span className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                <Calendar className="h-3.5 w-3.5" /> Tanggal Pengajuan & Target
              </span>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                Diajukan: {formatDate(data.tanggal_pengajuan)} <br />
                Target: {formatDate(data.target_penetapan)}
              </p>
            </div>
          </div>

          {/* Ringkasan */}
          {data.ringkasan && (
            <div className="rounded-xl border border-slate-100 p-4 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                Ringkasan Eksekutif / Urgensi
              </span>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {data.ringkasan}
              </p>
            </div>
          )}

          {/* Catatan Harmonisasi */}
          {data.catatan_revisi && (
            <div className="rounded-xl border border-amber-200/60 bg-amber-50/50 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5 mb-1.5">
                <AlertCircle className="h-3.5 w-3.5" /> Catatan Harmonisasi / Rekomendasi
              </span>
              <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                {data.catatan_revisi}
              </p>
            </div>
          )}

          {/* Dokumen Lampiran */}
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-3">
              Berkas Lampiran
            </span>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {data.file_draft_url ? (
                <a
                  href={data.file_draft_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50/50 p-3.5 transition hover:bg-blue-100/60 dark:border-blue-900/40 dark:bg-blue-950/20 dark:hover:bg-blue-900/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        File Draft Peraturan
                      </p>
                      <span className="text-xs text-blue-600 dark:text-blue-400">
                        Klik untuk buka / unduh
                      </span>
                    </div>
                  </div>
                  <Download className="h-4 w-4 text-blue-500" />
                </a>
              ) : (
                <div className="flex items-center gap-3 rounded-xl border border-slate-100 p-3.5 text-slate-400 dark:border-slate-800">
                  <FileText className="h-5 w-5" />
                  <span className="text-xs">File draft belum diunggah</span>
                </div>
              )}

              {data.file_naskah_akademik_url ? (
                <a
                  href={data.file_naskah_akademik_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-xl border border-purple-200 bg-purple-50/50 p-3.5 transition hover:bg-purple-100/60 dark:border-purple-900/40 dark:bg-purple-950/20 dark:hover:bg-purple-900/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400">
                      <FileCheck2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        Naskah Akademik / Matriks
                      </p>
                      <span className="text-xs text-purple-600 dark:text-purple-400">
                        Klik untuk buka / unduh
                      </span>
                    </div>
                  </div>
                  <Download className="h-4 w-4 text-purple-500" />
                </a>
              ) : (
                <div className="flex items-center gap-3 rounded-xl border border-slate-100 p-3.5 text-slate-400 dark:border-slate-800">
                  <FileCheck2 className="h-5 w-5" />
                  <span className="text-xs">Naskah akademik tidak dilampirkan</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Tutup
          </button>

          {onEdit && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(data);
              }}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Edit Draft Ini
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
