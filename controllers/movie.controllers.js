require("dotenv").config();

const mongoose = require("mongoose");
// Recuperation du Model
const Movies = require("../models/Movies");
const User = require("../models/User");
// Module Node pour créer des chemain tous OS
const path = require("path");
// Module Node pour gérer les fichiers
const fs = require("fs");

// Création d'un nouveau film
const UploadMovies = async (req, res) => {
    try {
        const { title, description, date, duration, rating, category, isPremium } = req.body;
        const userId = req.user?.id;
        console.log("Film publié :", req.body);
        // console.log("category :", category);
        
        const [movieFile] = req.files?.movie || [];
        const [thumbnailFile] = req.files?.thumbnail || [];
        // console.log("req.files:", req.files);
        
        if (!title || !description || !category || !movieFile || !thumbnailFile || !date || !duration || !rating || !isPremium) {
            return res.status(400).json({ message: "Champs manquants ou fichiers non envoyés." });
        }

        if(!mongoose.Types.ObjectId.isValid(category)) {
            return res.status(400).json({ message: "ID non valide" });
        }

        const moviePath = path.join("uploads", "movies", movieFile.filename);
        const thumbnailPath = path.join("uploads", "thumbnails", thumbnailFile.filename);

        const newMovie = new Movies({
            title,
            thumbnailsUrl: thumbnailPath,
            moviesUrl: moviePath,
            date,
            duration,
            rating,
            // conversion explicite
            category: new mongoose.Types.ObjectId(category),
            isPremium,
            description,
            postBy: userId,
        });

        console.log("Données film :", newMovie);

        await newMovie.save();

        return res.status(201).json({ message: "Film publié avec succès." });
    } catch (error) {
        // Exemple d’un log enrichi ou service de reporting
        console.error("Erreur MoviesUpload:", error);
        return res.status(500).json({ message: "Erreur lors de la publication du film", error: error.message });
    }
};

// Suppression d'un film
const DeleteMovies = async (req, res) => {
    try {
        // Recuperatiion de l'ID
        const { id } = req.params;

        const movie = await Movies.findById(id);
        if(!movie) return res.status(404).json({ message: "Film introuvable" });

        // Création d'un chemin absolut vers nos fichier stocké localement
        const moviePath = path.join(__dirname,"..", movie.moviesUrl);
        const thumbnailsPath = path.join(__dirname, "..", movie.thumbnailsUrl);

        // Si le fichier existe on le supprime 
        if(fs.existsSync(moviePath)) fs.unlinkSync(moviePath);
        if(fs.existsSync(thumbnailsPath)) fs.unlinkSync(thumbnailsPath);

        // Suppression dans MongoDB
        await movie.deleteOne();

        res.status(200).json({ message: "Film supprimé avec succès" });
    } catch (error) {
        console.log("Erreur :", error);
        res.status(500).json({ message: "Une erreur est survenue lors de la suppression du film", error: error.message });
    }
}

// Modification d'un film
const UpdateMovies = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, category, date, durer, rating, description } = req.body;

        const movie = await Movies.findById(id);
        if(!movie) return res.status(404).json({ message: "Film introuvable" });

        // Mise a jour des champs textuels si fournis
        movie.title = title?.trim() || movie.title;
        movie.category = category?.trim() || movie.category;
        movie.description = description?.trim() || movie.description;
        movie.date = date?.trim() || movie.date;
        movie.durer = durer?.trim() || movie.durer;
        movie.rating = rating?.trim() || movie.rating;


        // Mise à jour de l'image si fournis (destructeur defendif)
        const [thumbnailFile] = req.file?.thumbnail || [];
        if(thumbnailFile) {
            // Chemin relative vers notre ancienne image
            const oldThumbnailPath = path.join(__dirname,"..", movie.thumbnailsUrl);

            // Suppression avec File Système (fs) de l'ancienne image si elle exist
            if(fs.existsSync(oldThumbnailPath)) fs.unlinkSync(oldThumbnailPath);
            
            // Chemin relative pour l'enregistrement de la nouvelle image
            movie.thumbnailsUrl = path.join("uploads","thumbnails", thumbnailFile.filename);
        }
        
        
        // Mise à jour de l'image si fournis (destructeur defendif)
        const [movieFile] = req.file?.movie || [];
        if(movieFile) {
            // Chemin relative vers notre ancienne video
            const oldMoviePath = path.join(__dirname,"..", movie.moviesUrl);
            
            // Suppression avec File Système (fs) de l'ancienne video si elle exist
            if(fs.existsSync(oldMoviePath)) fs.unlinkSync(fs.unlinkSync(oldMoviePath));

            // Chemin relative pour l'enregistrement de la nouvelle image
            movie.moviesUrl = path.join("uploads","movies", movieFile.filename);
        }

        // Sauvegarde dans MongoDB
        await movie.save();

        // Envoi de la reponse au Frontend
        return res.status(200).json({
            message: "Film modifié",
            data: {
                id: movie._id,
                title: movie.title,
                thumbnail: movie.thumbnailsUrl,
                movie: movie.moviesUrl,
                date: movie.data,
                durer: movie.durer,
                rating: movie.rating,
                category: movie.category,
                description: movie.description,
                updateAt: movie.updateAt
            }
        });
    } catch (error) {
        console.error("Erreur :", error);
        return res.status(500).json({
            message: "Une erreur est survenue lors de la modification du film",
            error: error.message
        });
    }
}

