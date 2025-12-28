const axios = require("axios");

async function getWeather(lat, lng) {
  const res = await axios.get(
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

  return {
    temp: res.data.main.temp,
    condition: res.data.weather[0].main
  };
}

module.exports = { getWeather };
