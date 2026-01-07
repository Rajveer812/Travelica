// DOM references
const form = document.getElementById("planForm");
const result = document.getElementById("planResult");
const pdfBtn = document.getElementById("downloadPdf");

const locationInput = document.getElementById("location");
const daysInput = document.getElementById("days");
const budgetInput = document.getElementById("budget");
const interestsInput = document.getElementById("interests");
const paceInput = document.getElementById("pace");

// ✅ Auto-fill location from navbar/session
document.addEventListener("DOMContentLoaded", () => {
  const savedCity = sessionStorage.getItem("userCity");
  if (savedCity && locationInput) {
    locationInput.value = savedCity;
  }
});


// FORM SUBMIT
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  result.innerHTML = "<p>Generating plan... ⏳</p>";
  pdfBtn.classList.add("d-none");

  const payload = {
    location: sessionStorage.getItem("userCity") || locationInput.value,
    days: daysInput.value,
    budget: budgetInput.value,
    interests: interestsInput.value,
    pace: paceInput.value,
    lat: sessionStorage.getItem("lat"),
    lng: sessionStorage.getItem("lng")
  };

  // 🔐 Store plan meta globally (needed for day regeneration)
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
    if (!data.plan) throw new Error("No plan returned");

    // ✅ Render formatted plan
    result.innerHTML = formatPlan(data.plan);
    pdfBtn.classList.remove("d-none");
  } catch (err) {
    console.error(err);
    result.innerHTML =
      "<p class='text-danger'>Failed to generate plan. Please try again.</p>";
  }
});

// PDF download
pdfBtn.addEventListener("click", () => {
  window.print();
});

/**
 * 🔹 Convert AI Markdown plan into formatted HTML
 */
function formatPlan(markdown) {
  if (!markdown) return "";

  // Split by day headings
  const dayBlocks = markdown.split(/^## Day\s+/gm).filter(Boolean);
  let html = "";

  dayBlocks.forEach((block, index) => {
    const dayNumber = index + 1;
    const fullBlock = `## Day ${block.trim()}`;

    html += `
      <div id="day-${dayNumber}" class="plan-day mb-4">
        ${renderDayMarkdown(fullBlock)}

        <button
          class="btn btn-sm btn-outline-secondary mt-2"
          onclick="regenerateDay(${dayNumber})">
          🔁 Regenerate this day
        </button>
      </div>
    `;
  });

  return html;
}

function renderDayMarkdown(markdown) {
  let html = markdown;

  // Day heading
  html = html.replace(/^## (.*)$/gm, "<h4 class='mt-3'>$1</h4>");

  // Markdown table → HTML
  html = html.replace(
    /\|(.+)\|\n\|([-|\s]+)\|\n((\|.*\|\n?)*)/g,
    (match) => {
      const lines = match.trim().split("\n");
      const headers = lines[0].split("|").filter(Boolean);
      const rows = lines.slice(2).map(line =>
        line.split("|").filter(Boolean)
      );

      let table = `
        <div class="table-responsive mt-2">
          <table class="table table-bordered table-striped">
            <thead><tr>`;

      headers.forEach(h => {
        table += `<th>${h.trim()}</th>`;
      });

      table += `</tr></thead><tbody>`;

      rows.forEach(row => {
        table += "<tr>";
        row.forEach(col => {
          table += `<td>${col.trim()}</td>`;
        });
        table += "</tr>";
      });

      table += `</tbody></table></div>`;
      return table;
    }
  );

  return html;
}

async function regenerateDay(dayNumber) {
  const meta = window.currentPlanMeta;
  if (!meta) return;

  const container = document.getElementById(`day-${dayNumber}`);
  if (!container) return;

  container.style.opacity = "0.5";

  try {
    const res = await fetch("/api/ai/plan/day", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        city: meta.city,
        dayNumber,
        totalDays: meta.totalDays,
        budget: meta.budget,
        interests: meta.interests,
        pace: meta.pace
      })
    });

    const data = await res.json();
    if (!data.dayPlan) return;

    container.innerHTML = `
      ${renderDayMarkdown(data.dayPlan)}
      <button
        class="btn btn-sm btn-outline-secondary mt-2"
        onclick="regenerateDay(${dayNumber})">
        🔁 Regenerate this day
      </button>
    `;
  } catch (err) {
    console.error("Regenerate day failed", err);
  } finally {
    container.style.opacity = "1";
  }
}
