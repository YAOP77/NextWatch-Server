const express = require("express");
const router = express.Router();
const  isAuth = require("../middleware/auth.middleware");
const { toggleFavoris, getFavorisByUser } = require("../controllers/favorite.contollers");

router.post("/", isAuth, toggleFavoris);
router.get("/all", isAuth, getFavorisByUser);

module.exports = router;