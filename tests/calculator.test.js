const assert = require("assert");
const { performance } = require("perf_hooks");
const { loadData } = require("./load-data");
const { data, calculator } = loadData();

assert.deepStrictEqual(calculator.calculate([], []), [], "zero selection must return safely");

const one = calculator.calculate(["Steel Ball"], []);
assert(one.length > 0, "one enemy must return results");
for (const result of one) {
  assert(result.package.length >= 1 && result.package.length <= 3, "package must contain 1-3 units");
  assert.strictEqual(new Set(result.package).size, result.package.length, "package units must be unique");
}

const scenarioA = calculator.calculate(["Steel Ball", "Marksman", "Crawler"], []);
assert(scenarioA.length > 0, "Scenario A must return results");
assert(scenarioA[0].assignments.every((item) => ["S", "A"].includes(item.grade)), "Scenario A must keep direct strong assignments");
const answerRoles = new Set(scenarioA[0].package.flatMap((name) => data.units.find((unit) => unit.name === name).roles));
assert(answerRoles.has("single_target") || answerRoles.has("anti_giant"), "Scenario A needs heavy/medium answer");
assert(answerRoles.has("chaff") || answerRoles.has("screen"), "Scenario A needs screen");
assert(answerRoles.has("chaff_clear"), "Scenario A needs chaff clear");

const vortex = calculator.calculate(["Vortex"], []);
assert(vortex[0].package.some((name) => ["Phoenix", "Phantom Ray", "Wraith"].includes(name)), "Scenario B must recognize Air answer");
assert(vortex[0].details.techNotes.some((note) => note.includes("Ground Only")), "Scenario B needs baseline targeting note");

const withoutOwn = calculator.calculate(["Tarantula"], []);
const withOwn = calculator.calculate(["Tarantula"], ["Crawler", "Arclight"]);
assert.notDeepStrictEqual(withOwn[0].package, withoutOwn[0].package, "Own Army must change recommendation");
assert.strictEqual(withOwn[0].package.length, 1, "Scenario C should not add unnecessary support");
assert(!withOwn[0].package.includes("Crawler") && !withOwn[0].package.includes("Arclight"), "existing Own roles must not be re-added");

const samples = [];
for (let index = 0; index < 20; index += 1) {
  const start = performance.now();
  calculator.calculate(["Steel Ball", "Marksman", "Crawler", "Raiden"], ["Fang", "Arclight", "Sledgehammer"]);
  samples.push(performance.now() - start);
}
const average = samples.reduce((sum, value) => sum + value, 0) / samples.length;
const maximum = Math.max(...samples);
assert(average < 100, `average calculation ${average.toFixed(2)}ms exceeds 100ms`);
console.log(`PASS calculator scenarios=3 average=${average.toFixed(2)}ms max=${maximum.toFixed(2)}ms topA=${scenarioA[0].package.join("+")}`);
