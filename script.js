/* ---------------------------------------------------------------
   Survey data (counts out of TOTAL residents) -- edit if needed
---------------------------------------------------------------- */
const TOTAL = 100;
const SURVEY = {
  aware: 75,
  not_aware: 25,
  health_problems: 40,
  respiratory: 40,
  cardiovascular: 20,
  income_agriculture: 50,
  income_daily_wage: 30,
  income_other: 20,
  economic_loss: 20
};

const COLORS = { navy: "#1F3A5F", teal: "#2A9D8F", amber: "#E9A23B", red: "#D1495B", grey: "#C9D1DA" };
const pct = n => Math.round(n * 100 / TOTAL);

/* sanity checks, same as the notebook */
(function validate() {
  if (SURVEY.aware + SURVEY.not_aware !== TOTAL)
    console.warn("Awareness counts must add up to TOTAL");
  if (SURVEY.income_agriculture + SURVEY.income_daily_wage + SURVEY.income_other !== TOTAL)
    console.warn("Income counts must add up to TOTAL");
})();

/* ---------------- stat tiles ---------------- */
function renderStats() {
  const tiles = [
    ["Residents surveyed", TOTAL, COLORS.navy],
    ["Aware", pct(SURVEY.aware) + "%", COLORS.teal],
    ["Health problems", pct(SURVEY.health_problems) + "%", COLORS.red],
    ["Economic loss", pct(SURVEY.economic_loss) + "%", COLORS.amber]
  ];
  document.getElementById("stats").innerHTML = tiles
    .map(([label, val, bg]) => `<div class="stat" style="background:${bg}"><b>${val}</b><span>${label}</span></div>`)
    .join("");
}

/* ---------------- results table ---------------- */
function renderTable() {
  const labels = {
    aware: "Aware of causes and effects of air pollution",
    not_aware: "Not aware",
    health_problems: "Reported health problems due to air pollution",
    respiratory: "Reported respiratory problems",
    cardiovascular: "Reported cardiovascular problems",
    income_agriculture: "Main income: agriculture",
    income_daily_wage: "Main income: daily wage labour",
    income_other: "Main income: other sources",
    economic_loss: "Reported economic losses due to air pollution"
  };
  document.getElementById("resultsBody").innerHTML = Object.keys(labels)
    .map(k => `<tr><td>${labels[k]}</td><td class="num">${SURVEY[k]}</td><td class="num">${pct(SURVEY[k])}%</td></tr>`)
    .join("");
  document.getElementById("conclusionLine").textContent =
    `Conclusion: awareness is high (${pct(SURVEY.aware)}%) but ${pct(SURVEY.health_problems)}% still report health problems.`;
}

/* ---------------- donut chart (SVG) ---------------- */
function renderDonut() {
  const r = 70, c = 2 * Math.PI * r;
  const awareLen = c * SURVEY.aware / TOTAL;
  const notLen = c * SURVEY.not_aware / TOTAL;
  document.getElementById("donut").innerHTML = `
    <svg viewBox="0 0 200 200" role="img" aria-label="Awareness donut chart">
      <g transform="rotate(-90 100 100)" fill="none" stroke-width="32">
        <circle cx="100" cy="100" r="${r}" stroke="${COLORS.grey}"
                stroke-dasharray="${notLen} ${c}" stroke-dashoffset="${-awareLen}"></circle>
        <circle id="awareArc" cx="100" cy="100" r="${r}" stroke="${COLORS.teal}"
                stroke-dasharray="0 ${c}"></circle>
      </g>
      <text x="100" y="98" text-anchor="middle" font-size="30" font-weight="700" fill="${COLORS.navy}">${pct(SURVEY.aware)}%</text>
      <text x="100" y="120" text-anchor="middle" font-size="12" fill="#5b6775">aware</text>
    </svg>
    <div class="legend">
      <span><i style="background:${COLORS.teal}"></i>Aware (${SURVEY.aware})</span>
      <span><i style="background:${COLORS.grey}"></i>Not aware (${SURVEY.not_aware})</span>
    </div>`;
  const arc = document.getElementById("awareArc");
  arc.style.transition = "stroke-dasharray 1.1s ease";
  requestAnimationFrame(() => requestAnimationFrame(() =>
    arc.setAttribute("stroke-dasharray", `${awareLen} ${c}`)));
}

/* ---------------- horizontal bar charts ---------------- */
function renderBars(id, items, max) {
  const box = document.getElementById(id);
  box.innerHTML = items.map(([label, v, color]) => `
    <div class="row">
      <span>${label}</span>
      <div class="track"><div class="fill" data-w="${(v / max) * 100}" style="background:${color}"></div></div>
      <span class="val">${v}%</span>
    </div>`).join("");
  requestAnimationFrame(() => requestAnimationFrame(() =>
    box.querySelectorAll(".fill").forEach(f => (f.style.width = f.dataset.w + "%"))));
}

function renderCharts() {
  renderDonut();
  renderBars("healthChart", [
    ["Respiratory problems", pct(SURVEY.respiratory), COLORS.red],
    ["Cardiovascular problems", pct(SURVEY.cardiovascular), COLORS.amber]
  ], 55);
  renderBars("incomeChart", [
    ["Agriculture", pct(SURVEY.income_agriculture), COLORS.grey],
    ["Daily wage labour", pct(SURVEY.income_daily_wage), COLORS.amber],
    ["Other sources", pct(SURVEY.income_other), COLORS.teal]
  ], 65);
  renderBars("summaryChart", [
    ["Aware of causes & effects", pct(SURVEY.aware), COLORS.teal],
    ["Health problems reported", pct(SURVEY.health_problems), COLORS.red],
    ["Respiratory problems", pct(SURVEY.respiratory), COLORS.red],
    ["Cardiovascular problems", pct(SURVEY.cardiovascular), COLORS.amber],
    ["Economic loss reported", pct(SURVEY.economic_loss), COLORS.navy]
  ], 90);
}

/* ---------------- nav highlight on scroll ---------------- */
function setupNav() {
  const links = [...document.querySelectorAll("#nav a")];
  const sections = links.map(a => document.querySelector(a.getAttribute("href")));
  const onScroll = () => {
    const y = window.scrollY + 120;
    let current = 0;
    sections.forEach((s, i) => { if (s && s.offsetTop <= y) current = i; });
    links.forEach((a, i) => a.classList.toggle("active", i === current));
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

document.addEventListener("DOMContentLoaded", () => {
  renderStats();
  renderTable();
  renderCharts();
  setupNav();
});
