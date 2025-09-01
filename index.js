const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const bodyParser = require("body-parser");
const cors = require("cors");
app.use(cors());
const dotenv = require("dotenv");

dotenv.config();
const port = process.env.PORT || 10000;
app.use(cors({
  origin: ['https://nextdev.onrender.com', 'http://localhost:3000'],
  credentials: true
}));

// ---------- Middlewares ----------
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "admin_secret_key",
    resave: false,
    saveUninitialized: false,
  })
);

// ---------- Database ----------
mongoose
  .connect(process.env.DB_CONNECT)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ Failed to connect:", err.message),
  console.log("❌ Connection String:", process.env.DB_CONNECT)
);

// ---------- Schema ----------
const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  message: String,
  date: { type: Date, default: Date.now },
});

const Contact = mongoose.model("Contact", contactSchema);

// ---------- Contact API ----------
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    const newContact = new Contact({ name, email, phone, message });
    await newContact.save();

    res.status(200).json({
      success: true,
      message: "Form successfully sent",
    });
  } catch (err) {
    console.error("❌ Error saving to DB:", err);
    res.status(500).json({
      success: false,
      message: "Server error. Could not save message.",
    });
  }
});

// ---------- Views ----------
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

// ---------- Admin Auth ----------
const adminUser = {
  username: "Lokesh",
  password: "Lokesh@4321",
};

function adminAuth(req, res, next) {
  if (req.session.isAdmin) return next();
  res.redirect("/admin/login");
}

// ---------- Routes ----------
// Public pages
app.get("/", (req, res) => res.render("home"));
app.get("/about", (req, res) => res.render("about"));
app.get("/course", (req, res) => res.render("course"));
app.get("/contact", (req, res) => res.render("contact"));
app.get("/webwork", (req, res) => res.render("webwork"));
app.get("/roadmap", (req, res) => res.render("roadmap"));
app.get("/liveeg", (req, res) => res.render("liveeg"));
app.get("/enroll", (req, res) => res.render("enrol"));
app.get("/lokesh", (req, res) => res.render("lokesh"));
app.get("/manish", (req, res) => res.render("manish"));
app.get("/naresh", (req, res) => res.render("naresh"));
app.get("/network", (req, res) => res.render("network"));

// Admin login/logout
app.get("/admin/login", (req, res) => res.render("login", { error: null }));
app.post("/admin/login", (req, res) => {
  const { username, password } = req.body;
  if (username === adminUser.username && password === adminUser.password) {
    req.session.isAdmin = true;
    return res.redirect("/admin");
  }
  res.render("login", { error: "Invalid credentials!" });
});
app.get("/admin/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/admin/login"));
});

// Admin dashboard
app.get("/admin", adminAuth, async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ date: -1 });
    res.render("admin", { contacts });
  } catch (err) {
    console.error("❌ Error fetching contacts:", err);
    res.status(500).send("Error fetching data");
  }
});

// ---------- Server ----------
app.listen(port, () => {
  console.log(`🚀 Server is running at http://localhost:${port}`);
});
