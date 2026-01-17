const form = document.getElementById("planForm");
const result = document.getElementById("planResult");
const pdfBtn = document.getElementById("downloadPdf");

const locationInput = document.getElementById("location");
const daysInput = document.getElementById("days");
const budgetSlider = document.getElementById("budget");
const budgetValue = document.getElementById("budgetValue");

let selectedDays = null;
let selectedInterests = [];
let selectedPace = "Relaxed";

/* =====================
   AUTO LOCATION
===================== */
document.addEventListener("DOMContentLoaded", () => {
  const city = sessionStorage.getItem("userCity");
  if (city) locationInput.value = city;
});

/* =====================
   DAYS BUTTONS
===================== */
document.querySelectorAll(".day-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    selectedDays = btn.dataset.days;
    daysInput.value = selectedDays;
    daysInput.classList.add("d-none");

    document.querySelectorAll(".day-btn")
      .forEach(b => b.classList.replace("btn-light", "btn-outline-light"));

    btn.classList.replace("btn-outline-light", "btn-light");
  });
});

document.getElementById("customDayBtn").addEventListener("click", () => {
  daysInput.classList.remove("d-none");
  daysInput.focus();
});

/* =====================
   BUDGET SLIDER
===================== */
budgetSlider.addEventListener("input", () => {
  budgetValue.innerText = budgetSlider.value;
});

/* =====================
   INTERESTS
===================== */
document.querySelectorAll(".interest-chip").forEach(chip => {
  chip.addEventListener("click", () => {
    chip.classList.toggle("btn-light");
    chip.classList.toggle("btn-outline-light");

    const value = chip.innerText.toLowerCase();
    if (selectedInterests.includes(value)) {
      selectedInterests = selectedInterests.filter(i => i !== value);
    } else {
      selectedInterests.push(value);
    }
  });
});

/* =====================
   PACE
===================== */
document.querySelectorAll(".pace-chip").forEach(chip => {
  chip.addEventListener("click", () => {
    document.querySelectorAll(".pace-chip")
      .forEach(c => c.classList.replace("btn-light", "btn-outline-light"));

    chip.classList.replace("btn-outline-light", "btn-light");
    selectedPace = chip.dataset.value;
  });
});

/* =====================
   FORM SUBMIT
===================== */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  result.innerHTML = "<p>Generating plan... ⏳</p>";
  pdfBtn.classList.add("d-none");

  const payload = {
    location: sessionStorage.getItem("userCity") || locationInput.value,
    days: daysInput.value,
    budget: budgetSlider.value,
    interests: selectedInterests.join(", "),
    pace: selectedPace,
    startTime: document.getElementById("startTime").value,
    endTime: document.getElementById("endTime").value,
    lat: sessionStorage.getItem("lat"),
    lng: sessionStorage.getItem("lng")
  };

  // Store meta for regenerate day
  window.currentPlanMeta = {
    city: payload.location,
    totalDays: Number(payload.days),
    budget: payload.budget,
    interests: payload.interests,
    pace: payload.pace
  };

  try {
    const res = await fetch("/api/ai/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!data.plan) throw new Error("No plan");

    result.innerHTML = formatPlan(data.plan);
    pdfBtn.classList.remove("d-none");
  } catch (err) {
    console.error(err);
    result.innerHTML =
      "<p class='text-danger'>Failed to generate plan.</p>";
  }
});

/* =====================
   FORMAT PLAN
===================== */
function formatPlan(markdown) {
  const blocks = markdown.split(/^## Day\s+/gm).filter(Boolean);
  let html = "";

  blocks.forEach((block, index) => {
    const day = index + 1;
    html += `
      <div id="day-${day}" class="plan-day mb-4">
        ${renderDay(block, day)}
        <button
          class="btn btn-sm btn-outline-secondary mt-2"
          onclick="regenerateDay(${day})">
          🔁 Regenerate this day
        </button>
      </div>
    `;
  });

  return html;
}

function renderDay(block, day) {
  let html = `## Day ${block}`;
  html = html.replace(/^## (.*)$/gm, "<h4 class='mt-3'>$1</h4>");

  html = html.replace(
    /\|(.+)\|\n\|([-|\s]+)\|\n((\|.*\|\n?)*)/g,
    match => {
      const lines = match.trim().split("\n");
      const headers = lines[0].split("|").filter(Boolean);
      const rows = lines.slice(2).map(r => r.split("|").filter(Boolean));

      let table = `<div class="table-responsive mt-2">
      <table class="table table-bordered table-striped">
      <thead><tr>`;

      headers.forEach(h => table += `<th>${h.trim()}</th>`);
      table += "</tr></thead><tbody>";

      rows.forEach(r => {
        table += "<tr>";
        r.forEach(c => table += `<td>${c.trim()}</td>`);
        table += "</tr>";
      });

      table += "</tbody></table></div>";
      return table;
    }
  );

  return html;
}

/* =====================
   REGENERATE DAY
===================== */
async function regenerateDay(day) {
  const meta = window.currentPlanMeta;
  if (!meta) return;

  const container = document.getElementById(`day-${day}`);
  container.style.opacity = "0.5";

  try {
    const res = await fetch("/api/ai/plan/day", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        city: meta.city,
        dayNumber: day,
        totalDays: meta.totalDays,
        budget: meta.budget,
        interests: meta.interests,
        pace: meta.pace
      })
    });

    const data = await res.json();
    container.innerHTML = `
      ${renderDay(data.dayPlan, day)}
      <button
        class="btn btn-sm btn-outline-secondary mt-2"
        onclick="regenerateDay(${day})">
        🔁 Regenerate this day
      </button>
    `;
  } finally {
    container.style.opacity = "1";
  }
}
let startX = 0;

document.addEventListener("touchstart", e => {
  startX = e.touches[0].clientX;
});

document.addEventListener("touchend", e => {
  const diffX = startX - e.changedTouches[0].clientX;

  if (diffX > 80) {
    goToNextDay();
  } else if (diffX < -80) {
    goToPrevDay();
  }
});
