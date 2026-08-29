(function () {
  "use strict";
  const esc = (value) => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  let filter = "all";
  const search = document.getElementById("comp-search");

  function card(item) {
    const rounds = item.r.map((round) => `<li><strong>${esc(round[0])}</strong><span>${esc(round[1])}</span></li>`).join("");
    return `<details class="comp-card" data-kind="${esc(item.k)}" data-search="${esc(`${item.n} ${item.c} ${item.g}`.toLowerCase())}">
      <summary><div><strong>${esc(item.n)}</strong><span>${esc(item.c)}</span></div><em>${item.k === "meta" ? "CURRENT" : "WIKI"}</em></summary>
      <div class="comp-body"><p>${esc(item.o)}</p>
        <section><h3>STARTER / ENTRY</h3><p>${esc(item.s)}</p></section>
        <section><h3>ROUND PLAN</h3><ol class="round-plan">${rounds}</ol></section>
        <section><h3>TECH</h3><div class="pills">${item.t.map((value) => `<span>${esc(value)}</span>`).join("")}</div></section>
        <section><h3>SUPPORT</h3><ul>${item.a.map((value) => `<li>${esc(value)}</li>`).join("")}</ul></section>
        <section><h3>RISKS / COUNTER</h3><p>${esc(item.x)}</p></section>
        <section><h3>WHEN ENEMY USES IT</h3><p>${esc(item.v)}</p></section>
        <a class="source-link" href="${esc(item.u)}" target="_blank" rel="noopener">Reference</a>
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
