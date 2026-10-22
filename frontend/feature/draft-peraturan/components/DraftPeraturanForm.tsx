"use client";

import { useEffect, useState, useRef } from "react";
import { useForm, Controller, type SubmitErrorHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Calendar,
  Building2,
  FileCheck2,
  Scale,
  Save,
  RotateCcw,
  Clock,
  Sparkles,
  Paperclip,
  Trash2,
} from "lucide-react";

import FormInput from "@/components/ui/FormInput";
import FormSelect2 from "@/components/ui/FormSelect2";
import {
  kategoriDraftOptions,
  tahapanDraftOptions,
  statusDraftOptions,
  tahunOptions,
} from "@/constanta/GlobalConstanta";
import { DraftPeraturan } from "../types/DraftPeraturan.type";
import {
  DraftPeraturanFormValues,
  DraftPeraturanSchema,
} from "../schema/DraftPeraturan.schema";
import {
  useCreateDraftPeraturan,
  useUpdateDraftPeraturan,
} from "../hooks/DraftPeraturan.hooks";

interface DraftPeraturanFormProps {
  mode: "create" | "edit";
  data?: DraftPeraturan | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function DraftPeraturanForm({
  mode,
  data,
  onSuccess,
  onCancel,
}: DraftPeraturanFormProps) {
  const isEdit = mode === "edit";

  const createMutation = useCreateDraftPeraturan();
  const updateMutation = useUpdateDraftPeraturan();

  const [draftFile, setDraftFile] = useState<File | null>(null);

  const draftInputRef = useRef<HTMLInputElement>(null);

  const formatDateInput = (value?: string | null) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString().split("T")[0];
  };

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<DraftPeraturanFormValues>({
    resolver: zodResolver(DraftPeraturanSchema) as any,
    defaultValues: {
      judul: "",
      kategori: "",
      nomor_rancangan: "",
      tahun: String(new Date().getFullYear()),
      pemrakarsa: "",
      penanggung_jawab: "",
      tahapan: "Penyusunan Draft Awal",
      status: "Draft",
      tanggal_pengajuan: new Date().toISOString().split("T")[0],
      target_penetapan: "",
      ringkasan: "",
      catatan_revisi: "",
    },
  });

  useEffect(() => {
    if (isEdit && data) {
      reset({
        id: data.id,
        judul: data.judul || "",
        kategori: data.kategori || "",
        nomor_rancangan: data.nomor_rancangan || "",
        tahun: String(data.tahun || new Date().getFullYear()),
        pemrakarsa: data.pemrakarsa || "",
        penanggung_jawab: data.penanggung_jawab || "",
        tahapan: data.tahapan || "Penyusunan Draft Awal",
        status: data.status || "Draft",
        tanggal_pengajuan: formatDateInput(data.tanggal_pengajuan),
        target_penetapan: formatDateInput(data.target_penetapan),
        ringkasan: data.ringkasan || "",
        catatan_revisi: data.catatan_revisi || "",
      });
      setDraftFile(null);
    } else {
      reset({
        judul: "",
        kategori: "",
        nomor_rancangan: "",
        tahun: String(new Date().getFullYear()),
        pemrakarsa: "",
        penanggung_jawab: "",
        tahapan: "Penyusunan Draft Awal",
        status: "Draft",
        tanggal_pengajuan: new Date().toISOString().split("T")[0],
        target_penetapan: "",
        ringkasan: "",
        catatan_revisi: "",
      });
      setDraftFile(null);
    }
  }, [data, isEdit, reset]);

  const onInvalid: SubmitErrorHandler<DraftPeraturanFormValues> = (
    formErrors
  ) => {
    console.warn("Validation errors:", formErrors);
    const firstError = Object.values(formErrors)[0];
    if (firstError?.message) {
      toast.error(String(firstError.message));
    } else {
      toast.error("Mohon lengkapi isian data wajib yang ditandai *");
    }
  };

  const handleFormSubmit = () => {
    handleSubmit(onSubmit, onInvalid)();
  };

