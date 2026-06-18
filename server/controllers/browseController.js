const { fetchMangaFromAniList } = require("../utils/anilistAPI");

// SEARCH PUBLIC MANGA
exports.searchPublicManga = async (req, res) => {
  try {
    const { query = "", page = 1 } = req.query;

    const result = await fetchMangaFromAniList(page, query);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to search public manga" });
  }
};

// GET TRENDING MANGA
exports.getTrendingManga = async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const result = await fetchMangaFromAniList(page, "");
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch trending manga" });
  }
};
