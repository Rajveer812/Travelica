# 🌍 Travelica — AI-Powered Local Travel Guide

Travelica is a **location-aware AI travel assistant** that helps tourists and locals discover
nearby places, food, routes, and smart travel plans — all in real time.

Built for hackathons with a strong focus on **AI + Maps + UX**.

---

## 🚀 What Problem Does Travelica Solve?

Tourists often face:
- Information overload
- Generic recommendations
- No real-time context (location, time, crowd, weather)

**Travelica fixes this** by combining:
- Live location
- AI reasoning
- Maps intelligence
- Clean, mobile-first UI

---

## ✨ Key Features

### 📍 Location-Aware AI
- Automatically detects user's city
- AI understands phrases like **“near me”**, **“around me”**
- No repeated location prompts

### 🧠 AI Travel Assistant (Chat)
- Ask about food, places, routes, plans
- Context-aware replies based on:
  - City
  - Latitude / Longitude
  - Time of day
- Feels like a **local guide**

### 🗺️ Nearby Places & Food Discovery
- Google Places API integration
- Smart filtering (no taxi / service clutter)
- Infinite scroll
- End-of-results UX feedback
- Auto-scroll to map on navigation click

### ☀️ Today in Your City (Dynamic)
- Live weather summary
- AI-generated:
  - Best activity right now
  - Crowd avoidance tips
- Updates dynamically per city

### 🧭 Smart Travel Planner
- AI-generated **day-wise plans**
- Structured output with tables
- PDF-friendly
- Inputs:
  - City
  - Days
  - Budget
  - Interests
  - Pace

### 🎨 Polished UI/UX
- Custom blue–teal theme
- Chat-style AI UI
- Floating action buttons
- Mobile-first design

---

## 🛠️ Tech Stack

**Frontend**
- EJS
- Bootstrap 5
- Vanilla JavaScript
- CSS Variables (Theme-based)

**Backend**
- Node.js
- Express.js

**AI & APIs**
- Google Gemini API
- Google Maps JavaScript API
- Google Places API
- Google Directions API
- OpenStreetMap (Reverse Geocoding)

---

## 🧩 Architecture Overview
Browser (Client)
↓
Express Server
↓
AI (Gemini) + Maps + Places + Weather



---

## ⚙️ Installation & Setup

### 1️⃣ Clone Repository
```bash
git clone https://github.com/YOUR_USERNAME/travelica.git
cd travelica

### Install Dependencies
npm install


### Create .env File
PORT=3000
GEMINI_API_KEY=your_gemini_api_key
MAPS_API_KEY=your_google_maps_api_key