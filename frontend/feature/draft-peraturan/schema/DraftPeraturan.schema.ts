import { z } from "zod";

const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx"];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const validateDocumentFile = (file: unknown, required: boolean, fieldName: string) => {
  if (!file) {
    if (required) return false;
    return true;
  }
  // Jika string (URL / filename yang sudah tersimpan di server)
  if (typeof file === "string") {
    if (required && !file.trim()) return false;
    return true;
  }
  // Jika File instance
  if (typeof File !== "undefined" && file instanceof File) {
    if (file.size > MAX_FILE_SIZE) return false;
    const lowerName = file.name.toLowerCase();
    const hasValidExt = ALLOWED_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
    return hasValidExt;
  }
  return true;
};

export const DraftPeraturanSchema = z.object({
  id: z.number().optional(),

  judul: z
    .string()
    .trim()
    .min(1, "Judul rancangan peraturan wajib diisi")
    .max(500, "Judul rancangan peraturan maksimal 500 karakter"),

  kategori: z
    .string()
    .trim()
    .min(1, "Kategori rancangan peraturan wajib dipilih"),

  nomor_rancangan: z
    .string()
    .trim()
    .max(100, "Nomor rancangan maksimal 100 karakter")
    .optional()
    .or(z.literal("")),

  tahun: z
    .string()
    .trim()
    .min(1, "Tahun rancangan wajib diisi")
    .regex(/^\d{4}$/, "Tahun harus berupa 4 digit angka yang valid"),

  pemrakarsa: z
    .string()
    .trim()
    .max(255, "Instansi pemrakarsa maksimal 255 karakter")
    .optional()
    .or(z.literal("")),

  penanggung_jawab: z
    .string()
    .trim()
    .max(255, "Penanggung jawab maksimal 255 karakter")
    .optional()
    .or(z.literal("")),

  tahapan: z
    .string()
    .trim()
    .min(1, "Tahapan pembahasan wajib dipilih"),

  status: z
    .string()
    .trim()
    .min(1, "Status draft wajib dipilih"),

  tanggal_pengajuan: z
    .string()
    .optional()
    .or(z.literal("")),

  target_penetapan: z
    .string()
    .optional()
    .or(z.literal("")),

  ringkasan: z
    .string()
    .trim()
    .max(2000, "Ringkasan eksekutif maksimal 2000 karakter")
    .optional()
    .or(z.literal("")),

  catatan_revisi: z
    .string()
    .trim()
    .max(2000, "Catatan harmonisasi maksimal 2000 karakter")
    .optional()
    .or(z.literal("")),

  file_draft: z
    .any()
    .optional()
    .refine(
      (file) => validateDocumentFile(file, false, "file_draft"),
      {
        message: "File draft harus berformat PDF, DOC, atau DOCX dan maksimal 50 MB",
      }
    ),
});

export type DraftPeraturanFormValues = z.infer<typeof DraftPeraturanSchema>;
