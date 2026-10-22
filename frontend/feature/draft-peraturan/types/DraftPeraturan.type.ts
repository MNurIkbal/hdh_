export interface DraftPeraturan {
  id: number;
  judul: string;
  kategori: string;
  nomor_rancangan?: string | null;
  tahun: number | string;
  pemrakarsa?: string | null;
  penanggung_jawab?: string | null;
  tahapan: string;
  status: string;
  tanggal_pengajuan?: string | null;
  target_penetapan?: string | null;
  ringkasan?: string | null;
  catatan_revisi?: string | null;
  file_draft?: string | null;
  file_draft_url?: string | null;
  file_naskah_akademik?: string | null;
  file_naskah_akademik_url?: string | null;
  dilihat?: number;
  download?: number;
  created_at?: string;
  updated_at?: string;
}

export interface DraftPeraturanSummary {
  total_draft?: number;
  status_draft?: number;
  status_pembahasan?: number;
  status_revisi?: number;
  status_disetujui?: number;
  tahap_harmonisasi?: number;
  tahap_uji_publik?: number;
}
