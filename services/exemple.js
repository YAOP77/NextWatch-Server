require("dotenv").config();
const mongoose = require('mongoose');
const User = require("../models/User");
const bcrypt = require("bcrypt");

// Créer un Administrateur avec une fonction auto-executer
(async () => {
    try {
        // Connexion a MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connecté");

        const emailAdmin = process.env.EMAIL_ADMIN;
        const passwordAdmin = process.env.PASSWORD_ADMIN;

        // Vérifier si l'admin exist déja
        const adminExist = await User.findOne({ emailAdmin });
        if(adminExist) {
            console.log("L'admin exist déja");
            return;
        }

        // Hasher le mot de passe
        const passwordHash = await bcrypt.hash(passwordAdmin, 10);

        // Créer un nouvel administrateur
        const createAdmin = new User({
            username: "Thomas",
            email: emailAdmin,
            password: passwordHash,
            // Donnéer le rôle d'admin
            role: "admin"
        });
        // Le sauvegarder en base de donnée
        await createAdmin.save();
        console.log("Admin créer");
    } catch (error) {
        console.error("Une erreur est survenue !");
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
})

//////////////////////////////////////// Gestion d'User
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Création d'un utilisateur

// Connexion d'un utilisateur

/////////////////////////////////////////// MIDDLEWARE AUTH
// USER

// ADMIN

////////////////////////////////////////////////////// MIDDLEWARE POUR LA GESTION DES FICHIER (VIDEOS/IMAGES)
const multer = require("multer");
const path = require("path");

// STOCKER LES FICHIERS SUR LE DISQUES LOCALE
const uploadsStockage = multer.diskStorage({
    destination: "uploads/movies",
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-movie" + path.extname(file.originalname));
    }
});

// CONFIGURER UPLOADS DES FICHIERS

/////////////////////////////////////////////////////////////////// CONTOLLERS UPLOADS
const Upload = require("../models/Movies");

const MoviesUpload = async (req, res) => {
    try {        
        const { title, description } = req.body;
        const movieUrl = "uploads/movies/" + req.files.movie[0].filename;
        const thumbnailsUrl = "uploads/thumbnails" + req.files.thumbnails[0].filename;
    
        res.status(201).json({ message: "film enregistrer avec succès" });
    } catch (error) {
        res.status(500).json({ message: "Une erreur est survenue", error: error.message });
    }
}


///////////////////////////////////////////////////////// ROUTES
const express = require("express");
const rooter = express.Router();
const { MoviesUpload } = require("../controllers/upload.controllers");
const requireAdmin = require("../middleware/admin.middleware");
const { moviesUpload, thumbnailsUpload } = require("../middleware");

rooter.post("upload", requireAdmin, (req, res) => {
    moviesUpload(req, res, (error) => {
        if(error) return res.status(400).json({ error: error.message });

        thumbnailsUpload(req, res, (error) => {
            if(error) return res.status(400).json({ error: error.message });

            MoviesUpload(req, res);
        })
    })
})

module.exports = rooter




////////////////////////////////////////////////////////////////////////
const Movies = require("./models/movies");
const path  = require("path");

const UploadMovies = async (req, res) => {
    const { titre, description, categoties } = req.body;

    const [movieFile] = req.file?.movie || [];
    const [thumbnailFile] = req.file?.thumbnails || [];

    if(!titre || !thumbnailFile || !movieFile || !description || !categoties) {
        return res.status(400).json({ message: 'Tous les champs sont obligatoire' });
    }

    const movieUrl = path.join("uploads","movies", movieFile.filename);
    const thumbnailUrl = path.join("uploads","thumbnails", thumbnailFile.filename);

    try {        
        const newMovie = new Movies({
            titre,
            thumbnailUrl,
            movieUrl,
            categoties,
            description,
            postBy: req.user?.id
        });
    
        await newMovie.save();

        return res.status(201).json({ message: "Film téléchargé avec succès" });
    } catch (error) {
        return res.status(500).json({ message: "Une erreur est survenue lors de la publication", error: error.message });
    }
}

//////////////////////////////////////////////////
const fs = require("fs");
const path = require("path");
const Movie = require("../models/uploads.models");


////////////// REVISION

const Movies = require("./models/movieUpload");
const path = require("path");
const fs = require("fs");

const DeleteMovies = async (req, res) => {
    try {
        const { id } = req.params;

        const movie = await Movies.findById(id)
        if(!movie) return res.status(404).json({ messag: "Film introuvable" });

        const moviePath = path.join(__dirname,"..", movie.movieUrl);
        const thumbnailsPath = path.join(__dirname,"..", movie.thumbnailUrl);

        if(fs.existsSync(moviePath)) fs.unlinkSync(moviePath);
        if(fs.existsSync(thumbnailsPath)) fs.unlinkSync(thumbnailsPath);

        await movie.deleteOne();
        return res.status(200).json({ message: "Film supprimé avec succès" });
    } catch (error) {
        console.error("Erreur :", erro.stack);
        return res.status(500).json({ message: "Une erreur est survenue lors de la suppression", error: error.message });
    }
}

const MoviesUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category } = req.body;

    const movie = await Movie.findById(id);
    if (!movie) {
      return res.status(404).json({ message: "Vidéo introuvable." });
    }

    // 📝 Mise à jour des champs textuels si fournis
    movie.title = title?.trim() || movie.title;
    movie.description = description?.trim() || movie.description;
    movie.category = category?.trim() || movie.category;

    // 🔄 Remplacement de l'image si une nouvelle est envoyée
    const [thumbnailFile] = req.files?.thumbnail || [];
    if (thumbnailFile) {
      const oldThumbPath = path.join(__dirname, "..", movie.thumbnailUrl);
      if (fs.existsSync(oldThumbPath)) fs.unlinkSync(oldThumbPath);

      movie.thumbnailUrl = path.join("uploads", "thumbnails", thumbnailFile.filename);
    }

    // 🎬 Remplacement de la vidéo si une nouvelle est envoyée
    const [movieFile] = req.files?.movie || [];
    if (movieFile) {
      const oldMoviePath = path.join(__dirname, "..", movie.movieUrl);
      if (fs.existsSync(oldMoviePath)) fs.unlinkSync(oldMoviePath);

      movie.movieUrl = path.join("uploads", "movies", movieFile.filename);
    }

    await movie.save();

    return res.status(200).json({
      message: "Vidéo mise à jour avec succès.",
      data: {
        id: movie._id,
        title: movie.title,
        description: movie.description,
        category: movie.category,
        movieUrl: movie.movieUrl,
        thumbnailUrl: movie.thumbnailUrl,
        updatedAt: movie.updatedAt,
      },
    });
  } catch (err) {
    console.error("Erreur lors de la mise à jour du film :", err);
    return res.status(500).json({
      message: "Erreur serveur lors de la mise à jour.",
      error: err.message,
    });
  }
};

//////////////////////////////////////////

////////////////////////////////////////////////////////////
const express = require("express");
const router = express.Router();
const {
  UploadMovies,
  DeleteMovies,
  UpdateMovies
} = require("../controllers/upload.controllers");

const {
  movieUploadMiddleware,
  thumbnailUploadMiddleware
} = require("../middleware/uploads.middleware");

const requireAdmin = require("../middleware/admin.middleware");
const isAuth = require("../middleware/auth.middleware");

router.patch( "/:id", isAuth, requireAdmin, (req, res, next) => {
    movieUploadMiddleware(req, res, (err) => {
      if (err) return res.status(400).json({ error: err.message });
      next();
    });
  },
  (req, res, next) => {
    thumbnailUploadMiddleware(req, res, (err) => {
      if (err) return res.status(400).json({ error: err.message });
      next();
    });
  },
  UpdateMovies
);

module.exports = router;

