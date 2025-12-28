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

  let html = markdown;

  // Day headings (## Day 1)
  html = html.replace(/^## (.*)$/gm, "<h4 class='mt-4'>$1</h4>");

  // Bold text
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // Convert Markdown tables to HTML tables
  html = html.replace(
    /\|(.+)\|\n\|([-|\s]+)\|\n((\|.*\|\n?)*)/g,
    (match) => {
      const lines = match.trim().split("\n");
      const headers = lines[0].split("|").filter(Boolean);
      const rows = lines.slice(2).map(line =>
        line.split("|").filter(Boolean)
      );

      let table =
        `<div class="table-responsive mt-3">
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

  // Line breaks
  html = html.replace(/\n/g, "<br>");

  return html;
}
