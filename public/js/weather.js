async function loadTodayInsight() {
  const weatherEl = document.getElementById("weatherSummary");
  const bestEl = document.getElementById("bestSuggestion");
  const crowdEl = document.getElementById("crowdTip");
  const titleEl = document.getElementById("todayCityTitle");

  const lat = sessionStorage.getItem("lat");
  const lng = sessionStorage.getItem("lng");
  const city = sessionStorage.getItem("userCity");

  if (!lat || !lng || !city) {
    if (titleEl) titleEl.innerText = "☀️ Today in your city";
    weatherEl.innerText = "Enable location to see today's insights.";
    bestEl.innerText = "Best now: Enable location";
    crowdEl.innerText = "Crowd tip: Enable location";
    return;
  }

  // ✅ Update title dynamically
  if (titleEl) {
    titleEl.innerText = `☀️ Today in ${city}`;
  }

  try {
    /* 🌤️ WEATHER */
    const weatherRes = await fetch("/weather-summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lat, lng, location: city })
    });

    const weatherData = await weatherRes.json();
    weatherEl.innerText = weatherData.summary || "Weather data unavailable";

    /* 🧠 AI INSIGHT */
    const now = new Date();
    const hour = now.getHours();
    const isWeekend = now.getDay() === 0 || now.getDay() === 6;

    const aiRes = await fetch("/api/ai/today-insight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        city,
        weather: weatherData.summary,
        hour,
        isWeekend
      })
    });

    const aiData = await aiRes.json();

    bestEl.innerText = `Best now: ${aiData.best}`;
    crowdEl.innerText = `Crowd tip: ${aiData.crowd}`;
  } catch (err) {
    console.error("Today insight error:", err);
    weatherEl.innerText = "Weather unavailable";
    bestEl.innerText = "Best now: Explore nearby places";
    crowdEl.innerText = "Crowd tip: Visit early to avoid crowds";
  }
}

/* 🔹 Run once on page load */
document.addEventListener("DOMContentLoaded", loadTodayInsight);

/* 🔹 Expose globally so location.js can trigger it */
window.loadTodayInsight = loadTodayInsight;
