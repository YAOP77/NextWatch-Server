const mongoose = require("mongoose");

const moviesSchema = mongoose.Schema({
    title: { type: String, required: true },
    thumbnailsUrl: { type: String, required:  true },
    moviesUrl: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" , required: true },
    date: { type: String, required: true },
    duration: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, default: 1 },
    isPremium: { type: Boolean, default: false },
    postBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
},
    { timestamps: true }
);

module.exports = mongoose.model("Movies", moviesSchema);