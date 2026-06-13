const express = require("express");
const router = express.Router({});
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl, isLoggedIn } = require("../middleware.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js"); // ✅ import
const upload = multer({ storage });               // ✅ define

const userController = require("../controllers/users.js");

router.route("/signup")
  .get(userController.renderSignupForm)
  .post(wrapAsync(userController.signup));

router.route("/login")
  .get(userController.renderloginForm)
  .post(
    saveRedirectUrl,
    passport.authenticate("local", { failureRedirect: "/login", failureFlash: true }),
    userController.login,
  );

router.get("/logout", userController.logout);
router.get("/profile", isLoggedIn, userController.renderProfile);
router.get("/profile/edit", isLoggedIn, userController.renderEditProfile);

// ✅ Sirf EK baar — multer ke saath
router.put("/profile/edit", isLoggedIn, upload.single("profileImage"), wrapAsync(userController.updateProfile));
router.put("/profile/change-password", isLoggedIn, wrapAsync(userController.changePassword));

module.exports = router;