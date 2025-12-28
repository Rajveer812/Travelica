const express = require("express");
const axios = require("axios");
const router = express.Router();

/**
 * 🔹 PLACE SUMMARY (for nearby cards)
 */
router.post("/api/place-summary", async (req, res) => {
  const { name, location, category } = req.body;

  if (!name) return res.json({ summary: "" });

  const prompt =
    category === "food"
      ? `
You are a local food expert.
Place: ${name}
City: ${location || "Udaipur"}
Write ONE sentence of 20–25 words about cuisine, vibe, and best time to visit.
`
      : `
You are a local travel guide.
Place: ${name}
City: ${location || "Udaipur"}
Write ONE sentence of 20–25 words about what it is famous for and best time to visit.
`;

  try {
    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        contents: [{ role: "user", parts: [{ text: prompt }] }]
      },
      { params: { key: process.env.GEMINI_API_KEY } }
    );

    const summary =
      response.data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    res.json({ summary: summary.trim() });
  } catch (err) {
    console.error("Place summary error:", err.message);
    res.json({ summary: "" });
  }
});

/**
 * 🔹 AI CHAT
 */
/**
 * 🔹 AI CHAT (LOCATION-AWARE)
 */
router.post("/api/ai/chat", async (req, res) => {
  const { message, city, lat, lng } = req.body;

  if (!message) return res.json({ reply: "" });

  const systemContext = `
You are Travelica AI, a smart local travel assistant.

User is currently in:
City: ${city || "Udaipur"}
Latitude: ${lat || "unknown"}
Longitude: ${lng || "unknown"}

IMPORTANT RULES:
- Treat phrases like "near me", "around me", "nearby" as referring to the user's current city.
- DO NOT ask for user's location again.
- Answer like a local guide who already knows the city.
- Be concise, practical, and helpful.
`;

  const prompt = `
${systemContext}

User question:
"${message}"
`;

  try {
    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        contents: [
          { role: "user", parts: [{ text: prompt }] }
        ]
      },
      { params: { key: process.env.GEMINI_API_KEY } }
    );

    const reply =
      response.data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    res.json({ reply: reply.trim() });
  } catch (err) {
    console.error("AI chat error:", err.message);
    res.json({ reply: "AI is unavailable right now." });
  }
});


/**
 * 🔹 AI TRAVEL PLAN
 */
router.post("/api/ai/plan", async (req, res) => {
  const { location, days, budget, interests, pace } = req.body;

  const prompt = `
You are a professional travel planner.

City: ${location || "Udaipur"}
Days: ${days || 1}
Budget: ${budget || "Moderate"}
Interests: ${interests || "Sightseeing"}
Pace: ${pace || "Relaxed"}

Create a DAY-WISE travel plan in Markdown.
For each day:
- ## Day X
- One-line summary
- A table with:
  Time | Activity | Location | Tips
`;

  try {
    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        contents: [{ role: "user", parts: [{ text: prompt }] }]
      },
      { params: { key: process.env.GEMINI_API_KEY } }
    );

    const plan =
      response.data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    res.json({ plan: plan.trim() });
  } catch (err) {
    console.error("AI plan error:", err.message);
    res.json({ plan: "" });
  }
});

/**
 * 🔹 TODAY INSIGHT (Crowd + Best Now)
 */
router.post("/api/ai/today-insight", async (req, res) => {
  const { city, weather, hour, isWeekend } = req.body;

  const prompt = `
You are a smart local travel assistant.

City: ${city}
Current weather: ${weather}
Time: ${hour}:00
Day: ${isWeekend ? "Weekend" : "Weekday"}

Return TWO short lines:
1) Best activity right now
2) Crowd tip

Format STRICTLY as:
Best: <text>
Crowd: <text>

Keep each line under 12 words.
`;

  try {
    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        contents: [{ role: "user", parts: [{ text: prompt }] }]
      },
      { params: { key: process.env.GEMINI_API_KEY } }
    );

    const text =
      response.data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    const best =
      text.match(/Best:\s*(.*)/)?.[1] || "Explore nearby attractions";
    const crowd =
      text.match(/Crowd:\s*(.*)/)?.[1] || "Moderate crowds expected";

    res.json({ best, crowd });
  } catch (err) {
    console.error("Today insight error:", err.message);
    res.json({
      best: "Lakes and viewpoints are ideal now",
      crowd: "Visit popular spots early morning"
    });
  }
});




module.exports = router;
