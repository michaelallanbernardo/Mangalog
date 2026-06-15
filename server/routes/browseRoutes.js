const express = require("express");
const router = express.Router();

const { searchPublicManga, getTrendingManga } = require("../controllers/browseController");

router.get("/search", searchPublicManga);
router.get("/trending", getTrendingManga);

module.exports = router;
