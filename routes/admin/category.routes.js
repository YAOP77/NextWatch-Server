const express = require("express");
const router = express.Router();
const isAuth = require("../../middleware/auth.middleware");
const requireAdmin = require("../../middleware/admin.middleware");
const { getCategory, addCategory, updateCategory, deleteCategory } = require("../../controllers/category.controllers");

router.get("/", isAuth, getCategory);
router.post("/add", isAuth, requireAdmin, addCategory);
router.put("/:id", isAuth, requireAdmin, updateCategory);
router.delete("/:id", isAuth, requireAdmin, deleteCategory);

module.exports = router;