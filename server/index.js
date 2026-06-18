const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");
const mangaRoutes = require("./routes/mangaRoutes");
const browseRoutes = require("./routes/browseRoutes");
require("dotenv").config();


const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/manga", mangaRoutes);
app.use("/api/browse", browseRoutes);

app.get("/api/status", (req, res) => {
  res.json({ message: "MangaLog API is running" });
});

const PORT = process.env.PORT || 5000;

console.log("Connecting to MongoDB...");
mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
  })
  .then(() => {
    console.log("MongoDB connected");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("MongoDB connection error:", err);
  });
