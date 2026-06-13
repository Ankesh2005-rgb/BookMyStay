require("dotenv").config();

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const bookingRouter = require("./routes/booking");

// Routers
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const dbUrl = process.env.ATLASDB_URL;



main()
  .then(() => {
    console.log("connected to db");
  })
  .catch((err) => {
    console.log(err);
  });
async function main() {
  await mongoose.connect(dbUrl);
}

// View Engine
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", (err) => {
  console.log("ERROR in MONGO SESSION STORE", err);
});

// Session
const sessionOption = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOption));
app.use(flash());

// Passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Flash + user
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// ================= ROUTES =================

// Root
app.get("/", (req, res) => {
  res.redirect("/listings");
});

// Main Routes
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/listings/:id/bookings", bookingRouter);  // ← yahan
app.use("/bookings", bookingRouter);
app.use("/", userRouter);

app.get("/profile", (req, res) => {
    if(!req.user){
        req.flash("error", "Pehle login karo!");
        return res.redirect("/login");
    }
    res.render("users/profile");
});

// Static pages
app.get("/privacy", (req, res) => {
  res.render("privacy.ejs");
});

app.get("/terms", (req, res) => {
  res.render("terms.ejs");
});

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash"
});

    const result = await model.generateContent(`
      You are BookMyStay Assistant.

      Rules:
      - Reply in Hinglish.
      - Help with hotels, stays, travel and bookings.
      - Be friendly and short.

      User: ${message}
    `);

    const reply = result.response.text();

    res.json({ reply });
  } catch (err) {
    console.log(err);
    res.json({
      reply: "Sorry! Chatbot abhi available nahi hai.",
    });
  }
});

// ================= 404 =================
app.use((req, res, next) => {
  next(new ExpressError(404, "Page not found"));
});

// ================= ERROR HANDLER =================
app.use((err, req, res, next) => {
  let { statusCode = 500 } = err;
  res.status(statusCode).render("listings/error.ejs", { err });
});

// Server
app.listen(8080, () => {
  console.log("server is listening to port 8080");
});
