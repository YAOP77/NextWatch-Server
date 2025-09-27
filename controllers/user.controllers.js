const bcrypt = require("bcrypt");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const createUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const userExist = await User.findOne({ email });
        if(userExist) return res.status(401).json({ message: "L'email existe déja" });

        const passwordHash = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: passwordHash });
        await newUser.save();

        const token = jwt.sign({ id: newUser._id, role: newUser.role }, process.env.JWT_SECRET, { expiresIn: "2d" });
        res.status(201).json({
            message: "Inscription réussie",
            token,
            user: {
                id: newUser._id,
                email: newUser.email,
                username: newUser.username,
                role: newUser.role,
                subscription: newUser.subscription
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Une erreur est survenue lors de l'inscription", error: error.message });
    }
}

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if(!user) return res.status(401).json({ message: "Email inconnu" });
        
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) return res.status(401).json({ message: "Mot de passe incorrect" });

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "2d" });
        res.status(201).json({
            message: "Connexion réussi",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                subscription: user.subscription
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Une erreur est servenue lors de la connexion", error: error.message });
    }
}

module.exports = { createUser, loginUser };