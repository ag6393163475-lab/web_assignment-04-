const Donor = require("../models/Donor");
const Inventory = require("../models/Inventory");
const BloodRequest = require("../models/BloodRequest");
const User = require("../models/User");
const { BLOOD_GROUPS, REQUEST_STATUSES, isEligible, formatDate } = require("../utils/blood");

exports.dashboard = async (req, res) => {
  const stock = await Inventory.find().sort({ bloodGroup: 1 }).lean({ virtuals: true });
  const totalUnits = stock.reduce((sum, item) => sum + item.units, 0);
  const lowStock = stock.filter((item) => item.units <= item.lowStockThreshold);
  const activeRequests = await BloodRequest.countDocuments({ status: { $in: ["Pending", "Processing"] } });
  const donorCount = await Donor.countDocuments();
  const recentRequests = await BloodRequest.find().sort({ createdAt: -1 }).limit(6).lean();

  res.render("pages/admin-dashboard", {
    title: "Blood Bank Dashboard",
    stock,
    totalUnits,
    lowStock,
    activeRequests,
    donorCount,
    recentRequests,
    formatDate
  });
};

exports.listDonors = async (req, res) => {
  const { group, q } = req.query;
  const filter = {};
  if (group && BLOOD_GROUPS.includes(group)) filter.bloodGroup = group;

  let donors = await Donor.find(filter).populate("user").sort({ createdAt: -1 }).lean({ virtuals: true });
  if (q) {
    const term = q.toLowerCase();
    donors = donors.filter(
      (d) =>
        (d.user && d.user.name && d.user.name.toLowerCase().includes(term)) ||
        (d.user && d.user.email && d.user.email.toLowerCase().includes(term)) ||
        (d.city && d.city.toLowerCase().includes(term))
    );
  }

  res.render("pages/admin-donors", {
    title: "Manage Donors",
    donors,
    selected: group || "",
    q: q || "",
    bloodGroups: BLOOD_GROUPS,
    formatDate,
    isEligible
  });
};

exports.recordDonation = async (req, res) => {
  try {
    const donor = await Donor.findById(req.params.id);
    if (!donor) {
      req.flash("error", "Donor not found.");
      return res.redirect("/admin/donors");
    }

    if (!isEligible(donor.lastDonationDate)) {
      req.flash("error", "This donor is not yet eligible (90-day gap required).");
      return res.redirect("/admin/donors");
    }

    donor.lastDonationDate = new Date();
    donor.donationCount += 1;
    await donor.save();

    await Inventory.findOneAndUpdate(
      { bloodGroup: donor.bloodGroup },
      { $inc: { units: 1 } }
    );

    req.flash("success", `Donation recorded for ${donor.bloodGroup}. Inventory +1 unit.`);
    res.redirect("/admin/donors");
  } catch (err) {
    console.error(err);
    req.flash("error", "Could not record donation.");
    res.redirect("/admin/donors");
  }
};

exports.deleteDonor = async (req, res) => {
  try {
    const donor = await Donor.findById(req.params.id);
    if (!donor) {
      req.flash("error", "Donor not found.");
      return res.redirect("/admin/donors");
    }
    await User.findByIdAndDelete(donor.user);
    await donor.deleteOne();
    req.flash("success", "Donor record removed.");
    res.redirect("/admin/donors");
  } catch (err) {
    console.error(err);
    req.flash("error", "Could not delete donor.");
    res.redirect("/admin/donors");
  }
};

exports.inventory = async (req, res) => {
  const stock = await Inventory.find().sort({ bloodGroup: 1 }).lean({ virtuals: true });
  res.render("pages/admin-inventory", {
    title: "Inventory",
    stock
  });
};

exports.updateInventory = async (req, res) => {
  try {
    const { units, lowStockThreshold } = req.body;
    await Inventory.findByIdAndUpdate(req.params.id, {
      units: Math.max(0, Number(units) || 0),
      lowStockThreshold: Math.max(0, Number(lowStockThreshold) || 0)
    });
    req.flash("success", "Inventory updated.");
    res.redirect("/admin/inventory");
  } catch (err) {
    console.error(err);
    req.flash("error", "Could not update inventory.");
    res.redirect("/admin/inventory");
  }
};

exports.listRequests = async (req, res) => {
  const { status } = req.query;
  const filter = status && REQUEST_STATUSES.includes(status) ? { status } : {};
  const requests = await BloodRequest.find(filter).sort({ createdAt: -1 }).lean();
  res.render("pages/admin-requests", {
    title: "Blood Requests",
    requests,
    selected: status || "",
    statuses: REQUEST_STATUSES,
    formatDate
  });
};

exports.updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const request = await BloodRequest.findById(req.params.id);
    if (!request) {
      req.flash("error", "Request not found.");
      return res.redirect("/admin/requests");
    }

    if (status === "Fulfilled" && request.status !== "Fulfilled") {
      const item = await Inventory.findOne({ bloodGroup: request.bloodGroup });
      if (!item || item.units < request.unitsNeeded) {
        req.flash("error", `Not enough ${request.bloodGroup} units in inventory.`);
        return res.redirect("/admin/requests");
      }
      item.units -= request.unitsNeeded;
      await item.save();
    }

    request.status = status;
    request.handledBy = req.session.user.id;
    await request.save();
    req.flash("success", `Request marked as ${status}.`);
    res.redirect("/admin/requests");
  } catch (err) {
    console.error(err);
    req.flash("error", "Could not update request.");
    res.redirect("/admin/requests");
  }
};
