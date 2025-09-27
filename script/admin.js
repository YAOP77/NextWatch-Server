require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const bcrypt = require("bcrypt");

(async () => {
    try {
        // Connexion à MongoDB
        await mongoose.connect(process.env.DB_URI);
        console.log("Connecté à MongoDB !");

        // Verification de l'exitance de l'administrateur
        const emailAdmin = process.env.EMAIL_ADMIN;
        const passwordAdmin = process.env.PASSWORD_ADMIN;

        const adminExist = await User.findOne({ email: emailAdmin });
        if(adminExist) {
            console.log("Cette admin exist déja");
            return;
        }

        // Hashe le mdp de l'administrateur
        const passwordHash = await bcrypt.hash(passwordAdmin, 10);

        // Création d'un administrateur
        const createAdmin = new User({
            username: "Thomas",
            email: emailAdmin,
            password: passwordHash,
            role: "admin",
            subscription: "yearly"
        });
        await createAdmin.save();
        
        console.log("Administrateur créer avec succès");
    } catch (error) {
        console.error("Erreur lors de la création de l'administrateur !", error);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
})();