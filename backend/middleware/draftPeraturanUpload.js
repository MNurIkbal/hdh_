const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadPath = path.join(
    process.cwd(),
    "uploads",
    "draft-peraturan"
);

// Pastikan folder tersedia
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, {
        recursive: true,
    });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const cleanName = path
            .basename(file.originalname, ext)
            .replace(/[^a-zA-Z0-9_-]/g, "_")
            .substring(0, 30);
        const filename = `draft-${Date.now()}-${cleanName}${ext}`;
        cb(null, filename);
    },
});

const fileFilter = (req, file, cb) => {
    const fieldName = file.fieldname.trim();

    const allowedFields = [
        "file_draft",
        "file_naskah_akademik",
    ];

    if (!allowedFields.includes(fieldName)) {
        return cb(
            new multer.MulterError(
                "LIMIT_UNEXPECTED_FILE",
                file.fieldname
            )
        );
    }

    const allowedMimes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/octet-stream",
    ];

    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExts = [".pdf", ".doc", ".docx"];

    if (allowedMimes.includes(file.mimetype) || allowedExts.includes(ext)) {
        return cb(null, true);
    }

    return cb(
        new Error("File draft harus berformat PDF, DOC, atau DOCX")
    );
};

const draftPeraturanUpload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB
        files: 2,
    },
});

module.exports = draftPeraturanUpload;
