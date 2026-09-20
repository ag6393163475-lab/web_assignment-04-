const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { ensureAdmin } = require("../middleware/auth");

router.use(ensureAdmin);

router.get("/dashboard", adminController.dashboard);
router.get("/donors", adminController.listDonors);
router.post("/donors/:id/donate", adminController.recordDonation);
router.delete("/donors/:id", adminController.deleteDonor);
router.get("/inventory", adminController.inventory);
router.put("/inventory/:id", adminController.updateInventory);
router.get("/requests", adminController.listRequests);
router.put("/requests/:id", adminController.updateRequestStatus);

module.exports = router;