////////////////////////////////////////////////////////////////////////
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "movie") {
      cb(null, "uploads/movies/");
    } else if (file.fieldname === "thumbnail") {
      cb(null, "uploads/thumbnails/");
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const prefix = file.fieldname === "movie" ? "movie" : "thumb";
    cb(null, `${Date.now()}-${prefix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (file.fieldname === "movie" && ext !== ".mp4") {
    return cb(new Error("Seuls les fichiers .mp4 sont autorisés"));
  }

  if (file.fieldname === "thumbnail") {
    const allowed = [".jpg", ".jpeg", ".png"];
    if (!allowed.includes(ext)) {
      return cb(new Error("Miniatures : extensions valides .jpg, .jpeg, .png"));
    }
  }

  cb(null, true);
};

const movieAndThumbnailUpload = multer({
  storage,
  fileFilter,
}).fields([
  { name: "movie", maxCount: 1 },
  { name: "thumbnail", maxCount: 1 },
]);

module.exports = { movieAndThumbnailUpload };

///////////////////////////////////////////////
const Movies = require("./models/controllers.uploads");
const multer = require("multer");
const fs = require("fs");

const MoviesDelete = async (req, res) => {
    try {
        const { id } = req.params;

        const movie = await Movies.findById(id);
        if(!movie) return res.status(404).json({ message: "Film introuvable" });

        const thumbnailPath = path.join(__dirname,"..", movie.thumbnailUrl);
        const moviePath = path.join(__dirname,"..", movie.movieUrl);

        if(fs.existsSync(thumbnailPath)) fs.unlinkSync(thumbnailPath);
        if(fs.existsSync(moviePath)) fs.unlinkSync(moviePath);

        await movie.deleteOne();
        return res.status(200).json({ message: "Film supprimé" });
    } catch (error) {
        console.error("Erreur :", error);
        return res.status(500).json({ message: "Une erreur est survenue", error });
    }
}

// const MoviesUpdate = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const { title, category, description } = req.body;

//         const movie = await Movies.findById(id);
//         if(!movie) return res.status(404).json({ message: "Film introuvanle" });

//         movie.title = title?.trim() || movie.title;
//         movie.category = category?.trim() || movie.category;
//         movie.description = description?.trim() || movie.description;

//         const [thumbnailFile] = req.file?.thumbnail || [];
//         if(thumbnailFile) {
//             const oldThumbnailPath = path.join(__dirname,"..", movie.thumbnailUrl);
//             if(fs.existsSync(oldThumbnailPath)) fs.unlinkSync(oldThumbnailPath);

//             movie.thumbnailUrl = path.join("uploads","thumbnails", thumbnailFile.filename);
//         }

//         const [movieFile] = req.file?.movie || [];
//         if(movieFile) {
//             const oldMoviePath = path.join(__dirname,"..", movie.movieUrl);
//             if(fs.existsSync(oldMoviePath)) fs.unlinkSync(oldMoviePath);

//             movie.movieUrl = path.join("uploads","movies", movieFile.filename);
//         };

//         await Movies.save();

//         res.status(200).json({
//             message: "Film modifié",
//             data: {
//                 id: movie._id,
//                 title: movie.title,
//                 thumbnail: movie.thumbnailUrl,
//                 movie: movie.movieUrl,
//                 category: movie.category,
//                 description: movie.description,
//                 updateAt: movie.updateAt,
//             }
//         });
//     } catch (error) {
//         console.error("Erreur :", error);
//         return res.status(500).json({ message: "Une erreur est survenue :", error: error.message });
//     }
// }

// - - - - //
const express = require("express");
const isAuth = require("../middleware/auth.middleware");
const requireAdmin = require("../middleware/admin.middleware");
const { thumbnailUploadMiddleware } = require("../middleware/uploads.middleware");
const { default: movieServices } = require("./front-react/src/services/admin/movieServices");
// const { MoviesUpload, MoviesDelete, MoviesUpdate } = require("./server-express/controllers/upload.controllers");

router.post("upload", isAuth, requireAdmin, thumbnailUploadMiddleware, MoviesUpload);
router.delete("delete", isAuth, requireAdmin, MoviesDelete);
router.put("update", isAuth, requireAdmin, thumbnailUploadMiddleware, MoviesUpdate );

// const isAuth = (req, res, next) => {
  //   try {
    //     const authHeader = req.headers.authorization;
//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return res.status(401).json({ message: "Accès non autorisé" });
//     }

//     const token = authHeader.split(" ")[1];
//     const decoded = jwt.verify(token, process.env.SECRET_JWT);

//     req.user = decoded;
//     next();

//   } catch (error) {
//     console.error("Erreur d'authentification :", error);
//     return res.status(403).json({ message: "Token invalide ou expiré", error: error.message });
//   }
// };

/////////////////////////////////////
const Category = require("/models/category");
const { constants } = require("buffer");

const readAllCategory = async (req, res) => {
  try {
    const category = await Category.find().sort({ createdAt: -1 });
    res.json(category);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}

const addCategory = async (req, res) => {
  try {
    const { category } = req.body;

    const categoryExist = await Category.findOne({ nom: category });
    if(categoryExist) return res.status(400).json({ message: "Cette catégorie existe déja" });

    const newCategory = new Category({
      nom: mongoose.Schema.Types.ObjectId("catehory"),
      createdBy: req.user?.id
    });

    await newCategory.save();

    return res.status(201).json({
      message: "Film publié",
      category: category
    })
  } catch (error) {
    return res.status(500).json({ message: "Une erreur est survenue", error });
  }
}

const updateCategory = async (req, res) => {
  try {    
    const { id } = req.params;
    const { category } = req.body;
  
    if (!category?.trim()) return res.status(400).json({ message: "Le nom est requis" });
    
    const categoryExist = await Category.findOne({ nom: category });
    if(categoryExist && categoryExist?.id !== id) {
      return res.status(400).json({ message: "Cette catzgorie existe déja" });
    }
  
    const update = await Category.findByIdUpdate(
      id,
      { name: category },
      { new: true, runValidators: true }
    );
  
    await update.save();
  
    if(!update) return res.status(404).json({ message: "Catégorie introubale" });
  
    return res.status(200).json({ message: "Category modifier avec succès" });
  } catch (error) {
      return res.status(500).json({ message: "Une erreur est survenue", error });
  }
}

/////////////////////////////////////////////////////////////////////