  const onSubmit = (values: DraftPeraturanFormValues) => {
    const formData = new FormData();

    formData.append("judul", values.judul.trim());
    formData.append("kategori", values.kategori);
    formData.append("nomor_rancangan", values.nomor_rancangan?.trim() || "");
    formData.append("tahun", String(values.tahun));
    formData.append("pemrakarsa", values.pemrakarsa?.trim() || "");
    formData.append("penanggung_jawab", values.penanggung_jawab?.trim() || "");
    formData.append("tahapan", values.tahapan);
    formData.append("status", values.status);
    formData.append("tanggal_pengajuan", values.tanggal_pengajuan || "");
    formData.append("target_penetapan", values.target_penetapan || "");
    formData.append("ringkasan", values.ringkasan?.trim() || "");
    formData.append("catatan_revisi", values.catatan_revisi?.trim() || "");

    if (draftFile) {
      formData.append("file_draft", draftFile);
    }

    if (isEdit && data?.id) {
      updateMutation.mutate(
        { id: data.id, data: formData },
        {
          onSuccess: () => {
            onSuccess?.();
          },
        }
      );
    } else {
      createMutation.mutate(formData, {
        onSuccess: () => {
          onSuccess?.();
        },
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6 pb-6">
      {/* SECTION 1: Identitas Rancangan */}
      <div className="rounded-xl border border-slate-200/80 bg-white/70 p-5 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/60">
        <div className="mb-4 flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
            <Scale className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Identitas Rancangan Dokumen
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Informasi pokok judul, bentuk kategori, dan nomor rancangan
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <FormInput
              label="Judul Rancangan Peraturan"
              required
              placeholder="Contoh: Rancangan Peraturan tentang Tata Kelola Keamanan Informasi..."
              error={errors.judul?.message}
              {...register("judul")}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormSelect2
              label="Kategori / Bentuk Rancangan"
              required
              name="kategori"
              control={control}
              options={kategoriDraftOptions}
              placeholder="Pilih kategori..."
              error={errors.kategori?.message}
            />

            <FormSelect2
              label="Tahun Pembahasan"
              required
              name="tahun"
              control={control}
              options={tahunOptions}
              placeholder="Pilih tahun..."
              error={errors.tahun?.message}
            />
          </div>

          <div>
            <FormInput
              label="Nomor Registrasi / Kode Rancangan (Opsional)"
              placeholder="Contoh: REG-DRAFT/2026/001 atau D-PER-01"
              error={errors.nomor_rancangan?.message}
              {...register("nomor_rancangan")}
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: Pemrakarsa & Penanggung Jawab */}
      <div className="rounded-xl border border-slate-200/80 bg-white/70 p-5 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/60">
        <div className="mb-4 flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Unit Pemrakarsa & Penanggung Jawab
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Instansi pengusul dan tim hukum perancang
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormInput
            label="Instansi / Unit Kerja Pemrakarsa"
            required
            placeholder="Contoh: Biro Hukum / Pusdalops / Satker Terkait"
            error={errors.pemrakarsa?.message}
            {...register("pemrakarsa")}
          />

          <FormInput
            label="Penanggung Jawab / Tim Harmonisasi"
            placeholder="Contoh: Tim Pokja Harmonisasi Regulasi"
            error={errors.penanggung_jawab?.message}
            {...register("penanggung_jawab")}
          />
        </div>
      </div>

      {/* SECTION 3: Tahapan & Status */}
      <div className="rounded-xl border border-slate-200/80 bg-white/70 p-5 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/60">
        <div className="mb-4 flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400">
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Tahapan Pembahasan & Jadwal
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Progres tahapan telaah, status persetujuan, dan target penetapan
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormSelect2
              label="Tahapan Harmonisasi"
              required
              name="tahapan"
              control={control}
              options={tahapanDraftOptions}
              placeholder="Pilih tahapan..."
              error={errors.tahapan?.message}
            />

            <FormSelect2
              label="Status Draft"
              required
              name="status"
              control={control}
              options={statusDraftOptions}
              placeholder="Pilih status..."
              error={errors.status?.message}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormInput
              type="date"
              label="Tanggal Pengajuan Draft"
              error={errors.tanggal_pengajuan?.message}
              {...register("tanggal_pengajuan")}
            />

            <FormInput
              type="date"
              label="Target Tanggal Penetapan"
              error={errors.target_penetapan?.message}
              {...register("target_penetapan")}
            />
          </div>
        </div>
      </div>

      {/* SECTION 4: Ringkasan & Catatan */}
      <div className="rounded-xl border border-slate-200/80 bg-white/70 p-5 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/60">
        <div className="mb-4 flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
            <FileText className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Ringkasan & Catatan Harmonisasi
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Latar belakang urgensi dan poin catatan perbaikan tim telaah hukum
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Ringkasan Eksekutif / Latar Belakang Urgensi
            </label>
            <textarea
              rows={3}
              placeholder="Jelaskan secara ringkas maksud, tujuan, dan urgensi pembentukan rancangan regulasi ini..."
              className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
              {...register("ringkasan")}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Catatan Harmonisasi / Rekomendasi Revisi
            </label>
            <textarea
              rows={3}
              placeholder="Catatan dari tim perancang atau hasil rapat harmonisasi pasal per pasal..."
              className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
              {...register("catatan_revisi")}
            />
          </div>
        </div>
      </div>

      {/* SECTION 5: Berkas Dokumen */}
      <div className="rounded-xl border border-slate-200/80 bg-white/70 p-5 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/60">
        <div className="mb-4 flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
            <Paperclip className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Berkas Dokumen Digital
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Unggah file rancangan peraturan (PDF, DOC, DOCX maks 50MB)
            </p>
          </div>
        </div>

        <div>
          {/* File Draft */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              File Draft Peraturan
              <span className="text-xs text-slate-400 font-normal ml-1">
                (Format PDF / Word)
              </span>
            </label>

            <input
              type="file"
              ref={draftInputRef}
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setDraftFile(file);
              }}
            />

            <div
              onClick={() => draftInputRef.current?.click()}
              className="group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 p-5 text-center transition hover:border-blue-500 hover:bg-blue-50/30 dark:border-slate-700 dark:hover:border-blue-400 dark:hover:bg-blue-950/20"
            >
              {draftFile ? (
                <div className="flex flex-col items-center text-blue-600 dark:text-blue-400">
                  <CheckCircle2 className="h-8 w-8 mb-2" />
                  <span className="text-xs font-semibold max-w-[200px] truncate text-slate-800 dark:text-slate-200">
                    {draftFile.name}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {(draftFile.size / (1024 * 1024)).toFixed(2)} MB • Klik untuk ganti
                  </span>
                </div>
              ) : isEdit && data?.file_draft ? (
                <div className="flex flex-col items-center">
                  <FileText className="h-8 w-8 mb-2 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    File tersimpan di server
                  </span>
                  <a
                    href={data.file_draft_url || "#"}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-[11px] text-blue-500 underline mt-1 hover:text-blue-600"
                  >
                    Lihat file saat ini
                  </a>
                  <span className="text-[10px] text-slate-400 mt-1">
                    Klik kotak untuk mengunggah versi baru
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center text-slate-400">
                  <Upload className="h-8 w-8 mb-2 group-hover:text-blue-500 transition-colors" />
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                    Pilih File Draft Peraturan
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1">
                    PDF, DOC, DOCX hingga 50MB
                  </span>
                </div>
              )}
            </div>

            {draftFile && (
              <button
                type="button"
                onClick={() => setDraftFile(null)}
                className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-600 pt-1"
              >
                <Trash2 className="h-3 w-3" /> Batalkan pilihan file
              </button>
            )}
          </div>
        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="sticky bottom-0 z-10 flex items-center justify-end gap-3 rounded-xl border border-slate-200/80 bg-white/95 p-4 shadow-lg backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Batal
        </button>

        <button
          type="button"
          onClick={handleFormSubmit}
          disabled={isPending}
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-md shadow-blue-500/20 transition hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50"
        >
          {isPending ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>Menyimpan...</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>{isEdit ? "Perbarui Draft" : "Simpan Draft Peraturan"}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
