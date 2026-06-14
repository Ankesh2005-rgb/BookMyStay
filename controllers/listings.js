const { cloudinary } = require("../cloudConfig");
const Listing = require("../models/listing");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");

const mapToken = process.env.MAPBOX_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

// INDEX — search + category + ratings sab ek saath
module.exports.index = async (req, res) => {
  const { search, category } = req.query;
  let query = {};

  if (search && search.trim() !== "") {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { location: { $regex: search, $options: "i" } },
      { country: { $regex: search, $options: "i" } },
    ];
  }

  if (category && category.trim() !== "") {
    query.category = { $regex: category, $options: "i" };
  }

  const allListings = await Listing.find(query).populate("reviews");

  const listingsWithRating = allListings.map((listing) => {
    let avgRating = 0;
    let totalReviews = listing.reviews.length;
    if (totalReviews > 0) {
      let sum = listing.reviews.reduce((acc, r) => acc + r.rating, 0);
      avgRating = (sum / totalReviews).toFixed(1);
    }
    return { ...listing.toObject(), avgRating, totalReviews };
  });

  res.render("listings/index.ejs", {
    allListings: listingsWithRating,
    search: search || "",
    category: category || "",
  });
};

// NEW FORM
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

// SHOW
module.exports.showListing = async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }

  let avgRating = 0;
  let totalReviews = listing.reviews.length;
  if (totalReviews > 0) {
    let sum = listing.reviews.reduce((acc, r) => acc + r.rating, 0);
    avgRating = (sum / totalReviews).toFixed(1);
  }

  res.render("listings/show.ejs", { listing, avgRating, totalReviews });
};

// CREATE
module.exports.createListing = async (req, res) => {
  let response = await geocodingClient
    .forwardGeocode({ query: req.body.listing.location, limit: 1 })
    .send();

  let url = req.file.path;
  let filename = req.file.filename;

  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };
  newListing.geometry = response.body.features[0].geometry;

  await newListing.save();
  req.flash("success", "New listing created!");
  res.redirect("/listings");
};

// EDIT FORM
module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }
  let originalImageUrl = listing.image.url;
  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

// UPDATE
module.exports.updateListing = async (req, res) => {
  const { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  if (req.file) {
    listing.image = { url: req.file.path, filename: req.file.filename };
    await listing.save();
  }
  req.flash("success", "Listing updated!");
  res.redirect(`/listings/${id}`);
};

// DELETE
module.exports.destoryListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (listing.image && listing.image.filename) {
    await cloudinary.uploader.destroy(listing.image.filename);
  }
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing deleted!");
  res.redirect("/listings");
};