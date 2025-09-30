const express = require("express");
const cloudinary = require("../../services/cloudinary.js");
const Movies = require("../../models/Movies.js");
const isAuth = require("../../middleware/auth.middleware")
const requireAdmin = require("../../middleware/admin.middleware")
const { thumbnailsAndMoviesUpload } = require("../../middleware/uploads.middleware.js")

const router = express.Router()

router.post("/", isAuth, requireAdmin, thumbnailsAndMoviesUpload, async (req, res) => {
  try {
    const {
      title,
      description,
      rating,
      category,
      date,
      duration,
      isPremium
    } = req.body

    const thumbnailPath = req.files?.thumbnail?.[0]?.path
    const moviePath = req.files?.movie?.[0]?.path

    if (!thumbnailPath || !moviePath || !title || !rating || !description || !category || !date || !duration) {
      return res.status(400).json({ message: "Please provide all required fields" })
    }

    // Upload vers Cloudinary
    const thumbnailUpload = await cloudinary.uploader.upload(thumbnailPath, {
      resource_type: "image"
    })

    const movieUpload = await cloudinary.uploader.upload(moviePath, {
      resource_type: "video"
    })

    // Construction du document
    const newMovie = new Movies({
      title,
      description,
      rating,
      category,
      date,
      duration,
      isPremium,
      postBy: req.user?.id,
      thumbnailsUrl: thumbnailUpload.secure_url,
      moviesUrl: movieUpload.secure_url
    })

    await newMovie.save()

    res.status(201).json(newMovie)
  } catch (error) {
    console.error("Error uploading movie:", error)
    res.status(500).json({ message: "Server error during upload" })
  }
})

module.exports = router;