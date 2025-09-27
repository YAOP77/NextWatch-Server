const User = require("../models/User");

const requireAdmin = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        // console.log("Rôle de l'utilisateur :", user.role);

        if(!req.user || user.role !== "admin") {
            // console.log("Accès refusé : rôle insuffisant");
            return res.status(403).json({ message: "Accès refusé" });
        }
        next();        
    } catch (error) {
        console.error("Erreur dans requireAdmin :", error);
        res.status(500).json({ message: "Une erreur est survenue" });
    }
}

module.exports = requireAdmin;

// const isAdmin = async (req, res, next) => {
//   try {
//     if (!req.user || !req.user.id) {
//       return res.status(401).json({ message: "Utilisateur non authentifié" });
//     }

//     const user = await User.findById(req.user.id);

//     if (!user || user.role !== "admin") {
//       return res.status(403).json({ message: "Accès refusé : rôle insuffisant" });
//     }

//     next();
//   } catch (error) {
//     console.error("Erreur dans isAdmin:", error);
//     res.status(500).json({ message: "Une erreur est survenue" });
//   }
// };