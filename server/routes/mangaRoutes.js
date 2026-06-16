const express = require("express");
const router = express.Router();

const {
  createManga,
  getUserManga,
  getUserStats,
  getUserMangaIds,
  getMangaById,
  updateManga,
  deleteManga,
} = require("../controllers/mangaController");
const authMiddleware = require("../middleware/authMiddleware");

// All manga routes require authentication
router.use(authMiddleware);

router.post("/", createManga);
router.get("/", getUserManga);
router.get("/stats", getUserStats);
router.get("/ids", getUserMangaIds);
router.get("/:id", getMangaById);
router.put("/:id", updateManga);
router.delete("/:id", deleteManga);

module.exports = router;
