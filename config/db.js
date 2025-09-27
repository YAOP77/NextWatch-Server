const mongoose = require("mongoose");

const mongoConnect = async () => {
    try {
        await mongoose.connect(process.env.DB_URI);
        // console.log("Connecté sur :", conn.connection.host);
        console.log("Etat de la connexion :", mongoose.connection.readyState);
    } catch (error) {
        console.error("Erreur lors de la connsion !", error);
        process.exit(1);
    }
}

module.exports = mongoConnect;