"use client";

import { useState } from "react";
import { BookOpen, FileText, Info, RotateCcw, Scale } from "lucide-react";
import { APP_BASE_URL } from "@/constanta/GlobalConstanta";
import { useDokumenHukumWebDetail } from "@/feature/web";
import { ProdukHukum } from "./produk-hukum-detail";

export function formatTanggal(value?: string | Date | null): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function getDocumentBaseUrl() {
  return `${APP_BASE_URL}/`;
}

function getFileName(file?: string | null) {
  if (!file) return "";
  return file.split("/").pop() ?? "";
}

function getPeraturanFileUrl(produk: ProdukHukum) {
  if (!produk.file_dokumen) return "";
  const fileName = getFileName(produk.file_dokumen);
  if (!fileName) return "";
  return `${getDocumentBaseUrl()}/${encodeURIComponent(fileName)}`;
}

export function AdminProdukHukumDetail({ id }: { id: number }) {
  const { data, isLoading, isError, refetch } = useDokumenHukumWebDetail(id);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-border bg-card p-10 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
          <p className="mt-4 text-sm font-medium text-foreground">
            Memuat dokumen hukum...
          </p>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-border bg-card p-10 text-center">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <h2 className="mt-4 text-lg font-bold text-foreground">
            Dokumen tidak ditemukan
          </h2>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-5 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <RotateCcw className="h-4 w-4" />
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  const produk = data as any as ProdukHukum;
  
  const rows = [
    { label: "Judul", value: produk.judul },
    { label: "Tahun", value: produk.tahun },
    { label: "Tempat Penetapan", value: produk.tempat_penetapan },
    { label: "Tanggal Penetapan", value: formatTanggal(produk.tanggal_penetapan) },
    { label: "Status", value: produk.status },
  ];

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <section className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/[0.08] via-card to-secondary/30 shadow-sm">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/[0.07] blur-3xl" />
          <div className="absolute -bottom-32 -left-20 h-64 w-64 rounded-full bg-primary/[0.05] blur-3xl" />
          <BookOpen
            className="absolute -right-8 top-8 h-52 w-52 rotate-12 text-primary/[0.055]"
            strokeWidth={0.8}
            aria-hidden="true"
          />
          <Scale
            className="absolute bottom-[-25px] left-[-20px] h-36 w-36 -rotate-12 text-primary/[0.035]"
            strokeWidth={0.8}
            aria-hidden="true"
          />
        </div>

        <div className="relative px-6 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-12">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-primary/15 bg-primary/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-primary">
              <BookOpen className="h-3.5 w-3.5" />
              Dokumen Hukum
            </span>
            <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
            <span className="text-xs font-medium text-muted-foreground">
              {produk.kategori}
            </span>
          </div>

          <div className="mt-5 max-w-5xl">
            <p className="text-sm font-semibold text-muted-foreground">
              Tahun {produk.tahun}
            </p>
            <h1 className="mt-2 font-display text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl lg:text-4xl">
              {produk.tentang}
            </h1>
            {produk.judul && produk.judul !== produk.tentang && (
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                {produk.judul}
              </p>
            )}
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* KIRI: METADATA */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Info className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-foreground">
                Metadata Dokumen
              </h2>
            </div>
          </div>
          
          <dl className="divide-y divide-border">
            {rows.map((row) => {
              const hasValue = row.value !== null && row.value !== undefined && String(row.value).trim() !== "";
              return (
                <div key={row.label} className="grid grid-cols-[145px_1fr] gap-4 py-3 text-sm sm:grid-cols-[160px_1fr]">
                  <dt className="font-semibold text-foreground">{row.label}</dt>
                  <dd className="break-words text-muted-foreground">
                    {hasValue ? row.value : <span className="italic text-muted-foreground/60">– belum diisi –</span>}
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>

        {/* KANAN: PREVIEW PDF LAMPIRAN */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-foreground">
                Preview Dokumen
              </h2>
            </div>
          </div>
          
          <div className="overflow-hidden rounded-xl border border-border shadow-sm">
            <div className="relative h-[650px] bg-secondary/30">
              {produk.file_dokumen ? (
                <iframe
                  src={produk.file_dokumen}
                  title={`Preview peraturan ${produk.judul}`}
                  className="h-full w-full"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground italic">
                  File dokumen tidak tersedia.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
