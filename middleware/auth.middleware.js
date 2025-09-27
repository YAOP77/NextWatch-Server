require("dotenv").config();
const jwt = require("jsonwebtoken");

const authUser = (req, res, next) => {
  const authHeader = req.headers.authorization;
  // console.log("Token user :", req.headers.authorization);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("En-tête Authorization manquant ou incorrect :", authHeader);
    return res.status(401).json({ message: "Accès refusé" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    // console.log("Utilisateur dans isAuth:", req.user);
    next();
  } catch (error) {
    console.error("Erreur lors de la vérification du token :", error);
    return res.status(403).json({ message: "Token invalide" });
  }
};

module.exports = authUser;
//   console.log("token reçu :", req.headers.authorization);
//   console.log(req.headers)