const User = require("../../models/User");
const express = require("express");
const router = express.Router();
const isAuth = require("../../middleware/auth.middleware");
// const isPremium = require("../../middleware/premium.middleware");
const { 
    PremiumMovieInfo, 
    AllPremiumMovies, 
    SearchMoviesPremium 
    } = require("../../controllers/movie.controllers")
// const { getCategory } = require("../../controllers/category.controllers");

router.get("/premium/me", isAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    res.json({
      id: user._id,
      email: user.email,
      username: user.username,
      role: user.role,
      subscription: user.subscription,
      subscriptionStart: user.subscriptionStart,
      subscriptionEnd: user.subscriptionEnd
    });
  } catch (error) {
    console.error("Erreur récupération user:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

router.get("/premium/all", isAuth, AllPremiumMovies );
router.get("/premium/:id", isAuth, PremiumMovieInfo );
router.get("/premium/search/query", isAuth, SearchMoviesPremium );

module.exports = router;