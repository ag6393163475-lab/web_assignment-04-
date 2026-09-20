const express = require("express");
const router = express.Router();
const donorController = require("../controllers/donorController");
const { ensureDonor } = require("../middleware/auth");

router.get("/dashboard", ensureDonor, donorController.dashboard);
router.post("/profile", ensureDonor, donorController.updateProfile);

module.exports = router;
