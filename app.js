require("dotenv").config();
const express = require("express");
const path = require("path");
const ejsMate = require("ejs-mate");

const homeRoutes = require("./routes/home");
const locationRoutes = require("./routes/location");
const placesRoutes = require("./routes/places");
const weatherRoutes = require("./routes/weather");
const aiRoutes = require("./routes/ai");

const app = express();

// view engine
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// make MAPS key available in EJS
app.use((req, res, next) => {
  res.locals.MAPS_API_KEY = process.env.MAPS_API_KEY;
  next();
});


app.use("/", homeRoutes);

// API routes
app.use("/", locationRoutes);
app.use("/", weatherRoutes);
app.use("/", placesRoutes);
app.use("/", aiRoutes);



// server
const PORT =process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Travelica running on http://localhost:${PORT}`);
});
