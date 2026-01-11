import express from 'express';
import cors from 'cors';
import "dotenv/config";
import { connectDB } from "./config/db.js";
import usersRoutes from "./routes/usersRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import conversationRoutes from "./routes/conversationRoutes.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();
app.use(cors()); 
app.use(express.json());
app.use("/users", usersRoutes);
app.use("/auth", authRoutes);
app.use("/conversations", conversationRoutes);
app.use("/", aiRoutes);

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB(process.env.MONGO_URI);

    app.listen(PORT, () => {
      console.log(` Server running on http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error(" Failed to connect to DB:", err.message);
    throw err;
  }
}

startServer();
