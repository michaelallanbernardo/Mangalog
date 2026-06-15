const Manga = require("../models/Manga");

// CREATE
exports.createManga = async (req, res) => {
  try {
    const { title, author, status, chapters, currentChapter, rating, notes, anilistId } = req.body;

    if (!title || !author) {
      return res.status(400).json({ message: "Title and author are required" });
    }

    // Check if manga already exists in user's list
    if (anilistId) {
      const existing = await Manga.findOne({ userId: req.userId, anilistId });
      if (existing) {
        return res.status(409).json({ message: "This manga is already in your list" });
      }
    }

    const manga = await Manga.create({
      userId: req.userId,
      title,
      author,
      status: status || "plan-to-read",
      chapters: chapters || 0,
      currentChapter: currentChapter || 0,
      rating: rating || null,
      notes: notes || "",
      anilistId: anilistId || null,
    });

    res.status(201).json(manga);
  } catch (err) {
    res.status(500).json({ error: "Failed to create manga" });
  }
};

// GET ALL USER MANGA WITH FILTERING, SORTING, AND PAGINATION
exports.getUserManga = async (req, res) => {
  try {
    const {
      status,
      minRating = 0,
      maxRating = 5,
      sortBy = "createdAt",
      sortOrder = "desc",
      page = 1,
      limit = 10,
      search = "",
    } = req.query;

    // Build filter object
    const filter = { userId: req.userId };

    // Apply status filter
    if (status) {
      const statuses = status.split(",").filter((s) => s.trim());
      if (statuses.length > 0) {
        filter.status = { $in: statuses };
      }
    }

    // Apply rating filter
    const minRatingNum = parseFloat(minRating);
    const maxRatingNum = parseFloat(maxRating);
    if (minRatingNum > 0 || maxRatingNum < 5) {
      filter.rating = { $gte: minRatingNum, $lte: maxRatingNum };
    }

    // Apply search filter
    if (search.trim()) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { author: { $regex: search, $options: "i" } },
      ];
    }

    // Build sort object
    const sortObj = {};
    const validSortFields = ["title", "rating", "createdAt", "currentChapter"];
    const field = validSortFields.includes(sortBy) ? sortBy : "createdAt";
    sortObj[field] = sortOrder === "asc" ? 1 : -1;

    // Calculate pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Fetch total count for pagination info
    const total = await Manga.countDocuments(filter);

    // Fetch manga with pagination
    const mangas = await Manga.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum);

    res.json({
      data: mangas,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch manga list" });
  }
};

// GET SINGLE MANGA
exports.getMangaById = async (req, res) => {
  try {
    const manga = await Manga.findOne({ _id: req.params.id, userId: req.userId });

    if (!manga) {
      return res.status(404).json({ message: "Manga not found" });
    }

    res.json(manga);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch manga" });
  }
};

// UPDATE MANGA
exports.updateManga = async (req, res) => {
  try {
    const { title, author, status, chapters, currentChapter, rating, notes } = req.body;

    const manga = await Manga.findOne({ _id: req.params.id, userId: req.userId });

    if (!manga) {
      return res.status(404).json({ message: "Manga not found" });
    }

    if (title) manga.title = title;
    if (author) manga.author = author;
    if (status) manga.status = status;
    if (chapters !== undefined) manga.chapters = chapters;
    if (currentChapter !== undefined) manga.currentChapter = currentChapter;
    if (rating !== undefined) manga.rating = rating;
    if (notes !== undefined) manga.notes = notes;

    await manga.save();
    res.json(manga);
  } catch (err) {
    res.status(500).json({ error: "Failed to update manga" });
  }
};

// DELETE MANGA
exports.deleteManga = async (req, res) => {
  try {
    const manga = await Manga.findOneAndDelete({ _id: req.params.id, userId: req.userId });

    if (!manga) {
      return res.status(404).json({ message: "Manga not found" });
    }

    res.json({ message: "Manga deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete manga" });
  }
};
