const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { ensureGuest } = require("../middleware/auth");

router.get("/register", ensureGuest, authController.showRegister);
router.post("/register", ensureGuest, authController.register);
router.get("/login", ensureGuest, authController.showLogin);
router.post("/login", ensureGuest, authController.login);
router.post("/logout", authController.logout);

module.exports = router;
