const express = require("express");
const router = express.Router();
const publicController = require("../controllers/publicController");

router.get("/", publicController.home);
router.get("/search", publicController.search);
router.get("/requests/new", publicController.showRequestForm);
router.post("/requests", publicController.submitRequest);

module.exports = router;
