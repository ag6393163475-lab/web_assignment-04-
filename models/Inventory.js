const mongoose = require("mongoose");
const { BLOOD_GROUPS, LOW_STOCK_THRESHOLD } = require("../utils/blood");

const inventorySchema = new mongoose.Schema(
  {
    bloodGroup: { type: String, enum: BLOOD_GROUPS, required: true, unique: true },
    units: { type: Number, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: LOW_STOCK_THRESHOLD, min: 0 }
  },
  { timestamps: true }
);

inventorySchema.virtual("isLowStock").get(function isLowStock() {
  return this.units <= this.lowStockThreshold;
});

inventorySchema.set("toObject", { virtuals: true });
inventorySchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Inventory", inventorySchema);
