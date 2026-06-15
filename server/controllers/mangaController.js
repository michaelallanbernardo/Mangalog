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

// GET ALL USER MANGA
exports.getUserManga = async (req, res) => {
  try {
    const mangas = await Manga.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(mangas);
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
