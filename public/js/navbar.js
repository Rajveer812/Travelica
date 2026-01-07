function updateNavbarLocation() {
  const navbarLocation = document.getElementById("navbarLocation");
  if (!navbarLocation) return;

  const city = sessionStorage.getItem("userCity");

  navbarLocation.innerText = city
    ? `📍 ${city}`
    : "📍 Detecting…";
}

// Initial load (page refresh / new page)
document.addEventListener("DOMContentLoaded", updateNavbarLocation);

// Live update (after clicking "Use My Location")
window.addEventListener("locationUpdated", updateNavbarLocation);
