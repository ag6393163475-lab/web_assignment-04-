const Donor = require("../models/Donor");
const BloodRequest = require("../models/BloodRequest");
const { formatDate, isEligible, nextEligibleDate, daysSince } = require("../utils/blood");

exports.dashboard = async (req, res) => {
  const donor = await Donor.findOne({ user: req.session.user.id }).populate("user").lean({ virtuals: true });
  if (!donor) {
    req.flash("error", "Donor profile not found.");
    return res.redirect("/");
  }

  const myRequests = await BloodRequest.find({ requestedBy: req.session.user.id })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  const eligible = isEligible(donor.lastDonationDate);
  res.render("pages/donor-dashboard", {
    title: "Donor Dashboard",
    donor,
    myRequests,
    eligible,
    nextEligibleOn: formatDate(nextEligibleDate(donor.lastDonationDate)),
    daysUntilEligible: eligible ? 0 : Math.max(0, 90 - daysSince(donor.lastDonationDate)),
    formatDate
  });
};

exports.updateProfile = async (req, res) => {
  try {
    const { phone, city, address, lastDonationDate } = req.body;
    await require("../models/User").findByIdAndUpdate(req.session.user.id, { phone });
    await Donor.findOneAndUpdate(
      { user: req.session.user.id },
      { city, address, lastDonationDate: lastDonationDate || null }
    );
    req.flash("success", "Profile updated.");
    res.redirect("/donor/dashboard");
  } catch (err) {
    console.error(err);
    req.flash("error", "Could not update profile.");
    res.redirect("/donor/dashboard");
  }
};
