const express = require("express");
const router = express.Router();
const isAuth = require("../../middleware/auth.middleware");
const { 
    GetAllMovies, 
    GetMovieByCategory, 
    SearchMovies, 
    // ReadInfoMovieById,
    ReadMovieById,
    GetSimilarMovies
} = require("../../controllers/movie.controllers")
const { getCategory } = require("../../controllers/category.controllers");

router.get("/", isAuth, getCategory);
router.get("/all", isAuth, GetAllMovies);
router.get("/:id", isAuth, GetMovieByCategory);
router.get("/search/query", isAuth, SearchMovies);
router.get("/read/:id", isAuth, ReadMovieById);
router.get("/similar/:id", GetSimilarMovies);

module.exports = router;