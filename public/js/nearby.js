let nextPageToken = null;
let isLoading = false;
const seenPlaces = new Set();

/**
 * 🔹 Detect category from URL
 */
const params = new URLSearchParams(window.location.search);
const category = params.get("category") || "places";

function scrollToMap() {
  const mapWrapper = document.getElementById("mapWrapper") || document.getElementById("map");
  if (!mapWrapper) return;

  mapWrapper.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}


/**
 * 🔹 Init page
 */
document.addEventListener("DOMContentLoaded", () => {
  const title = document.getElementById("pageTitle");
  if (title && category === "food") {
    title.innerText = "🍽️ Food Near Me";
  }

  const container = document.getElementById("dynamicPlaces");
  if (container) container.innerHTML = "";

  nextPageToken = null;
  isLoading = false;
  seenPlaces.clear();

  loadMorePlaces();
});

/**
 * ⭐ Rating stars
 */
function renderStars(rating) {
  if (!rating) return "No ratings";
  return `${"⭐".repeat(Math.round(rating))} (${rating})`;
}

/**
 * 🔹 Load places (Google pagination)
 */
async function loadMorePlaces() {
  if (isLoading) return;
  isLoading = true;

  const lat = sessionStorage.getItem("lat");
  const lng = sessionStorage.getItem("lng");
  if (!lat || !lng) {
    isLoading = false;
    return;
  }

  try {
    const res = await fetch("/api/nearby", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lat,
        lng,
        category,
        nextPageToken,
      }),
    });

    const data = await res.json();

    // ⛔ No more results
    if (!data.places || data.places.length === 0) {
      showEndMessage();
      isLoading = false;
      return;
    }

    nextPageToken = data.nextPageToken || null;
    renderPlaces(data.places);

    // ⛔ Final page
    if (!nextPageToken) {
      showEndMessage();
    }
  } catch (err) {
    console.error("Nearby load error:", err);
  }

  // Google requires delay before next token works
  setTimeout(() => {
    isLoading = false;
  }, 1500);
}

/**
 * 🔹 Render cards instantly (no blocking)
 */
function renderPlaces(places) {
  const container = document.getElementById("dynamicPlaces");
  if (!container) return;

  const userLat = sessionStorage.getItem("lat");
  const userLng = sessionStorage.getItem("lng");
  const userCity = sessionStorage.getItem("userCity") || "Udaipur";

  places.forEach((place) => {
    const key = `${place.name}-${place.lat}-${place.lng}`;
    if (seenPlaces.has(key)) return;
    seenPlaces.add(key);

    const col = document.createElement("div");
    col.className = "col-12 col-md-4 mb-4 place-card";

    col.innerHTML = `
      <div class="card h-100">
       <img
        src="${place.photo}"
        class="card-img-top place-img"
        loading="lazy"
        referrerpolicy="no-referrer"
        onerror="
        this.onerror=null;
        this.src='${category === "food"
        ? "/images/default-food.jpg"
        : "/images/default-place.jpg"}';
        "
      >

        <div class="card-body">
          <h6 class="fw-bold">${place.name}</h6>

          <p class="small text-muted ai-text">
            Loading summary...
          </p>

          <p class="small mb-1">
            ⭐ ${renderStars(place.rating)}
          </p>

          <p class="small mb-2 route">
            🚗 Calculating...
          </p>

          <div class="d-flex gap-2">
            <button
              class="btn btn-sm btn-dark navigate-btn"
              data-lat="${place.lat}"
              data-lng="${place.lng}">
              Navigate
            </button>

            <button
              class="btn btn-sm btn-outline-dark"
              onclick="location.href='/chat'">
              Ask AI
            </button>
          </div>
        </div>
      </div>
    `;

    container.appendChild(col);

    // Async hydrate (AI + ETA)
    hydrateCard(col, place, userLat, userLng, userCity);
  });
}

/**
 * 🔹 Hydrate AI summary + ETA (non-blocking)
 */
async function hydrateCard(cardEl, place, userLat, userLng, userCity) {
  const aiTextEl = cardEl.querySelector(".ai-text");
  const routeEl = cardEl.querySelector(".route");

  try {
    const [aiRes, routeRes] = await Promise.all([
      fetch("/api/place-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: place.name,
          location: userCity,
          category,
        }),
      }),
      fetch("/api/route-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromLat: userLat,
          fromLng: userLng,
          toLat: place.lat,
          toLng: place.lng,
        }),
      }),
    ]);

    const aiData = await aiRes.json();
    const routeData = await routeRes.json();

    aiTextEl.innerText = aiData.summary || "A popular place worth visiting.";

    routeEl.innerText = `🚗 ${routeData.distance || "--"} • ${
      routeData.duration || "--"
    }`;
  } catch (err) {
    aiTextEl.innerText = "A popular place worth visiting.";
    routeEl.innerText = "🚗 -- • --";
  }
}

/**
 * 🔹 End-of-results message
 */
function showEndMessage() {
  const container = document.getElementById("dynamicPlaces");
  if (!container || document.getElementById("endMessage")) return;

  const endMsg = document.createElement("div");
  endMsg.id = "endMessage";
  endMsg.className = "text-center text-muted my-4";
  endMsg.innerHTML = `
    <p>🎉 You’ve seen all ${
      category === "food" ? "food places near you" : "places to explore"
    }.</p>
  `;

  container.appendChild(endMsg);
}

/**
 * 🔥 Infinite scroll
 */
window.addEventListener("scroll", () => {
  if (!nextPageToken || isLoading) return;

  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
    loadMorePlaces();
  }
});
/**
 * 🧭 Navigate button → scroll to map + focus marker
 */
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".navigate-btn");
  if (!btn) return;

  const lat = Number(btn.dataset.lat);
  const lng = Number(btn.dataset.lng);

  // 1️⃣ Smooth scroll to map
  scrollToMap();

  // 2️⃣ Focus map after scroll
  setTimeout(() => {
    if (window.map) {
      map.panTo({ lat, lng });
      map.setZoom(15);
    }
  }, 400);
});
