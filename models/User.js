const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "user"], default: "user" },
    // Gestion abonnement
    subscription: { 
        type: String, 
        enum: ["free", "weekly", "monthly", "yearly"], 
        default: "free", 
        required: true 
    },
    subscriptionStart: { type: Date },
    subscriptionEnd: { type: Date },

    // Pour les payement
    lastPaymentId: { type: String },
    lastPaymentAmount: { type: Number },
    lastPaymentDate: { type: Date }
},
    { timestamps: true }
);

module.exports = mongoose.model("utilisateur", userSchema);