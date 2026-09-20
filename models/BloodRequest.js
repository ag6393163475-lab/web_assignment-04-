const mongoose = require("mongoose");
const { BLOOD_GROUPS, REQUEST_STATUSES } = require("../utils/blood");

const bloodRequestSchema = new mongoose.Schema(
  {
    requesterName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    hospital: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    bloodGroup: { type: String, enum: BLOOD_GROUPS, required: true },
    unitsNeeded: { type: Number, required: true, min: 1, max: 20 },
    urgency: { type: String, enum: ["Normal", "Emergency"], default: "Emergency" },
    status: { type: String, enum: REQUEST_STATUSES, default: "Pending" },
    notes: { type: String, trim: true },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    handledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("BloodRequest", bloodRequestSchema);
