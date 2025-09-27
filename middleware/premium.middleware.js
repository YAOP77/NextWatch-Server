const User = require("../models/User");

const checkSubscription = async (req, res, next) => {
  try {
    // injecté par ton middleware d’auth (JWT)
    const userId = req.user.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    // Si l’abonnement est expiré
    if (user.subscription !== "free" && user.subscriptionEnd < new Date()) {
      user.subscription = "free";
      user.subscriptionEnd = null;
      await user.save();
    }

    // Injecte l’utilisateur mis à jour dans la requête
    req.user = user;
    next();
  } catch (error) {
    console.error("Erreur vérification abonnement:", error);
    res.status(500).json({ message: "Erreur interne" });
  }
};

module.exports = checkSubscription;