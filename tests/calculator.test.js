const assert = require("assert");
const { performance } = require("perf_hooks");
const { loadData } = require("./load-data");
const { data, calculator } = loadData();

assert.deepStrictEqual(calculator.calculate([], []), [], "zero selection must return safely");

// Direction is counter -> target, while the source table is indexed by target.
assert.strictEqual(calculator.directCounter("Melting Point", "Fortress").grade, "S", "Melting Point must counter Fortress");
assert.strictEqual(calculator.directCounter("Mountain", "Fortress").grade, "A", "Mountain must be an A counter to Fortress");
assert.strictEqual(calculator.directCounter("Fortress", "Melting Point"), null, "Fortress must not be read as a Melting Point counter");
assert.strictEqual(calculator.evaluateExposure(["Melting Point"], ["Fortress"]).penalty, 0, "Enemy Fortress must not expose Melting Point");
assert(calculator.evaluateExposure(["Melting Point"], ["Crawler"]).items.some((item) => item.threat === "Crawler"), "Crawler in Melting Point's target table must create exposure");

// Mirrors are neutral parity, not automatic counters.
assert.strictEqual(calculator.existingMatchup("Arclight", "Arclight").grade, "B", "same-unit mirror must not be A");
assert.strictEqual(calculator.existingMatchup("Rhino", "Rhino").grade, "B", "all mirrors must use parity");

// Crawler is a separate chaff slot and has much lighter acquisition friction.
assert.strictEqual(calculator.coreTypeCount(["Crawler", "Arclight", "Melting Point", "Raiden"]), 3, "Crawler must be excluded from core count");
assert.strictEqual(calculator.coreDiversityPenalty(["Crawler", "Melting Point"], ["Arclight"]), 0, "Crawler must not consume compact core budget");
assert(calculator.economyPenalty(["Crawler"]) < calculator.economyPenalty(["Arclight"]), "Crawler new-unit friction must be lighter than a normal core");
assert.strictEqual(calculator.scorePackage(["Crawler", "Melting Point"], ["Fortress"], []).core, "Melting Point", "Crawler must not replace a real composition core");
assert(!calculator.calculate(["Marksman"], ["Crawler"], { limit: 10 }).some((result) => result.package.includes("Crawler")), "owned Crawler must never be re-added");

// Every live unit carries validated baseline economy data.
assert.strictEqual(data.units.length, 33, "economy coverage requires all 33 units");
data.units.forEach((unit) => {
  assert(Number.isInteger(unit.cost) && unit.cost >= 100, `${unit.name} cost missing`);
  assert(Number.isInteger(unit.unlockCost) && unit.unlockCost >= 0, `${unit.name} unlock cost missing`);
});
const unit = (name) => data.units.find((item) => item.name === name);
assert.deepStrictEqual([unit("Mountain").cost, unit("Mountain").unlockCost], [800, 350], "Mountain economy regression");
assert.deepStrictEqual([unit("Melting Point").cost, unit("Melting Point").unlockCost], [400, 200], "Melting Point economy regression");

// Scenario A: compact two-new-core answer; never the old isolated Mountain.
const enemiesA = ["Crawler", "Arclight", "Marksman", "Fortress"];
const own = ["Crawler", "Arclight"];
const scenarioA = calculator.calculate(enemiesA, own, { limit: 10 });
assert(scenarioA[0].package.includes("Melting Point"), "Scenario A top answer must use the efficient S Fortress counter");
assert.strictEqual(scenarioA[0].package.length, 2, "Scenario A should form a compact two-new-core package");
assert.strictEqual(scenarioA[0].totalCoreCount, 3, "Scenario A completed composition should have three cores including Own Arclight");
assert.strictEqual(scenarioA[0].adequateCoverage, enemiesA.length, "Scenario A must cover every enemy at A/S");
assert.notDeepStrictEqual(scenarioA[0].package, ["Mountain"], "isolated Mountain regression must stay fixed");
assert.strictEqual(scenarioA[0].assignments.find((item) => item.enemy === "Crawler").answer, "OWN Arclight", "Own Arclight must keep Crawler duty");
assert.notStrictEqual(scenarioA[0].assignments.find((item) => item.enemy === "Arclight").answer, "OWN Arclight", "mirror Arclight must not be treated as solved A");

