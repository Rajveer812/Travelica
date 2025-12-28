const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.render("pages/home");
});

router.get("/nearby", (req, res) => {
  const showAll = req.query.all === "true";

  const places = [
    {
      name: "City Palace",
      image: "/images/city-palace.jpg",
      desc: "Historic royal palace with lake views.",
      lat: 24.5765,
      lng: 73.6835,
      distance: "1.2 km"
    },
    {
      name: "Fateh Sagar Lake",
      image: "/images/fateh-sagar.jpg",
      desc: "Peaceful lake perfect for evening walks.",
      lat: 24.5942,
      lng: 73.7125,
      distance: "0.8 km"
    },
    {
      name: "Jag Mandir",
      image: "/images/jag-mandir.jpg",
      desc: "Island palace known for sunsets.",
      lat: 24.5687,
      lng: 73.6844,
      distance: "1.4 km"
    },
    {
      name: "Sajjangarh (Monsoon Palace)",
      image: "/images/sajjangarh.jpg",
      desc: "Hilltop palace with panoramic views.",
      lat: 24.5965,
      lng: 73.6425,
      distance: "4.5 km"
    },
    {
      name: "Jagdish Temple",
      image: "/images/jagdish.jpg",
      desc: "Famous 17th-century Hindu temple.",
      lat: 24.5772,
      lng: 73.6828,
      distance: "1.1 km"
    },
    {
      name: "Saheliyon Ki Bari",
      image: "/images/saheliyon.jpg",
      desc: "Beautiful garden with fountains.",
      lat: 24.5981,
      lng: 73.7113,
      distance: "2.3 km"
    },
    {
      name: "Bagore Ki Haveli",
      image: "/images/bagore.jpg",
      desc: "Traditional haveli with cultural shows.",
      lat: 24.5769,
      lng: 73.6815,
      distance: "1.3 km"
    }
  ];

  res.render("pages/nearby", {
    places,
    showAll
  });
});



router.get("/chat", (req, res) => {
  res.render("pages/chat");
});

router.get("/plan", (req, res) => {
  res.render("pages/plan");
});





module.exports = router;
