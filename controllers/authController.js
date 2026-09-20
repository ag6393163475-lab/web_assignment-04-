const User = require("../models/User");
const Donor = require("../models/Donor");
const { BLOOD_GROUPS } = require("../utils/blood");

exports.showRegister = (req, res) => {
  res.render("pages/register", {
    title: "Donor Registration",
    bloodGroups: BLOOD_GROUPS
  });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, bloodGroup, lastDonationDate, age, gender, city, address } = req.body;

    if (!name || !email || !password || !bloodGroup || !age || !gender || !city) {
      req.flash("error", "Please fill in all required fields.");
      return res.redirect("/auth/register");
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      req.flash("error", "An account with that email already exists.");
      return res.redirect("/auth/register");
    }

    const user = await User.create({ name, email, password, phone, role: "donor" });
    await Donor.create({
      user: user._id,
      bloodGroup,
      lastDonationDate: lastDonationDate || null,
      age,
      gender,
      city,
      address
    });

    req.session.user = { id: user._id, name: user.name, email: user.email, role: user.role };
    req.flash("success", "Welcome. Your donor profile is ready.");
    res.redirect("/donor/dashboard");
  } catch (err) {
    console.error(err);
    req.flash("error", "Registration failed. Check your details and try again.");
    res.redirect("/auth/register");
  }
};

exports.showLogin = (req, res) => {
  res.render("pages/login", { title: "Sign in" });
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || "").toLowerCase() });
    if (!user || !(await user.matchPassword(password || ""))) {
      req.flash("error", "Invalid email or password.");
      return res.redirect("/auth/login");
    }

    req.session.user = { id: user._id, name: user.name, email: user.email, role: user.role };
    req.flash("success", `Signed in as ${user.name}.`);
    res.redirect(user.role === "admin" ? "/admin/dashboard" : "/donor/dashboard");
  } catch (err) {
    console.error(err);
    req.flash("error", "Login failed. Try again.");
    res.redirect("/auth/login");
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
};
