
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const authRoutes = require("./src/routes/route");
const usersRoutes = require("./src/routes/users");
const app = express();

app.use(express.json());
app.use(cookieParser());


app.use(
  cors({
    origin: process.env.APP_URL, 
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);

app.use("/api/users", usersRoutes);
app.get("/", (req, res) => res.send("API is running..."));

const port = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(port, () => console.log(`Server running on port: ${port}`));
  })
  .catch((err) => console.error("MongoDB connection error:", err));
