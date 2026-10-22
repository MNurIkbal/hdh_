const path = require("path");
const fs = require("fs");
const draftPeraturanRepository = require("../repositories/draftPeraturan.repository");

const getFileBaseUrl = () => {
    const backendUrl =
        process.env.APP_BACKEND_URL || "https://hdh-be.asiasistem.com";
    return `${backendUrl.replace(/\/$/, "")}/uploads/draft-peraturan`;
};

const mapDraftFiles = (item) => {
    if (!item) return null;
    const fileBaseUrl = getFileBaseUrl();

    return {
        ...item,
        file_draft_url: item.file_draft
            ? `${fileBaseUrl}/${item.file_draft}`
            : null,
        file_naskah_akademik_url: item.file_naskah_akademik
            ? `${fileBaseUrl}/${item.file_naskah_akademik}`
            : null,
    };
};

const getAll = async ({
    search = "",
    kategori = "",
    tahapan = "",
    status = "",
    tahun = "",
    page = 1,
    size = 10,
} = {}) => {
    page = Number(page);
    size = Number(size);

    if (!Number.isInteger(page) || page < 1) {
        page = 1;
    }

    if (!Number.isInteger(size) || size < 1) {
        size = 10;
    }

    if (size > 100) {
        size = 100;
    }

    const result = await draftPeraturanRepository.findAll({
        search,
        kategori,
        tahapan,
        status,
        tahun,
        page,
        size,
    });

    const totalPages = Math.ceil(result.total / size);
    const data = result.data.map(mapDraftFiles);

    return {
        data,
        pagination: {
            page,
            size,
            total: result.total,
            totalPages,
        },
    };
};

const getById = async (id) => {
    const result = await draftPeraturanRepository.findById(id);

    if (!result) {
        throw new Error("Draft peraturan tidak ditemukan");
    }

    return mapDraftFiles(result);
};

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
    if (!judul || !judul.trim()) {
        throw new Error("Judul rancangan peraturan wajib diisi");
    }

    if (!kategori || !kategori.trim()) {
        throw new Error("Kategori peraturan wajib dipilih");
    }

    if (
        tahun === undefined ||
        tahun === null ||
        String(tahun).trim() === ""
    ) {
        throw new Error("Tahun perancangan wajib diisi");
    }

    const tahunNumber = Number(tahun);
    if (!Number.isInteger(tahunNumber)) {
        throw new Error("Tahun harus berupa angka");
    }

    const created = await draftPeraturanRepository.create({
        judul: judul.trim(),
        kategori: kategori.trim(),
        nomor_rancangan: nomor_rancangan ? nomor_rancangan.trim() : null,
        tahun: tahunNumber,
        pemrakarsa: pemrakarsa ? pemrakarsa.trim() : null,
        penanggung_jawab: penanggung_jawab ? penanggung_jawab.trim() : null,
        tahapan: tahapan ? tahapan.trim() : "Penyusunan Draft Awal",
        status: status ? status.trim() : "Draft",
        tanggal_pengajuan: tanggal_pengajuan ? tanggal_pengajuan.trim() : null,
        target_penetapan: target_penetapan ? target_penetapan.trim() : null,
        ringkasan: ringkasan ? ringkasan.trim() : null,
        catatan_revisi: catatan_revisi ? catatan_revisi.trim() : null,
        file_draft,
        file_naskah_akademik,
    });

    return mapDraftFiles(created);
};

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
    const existing = await draftPeraturanRepository.findById(id);

    if (!existing) {
        throw new Error("Draft peraturan tidak ditemukan");
    }

    if (!judul || !judul.trim()) {
        throw new Error("Judul rancangan peraturan wajib diisi");
    }

    if (!kategori || !kategori.trim()) {
        throw new Error("Kategori peraturan wajib dipilih");
    }

    const tahunNumber = Number(tahun);
    if (!Number.isInteger(tahunNumber)) {
        throw new Error("Tahun harus berupa angka");
    }

    // Jika file diganti, hapus file lama dari disk
    const uploadDir = path.join(process.cwd(), "uploads", "draft-peraturan");

    if (file_draft && existing.file_draft && file_draft !== existing.file_draft) {
        const oldPath = path.join(uploadDir, existing.file_draft);
        if (fs.existsSync(oldPath)) {
            try {
                fs.unlinkSync(oldPath);
            } catch (e) {
                console.error("Gagal hapus file draft lama:", e);
            }
        }
    }

    if (
        file_naskah_akademik &&
        existing.file_naskah_akademik &&
        file_naskah_akademik !== existing.file_naskah_akademik
    ) {
        const oldPath = path.join(uploadDir, existing.file_naskah_akademik);
        if (fs.existsSync(oldPath)) {
            try {
                fs.unlinkSync(oldPath);
            } catch (e) {
                console.error("Gagal hapus file naskah akademik lama:", e);
            }
        }
    }

    const updated = await draftPeraturanRepository.update(id, {
        judul: judul.trim(),
        kategori: kategori.trim(),
        nomor_rancangan: nomor_rancangan ? nomor_rancangan.trim() : null,
        tahun: tahunNumber,
        pemrakarsa: pemrakarsa ? pemrakarsa.trim() : null,
        penanggung_jawab: penanggung_jawab ? penanggung_jawab.trim() : null,
        tahapan: tahapan ? tahapan.trim() : existing.tahapan,
        status: status ? status.trim() : existing.status,
        tanggal_pengajuan: tanggal_pengajuan ? tanggal_pengajuan.trim() : null,
        target_penetapan: target_penetapan ? target_penetapan.trim() : null,
        ringkasan: ringkasan ? ringkasan.trim() : null,
        catatan_revisi: catatan_revisi ? catatan_revisi.trim() : null,
        file_draft: file_draft || existing.file_draft,
        file_naskah_akademik: file_naskah_akademik || existing.file_naskah_akademik,
    });

    return mapDraftFiles(updated);
};

const remove = async (id) => {
    const existing = await draftPeraturanRepository.findById(id);

    if (!existing) {
        throw new Error("Draft peraturan tidak ditemukan");
    }

    await draftPeraturanRepository.remove(id);
    return { id, message: "Draft peraturan berhasil dihapus" };
};

const getSummary = async () => {
    return await draftPeraturanRepository.getSummary();
};

module.exports = {
    getAll,
    getById,
    create,
    update,
    remove,
    getSummary,
};
