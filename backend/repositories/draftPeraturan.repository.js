const pool = require("../config/database");

// Inisialisasi tabel jika belum ada
const ensureTableExists = async () => {
    try {
        await pool.query(`
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

            CREATE INDEX IF NOT EXISTS idx_draft_peraturan_deleted_at ON draft_peraturan(deleted_at);
            CREATE INDEX IF NOT EXISTS idx_draft_peraturan_tahun ON draft_peraturan(tahun);
            CREATE INDEX IF NOT EXISTS idx_draft_peraturan_status ON draft_peraturan(status);
            CREATE INDEX IF NOT EXISTS idx_draft_peraturan_tahapan ON draft_peraturan(tahapan);
        `);
    } catch (error) {
        console.error("Error creating draft_peraturan table:", error);
    }
};

ensureTableExists();

// GET ALL
const findAll = async ({
    search = "",
    kategori = "",
    tahapan = "",
    status = "",
    tahun = "",
    page = 1,
    size = 10,
}) => {
    const offset = (page - 1) * size;
    const conditions = ["deleted_at IS NULL"];
    const values = [];
    let paramIndex = 1;

    if (search && search.trim()) {
        values.push(`%${search.trim()}%`);
        conditions.push(`(
            judul ILIKE $${paramIndex}
            OR nomor_rancangan ILIKE $${paramIndex}
            OR pemrakarsa ILIKE $${paramIndex}
            OR kategori ILIKE $${paramIndex}
            OR penanggung_jawab ILIKE $${paramIndex}
        )`);
        paramIndex++;
    }

    if (kategori && kategori.trim()) {
        values.push(kategori.trim());
        conditions.push(`kategori = $${paramIndex}`);
        paramIndex++;
    }

    if (tahapan && tahapan.trim()) {
        values.push(tahapan.trim());
        conditions.push(`tahapan = $${paramIndex}`);
        paramIndex++;
    }

    if (status && status.trim()) {
        values.push(status.trim());
        conditions.push(`status = $${paramIndex}`);
        paramIndex++;
    }

    if (tahun && String(tahun).trim()) {
        values.push(Number(tahun));
        conditions.push(`tahun = $${paramIndex}`);
        paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const dataQuery = `
        SELECT
            id,
            judul,
            kategori,
            nomor_rancangan,
            tahun,
            pemrakarsa,
            penanggung_jawab,
            tahapan,
            status,
            tanggal_pengajuan,
            target_penetapan,
            ringkasan,
            catatan_revisi,
            file_draft,
            file_naskah_akademik,
            dilihat,
            download,
            created_at,
            updated_at
        FROM draft_peraturan
        ${whereClause}
        ORDER BY id DESC
        LIMIT $${paramIndex}
        OFFSET $${paramIndex + 1}
    `;

    const countQuery = `
        SELECT COUNT(*) AS total
        FROM draft_peraturan
        ${whereClause}
    `;

    const [dataResult, countResult] = await Promise.all([
        pool.query(dataQuery, [...values, size, offset]),
        pool.query(countQuery, values),
    ]);

    return {
        data: dataResult.rows,
        total: Number(countResult.rows[0]?.total || 0),
    };
};

// GET BY ID
const findById = async (id) => {
    const query = `
        SELECT
            id,
            judul,
            kategori,
            nomor_rancangan,
            tahun,
            pemrakarsa,
            penanggung_jawab,
            tahapan,
            status,
            tanggal_pengajuan,
            target_penetapan,
            ringkasan,
            catatan_revisi,
            file_draft,
            file_naskah_akademik,
            dilihat,
            download,
            created_at,
            updated_at
        FROM draft_peraturan
        WHERE id = $1
          AND deleted_at IS NULL
        LIMIT 1
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
};

// CREATE
const create = async ({
    judul,
    kategori,
    nomor_rancangan = null,
    tahun,
    pemrakarsa = null,
    penanggung_jawab = null,
    tahapan = "Penyusunan Draft Awal",
    status = "Draft",
    tanggal_pengajuan = null,
    target_penetapan = null,
    ringkasan = null,
    catatan_revisi = null,
    file_draft = null,
    file_naskah_akademik = null,
}) => {
    const query = `
        INSERT INTO draft_peraturan (
            judul,
            kategori,
            nomor_rancangan,
            tahun,
            pemrakarsa,
            penanggung_jawab,
            tahapan,
            status,
            tanggal_pengajuan,
            target_penetapan,
            ringkasan,
            catatan_revisi,
            file_draft,
            file_naskah_akademik
        )
        VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
        )
        RETURNING *
    `;

    const result = await pool.query(query, [
        judul,
        kategori,
        nomor_rancangan,
        Number(tahun),
        pemrakarsa,
        penanggung_jawab,
        tahapan,
        status,
        tanggal_pengajuan || null,
        target_penetapan || null,
        ringkasan || null,
        catatan_revisi || null,
        file_draft || null,
        file_naskah_akademik || null,
    ]);

    return result.rows[0];
};

// UPDATE
const update = async (
    id,
    {
        judul,
        kategori,
        nomor_rancangan,
        tahun,
        pemrakarsa,
        penanggung_jawab,
        tahapan,
        status,
        tanggal_pengajuan,
        target_penetapan,
        ringkasan,
        catatan_revisi,
        file_draft,
        file_naskah_akademik,
    }
) => {
    const query = `
        UPDATE draft_peraturan
        SET
            judul = $1,
            kategori = $2,
            nomor_rancangan = $3,
            tahun = $4,
            pemrakarsa = $5,
            penanggung_jawab = $6,
            tahapan = $7,
            status = $8,
            tanggal_pengajuan = $9,
            target_penetapan = $10,
            ringkasan = $11,
            catatan_revisi = $12,
            file_draft = COALESCE($13, file_draft),
            file_naskah_akademik = COALESCE($14, file_naskah_akademik),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $15
          AND deleted_at IS NULL
        RETURNING *
    `;

    const result = await pool.query(query, [
        judul,
        kategori,
        nomor_rancangan,
        Number(tahun),
        pemrakarsa,
        penanggung_jawab,
        tahapan,
        status,
        tanggal_pengajuan || null,
        target_penetapan || null,
        ringkasan || null,
        catatan_revisi || null,
        file_draft,
        file_naskah_akademik,
        id,
    ]);

    return result.rows[0] || null;
};

// SOFT DELETE
const remove = async (id) => {
    const query = `
        UPDATE draft_peraturan
        SET deleted_at = CURRENT_TIMESTAMP
        WHERE id = $1
          AND deleted_at IS NULL
        RETURNING id
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
};

// SUMMARY STATS
const getSummary = async () => {
    const summaryQuery = `
        SELECT
            COUNT(*) AS total_draft,
            COUNT(*) FILTER (WHERE status = 'Draft') AS status_draft,
            COUNT(*) FILTER (WHERE status = 'Dalam Pembahasan') AS status_pembahasan,
            COUNT(*) FILTER (WHERE status = 'Revisi') AS status_revisi,
            COUNT(*) FILTER (WHERE status = 'Disetujui') AS status_disetujui,
            COUNT(*) FILTER (WHERE tahapan = 'Harmonisasi & Sinkronisasi') AS tahap_harmonisasi,
            COUNT(*) FILTER (WHERE tahapan = 'Uji Publik / Konsultasi') AS tahap_uji_publik
        FROM draft_peraturan
        WHERE deleted_at IS NULL
    `;

    const result = await pool.query(summaryQuery);
    return result.rows[0] || {};
};

module.exports = {
    ensureTableExists,
    findAll,
    findById,
    create,
    update,
    remove,
    getSummary,
};
