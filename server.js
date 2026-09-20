require("dotenv").config();
const path = require("path");
const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const methodOverride = require("method-override");
const connectDB = require("./config/db");
const bootstrap = require("./config/bootstrap");
const { BLOOD_GROUPS, formatDate } = require("./utils/blood");

const indexRoutes = require("./routes/index");
const authRoutes = require("./routes/auth");
const donorRoutes = require("./routes/donor");
const adminRoutes = require("./routes/admin");

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));

if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI is missing in .env. Use: MONGODB_URI=mongodb+srv://...");
  process.exit(1);
}

app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret-change-me",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      ttl: 60 * 60 * 24 * 7
    }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 }
  })
);
app.use(flash());

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.bloodGroups = BLOOD_GROUPS;
  res.locals.formatDate = formatDate;
  next();
});

app.use("/", indexRoutes);
app.use("/auth", authRoutes);
app.use("/donor", donorRoutes);
app.use("/admin", adminRoutes);

app.use((req, res) => {
  res.status(404).render("pages/error", {
    title: "Page not found",
    message: "That page does not exist."
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render("pages/error", {
    title: "Server error",
    message: "Something went wrong. Please try again."
  });
});

connectDB()
  .then(() => bootstrap())
  .then(() => {
    app.listen(PORT, () => {
      console.log(`LifeLine Blood Bank running at http://localhost:${PORT}`);
    });``
  })
  .catch((err) => {
    console.error("Failed to start:", err.message);
    process.exit(1);
  });
