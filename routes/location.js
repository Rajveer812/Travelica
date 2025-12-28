const express = require("express");
const axios = require("axios");
const router = express.Router();

router.post("/reverse-geocode", async (req, res) => {
  const { lat, lng } = req.body;

  try {
    const geoRes = await axios.get(
      "https://nominatim.openstreetmap.org/reverse",
      {
        params: {
          lat,
          lon: lng,
          format: "json",
        },
        headers: {
          "User-Agent": "Travelica-App",
        },
      }
    );

    const address = geoRes.data.address || {};
    const city =
      address.city || address.town || address.village || "Unknown city";

    const area =
      address.suburb || address.neighbourhood || address.road || city;

    res.json({
      city,
      area,
    });
  } catch (err) {
    console.error(err.message);
    res.json({ place: "Unknown location" });
  }
});

module.exports = router;
