require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./db");
const User = require("../models/User");
const Inventory = require("../models/Inventory");
const { BLOOD_GROUPS } = require("../utils/blood");

const SAMPLE_STOCK = {
  "A+": 12,
  "A-": 4,
  "B+": 9,
  "B-": 3,
  "AB+": 6,
  "AB-": 2,
  "O+": 15,
  "O-": 5
};

async function seed() {
  await connectDB();

  const email = process.env.ADMIN_EMAIL || "admin@bloodbank.com";
  const password = process.env.ADMIN_PASSWORD || "Admin@123";

  let admin = await User.findOne({ email });
  if (!admin) {
    admin = await User.create({
      name: "Blood Bank Admin",
      email,
      password,
      phone: "1800-BLOOD",
      role: "admin"
    });
    console.log(`Admin created: ${email}`);
  } else {
    console.log(`Admin already exists: ${email}`);
  }

  for (const group of BLOOD_GROUPS) {
    await Inventory.findOneAndUpdate(
      { bloodGroup: group },
      { bloodGroup: group, units: SAMPLE_STOCK[group], lowStockThreshold: 5 },
      { upsert: true, new: true }
    );
  }

  console.log("Inventory seeded for all blood groups.");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
