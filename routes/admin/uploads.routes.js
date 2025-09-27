const express = require("express");
const router = express.Router();
const { UploadMovies, DeleteMovies, UpdateMovies, GetAllMovies, GetMovieByCategory } = require("../../controllers/movie.controllers");
const { thumbnailsAndMoviesUpload } = require("../../middleware/uploads.middleware");
const requireAdmin = require("../../middleware/admin.middleware");
const isAuth = require("../../middleware/auth.middleware");

router.post("/uploads", isAuth, requireAdmin, thumbnailsAndMoviesUpload, UploadMovies);
router.put("/:id", isAuth, requireAdmin, thumbnailsAndMoviesUpload, UpdateMovies);
router.delete("/:id", isAuth, requireAdmin, DeleteMovies);
router.get("/admin/all", isAuth, requireAdmin, GetAllMovies);
router.get("/:category", isAuth, requireAdmin, GetMovieByCategory);

module.exports = router;