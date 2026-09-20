function ensureAuth(req, res, next) {
  if (req.session && req.session.user) return next();
  req.flash("error", "Please log in to continue.");
  res.redirect("/auth/login");
}

function ensureGuest(req, res, next) {
  if (req.session && req.session.user) {
    return res.redirect(req.session.user.role === "admin" ? "/admin/dashboard" : "/donor/dashboard");
  }
  next();
}

function ensureAdmin(req, res, next) {
  if (req.session && req.session.user && req.session.user.role === "admin") return next();
  req.flash("error", "Admin access only.");
  res.redirect("/auth/login");
}

function ensureDonor(req, res, next) {
  if (req.session && req.session.user && req.session.user.role === "donor") return next();
  req.flash("error", "Donor account required.");
  res.redirect("/auth/login");
}

module.exports = { ensureAuth, ensureGuest, ensureAdmin, ensureDonor };
