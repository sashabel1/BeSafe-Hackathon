import mongoose from "mongoose";

export async function connectDB(uri) {
  if (!uri) throw new Error("MONGO_URI is missing in .env");

  await mongoose.connect(uri);
  console.log("✅ Connected to MongoDB");
  console.log("DB name:", mongoose.connection.name);

}
