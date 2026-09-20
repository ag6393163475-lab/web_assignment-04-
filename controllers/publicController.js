const Inventory = require("../models/Inventory");
const BloodRequest = require("../models/BloodRequest");
const { BLOOD_GROUPS } = require("../utils/blood");

exports.home = async (req, res) => {
  const stock = await Inventory.find().sort({ bloodGroup: 1 }).lean({ virtuals: true });
  const emergencyCount = await BloodRequest.countDocuments({
    status: { $in: ["Pending", "Processing"] },
    urgency: "Emergency"
  });
  res.render("pages/home", {
    title: "LifeLine Blood Bank",
    stock,
    emergencyCount,
    bloodGroups: BLOOD_GROUPS
  });
};

exports.search = async (req, res) => {
  const group = req.query.group;
  const query = group && BLOOD_GROUPS.includes(group) ? { bloodGroup: group } : {};
  const stock = await Inventory.find(query).sort({ bloodGroup: 1 }).lean({ virtuals: true });
  res.render("pages/search", {
    title: "Search Blood Inventory",
    stock,
    selected: group || "",
    bloodGroups: BLOOD_GROUPS
  });
};

exports.showRequestForm = (req, res) => {
  res.render("pages/request-form", {
    title: "Emergency Blood Request",
    bloodGroups: BLOOD_GROUPS,
    selectedGroup: req.query.group || ""
  });
};

exports.submitRequest = async (req, res) => {
  try {
    const { requesterName, phone, hospital, city, bloodGroup, unitsNeeded, urgency, notes } = req.body;
    if (!requesterName || !phone || !hospital || !city || !bloodGroup || !unitsNeeded) {
      req.flash("error", "Please complete every required field.");
      return res.redirect("/requests/new");
    }

    await BloodRequest.create({
      requesterName,
      phone,
      hospital,
      city,
      bloodGroup,
      unitsNeeded,
      urgency: urgency || "Emergency",
      notes,
      requestedBy: req.session.user ? req.session.user.id : undefined
    });

    req.flash("success", "Request submitted. The blood bank will review it shortly.");
    res.redirect(req.session.user ? (req.session.user.role === "admin" ? "/admin/requests" : "/donor/dashboard") : "/");
  } catch (err) {
    console.error(err);
    req.flash("error", "Could not submit the request.");
    res.redirect("/requests/new");
  }
};
