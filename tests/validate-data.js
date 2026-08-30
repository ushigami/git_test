const assert = require("assert");
const { loadData } = require("./load-data");
const { data } = loadData();

assert(Array.isArray(data.units), "units must be an array");
assert.strictEqual(data.units.length, 33, "exactly 33 live units are required");
const names = data.units.map((unit) => unit.name);
const ids = data.units.map((unit) => unit.id);
assert.strictEqual(new Set(names).size, 33, "unit names must be unique");
assert.strictEqual(new Set(ids).size, 33, "unit IDs must be unique");
assert.deepStrictEqual(names, names.slice().sort((a, b) => a.localeCompare(b)), "units must be A-Z");
const known = new Set(names);
const levels = new Set(["low", "medium", "high"]);
const required = ["roles", "target", "cost", "unlockCost", "supportNeeds", "preferredSupport", "synergies", "placement", "risks", "techExceptions", "recommendedTechSets", "goodAgainst", "badAgainst", "sources"];

for (const unit of data.units) {
  required.forEach((field) => assert(unit[field] != null, `${unit.name}.${field} missing`));
  assert(["ground", "air_ground"].includes(unit.target), `${unit.name}.target invalid`);
  assert(Number.isInteger(unit.cost) && unit.cost >= 100, `${unit.name}.cost invalid`);
  assert(Number.isInteger(unit.unlockCost) && unit.unlockCost >= 0, `${unit.name}.unlockCost invalid`);
  assert(unit.roles.length > 0, `${unit.name}.roles empty`);
  Object.values(unit.supportNeeds).forEach((value) => assert(levels.has(value), `${unit.name}.supportNeeds invalid`));
  assert(unit.placement.depth && unit.placement.notes.length, `${unit.name}.placement incomplete`);
  assert(unit.risks.length && unit.goodAgainst.length && unit.badAgainst.length, `${unit.name} strategy incomplete`);
  assert(unit.sources.length, `${unit.name}.sources empty`);
  [...Object.values(unit.preferredSupport).flat(), ...unit.goodAgainst, ...unit.badAgainst].forEach((name) => assert(known.has(name), `${unit.name} references unknown unit ${name}`));
  unit.synergies.forEach((item) => assert(known.has(item.unit) && item.reason, `${unit.name} synergy invalid`));
  const techIds = new Set((data.techExceptions[unit.name] || []).map((item) => item.id));
  unit.techExceptions.forEach((id) => assert(techIds.has(id), `${unit.name} references unknown tech ${id}`));
  const catalog = new Set(data.recommendedTechCatalog[unit.name] || []);
  assert(catalog.size >= 4, `${unit.name} verified tech catalog missing`);
  assert(unit.recommendedTechSets.length >= 1 && unit.recommendedTechSets.length <= 2, `${unit.name} needs 1-2 recommended tech sets`);
  unit.recommendedTechSets.forEach((set) => {
    assert(set.name && set.note, `${unit.name} recommended set metadata missing`);
    assert.strictEqual(set.techs.length, 4, `${unit.name}/${set.name} must contain exactly 4 techs`);
    assert.strictEqual(new Set(set.techs).size, 4, `${unit.name}/${set.name} contains duplicate techs`);
    set.techs.forEach((tech) => assert(catalog.has(tech), `${unit.name}/${set.name} cannot use ${tech}`));
  });
}

assert.strictEqual(Object.keys(data.recommendedTechCatalog).length, 33, "verified tech catalog must cover all 33 units");
const vortex = data.units.find((unit) => unit.name === "Vortex");
assert.deepStrictEqual(vortex.recommendedTechSets.map((set) => set.name), ["STANDARD", "CARRY"], "Vortex needs current standard and carry setups");
assert.deepStrictEqual(vortex.recommendedTechSets[0].techs, ["Range Enhancement", "Grid Integration", "Mobile Power Station", "Field Maintenance"], "Vortex standard setup regression");

assert.deepStrictEqual(Object.keys(data.matchups).sort(), names.slice().sort(), "every unit needs direct matchup data");
for (const [enemy, entries] of Object.entries(data.matchups)) {
  assert(entries.length >= 4, `${enemy} needs primary counters`);
  entries.forEach((entry) => {
    assert(known.has(entry.unit), `${enemy} matchup references ${entry.unit}`);
    assert(["S", "A", "B", "C", "D"].includes(entry.grade), `${enemy}/${entry.unit} grade invalid`);
    assert(entry.reason, `${enemy}/${entry.unit} reason missing`);
  });
}

assert(data.matchupAudit, "matchup audit metadata missing");
assert.strictEqual(data.matchupAudit.reviewedUnits.length, 33, "baseline audit must cover all 33 units");
assert.deepStrictEqual(data.matchupAudit.reviewedUnits, names.slice().sort(), "baseline audit unit list drifted");
assert.strictEqual(data.matchupAudit.sources.length, 4, "baseline audit needs Companion, both wikis, and official patch source");
const fangBaseline = new Map(data.matchups.Fang.map((entry) => [entry.unit, entry.grade]));
(["Hound", "Mustang", "Stormcaller", "Fire Badger", "Typhoon", "Wraith", "Vulcan"]).forEach((name) => {
  assert.strictEqual(fangBaseline.get(name), "S", `Fang baseline missing S counter ${name}`);
});
(["Arclight", "Tarantula", "Scorpion"]).forEach((name) => {
  assert.strictEqual(fangBaseline.get(name), "A", `Fang baseline missing A counter ${name}`);
});

for (const [name, entries] of Object.entries(data.techExceptions)) {
  assert(known.has(name), `tech exceptions reference unknown unit ${name}`);
  const techIds = new Set();
  entries.forEach((entry) => {
    assert(entry.id && entry.name && entry.effect, `${name} tech structure invalid`);
    assert(Array.isArray(entry.changes) && entry.changes.length, `${name}/${entry.name} changes missing`);
    assert(!techIds.has(entry.id), `${name} duplicate tech id ${entry.id}`);
    techIds.add(entry.id);
  });
}

console.log(`PASS data units=${data.units.length} matchupSets=${Object.keys(data.matchups).length} techUnits=${Object.keys(data.techExceptions).length}`);
