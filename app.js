(function () {
  "use strict";
  const state = { enemy: new Set(), own: new Set() };
  const $ = (id) => document.getElementById(id);
  const esc = (value) => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);

  function unitButton(name, side) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "unit-button";
    button.textContent = name;
    button.dataset.unit = name;
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", () => {
      const selected = state[side];
      selected.has(name) ? selected.delete(name) : selected.add(name);
      button.classList.toggle("selected", selected.has(name));
      button.setAttribute("aria-pressed", String(selected.has(name)));
      update();
    });
    return button;
  }

  function renderSelectors(units) {
    const names = units.map((unit) => unit.name).sort((a, b) => a.localeCompare(b));
    names.forEach((name) => {
      $("enemy-grid").appendChild(unitButton(name, "enemy"));
      $("own-grid").appendChild(unitButton(name, "own"));
    });
  }

  function list(title, items, className) {
    return `<section class="detail-block ${className || ""}"><h4>${esc(title)}</h4><ul>${items.map((item) => `<li>${esc(item)}</li>`).join("")}</ul></section>`;
  }

  function renderResult(result, index) {
    const packageNames = result.package.map((name) => `<span>${esc(name)}</span>`).join("<b>+</b>");
    const assignments = result.assignments.map((item) => `
      <div class="assignment"><span>${esc(item.enemy)}</span><i>→</i><strong>${esc(item.answer)}</strong><em class="grade grade-${item.grade}">${item.grade}</em></div>`).join("");
    return `<article class="result-card">
      <div class="result-top"><span class="rank">${index + 1}</span><div><div class="package">${packageNames}</div><span class="recommendation">${esc(result.label)}</span></div></div>
      <div class="assignments">${assignments}</div>
      <details class="result-details"><summary>DETAILS</summary><div class="detail-grid">
        ${list("WHY", result.details.why)}
        ${list("PLACEMENT", result.details.placement)}
        ${list("SUPPORT", result.details.support)}
        ${list("RISKS", result.details.risks, "risk")}
        ${list("TECH NOTES", result.details.techNotes, "tech-note")}
      </div></details>
    </article>`;
  }

  function updateButtons() {
    document.querySelectorAll("#enemy-grid .unit-button").forEach((button) => {
      const selected = state.enemy.has(button.dataset.unit);
      button.classList.toggle("selected", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
    document.querySelectorAll("#own-grid .unit-button").forEach((button) => {
      const selected = state.own.has(button.dataset.unit);
      button.classList.toggle("selected", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
  }

  function update() {
    $("enemy-count").textContent = `ENEMY ${state.enemy.size}`;
    $("own-count").textContent = `OWN ${state.own.size}`;
    const started = performance.now();
    const results = window.MECH_CALCULATOR.calculate([...state.enemy], [...state.own]);
    const elapsed = performance.now() - started;
    $("calc-time").textContent = state.enemy.size ? `${elapsed.toFixed(1)} ms` : "";
    $("result-empty").hidden = results.length > 0;
    $("results").innerHTML = results.map(renderResult).join("");
  }

  function clear(side) {
    state[side].clear();
    updateButtons();
    update();
  }

  function clearAll() {
    state.enemy.clear();
    state.own.clear();
    $("own-panel").open = false;
    updateButtons();
    update();
  }

  function init() {
    try {
      const data = window.MECH_DATA;
      if (!data || !Array.isArray(data.units) || data.units.length !== 33 || !data.matchups || !window.MECH_CALCULATOR) {
        throw new Error("33-unit tactical data is incomplete");
      }
      renderSelectors(data.units);
      $("clear-all").addEventListener("click", clearAll);
      $("clear-enemy").addEventListener("click", () => clear("enemy"));
      $("clear-own").addEventListener("click", () => clear("own"));
      $("data-status").hidden = true;
      update();
      window.MECH_APP = { state, clearAll, update };
    } catch (error) {
      $("data-status").className = "data-error";
      $("data-status").textContent = "Counter dataを読み込めませんでした。ページ更新後も続く場合はasset versionを確認してください。";
      console.error(error);
    }
  }

  init();
})();
