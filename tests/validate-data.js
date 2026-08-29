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
const required = ["roles", "target", "cost", "unlockCost", "supportNeeds", "preferredSupport", "synergies", "placement", "risks", "techExceptions", "goodAgainst", "badAgainst", "sources"];

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
}

assert.deepStrictEqual(Object.keys(data.matchups).sort(), names.slice().sort(), "every unit needs direct matchup data");
for (const [enemy, entries] of Object.entries(data.matchups)) {
  assert(entries.length >= 4, `${enemy} needs primary counters`);
  entries.forEach((entry) => {
    assert(known.has(entry.unit), `${enemy} matchup references ${entry.unit}`);
    assert(["S", "A", "B", "C", "D"].includes(entry.grade), `${enemy}/${entry.unit} grade invalid`);
    assert(entry.reason, `${enemy}/${entry.unit} reason missing`);
  });
}

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
