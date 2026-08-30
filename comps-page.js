(function () {
  "use strict";
  const esc = (value) => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  let filter = "all";
  const search = document.getElementById("comp-search");
  const positions = {
    "left-front": [105, 48], "center-front": [180, 48], "right-front": [255, 48],
    "left-mid": [110, 102], "center-mid": [180, 102], "right-mid": [250, 102],
    "left-back": [110, 184], "center-back": [180, 184], "right-back": [250, 184],
    "left-flank": [40, 92], "right-flank": [320, 92],
    "left-reserve": [62, 190], "right-reserve": [298, 190],
    "tower-left": [92, 145], "tower-right": [268, 145]
  };
  const tokens = {
    Abyss: "AB", Arclight: "AR", Crawler: "CR", "Death Knell": "DK", Fang: "FG", Farseer: "FS",
    "Fire Badger": "FB", Fortress: "FT", Hacker: "HK", Hound: "HD", Marksman: "MM", "Melting Point": "MP",
    Mountain: "MT", Mustang: "MU", Overlord: "OL", "Phantom Ray": "PR", Phoenix: "PX", Raiden: "RD",
    Rhino: "RH", Sabertooth: "ST", Sandworm: "SW", Scorpion: "SC", Sledgehammer: "SH", "Steel Ball": "SB",
    Stormcaller: "SR", Tarantula: "TR", Typhoon: "TY", "Void Eye": "VE", Vortex: "VT", Vulcan: "VU",
    "War Factory": "WF", Wasp: "WS", Wraith: "WR"
  };

  const list = (values, className = "") => `<ul${className ? ` class="${className}"` : ""}>${values.map((value) => `<li>${esc(value)}</li>`).join("")}</ul>`;
  const techList = (label, values) => values?.length ? `<div><strong>${label}</strong>${list(values)}</div>` : "";

  function techPriority(item) {
    if (item.tech) return item.tech;
    const [coreCount, secondCount] = item.techSplit || [1, 1];
    return {
      core: item.t.slice(0, coreCount),
      second: item.t.slice(coreCount, coreCount + secondCount),
      situational: item.t.slice(coreCount + secondCount)
    };
  }

  function unitToken(entry) {
    const point = positions[entry.position];
    if (!point) return "";
    const [x, y] = point;
    return `<g class="formation-unit" transform="translate(${x} ${y})" aria-label="${esc(entry.unit)}">
      <circle r="15"></circle><text text-anchor="middle" dominant-baseline="central">${esc(tokens[entry.unit] || entry.unit.slice(0, 2).toUpperCase())}</text>
    </g>`;
  }

  function formationBoard(step) {
    const uniqueUnits = [...new Set(step.units.map((entry) => entry.unit))];
    return `<figure class="formation-step">
      <figcaption>${esc(step.title)}</figcaption>
      <svg class="formation-board" viewBox="0 0 360 225" role="img" aria-label="${esc(`${step.title} basic formation`)}" preserveAspectRatio="xMidYMid meet">
        <rect class="board-field" x="20" y="18" width="320" height="192" rx="9"></rect>
        <rect class="flank-zone" x="20" y="18" width="31" height="192"></rect>
        <rect class="flank-zone" x="309" y="18" width="31" height="192"></rect>
        <line class="center-axis" x1="180" y1="18" x2="180" y2="210"></line>
        <line class="front-guide" x1="51" y1="70" x2="309" y2="70"></line>
        <g class="tower"><rect x="74" y="132" width="36" height="25" rx="4"></rect><text x="92" y="127" text-anchor="middle">LEFT TOWER</text></g>
        <g class="tower"><rect x="250" y="132" width="36" height="25" rx="4"></rect><text x="268" y="127" text-anchor="middle">RIGHT TOWER</text></g>
        <text class="direction front" x="180" y="12" text-anchor="middle">↑ FRONT</text>
        <text class="direction back" x="180" y="221" text-anchor="middle">BACK</text>
        <text class="flank-label" x="35" y="205" text-anchor="middle">FLANK</text>
        <text class="flank-label" x="325" y="205" text-anchor="middle">FLANK</text>
        ${step.units.map(unitToken).join("")}
      </svg>
      <div class="formation-legend">${uniqueUnits.map((unit) => `<span><b>${esc(tokens[unit] || unit.slice(0, 2).toUpperCase())}</b>${esc(unit)}</span>`).join("")}</div>
      ${list(step.notes, "formation-notes")}
    </figure>`;
  }

  function card(item) {
    const rounds = item.r.map((round) => `<li><strong>${esc(round[0])}</strong><span>${esc(round[1])}</span></li>`).join("");
    const tech = techPriority(item);
    const entries = [["BEST ENTRY", item.entry.best], ["GOOD ENTRY", item.entry.good], ["CONDITIONAL", item.entry.conditional]];
    const roles = item.roles.map(([unit, role]) => `<li><strong>${esc(unit)}</strong><span>${esc(role)}</span></li>`).join("");
    const references = item.refs.map(([label, url]) => `<li><a class="source-link" href="${esc(url)}" target="_blank" rel="noopener">${esc(label)}</a></li>`).join("");
    return `<details class="comp-card" data-kind="${esc(item.k)}" data-search="${esc(`${item.n} ${item.c} ${item.g} ${item.roles.flat().join(" ")}`.toLowerCase())}">
      <summary><div><strong>${esc(item.n)}</strong><span>${esc(item.c)}</span></div><em>${item.k === "meta" ? "CURRENT" : "WIKI"}</em></summary>
      <div class="comp-body">
        <section class="overview"><h3>OVERVIEW</h3><p>${esc(item.o)}</p><p>${esc(item.flow)}</p></section>
        <section><h3>CORE UNITS / ROLES</h3><ul class="core-roles">${roles}</ul></section>
        <section><h3>STARTER / ENTRY</h3><p>${esc(item.s)}</p><dl class="entry-levels">${entries.map(([label, value]) => `<div><dt>${label}</dt><dd>${esc(value)}</dd></div>`).join("")}</dl></section>
        <section><h3>FORMATION</h3><p class="section-note">厳密座標ではなく、tower基準の前後関係とlayerを示します。</p><div class="formation-grid">${item.formationSteps.map(formationBoard).join("")}</div></section>
        <section><h3>PLACEMENT PRINCIPLES</h3>${list(item.placement)}</section>
        <section><h3>ROUND PLAN</h3><ol class="round-plan">${rounds}</ol></section>
        <section><h3>TECH PRIORITY</h3><div class="tech-priority">${techList("CORE", tech.core)}${techList("SECOND", tech.second)}${techList("SITUATIONAL", tech.situational)}</div></section>
        <section><h3>SUPPORT / FLEX</h3>${list(item.a)}</section>
        <section><h3>WIN CONDITION</h3><ol class="win-flow">${item.win.map((value) => `<li>${esc(value)}</li>`).join("")}</ol></section>
        <section><h3>COMMON MISTAKES</h3>${list(item.mistakes, "mistakes")}</section>
        <section><h3>RISKS / COUNTERS</h3><p>${esc(item.x)}</p></section>
        <section><h3>WHEN ENEMY USES IT</h3><p>${esc(item.v)}</p></section>
        <section><h3>REFERENCE</h3><ul class="reference-list">${references}</ul></section>
      </div></details>`;
  }

  function apply() {
    const query = search.value.trim().toLowerCase();
    document.querySelectorAll(".comp-card").forEach((card) => {
      const matchesFilter = filter === "all" || card.dataset.kind === filter;
      const matchesQuery = !query || card.dataset.search.includes(query) || card.innerText.toLowerCase().includes(query);
      card.hidden = !(matchesFilter && matchesQuery);
    });
  }

  try {
    if (!Array.isArray(GUIDE_DATA) || !GUIDE_DATA.length) throw new Error("Comp data missing");
    document.getElementById("comp-list").innerHTML = GUIDE_DATA.map(card).join("");
    document.getElementById("data-status").hidden = true;
    search.addEventListener("input", apply);
    document.querySelectorAll(".filter").forEach((button) => button.addEventListener("click", () => {
      document.querySelectorAll(".filter").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      filter = button.dataset.filter;
      apply();
    }));
  } catch (error) {
    const status = document.getElementById("data-status");
    status.className = "data-error";
    status.textContent = "Comp dataを読み込めませんでした。";
    console.error(error);
  }
})();
