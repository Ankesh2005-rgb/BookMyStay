const Booking = require("../models/booking");
const Listing = require("../models/listing");

// Booking create karo
module.exports.createBooking = async (req, res) => {
  const { id } = req.params;
  const { checkIn, checkOut } = req.body;

  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing nahi mili!");
    return res.redirect("/listings");
  }

  // Dates calculate karo
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  // Validation
  if (checkInDate >= checkOutDate) {
    req.flash("error", "Check-out date, check-in se baad honi chahiye!");
    return res.redirect(`/listings/${id}`);
  }

  if (checkInDate < new Date()) {
    req.flash("error", "Check-in date past mein nahi ho sakti!");
    return res.redirect(`/listings/${id}`);
  }

  // Conflict check — kya yeh dates already booked hain?
  const conflict = await Booking.findOne({
    listing: id,
    status: { $ne: "cancelled" },
    $or: [
      { checkIn: { $lt: checkOutDate }, checkOut: { $gt: checkInDate } }
    ]
  });

  if (conflict) {
    req.flash("error", "Yeh dates already booked hain! Doosri dates choose karo.");
    return res.redirect(`/listings/${id}`);
  }

  // Total nights aur price
  const totalNights = Math.ceil(
    (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)
  );
  const totalPrice = totalNights * listing.price;

  // Booking save karo
  const newBooking = new Booking({
    listing: id,
    user: req.user._id,
    checkIn: checkInDate,
    checkOut: checkOutDate,
    totalNights,
    totalPrice,
  });

  await newBooking.save();

  req.flash("success", `Booking confirmed! ${totalNights} nights — ₹${totalPrice.toLocaleString("en-IN")}`);
  res.redirect(`/bookings/my-bookings`);
};

// My bookings page
module.exports.myBookings = async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate("listing")
    .sort({ createdAt: -1 });

  res.render("bookings/my-bookings", { bookings });
};

// Host ki listings ki saari bookings
module.exports.hostBookings = async (req, res) => {
  const bookings = await Booking.find()
    .populate({
      path: "listing",
      populate: { path: "owner" }
    })
    .populate("user")
    .sort({ createdAt: -1 });

  const myListingBookings = bookings.filter(
    b => b.listing && b.listing.owner && 
    b.listing.owner._id.toString() === req.user._id.toString()
  );

  res.render("bookings/host-bookings", { bookings: myListingBookings });
};