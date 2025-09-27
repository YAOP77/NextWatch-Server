const mongoose = require("mongoose");
const Favorite = require("../models/Favoris");

const toggleFavoris = async (req, res) => {
  try {
    const { movieId } = req.body;
    const userId = req.user?.id;
    
    // console.log("Id envoyé :", req.body);
    if(!mongoose.Types.ObjectId.isValid(movieId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "ID invalide" });
    }

    const existing = await Favorite.findOne({ 
      movieId: new mongoose.Types.ObjectId(movieId), 
      userId: new mongoose.Types.ObjectId(userId)
    });

    if(existing) {
      await existing.deleteOne();
      // console.log("Favori trouvé, suppression...");
      return res.json({ status: "removed", movieId });
    }
    
    const newFavoris = new Favorite({
      movieId: new mongoose.Types.ObjectId(movieId),
      userId: new mongoose.Types.ObjectId(userId)
    });
    
    await newFavoris.save()
    // console.log("Favori trouvé, ajout...");
    return res.json({ status: "added", movieId });

  } catch (error) {
    console.error("Une erreur est survenue :", error);
    return res.status(500).json({ error: error.message });
  }
};

const getFavorisByUser = async (req, res) => {
  try {
    const userId = req.user?.id;
    // console.log("ID utilisateur récupéré :", userId);

    const favoris = await Favorite.find({ userId })
    // .populate("category", "nom")
    .populate("movieId", "title thumbnailsUrl description moviesUrl rating duration date")
    // .populate("category", "nom")
    // Inclure toutes les informations nécessaires
    .select("-__v");

    // console.log("Favoris enrichis :", favoris);
    // console.log("Favoris enrichis avec moviesUrl :", favoris.map(fav => fav.movieId.moviesUrl));
    
    return res.json(favoris);
  } catch (error) {
    console.error("Erreur récupération favoris :", error);
    return res.status(500).json({ error: error.message });
  }
};


module.exports = { toggleFavoris, getFavorisByUser };