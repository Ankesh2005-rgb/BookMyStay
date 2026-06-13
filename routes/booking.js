const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn } = require("../middleware");
const bookingController = require("../controllers/booking");

// Book karo
router.post("/", isLoggedIn, wrapAsync(bookingController.createBooking));

// Apni saari bookings dekho
router.get("/my-bookings", isLoggedIn, wrapAsync(bookingController.myBookings));

router.get("/host-bookings", isLoggedIn, wrapAsync(bookingController.hostBookings));

module.exports = router;