const GetAllMovies = async (req, res) => {
    try {
        const movies = await Movies.find({ isPremium: false })
        .populate("category", "nom")
        .sort({ createdAt: -1 })

        const formattedMovies = movies.map(movie => ({
            ...movie._doc,
            thumbnailsUrl: movie.thumbnailsUrl,
            moviesUrl: movie.moviesUrl,
        }));

        res.json(formattedMovies);

    } catch (error) {
        console.error("Erreur getAllMovie :", error);
        return res.status(500).json({
            message: "Une erreur est survenue lors de l'affichage des films.",
            error: error.message,
        });
    }
};

const GetMovieByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    const movies = await Movies.find({ category }).sort({ createdAt: -1 });


    const formattedMovies = movies.map(movie => ({
      ...movie._doc,
      thumbnailsUrl: movie.thumbnailsUrl,
      moviesUrl: movie.moviesUrl,
    }));

    res.json(formattedMovies);

  } catch (error) {
    console.error("Erreur :", error);
    return res.status(500).json({ message: "Une erreur est survenue :", error: error.message });
  }
};

const SearchMovies = async (req, res) => {
    try {
        const { query } = req.query;
        console.log("req.query :", req.query);

        if (!query?.trim()) {
            return res.status(400).json("Aucune requête pour la recherche");
        }

        const regex = new RegExp(query, "i");

        const search = await Movies.find({
            isPremium: false,
            $or: [
                { title: { $regex: regex } },
                { description: { $regex: regex } }
            ]
        })
        .populate("category", "nom")
        .select("_id title thumbnailsUrl moviesUrl description category rating duration date");

        // Formatage des URLs avec BASE_URL déjà disponible
        const formattedSearch = search.map(movie => ({
            ...movie._doc,
            thumbnailsUrl: movie.thumbnailsUrl,
            moviesUrl: movie.moviesUrl,
        }));

        res.json(formattedSearch);
    } catch (error) {
        return res.status(500).json({ 
            message: "Une erreur est survenue lors de la recherche",
            error
        });
    }
};

const SearchMoviesPremium = async (req, res) => {
    try {
        const { query } = req.query;
        console.log("req.query :", req.query);

        if (!query?.trim()) {
            return res.status(400).json("Aucune requête pour la recherche");
        }

        const regex = new RegExp(query, "i");

        const search = await Movies.find({
            isPremium: true,
            $or: [
                { title: { $regex: regex } },
                { description: { $regex: regex } }
            ]
        })
        .populate("category", "nom")
        .select("_id title thumbnailsUrl moviesUrl description category rating duration date");

        // Formatage des URLs avec BASE_URL déjà disponible
        const formattedSearch = search.map(movie => ({
            ...movie._doc,
            thumbnailsUrl: movie.thumbnailsUrl,
            moviesUrl: movie.moviesUrl,
        }));

        res.json(formattedSearch);
    } catch (error) {
        return res.status(500).json({ 
            message: "Une erreur est survenue lors de la recherche",
            error
        });
    }
};

const AllPremiumMovies = async (req, res) => {
        try {
        const movies = await Movies.find({ isPremium: true })
        .populate("category", "nom")
        .sort({ createdAt: -1 })

        const formattedMovies = movies.map(movie => ({
            ...movie._doc,
            thumbnailsUrl:movie.thumbnailsUrl,
            moviesUrl: movie.moviesUrl,
        }));

        res.json(formattedMovies);

    } catch (error) {
        console.error("Erreur getAllMovie :", error);
        return res.status(500).json({
            message: "Une erreur est survenue lors de l'affichage des films.",
            error: error.message,
        });
    }
}

