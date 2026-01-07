console.log("location.js loaded");


const btn = document.getElementById("getLocationBtn");
const locationText = document.getElementById("locationText");
const navbarLocation = document.getElementById("navbarLocation");

if (!btn) {
  console.error("Get Location button not found");
}

btn?.addEventListener("click", () => {
  console.log("Get Location clicked");

  if (!navigator.geolocation) {
    locationText.innerText = "Geolocation not supported";
    return;
  }

  locationText.innerText = "📡 Detecting location...";

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      console.log("Coordinates:", position.coords);

      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      try {
        const res = await fetch("/reverse-geocode", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lat, lng })
        });

        const data = await res.json();
        console.log("Reverse geocode:", data);

        const city = data.city || "Unknown city";
        const area = data.area || city;

        locationText.innerText = `📍 ${area}, ${city}`;

        // ✅ Persist cleanly
        sessionStorage.setItem("userCity", city);
        sessionStorage.setItem("userArea", area);
        sessionStorage.setItem("lat", lat);
        sessionStorage.setItem("lng", lng);


        window.dispatchEvent(new Event("locationUpdated"));
        
        // 🔁 Refresh "Today in City" section instantly
        if (window.loadTodayInsight) {
          window.loadTodayInsight();
        }

      } catch (err) {
        console.error("Fetch error", err);
        locationText.innerText = "Failed to get location";
      }
    },
    (error) => {
      console.error("Geolocation error:", error);
      locationText.innerText = "Location permission denied";
    }
  );
});
