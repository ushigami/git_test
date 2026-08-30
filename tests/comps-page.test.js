const assert = require("assert");
const fs = require("fs");
const vm = require("vm");
const { loadData } = require("./load-data");

const dataFiles = ["data0.js", "data1.js", "data2.js", "data3.js"];
function load(files) {
  const context = { console };
  vm.createContext(context);
  files.forEach((file) => vm.runInContext(fs.readFileSync(file, "utf8"), context, { filename: file }));
  return { context, guides: vm.runInContext("GUIDE_DATA", context) };
}

const baseline = load(dataFiles).guides;
const baselineNames = baseline.map((item) => item.n);
assert.strictEqual(baseline.length, 20, "existing comp baseline changed unexpectedly");

const loaded = load([...dataFiles, "comps-detail.js", "comps-formations.js"]);
const guides = loaded.guides;
assert.strictEqual(guides.length, 21, "20 existing comps + Carry Vortex required");
assert.deepStrictEqual(Array.from(guides.slice(0, 20), (item) => item.n), Array.from(baselineNames), "existing comps were deleted, renamed, or reordered");
assert.strictEqual(new Set(guides.map((item) => item.n)).size, 21, "duplicate comp name");

const { data } = loadData();
const knownUnits = new Set(data.units.map((item) => item.name));
const positions = new Set([
  "left-front", "center-front", "right-front", "left-mid", "center-mid", "right-mid",
  "left-back", "center-back", "right-back", "left-flank", "right-flank",
  "left-reserve", "right-reserve", "tower-left", "tower-right"
]);

guides.forEach((item) => {
  ["o", "flow", "s", "x", "v"].forEach((field) => assert(item[field]?.length, `${item.n}.${field} missing`));
  assert(item.roles.length >= 3, `${item.n} core roles missing`);
  assert(item.entry.best && item.entry.good && item.entry.conditional, `${item.n} entry tiers incomplete`);
  assert(item.r.length >= 3, `${item.n} round plan incomplete`);
  assert((item.tech?.core?.length || item.techSplit?.[0] > 0), `${item.n} core tech priority missing`);
  assert(item.a.length >= 3, `${item.n} support/flex incomplete`);
  assert(item.win.length >= 3, `${item.n} win condition incomplete`);
  assert(item.mistakes.length >= 3, `${item.n} common mistakes incomplete`);
  assert(item.placement.length >= 2, `${item.n} placement principles incomplete`);
  assert(item.refs.length >= 2 && item.refs.every((entry) => /^https:\/\//.test(entry[1])), `${item.n} source URL missing`);
  assert(item.formationSteps.length >= 2 && item.formationSteps.length <= 4, `${item.n} needs 2-4 formation steps`);
  assert(item.formationSteps.some((step) => step.title === "ROUND 1"), `${item.n} formation needs ROUND 1`);
  item.formationSteps.forEach((step) => {
    assert(step.notes.length, `${item.n}/${step.title} notes missing`);
    const seen = new Set();
    step.units.forEach((entry) => {
      assert(knownUnits.has(entry.unit), `${item.n}/${step.title} unknown unit ${entry.unit}`);
      assert(positions.has(entry.position), `${item.n}/${step.title} invalid position ${entry.position}`);
      const key = `${entry.unit}|${entry.position}`;
      assert(!seen.has(key), `${item.n}/${step.title} duplicate token ${key}`);
      seen.add(key);
    });
  });
});

const vortex = guides.find((item) => item.n === "Carry Vortex");
assert(vortex && vortex.k === "meta", "Carry Vortex must be a new CURRENT comp");
assert.deepStrictEqual(Array.from(vortex.roles, (entry) => entry[0]), ["Vortex", "Crawler", "Mustang"], "Carry Vortex core regression");
assert(vortex.tech.core.some((value) => value.includes("Grid Integration（250）")), "Carry Vortex current Grid cost missing");
assert.strictEqual(vortex.formationSteps.length, 3, "Carry Vortex needs R1/Mid/Late formations");

for (const [name, unit, firstAllowed] of [
  ["Ball + Wraith Aggro", "Wraith", 1], ["Hound + Phoenix Aggro", "Phoenix", 1],
  ["Spider + Phoenix Aggro", "Phoenix", 1], ["Mountain + Fire Badger Defense", "Mountain", 1],
  ["Multimelter + Fire Badger Defense", "Melting Point", 1], ["Typhon Aggro", "Typhoon", 1],
  ["Mass Raiden", "Raiden", 1]
]) {
  const item = guides.find((guide) => guide.n === name);
  assert(!item.formationSteps[0].units.some((entry) => entry.unit === unit), `${name} shows ${unit} before its round-plan entry`);
  assert(item.formationSteps[firstAllowed].units.some((entry) => entry.unit === unit), `${name} mid formation missing ${unit}`);
}

let rendered = "";
loaded.context.document = {
  getElementById(id) {
    if (id === "comp-list") return { set innerHTML(value) { rendered = value; }, get innerHTML() { return rendered; } };
    if (id === "comp-search") return { value: "", addEventListener() {} };
    return { hidden: false, className: "data-status", textContent: "" };
  },
  querySelectorAll() { return []; }
};
vm.runInContext(fs.readFileSync("comps-page.js", "utf8"), loaded.context, { filename: "comps-page.js" });
assert.strictEqual((rendered.match(/class="comp-card"/g) || []).length, 21, "all comps must render");
assert.strictEqual((rendered.match(/class="formation-board"/g) || []).length, guides.reduce((sum, item) => sum + item.formationSteps.length, 0), "all formations must render as SVG");
for (const token of ["LEFT TOWER", "RIGHT TOWER", "center-axis", "↑ FRONT", "BACK", "CORE UNITS / ROLES", "COMMON MISTAKES"]) {
  assert(rendered.includes(token), `rendered comp guide missing ${token}`);
}

const css = fs.readFileSync("style.css", "utf8");
assert(css.includes(".formation-board { display: block; width: 100%; height: auto; max-width: 100%; overflow: hidden; }"), "formation SVG must be responsive without horizontal overflow");
console.log(`PASS comps existing=${baseline.length} detailed=${guides.length} formations=${guides.reduce((sum, item) => sum + item.formationSteps.length, 0)} mobileSvg=responsive`);
