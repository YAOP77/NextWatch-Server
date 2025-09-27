const multer = require('multer');
const fs = require("fs");
const path = require("path");

// Dossiers à vérifier
const thumbnailsDir = path.join(__dirname, '..', 'uploads', 'thumbnails');
const moviesDir = path.join(__dirname, '..', 'uploads', 'movies');

// Création des dossiers AVANT le stockage
[thumbnailsDir, moviesDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    // console.log(`Dossier créé : ${dir}`);
  }
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === "movie") {
            cb(null, "uploads/movies");
        } else if (file.fieldname === "thumbnail") {
            cb(null, "uploads/thumbnails");
        } else {
            cb(new Error("Champ inattendu : " + file.fieldname));
        }
    },

    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const prefix = file.fieldname === "movie" ? "movie" : "thumbnail";
        cb(null, `${Date.now()}-${prefix}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const extAllowedMovie = [".mp4", ".avi"];
    const extAllowedThumb = ['.jpeg', '.png', '.jpg', '.avif', '.webp'];

    if (file.fieldname === "movie") {
        if (!extAllowedMovie.includes(ext)) {
            return cb(new Error("Extensions autorisées pour les vidéos : .mp4, .avi"));
        }
    } else if (file.fieldname === "thumbnail") {
        if (!extAllowedThumb.includes(ext)) {
            return cb(new Error("Extensions autorisées pour les miniatures : .jpeg, .png, .jpg, .avif"));
        }
    } else {
        return cb(new Error("Champ de fichier non autorisé : " + file.fieldname));
    }

    cb(null, true);
};

const thumbnailsAndMoviesUpload = multer({
    storage,
    fileFilter
}).fields([
    { name: "movie", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 }
]);

module.exports = { thumbnailsAndMoviesUpload };

// // Configuration pour les films
// const moviesStorage = multer.diskStorage({
//     destination: "uploads/movies/",
//     filename: (req, file, cb) => {
//         cb(null, Date.now() + "-movies" + path.extname(file.originalname));
//     }
// })

// const moviesUpload = multer({
//     storage: moviesStorage,
//     fileFilter: (req, file, cb) => {
//         const ext = path.extname(file.originalname).toLocaleLowerCase();
//         if(ext !== ".mp4") return cb(new Error("Only .mp4 allowed"));
//         cb(null, true);
//     }
// }).single("movies");

// // Configuration pour les thumbnails
// const thumbnailsStockage = multer.diskStorage({
//     destination: "uploads/thumbnails/",
//     filename: (req, file, cb) => {
//         cb(null, Date.now() + "-thumbnails" + path.extname(file.originalname));
//     }
// })

// const thumbnailsUpload = multer({
//     storage: thumbnailsStockage,
//     fileFilter: (req, file, cb) => {
//         const ext = path.extname(file.originalname).toLocaleLowerCase();
//         const extAllowed = [".jpg", ".jpeg", ".png"];
//         if(!extAllowed.includes(ext)) return cb(new Error("Les exention recommandées sont: 'jpg',' jpeg', 'png'"));
//         cb(null, true);
//     }
// }).single("thumbnails");

// module.exports = { moviesUpload, thumbnailsUpload };