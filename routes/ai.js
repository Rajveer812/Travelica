const express = require("express");
const axios = require("axios");
const router = express.Router();

/* =========================================================
   🔹 PLACE SUMMARY (Nearby / Food cards)
========================================================= */
router.post("/api/place-summary", async (req, res) => {
  const { name, location, category } = req.body;
  if (!name) return res.json({ summary: "" });

  const prompt =
    category === "food"
      ? `
You are a local food expert.
Place: ${name}
City: ${location || "Udaipur"}
Write ONE sentence (20–25 words) about cuisine, vibe, and best time to visit.
`
      : `
You are a local travel guide.
Place: ${name}
City: ${location || "Udaipur"}
Write ONE sentence (20–25 words) about what it is famous for and best time to visit.
`;

  try {
    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      { contents: [{ role: "user", parts: [{ text: prompt }] }] },
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

/* =========================================================
   🔹 AI CHAT (LOCATION AWARE)
========================================================= */
router.post("/api/ai/chat", async (req, res) => {
  const { message, city, lat, lng } = req.body;
  if (!message) return res.json({ reply: "" });

  const prompt = `
You are Travelica AI, a smart local travel assistant.

User location:
City: ${city || "Udaipur"}
Latitude: ${lat || "unknown"}
Longitude: ${lng || "unknown"}

RULES:
- Treat "near me / nearby" as user's current city
- NEVER ask for location again
- Respond like a local expert
- Be concise and helpful

User question:
"${message}"
`;

  try {
    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      { contents: [{ role: "user", parts: [{ text: prompt }] }] },
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

/* =========================================================
   🔹 AI TRAVEL PLAN (TABLE-LOCKED + FALLBACK)
========================================================= */
router.post("/api/ai/plan", async (req, res) => {
  const { location, days, budget, interests, pace } = req.body;

  const prompt = `
You are a professional travel planner.

City: ${location || "Udaipur"}
Days: ${days || 1}
Budget: ${budget || "Moderate"}
Interests: ${interests || "Sightseeing"}
Pace: ${pace || "Relaxed"}

STRICT RULES (MANDATORY):
- Respond ONLY in MARKDOWN
- DO NOT write paragraphs or bullets
- EVERY day MUST contain a MARKDOWN TABLE
- If table format breaks, response is INVALID

FORMAT (EXACT):

## Day 1
| Time | Activity | Location | Tips |
|------|----------|----------|------|
| ...  | ...      | ...      | ...  |
`;

  try {
    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      { contents: [{ role: "user", parts: [{ text: prompt }] }] },
      { params: { key: process.env.GEMINI_API_KEY } }
    );

    let plan =
      response.data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    /* 🛡️ HARD SAFETY FALLBACK */
    if (!plan.includes("| Time | Activity | Location | Tips |")) {
      plan = `
## Day 1
| Time | Activity | Location | Tips |
|------|----------|----------|------|
| Morning | Explore key attractions | City center | Start early |
| Afternoon | Local food & rest | Popular café | Stay hydrated |
| Evening | Scenic walk | Viewpoint | Best sunset views |
`;
    }

    res.json({ plan: plan.trim() });
  } catch (err) {
    console.error("AI plan error:", err.message);
    res.json({ plan: "" });
  }
});

/* =========================================================
   🔹 TODAY INSIGHT (Dynamic: Best + Crowd)
========================================================= */
router.post("/api/ai/today-insight", async (req, res) => {
  const { city, weather, hour, isWeekend } = req.body;

  const prompt = `
You are a smart local travel assistant.

City: ${city}
Weather: ${weather}
Time: ${hour}:00
Day: ${isWeekend ? "Weekend" : "Weekday"}

Return EXACTLY TWO short lines:
Best: <best activity now>
Crowd: <crowd tip>

Each line must be under 12 words.
`;

  try {
    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      { contents: [{ role: "user", parts: [{ text: prompt }] }] },
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

/**
 * 🔹 RE-GENERATE SINGLE DAY PLAN
 */
router.post("/api/ai/plan/day", async (req, res) => {
  const {
    city,
    dayNumber,
    totalDays,
    budget,
    interests,
    pace
  } = req.body;

  if (!dayNumber || !city) {
    return res.json({ dayPlan: "" });
  }

  const prompt = `
You are a professional travel planner.

City: ${city}
Day to generate: Day ${dayNumber}
Total days: ${totalDays}
Budget: ${budget}
Interests: ${interests}
Pace: ${pace}

STRICT RULES:
- Generate ONLY Day ${dayNumber}
- DO NOT mention any other day
- Output MUST be in Markdown
- Follow EXACTLY this format:

## Day ${dayNumber}
One-line summary

| Time | Activity | Location | Tips |
|------|----------|----------|------|
| ...  | ...      | ...      | ...  |

DO NOT add explanations or extra text.
`;

  try {
    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        contents: [{ role: "user", parts: [{ text: prompt }] }]
      },
      { params: { key: process.env.GEMINI_API_KEY } }
    );

    const dayPlan =
      response.data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    res.json({ dayPlan: dayPlan.trim() });
  } catch (err) {
    console.error("Single day plan error:", err.message);
    res.json({ dayPlan: "" });
  }
});


module.exports = router;
