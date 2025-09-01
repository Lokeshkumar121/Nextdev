const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const bodyParser = require("body-parser");

const port = process.env.PORT || 3000;
const dotenv = require("dotenv");
dotenv.config();

app.use(session({
  secret: "admin_secret_key",
  resave: false,
  saveUninitialized: false
}));

  mongoose.connect(process.env.DB_CONNECT, {
    })
    .then(() => {
        console.log("✅ Connected to MongoDB");
    })
    .catch((err) => {
        console.error("❌ Failed to connect:", err.message);
    });


    const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  message: String,
  date: {
    type: Date,
    default: Date.now
  }
});

const Contact = mongoose.model("Contact", contactSchema);
app.use(express.json());
app.post("/api/contact", async (req, res) => {
  const { name, email, phone, message } = req.body;

  try {
    const newContact = new Contact({ name, email, phone, message });
    await newContact.save();

    res.status(200).json({
      success: true,
      message: "From Succesfully Sent",
    });
  } catch (err) {
    console.error("Error saving to DB:", err);
    res.status(500).json({
      success: false,
      message: "Server error. Could not save message.",
    });
  }
});

// Serve all static files from public folder (css, js, images, etc.)

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Set view engine to ejs
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

// Admin credentials
const adminUser = {
  username: "Lokesh",
  password: "Lokesh@4321"
};

// Middleware to protect /admin
function adminAuth(req, res, next) {
  if (req.session.isAdmin) {
    return next();
  }
  res.redirect("/admin/login");
}

app.get("/admin/login", (req, res) => {
  res.render("login", { error: null });
});
app.post("/admin/login", (req, res) => {
  const { username, password } = req.body;
  if (username === adminUser.username && password === adminUser.password) {
    req.session.isAdmin = true;
    res.redirect("/admin");
  } else {
    res.render("login", { error: "Invalid credentials!" });
  }
});
app.get('/admin/logout', (req, res) => {
  res.set('WWW-Authenticate', 'Basic realm="Admin Area"');
  res.status(401).redirect('/');  // Forces browser to clear login + redirects to home
});


app.get("/admin", adminAuth, async (req, res) => {
  const contacts = await Contact.find();
  res.render("admin", {
    message: "Admin dashboard here",
    contacts: contacts
  });
});

// Route for home page
app.get("/", (req, res) => {
  res.render("home.ejs");
});
app.get("/about" , (req , res) => {
    res.render("about.ejs");
})
app.get("/course" , (req , res)=>{
  res.render("Course.ejs");
})
app.get("/contact" , (req , res)=>{
  res.render("contact.ejs");
})
app.get("/admin", async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ date: -1 }); // latest first
    res.render("admin", { contacts });
  } catch (err) {
    res.status(500).send("Error fetching data");
  }
});
app.use('/admin', (req, res, next) => {
  const auth = { login: 'Lokesh', password: 'Lokesh@4321' };

  const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
  const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':');

  if (login === auth.login && password === auth.password) {
    return next();
  }

  res.set('WWW-Authenticate', 'Basic realm="Admin Area"');
  res.status(401).send('Authentication required.');
});
app.get("/admin", async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ date: -1 });
    res.render("admin", { contacts });
  } catch (err) {
    res.status(500).send("Error fetching data");
  }
});
app.get("/webwork" , (req , res)=>{
  res.render("webwork.ejs");
  })
  app.get("/roadmap" , (req , res)=>{
  res.render("roadmap.ejs");
  })
  app.get("/liveeg" , (req , res)=>{
    res.render("liveeg.ejs");
  })
  app.get("/enroll" , (req , res)=>{
    res.render("enrol.ejs");
  })
app.get("/lokesh" , (req , res)=>{
  res.render("lokesh.ejs");
  })
  app.get("/manish" , (req , res)=>{
    res.render("manish.ejs");
  })
  app.get("/naresh" , (req , res)=>{
    res.render("naresh.ejs");
  })
  app.get("/network" , (req , res)=>{
    res.render("network.ejs");
  })
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

