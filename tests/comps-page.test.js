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
  assert(item.sourceEvidence?.primary?.startsWith("https://"), `${item.n} source audit missing`);
  assert(["high", "medium", "low"].includes(item.sourceEvidence.evidenceStrength), `${item.n} evidence strength missing`);
  assert(item.formationSteps.length >= 2 && item.formationSteps.length <= 4, `${item.n} needs 2-4 formation steps`);
  item.formationSteps.forEach((step) => {
    assert(step.notes.length, `${item.n}/${step.title} notes missing`);
    assert(step.evidence?.source?.startsWith("https://"), `${item.n}/${step.title} evidence source missing`);
    assert(step.evidence.timing && ["high", "medium", "low"].includes(step.evidence.confidence), `${item.n}/${step.title} evidence metadata incomplete`);
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

// Source-driven semantic validation. These rules intentionally check meaning,
// not only shape, so support/core units cannot leak into an earlier diagram.
const byName = (name) => guides.find((guide) => guide.n === name);
const firstUnits = (name) => byName(name).formationSteps[0].units.map((entry) => entry.unit);
const countFirst = (name, unit) => firstUnits(name).filter((value) => value === unit).length;
for (const [name, forbidden] of [
  ["Fangs Aggro", ["Fortress", "Hacker"]],
  ["Ball + Wraith Aggro", ["Wraith", "Wasp"]],
  ["Arclight + Sandworm Standard", ["Sandworm"]],
  ["Arclight + Hacker Defense", ["Hacker"]],
  ["Fire Badger + Void Eye Defense", ["Wraith", "Phantom Ray"]],
  ["Flank Pull Sledge Aggro", []],
  ["Hound + Phoenix Aggro", ["Phoenix", "Wasp", "Rhino", "Mustang"]],
  ["Mountain + Fire Badger Defense", ["Mountain", "Phoenix"]],
  ["Multimelter + Fire Badger Defense", ["Melting Point", "Crawler"]],
  ["Sledge + Marksman Defense", ["Arclight"]],
  ["Spider + Phoenix Aggro", ["Phoenix", "Hound"]],
  ["Typhon Aggro", ["Typhoon"]]
]) {
  forbidden.forEach((unit) => assert(!firstUnits(name).includes(unit), `${name}: late/conditional ${unit} leaked into opening`));
}
assert.strictEqual(countFirst("Fangs Aggro", "Fang"), 3, "Fangs opener must show exactly 3 Fang packs");
assert.strictEqual(countFirst("Fangs Aggro", "Steel Ball"), 1, "Fangs opener must show Steel Ball");
assert(firstUnits("Ball + Wraith Aggro").includes("Steel Ball"), "Ball/Wraith opener contradicts recommended Ball start");
assert(firstUnits("Spider + Phoenix Aggro").includes("Tarantula") && firstUnits("Spider + Phoenix Aggro").includes("Crawler"), "Spider opener contradiction");
assert(firstUnits("Multimelter + Fire Badger Defense").includes("Fang"), "Multimelter opener must use Fang chaff");

const techBefore = [
  ["Fangs Aggro", 0, /Barrier|Portable Shield|Mechanical Rage/],
  ["Ball + Wraith Aggro", 0, /Floating Artillery|Mechanical Division/],
  ["Arclight + Hacker Defense", 0, /Barrier/],
  ["Multimelter + Fire Badger Defense", 0, /Napalm|Diffraction/],
  ["Spider + Phoenix Aggro", 0, /High.Explosive|Jump Drive/],
  ["Typhon Aggro", 0, /Barrier|Tracking Missile|Mechanical Rage|Aerial Specialization/],
  ["Phantom Ray + Fire Badger", 0, /Sticky Oil/]
];
techBefore.forEach(([name, index, pattern]) => {
  const notes = byName(name).formationSteps[index].notes.join(" ");
  assert(!pattern.test(notes), `${name}: tech annotation appears before acquisition: ${pattern}`);
});

// Placement/formation consistency for explicit one-side openings.
for (const name of ["Fangs Aggro", "Ball + Wraith Aggro", "Hound + Phoenix Aggro", "Spider + Phoenix Aggro", "Typhon Aggro"]) {
  const positions = byName(name).formationSteps[0].units.map((entry) => entry.position);
  assert(!positions.some((value) => value.startsWith("right-") && value !== "right-reserve"), `${name}: opening contradicts one-side placement`);
}
assert.strictEqual(guides.filter((item) => item.sourceEvidence.currentDataVerified).length, 21, "all 21 audit rows must be verified");
assert.strictEqual(guides.filter((item) => item.sourceEvidence.imageCount > 0).length, 12, "12 dedicated guides must include image review");
assert.strictEqual(guides.reduce((sum, item) => sum + item.sourceEvidence.imageCount, 0), 40, "all 40 guide images must be accounted for");

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
