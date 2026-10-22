const express = require("express");
const router = express.Router();

const draftPeraturanController = require("../controllers/draftPeraturan.controller");
const draftPeraturanUpload = require("../middleware/draftPeraturanUpload");

router.get("/summary", draftPeraturanController.getSummary);
router.get("/", draftPeraturanController.getAll);
router.get("/:id", draftPeraturanController.getById);

router.post(
    "/",
    draftPeraturanUpload.fields([
        {
            name: "file_draft",
            maxCount: 1,
        },
        {
            name: "file_naskah_akademik",
            maxCount: 1,
        },
    ]),
    draftPeraturanController.create
);

router.put(
    "/:id",
    draftPeraturanUpload.fields([
        {
            name: "file_draft",
            maxCount: 1,
        },
        {
            name: "file_naskah_akademik",
            maxCount: 1,
        },
    ]),
    draftPeraturanController.update
);

router.delete("/:id", draftPeraturanController.remove);

module.exports = router;
