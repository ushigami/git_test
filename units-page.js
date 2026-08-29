(function () {
  "use strict";
  const esc = (value) => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  const block = (title, values) => `<div class="guide-block"><h3>${title}</h3>${values.map((value) => `<p>${esc(value)}</p>`).join("")}</div>`;
  try {
    const data = window.MECH_DATA;
    if (!data || data.units?.length !== 33) throw new Error("33-unit data missing");
    const roles = data.strategy.roles;
    const html = data.units.slice().sort((a, b) => a.name.localeCompare(b.name)).map((unit) => {
      const techs = data.techExceptions[unit.name] || [];
      return `<details class="unit-guide"><summary><strong>${esc(unit.name)}</strong><span>${unit.target === "ground" ? "GROUND ONLY" : "AIR + GROUND"}</span></summary><div class="unit-guide-body">
        ${block("ROLE", [unit.roles.map((role) => roles[role] || role).join(" / ")])}
        ${block("PLACEMENT", [`${data.strategy.depth[unit.placement.depth]} · ${unit.placement.notes.join(" / ")}`])}
        ${block("NEEDS", [`Screening: ${unit.supportNeeds.screening} · Chaff clear: ${unit.supportNeeds.chaffClear} · Tanking: ${unit.supportNeeds.tanking}`])}
        ${block("GOOD SUPPORT", [...new Set(Object.values(unit.preferredSupport).flat())])}
        ${block("SYNERGY", unit.synergies.map((item) => `${item.unit}: ${item.reason}`))}
        ${block("GOOD AGAINST", unit.goodAgainst)}
        ${block("BAD AGAINST", unit.badAgainst)}
        ${block("IMPORTANT TECH EXCEPTIONS", techs.length ? techs.map((item) => `${item.name}: ${item.effect}`) : ["大きく役割を変える例外は未登録"])}
        ${block("COMMON FAILURE", unit.risks)}
      </div></details>`;
    }).join("");
    document.getElementById("unit-list").innerHTML = html;
    document.getElementById("data-status").hidden = true;
  } catch (error) {
    const status = document.getElementById("data-status");
    status.className = "data-error";
    status.textContent = "Unit dataを読み込めませんでした。";
    console.error(error);
  }
})();
