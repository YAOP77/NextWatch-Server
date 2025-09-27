const mongoose = require("mongoose");
const WatchLater = require("../models/watchLater");

const addOrRemoveWatchLater = async (req, res) => {
    try {
        const { movieId } = req.body;
        const idUser = req.user?.id

        if(!mongoose.Types.ObjectId.isValid(movieId) || !mongoose.Types.ObjectId.isValid(idUser)) {
            return res.status(400).json({ message: "ID invalide" });
        }

        const existing = await WatchLater.findOne({
            movieId: new mongoose.Types.ObjectId(movieId),
            userId: new mongoose.Types.ObjectId(idUser)
        });

        if(existing) {
            await existing.deleteOne();
            // console.log("Supprimé de la liste 'A regarder plus-tard'");
            return res.status(200).json({ status: "remove", movieId })
        }

        const newWatchLater = new WatchLater({
            movieId: new mongoose.Types.ObjectId(movieId),
            userId: new mongoose.Types.ObjectId(idUser)
        })

        await newWatchLater.save();
        return res.status(200).json({ status: "added", newWatchLater });
    } catch (error) {
        return res.status(500).json({ message: "Une erreur est survenue", error });
    }
}

const readWatchLater = async (req, res) => {
    try {
        const userId = req.user?.id;
        // console.log("Donnée utilisateur :", userId);

        const watchLater = await WatchLater.find({ userId })
        .populate("movieId", "title thumbnailsUrl moviesUrl description rating duration date")
        // .populate("category", "nom")
        .select("-__v");

        return res.json(watchLater);
    } catch (error) {
        return res.status(500).json({ message: "Une erreur est survenue lors de l'affichage", error });
    }
}

module.exports = { addOrRemoveWatchLater, readWatchLater };