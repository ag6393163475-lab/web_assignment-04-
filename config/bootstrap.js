const User = require("../models/User");
const Inventory = require("../models/Inventory");
const { BLOOD_GROUPS, LOW_STOCK_THRESHOLD } = require("../utils/blood");

async function bootstrap() {
  const email = process.env.ADMIN_EMAIL || "admin@bloodbank.com";
  const password = process.env.ADMIN_PASSWORD || "Admin@123";

  const adminExists = await User.findOne({ email });
  if (!adminExists) {
    await User.create({
      name: "Blood Bank Admin",
      email,
      password,
      phone: "1800-BLOOD",
      role: "admin"
    });
    console.log(`Default admin created: ${email}`);
  }

  for (const group of BLOOD_GROUPS) {
    await Inventory.findOneAndUpdate(
      { bloodGroup: group },
      { $setOnInsert: { bloodGroup: group, units: 0, lowStockThreshold: LOW_STOCK_THRESHOLD } },
      { upsert: true }
    );
  }
}

module.exports = bootstrap;
