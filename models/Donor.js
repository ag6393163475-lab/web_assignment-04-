const mongoose = require("mongoose");
const { BLOOD_GROUPS, isEligible, nextEligibleDate, daysSince } = require("../utils/blood");

const donorSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    bloodGroup: { type: String, enum: BLOOD_GROUPS, required: true },
    lastDonationDate: { type: Date, default: null },
    age: { type: Number, min: 18, max: 65, required: true },
    gender: { type: String, enum: ["Female", "Male", "Other"], required: true },
    city: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    donationCount: { type: Number, default: 0, min: 0 }
  },
  { timestamps: true }
);

donorSchema.virtual("eligible").get(function eligible() {
  return isEligible(this.lastDonationDate);
});

donorSchema.virtual("daysUntilEligible").get(function daysUntilEligible() {
  if (isEligible(this.lastDonationDate)) return 0;
  return Math.max(0, 90 - daysSince(this.lastDonationDate));
});

donorSchema.virtual("nextEligibleOn").get(function nextEligibleOn() {
  return nextEligibleDate(this.lastDonationDate);
});

donorSchema.set("toObject", { virtuals: true });
donorSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Donor", donorSchema);
