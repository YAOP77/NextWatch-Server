const express = require("express");
const router = express.Router();
const isAuth = require("../middleware/auth.middleware");
const { addOrRemoveWatchLater, readWatchLater } = require("../controllers/watchLater.controllers");

router.get("/", isAuth, readWatchLater);
router.post("/add", isAuth, addOrRemoveWatchLater);

module.exports = router;