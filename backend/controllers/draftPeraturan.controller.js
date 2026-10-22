const draftPeraturanService = require("../services/draftPeraturan.service");

const getAll = async (req, res) => {
    try {
        const result = await draftPeraturanService.getAll({
            search: req.query.search || "",
            kategori: req.query.kategori || "",
            tahapan: req.query.tahapan || "",
            status: req.query.status || "",
            tahun: req.query.tahun || "",
            page: req.query.page || 1,
            size: req.query.size || 10,
        });

        return res.status(200).json({
            success: true,
            message: "Data draft peraturan berhasil diambil",
            ...result,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

const getById = async (req, res) => {
    try {
        const result = await draftPeraturanService.getById(req.params.id);

        return res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        return res.status(404).json({
            success: false,
            message: error.message,
        });
    }
};

const getSummary = async (req, res) => {
    try {
        const result = await draftPeraturanService.getSummary();

        return res.status(200).json({
            success: true,
            message: "Data ringkasan draft peraturan berhasil diambil",
            data: result,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const create = async (req, res) => {
    try {
        const {
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
        } = req.body;

        const fileDraft =
            req.files?.file_draft?.[0]?.filename || null;

        const fileNaskahAkademik =
            req.files?.file_naskah_akademik?.[0]?.filename || null;

        const result = await draftPeraturanService.create({
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
            file_draft: fileDraft,
            file_naskah_akademik: fileNaskahAkademik,
        });

        return res.status(201).json({
            success: true,
            message: "Draft peraturan berhasil dibuat",
            data: result,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const {
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
        } = req.body;

        const fileDraft =
            req.files?.file_draft?.[0]?.filename;

        const fileNaskahAkademik =
            req.files?.file_naskah_akademik?.[0]?.filename;

        const result = await draftPeraturanService.update(id, {
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
            file_draft: fileDraft,
            file_naskah_akademik: fileNaskahAkademik,
        });

        return res.status(200).json({
            success: true,
            message: "Draft peraturan berhasil diperbarui",
            data: result,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

const remove = async (req, res) => {
    try {
        const result = await draftPeraturanService.remove(req.params.id);

        return res.status(200).json({
            success: true,
            message: "Draft peraturan berhasil dihapus",
            data: result,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    getAll,
    getById,
    getSummary,
    create,
    update,
    remove,
};
