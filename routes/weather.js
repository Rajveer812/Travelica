const express = require("express");
const axios = require("axios");
const router = express.Router();

router.post("/weather-summary", async (req, res) => {
  const { lat, lng, location } = req.body;

  if (!lat || !lng) {
    return res.json({
      summary: "Enable location to see today's travel tips."
    });
  }

  try {
    // 1️⃣ Get weather
    const weatherRes = await axios.get(
      "https://api.openweathermap.org/data/2.5/weather",
      {
        params: {
          lat,
          lon: lng,
          units: "metric",
          appid: process.env.WEATHER_API_KEY
        }
      }
    );

    const temp = Math.round(weatherRes.data.main.temp);
    const condition = weatherRes.data.weather[0].main;

    // 2️⃣ Simple smart summary logic (fast & reliable)
    let tip = "";

    if (condition.includes("Rain")) {
      tip = "Carry an umbrella and prefer indoor places.";
    } else if (temp >= 35) {
      tip = "Avoid afternoon outings; evenings are better.";
    } else if (temp <= 18) {
      tip = "Cool weather — great for sightseeing.";
    } else {
      tip = "Perfect time for outdoor exploration.";
    }

    const summary = `${condition}, ${temp}°C — ${tip}`;

    res.json({ summary });
  } catch (err) {
    console.error("Weather summary error:", err.message);
    res.json({
      summary: "Unable to fetch weather right now."
    });
  }
});



module.exports = router;
