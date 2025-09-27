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

// app.use(cors());
app.use(cors({
  origin: 'https://next-watch-nine.vercel.app',
  credentials: true
}));

app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static("uploads"));
mongoConnect();

app.use("/api/auth", authRoutes);
app.use("/api/user/movies", readUserRoutes);
app.use("/api/user/movies", userMoviesPremium);
app.use("/api/movies", uploadRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/user/favoris", favorisRoutes);
app.use("/api/user/later", watchLaterRoutes);
app.use("/api/user", userPayment);

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
    // console.log(`Server started on http://localhost:${PORT}`);
});