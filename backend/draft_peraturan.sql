-- ====================================================================
-- SKEMA TABEL: draft_peraturan
-- Dokumentasi DDL PostgreSQL untuk modul Draft Peraturan Dokumen Hukum
-- ====================================================================

CREATE TABLE IF NOT EXISTS draft_peraturan (
    id SERIAL PRIMARY KEY,
    judul VARCHAR(500) NOT NULL,
    kategori VARCHAR(100) NOT NULL,
    nomor_rancangan VARCHAR(100),
    tahun INT NOT NULL,
    pemrakarsa VARCHAR(255),
    penanggung_jawab VARCHAR(255),
    tahapan VARCHAR(100) NOT NULL DEFAULT 'Penyusunan Draft Awal',
    status VARCHAR(50) NOT NULL DEFAULT 'Draft',
    tanggal_pengajuan DATE,
    target_penetapan DATE,
    ringkasan TEXT,
    catatan_revisi TEXT,
    file_draft VARCHAR(255),
    file_naskah_akademik VARCHAR(255),
    dilihat INT DEFAULT 0,
    download INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- Indeks untuk pencarian dan pemfilteran cepat
CREATE INDEX IF NOT EXISTS idx_draft_peraturan_deleted_at ON draft_peraturan(deleted_at);
CREATE INDEX IF NOT EXISTS idx_draft_peraturan_tahun ON draft_peraturan(tahun);
CREATE INDEX IF NOT EXISTS idx_draft_peraturan_status ON draft_peraturan(status);
CREATE INDEX IF NOT EXISTS idx_draft_peraturan_tahapan ON draft_peraturan(tahapan);
CREATE INDEX IF NOT EXISTS idx_draft_peraturan_kategori ON draft_peraturan(kategori);
