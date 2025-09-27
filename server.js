require("dotenv").config();
const express = require("express");
const mongoConnect = require("./config/db");
const authRoutes = require("./routes/auth.routes");
const favorisRoutes = require("./routes/favoris.routes");
const watchLaterRoutes = require("./routes/watchLater.routes");
const uploadRoutes = require("./routes/admin/uploads.routes");
const categoryRoutes = require("./routes/admin/category.routes");
const readUserRoutes = require("./routes/user/userRead.routes");
const userMoviesPremium = require("./routes/user/userPremium.routes")
const userPayment = require("./routes/user/userPayment.routes")
const cors = require("cors");


const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static("uploads"));
mongoConnect();

app.use("/api/auth", authRoutes);
app.use("/api/user/movies", readUserRoutes); // <---
app.use("/api/user/movies", userMoviesPremium); // <- -
app.use("/api/movies", uploadRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/user/favoris", favorisRoutes);
app.use("/api/user/later", watchLaterRoutes);
app.use("/api/user", userPayment);

// app.use((req, res, next) => {
//     // 2 minutes
//     req.setTimeout(120000);
//     next();
// });

// app.post("/api/auth/login", (req, res) => {
//     const { email, password } = req.body;
//     console.log("Donné reçu :", email, password);
//     res.send("ok");
// })

// app.get("/", (req, res) => {
//     res.render("app started");
// })

app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});