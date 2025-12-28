// Ensure initMap always exists before Google Maps loads
window.initMap = window.initMap || function () {};

let map, directionsService, directionsRenderer;

window.initMap = function () {
  const mapDiv = document.getElementById("map");
  if (!mapDiv) return;

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const userLocation = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      };

      map = new google.maps.Map(mapDiv, {
        center: userLocation,
        zoom: 14
      });

      new google.maps.Marker({
        position: userLocation,
        map,
        label: "You"
      });

      directionsService = new google.maps.DirectionsService();
      directionsRenderer = new google.maps.DirectionsRenderer({ map });
    },
    () => alert("Location permission denied")
  );
};

window.navigateTo = function (lat, lng) {
  if (!directionsService || !directionsRenderer) {
    alert("Map is still loading. Please wait.");
    return;
  }

  navigator.geolocation.getCurrentPosition((pos) => {
    directionsService.route(
      {
        origin: {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        },
        destination: { lat, lng },
        travelMode: google.maps.TravelMode.DRIVING
      },
      (result, status) => {
        if (status === "OK") {
          directionsRenderer.setDirections(result);
        } else {
          alert("Unable to calculate route.");
        }
      }
    );
  });
};

// ✅ Event delegation
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("navigate-btn")) {
    if (!map) {
      alert("Map still loading...");
      return;
    }

    const lat = parseFloat(e.target.dataset.lat);
    const lng = parseFloat(e.target.dataset.lng);

    if (!isNaN(lat) && !isNaN(lng)) {
      navigateTo(lat, lng);
    }
  }
});
