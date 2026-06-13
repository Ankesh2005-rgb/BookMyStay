const User = require("../models/user");

module.exports.renderSignupForm = (req, res) => {
  res.render("users/signup.ejs");
};

module.exports.signup = async (req, res) => {
  try {
    let { username, email, password } = req.body;
    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);
    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome to BookMyStay");
      res.redirect("/listings");
    });
  } catch (err) {
    req.flash("error", err.message);
    res.redirect("/signup");
  }
};

module.exports.renderloginForm = (req, res) => {
  res.render("users/login.ejs");
};

module.exports.login = async (req, res) => {
  req.flash("success", "Welcome to BookMyStay! You are logged in.");
  let redirectUrl = res.locals.redirectUrl || "/listings";
  res.redirect(redirectUrl);
};

module.exports.logout = (req, res) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash("success", "you are logged out!");
    res.redirect("/listings");
  });
};

// ✅ Yeh 4 functions add karo

module.exports.renderProfile = (req, res) => {
  res.render("users/profile.ejs");
};

module.exports.renderEditProfile = (req, res) => {
  res.render("users/editProfile.ejs", {
    success: req.flash("success"),
    error: req.flash("error"),
  });
};

module.exports.updateProfile = async (req, res) => {
  const { username, email } = req.body;

  // ✅ Email unique check
  const existingUser = await User.findOne({ email });
  if (existingUser && !existingUser._id.equals(req.user._id)) {
    req.flash("error", "Yeh email already kisi aur ka hai.");
    return res.redirect("/profile/edit");
  }

  const updateData = { username, email };

  // ✅ Photo upload hua toh save karo
  if (req.file) {
    updateData.profileImage = {
      url: req.file.path,
      filename: req.file.filename,
    };
  }

  await User.findByIdAndUpdate(req.user._id, updateData, { new: true });
  req.flash("success", "Profile update ho gaya!");
  res.redirect("/profile/edit");
};

module.exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  if (newPassword !== confirmPassword) {
    req.flash("error", "Passwords do not match.");
    return res.redirect("/profile/edit");
  }
  const user = await User.findById(req.user._id);
  await user.changePassword(currentPassword, newPassword);
  req.flash("success", "Password changed!");
  res.redirect("/profile/edit");
};