const PremiumMovieInfo = async (req, res) => {
    try {
        const movie = await Movies.findById(req.params.id);
        if (!movie) return res.status(404).json({ message: "Film introuvable" });

        let safeMovie = movie.toObject(); // pour modifier sans toucher à Mongo directement

        // Si le film est premium
        if (movie.isPremium) {
        const user = await User.findById(req.user.id);

        const isActive =
            (user.role === "admin") ||
            (user.subscription &&
            user.subscription !== "free" &&
            user.subscriptionEnd &&
            new Date(user.subscriptionEnd) > new Date());

        if (!isActive) {
            // On masque moviesUrl
            delete safeMovie.moviesUrl;
            return res.status(200).json({
            ...safeMovie,
            restricted: true, // petit flag pour le frontend
            });
        }
        }

        // Si abo actif OU film gratuit → on renvoie tout
        res.json(safeMovie);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

const ReadMovieById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID invalide" });
    }

    const movie = await Movies.findById(id)
    .populate("category", "nom");

    if (!movie) {
      return res.status(404).json({ message: "Film introuvable" });
    }

        // Construction de l'objet formaté
        const formattedMovie = {
            ...movie._doc,
            thumbnailsUrl: movie.thumbnailsUrl,
            moviesUrl: movie.moviesUrl,
        };

        // Si le film est premium, vérifier l'abonnement
        if (movie.isPremium) {
            const user = await User.findById(req.user.id);
            const isActive =
                (user.role === "admin") ||
                (user.subscription &&
                user.subscription !== "free" &&
                user.subscriptionEnd &&
                new Date(user.subscriptionEnd) > new Date());

            if (!isActive) {
                // On masque moviesUrl
                const { moviesUrl, ...safeMovie } = formattedMovie;
                return res.json({
                    ...safeMovie,
                    restricted: true,
                });
            }
        }

        // Si abo actif OU film gratuit → on renvoie tout
        res.json({
            _id: formattedMovie._id,
            title: formattedMovie.title,
            thumbnailsUrl: formattedMovie.thumbnailsUrl,
            moviesUrl: formattedMovie.moviesUrl,
            category: formattedMovie.category,
            date: formattedMovie.date,
            duration: formattedMovie.duration,
            rating: formattedMovie.rating,
            description: formattedMovie.description,
            isPremium: movie.isPremium,
            restricted: false
        });

  } catch (error) {
    console.error("Erreur :", error);
    return res.status(500).json({ message: "Une erreur est survenue :", error: error.message });
  }
};

// Récupérer les films similaire via l'id
const GetSimilarMovies = async (req, res) => {
  try {
    const movieId = req.params.id;
    const BASE_URL = process.env.BASE_URL;

    // Vérifier que l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      return res.status(400).json({ message: "ID de film invalide" });
    }

    // Récupérer le film cliqué
    const movie = await Movies.findById(movieId);
    if (!movie) {
      return res.status(404).json({ message: "Film non trouvé" });
    }

    // Récupérer les films de la même catégorie (exclure le film lui-même)
    const similarMovies = await Movies.find({
      category: movie.category,
      _id: { $ne: movie._id } // Pas besoin de .toString() ici
    });

            // Retourne les URLs telles qu'en base (Cloudinary ou autre)
            const formattedMovies = similarMovies.map(m => ({
                _id: m._id,
                title: m.title,
                description: m.description,
                category: m.category,
                thumbnailsUrl: m.thumbnailsUrl,
                moviesUrl: m.moviesUrl,
            }));

    res.status(200).json(formattedMovies);
  } catch (error) {
    console.error("Erreur lors de la récupération des films similaires :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

module.exports = { 
    SearchMovies, 
    SearchMoviesPremium,
    UploadMovies, 
    DeleteMovies, 
    UpdateMovies, 
    GetAllMovies, 
    ReadMovieById,
    AllPremiumMovies,
    PremiumMovieInfo,
    GetMovieByCategory,
    GetSimilarMovies
};

// const ReadMovieById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Vérification de l'ID
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ message: "ID invalide" });
//     }

//     // Récupération du film avec la catégorie peuplée
//     const movie = await Movies.findById(id).populate("category", "nom");

//     // Vérification de l'existence
//     if (!movie) {
//       return res.status(404).json({ message: "Film introuvable" });
//     }

//     // Formatage des URLs
//     const formattedMovie = {
//       ...movie._doc,
//       thumbnailsUrl: `${BASE_URL}/${movie.thumbnailsUrl.replace(/\\/g, "/")}`,
//       moviesUrl: `${BASE_URL}/${movie.moviesUrl.replace(/\\/g, "/")}`,
//     };

//     // Réponse structurée avec un objet movie
//     res.json({
//       movie: {
//         _id: formattedMovie._id,
//         title: formattedMovie.title,
//         thumbnailsUrl: formattedMovie.thumbnailsUrl,
//         moviesUrl: formattedMovie.moviesUrl,
//         // objet avec _id et nom
//         category: formattedMovie.category,
//         date: formattedMovie.date,
//         duration: formattedMovie.duration,
//         description: formattedMovie.description
//       }
//     });

//   } catch (error) {
//     console.error("Erreur :", error);
//     return res.status(500).json({ message: "Une erreur interne est survenue." });
//   }
// };