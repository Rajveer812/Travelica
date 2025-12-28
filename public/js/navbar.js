document.addEventListener("DOMContentLoaded", () => {
  const navbarLocation = document.getElementById("navbarLocation");
  const savedLocation = sessionStorage.getItem("userLocation");

  if (navbarLocation && savedLocation) {
    navbarLocation.innerText = `📍 ${savedLocation}`;
  }
});
