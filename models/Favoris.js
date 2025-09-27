const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", },
    movieId: { type: mongoose.Schema.Types.ObjectId, ref: "Movies", }
});

module.exports = mongoose.model("favorite", favoriteSchema);