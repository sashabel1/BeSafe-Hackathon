// src/scripts/seedUsers.js
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("../models/UserModel"); // תוודאי שהנתיב נכון אצלך

async function seedUsers() {
  if (!process.env.MONGO_URI) {
    throw new Error("Missing MONGO_URI in .env");
  }

  await mongoose.connect(process.env.MONGO_URI);

  const password = "123456";
  const passwordHash = await bcrypt.hash(password, 10);

  const users = [
    
    { email: "noa12@gmail.com", nickname: "Noa", age: 17, gender: "female" },
    { email: "maya14@gmail.com", nickname: "Maya", age: 16, gender: "female" },
    { email: "yael16@gmail.com", nickname: "Yael", age: 16, gender: "female" },
    { email: "tamar18@gmail.com", nickname: "Tamar", age: 18, gender: "female" },

   
    { email: "dan13@gmail.com", nickname: "Dan", age: 17, gender: "male" },
    { email: "itay15@gmail.com", nickname: "Itay", age: 15, gender: "male" },
    { email: "omer17@gmail.com", nickname: "Omer", age: 17, gender: "male" },
  ];

 
  const emails = users.map((u) => u.email);
  await User.deleteMany({ email: { $in: emails } });

  await User.insertMany(
    users.map((u) => ({
      name: u.nickname, 
      email: u.email,
      password: passwordHash,
      isEmailVerified: true, 
      nickname: u.nickname,
      age: u.age,
      gender: u.gender,
      profilePic: "", 
      isProfileComplete: true, 
    }))
  );

  console.log("✅ Seeded 7 users (password: 123456)");
  await mongoose.disconnect();
}

seedUsers().catch(async (err) => {
  console.error("❌ Seed failed:", err);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
