const express = require("express");
const axios = require("axios");
const router = express.Router();

/**
 * 🔹 Get nearby places using Google Places API
 */
router.post("/api/nearby", async (req, res) => {
  const { lat, lng, category, nextPageToken } = req.body;

  if (!lat || !lng) {
    return res.json({ places: [], nextPageToken: null });
  }

  // ✅ Correct type usage
  const type = category === "food" ? "restaurant" : "point_of_interest";

  try {
    const params = {
      location: `${lat},${lng}`,
      radius: 6000,
      type,
      keyword:
        category === "food"
          ? "restaurant cafe food"
          : "lake ghat garden palace hill sunset viewpoint park",
      key: process.env.MAPS_API_KEY,
    };

    // 🔁 Pagination
    if (nextPageToken) {
      params.pagetoken = nextPageToken;
    }

    const response = await axios.get(
      "https://maps.googleapis.com/maps/api/place/nearbysearch/json",
      { params }
    );

    let results = response.data.results || [];

    /* ===============================
       🚫 BLOCK SERVICE / TAXI PLACES
    =============================== */
    const blockedKeywords = [
      "taxi",
      "cab",
      "travel",
      "tour",
      "agency",
      "rent",
      "rental",
      "service",
      "booking",
      "transport",
      "driver",
    ];

    results = results.filter((p) => {
      const text = (p.name + " " + (p.vicinity || "")).toLowerCase();
      return !blockedKeywords.some((k) => text.includes(k));
    });

    /* ===============================
       🌿 PICNIC / SIGHTSEEING LOGIC
    =============================== */
    if (category !== "food") {
      const mustInclude = [
        "fateh sagar",
        "badi lake",
        "gangaur ghat",
        "dudh talai",
        "lake pichola",
        "saheliyon",
        "gulab bagh",
        "monsoon palace",
        "sajjangarh",
      ];

      results = results.filter((p) => {
        const text = (p.name + " " + (p.vicinity || "")).toLowerCase();

        // ⭐ Always include famous landmarks
        if (mustInclude.some((k) => text.includes(k))) return true;

        // 🌿 Otherwise allow nature keywords
        return [
          "lake",
          "garden",
          "park",
          "hill",
          "view",
          "talai",
          "dam",
          "sunset",
          "nature",
          "water",
          "ghat",
          "viewpoint",
        ].some((k) => text.includes(k));
      });
    }

    /* ===============================
       🍽️ FOOD FILTER
    =============================== */
    if (category === "food") {
      results = results.filter(
        (p) => p.rating && p.rating >= 3.8
      );
    }

    /* ===============================
       ✅ FINAL MAP
    =============================== */
    const places = results.map((p) => ({
      placeId: p.place_id, // 🔑 important for dedupe
      name: p.name,
      lat: p.geometry.location.lat,
      lng: p.geometry.location.lng,
      rating: p.rating || null,
      photo:
      p.photos && p.photos.length > 0 && p.photos[0].photo_reference
        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=600&photo_reference=${encodeURIComponent(
        p.photos[0].photo_reference
        )}&key=${process.env.MAPS_API_KEY}`
        : category === "food"
        ? "/images/default-food.jpg"
        : "/images/default-place.jpg",
    }));

    res.json({
      places,
      nextPageToken: response.data.next_page_token || null,
    });
  } catch (err) {
    console.error("Nearby API error:", err.message);
    res.json({ places: [], nextPageToken: null });
  }
});

/**
 * 🔹 Get ETA + distance
 */
router.post("/api/route-info", async (req, res) => {
  const { fromLat, fromLng, toLat, toLng } = req.body;

  if (!fromLat || !fromLng || !toLat || !toLng) {
    return res.json({ distance: "", duration: "" });
  }

  try {
    const response = await axios.get(
      "https://maps.googleapis.com/maps/api/directions/json",
      {
        params: {
          origin: `${fromLat},${fromLng}`,
          destination: `${toLat},${toLng}`,
          mode: "driving",
          key: process.env.MAPS_API_KEY,
        },
      }
    );

    const leg = response.data.routes[0].legs[0];

    res.json({
      distance: leg.distance.text,
      duration: leg.duration.text,
    });
  } catch (err) {
    console.error("Route info error:", err.message);
    res.json({ distance: "", duration: "" });
  }
});

module.exports = router;