// Scenario B: direct quality and economy naturally favor Melting Point.
const scenarioB = calculator.calculate(["Fortress"], own, { limit: 10 });
assert.deepStrictEqual(scenarioB[0].package, ["Melting Point"], "Fortress-only top answer must be Melting Point");
const mountain = calculator.scorePackage(["Mountain"], ["Fortress"], own);
const melter = calculator.scorePackage(["Melting Point"], ["Fortress"], own);
assert(melter.score > mountain.score, "Melting Point S/cost value must beat Mountain A/cost value");
assert(mountain.titanValuePenalty > 0, "an isolated expensive Titan needs additional value");
assert.strictEqual(melter.exposurePenalty, 0, "Fortress must not apply reverse exposure to Melting Point");

// Scenario C: existing clear means no new unit.
const scenarioC = calculator.calculate(["Crawler"], own, { limit: 10 });
assert.deepStrictEqual(scenarioC[0].package, [], "covered Crawler must allow NO NEW UNIT");
assert.strictEqual(scenarioC[0].assignments[0].answer, "OWN Arclight", "Own Arclight must retain chaff-clear duty");

// Scenario D: four total cores are allowed only when the complex board pays for them.
const enemiesD = ["Crawler", "Fortress", "Phoenix", "Stormcaller", "Sabertooth"];
const scenarioD = calculator.calculate(enemiesD, own, { limit: 10 });
assert(scenarioD.some((result) => result.totalCoreCount === 4), "complex Scenario D must allow a fourth total core");
assert(scenarioD[0].marginalValues && Object.values(scenarioD[0].marginalValues).every((value) => value > 0), "every Scenario D addition needs positive marginal contribution");

// Fifth core remains searchable, but its gate is stronger than the fourth.
assert.strictEqual(calculator.marginalThreshold(4), 8, "fourth core requires moderate marginal value");
assert.strictEqual(calculator.marginalThreshold(5), 18, "fifth core requires high marginal value");
assert(calculator.marginalThreshold(5) > calculator.marginalThreshold(4), "fifth-core gate must be stronger");
const fiveCoreProbe = calculator.calculate(["Mountain", "Wasp", "Rhino", "Hacker", "Stormcaller", "Vulcan"], own, { limit: 10 });
assert(fiveCoreProbe.some((result) => result.totalCoreCount === 5), "complex multi-axis input must retain qualifying fifth-core exploration");
assert(fiveCoreProbe.every((result) => result.totalCoreCount <= 5), "search must never exceed five cores");

// Scenario E: a simple enemy board does not force extra complementary cores.
const scenarioE = calculator.calculate(["Crawler", "Fang"], own, { limit: 10 });
assert(scenarioE[0].package.length <= 1, "simple Scenario E should prefer no or one new core");
assert.strictEqual(scenarioE[0].assignments.find((item) => item.enemy === "Crawler").answer, "OWN Arclight", "Scenario E must reuse Own clear");

// Existing conditional matchups and concise result contract remain intact.
for (const enemy of ["Arclight", "Marksman", "Farseer", "Stormcaller"]) {
  const relation = calculator.matchup("Rhino", enemy);
  assert(["S", "A"].includes(relation.grade), `Rhino vs ${enemy} must stay strong`);
  assert(relation.condition, `Rhino vs ${enemy} must retain its condition`);
}
scenarioA.forEach((result) => {
  assert(result.details.roles.length === (result.package.length || own.length), "DETAILS role contract changed");
  assert(result.details.techNotes.length <= 3 && result.details.risks.length <= 4, "DETAILS caps changed");
  assert(result.assignments.every((item) => item.source === "own" || result.package.includes(item.answer)), "assignment must point to Own or package");
});

// Warm browser-like execution and assert both average and worst sample stay below 100ms.
calculator.calculate(enemiesD, own);
const samples = [];
for (let index = 0; index < 20; index += 1) {
  const start = performance.now();
  calculator.calculate(index % 2 ? enemiesA : enemiesD, own);
  samples.push(performance.now() - start);
}
const average = samples.reduce((sum, value) => sum + value, 0) / samples.length;
const maximum = Math.max(...samples);
assert(average < 100, `average calculation ${average.toFixed(2)}ms exceeds 100ms`);
assert(maximum < 100, `maximum calculation ${maximum.toFixed(2)}ms exceeds 100ms`);

console.log(`PASS calculator compact=${scenarioA[0].package.join("+")} core4=${scenarioD[0].package.join("+")} average=${average.toFixed(2)}ms max=${maximum.toFixed(2)}ms`);
