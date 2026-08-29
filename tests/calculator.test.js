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
assert(withOwn[0].details.support.chaff.some((line) => line.includes("確保済み")), "Own chaff must be shown as already secured");

for (const enemy of ["Arclight", "Marksman", "Farseer", "Stormcaller"]) {
  const relation = calculator.matchup("Rhino", enemy);
  assert(["S", "A"].includes(relation.grade), `Rhino vs ${enemy} must remain a conditional strong matchup`);
  assert(relation.condition, `Rhino vs ${enemy} must state its reach/screen condition`);
}
assert.strictEqual(calculator.matchup("Marksman", "Rhino").grade, "C", "Marksman must not be a baseline Rhino counter");
assert.strictEqual(calculator.matchup("Arclight", "Rhino").grade, "C", "Arclight must not be a baseline Rhino counter");

const exposed = calculator.evaluateExposure(["Rhino"], ["Sabertooth", "Fortress"]);
const covered = calculator.evaluateExposure(["Rhino", "Melting Point"], ["Sabertooth", "Fortress"]);
const scoredRhino = calculator.scorePackage(["Rhino"], ["Sabertooth", "Fortress"], []);
assert.deepStrictEqual(exposed.items.filter((item) => item.candidate === "Rhino").map((item) => item.threat), ["Sabertooth", "Fortress"], "Rhino must expose both hard threats");
assert(exposed.items.every((item) => !item.mitigatedBy), "single Rhino must have no package mitigation");
assert.strictEqual(scoredRhino.exposurePenalty, exposed.penalty, "hard-counter exposure must be subtracted by package scoring");
for (const item of covered.items.filter((entry) => entry.candidate === "Rhino")) {
  const original = exposed.items.find((entry) => entry.threat === item.threat);
  assert.strictEqual(item.mitigatedBy, "Melting Point", `${item.threat} exposure must be covered by Melting Point`);
  assert(item.appliedPenalty < original.appliedPenalty, "coverage must reduce, not erase, exposure penalty");
}

const regressionEnemies = ["Crawler", "Arclight", "Marksman", "Sabertooth", "Rhino", "Fortress"];
const regression = calculator.calculate(regressionEnemies, ["Crawler"], { limit: 10 });
assert(regression.length > 0, "specified regression scenario must return recommendations");
regression.forEach((result) => {
  assert.deepStrictEqual(result.assignments.map((item) => item.enemy), regressionEnemies, "every enemy needs a normal assignment");
  assert(result.assignments.every((item) => result.package.includes(item.answer) && calculator.gradeValue[item.grade] !== undefined), "assignment answer and grade must be valid");
  assert(result.details.roles.length === result.package.length, "DETAILS must show one ROLE line per package unit");
  assert(result.details.support.chaff.length > 0 && result.details.support.tank.length > 0, "DETAILS must give concrete chaff and tank status");
  assert(result.details.techNotes.length <= 3, "Tech Notes must be capped at three");
  assert(result.details.risks.length <= 4, "Risks must be capped at four");
});
const rhinoResult = regression.find((result) => result.package.includes("Rhino"));
assert(rhinoResult, "regression should evaluate at least one Rhino package without hardcoding its rank");
for (const threat of ["Sabertooth", "Fortress"]) {
  assert(rhinoResult.exposure.some((item) => item.candidate === "Rhino" && item.threat === threat && item.appliedPenalty > 0), `Rhino ${threat} exposure must affect score`);
}
assert(rhinoResult.details.risks.some((risk) => risk.startsWith("Rhino:") && risk.includes("Sabertooth") && risk.includes("Fortress")), "Rhino exposure must be visible in concise Risks");

const samples = [];
for (let index = 0; index < 20; index += 1) {
  const start = performance.now();
  calculator.calculate(["Steel Ball", "Marksman", "Crawler", "Raiden"], ["Fang", "Arclight", "Sledgehammer"]);
  samples.push(performance.now() - start);
}
const average = samples.reduce((sum, value) => sum + value, 0) / samples.length;
const maximum = Math.max(...samples);
assert(average < 100, `average calculation ${average.toFixed(2)}ms exceeds 100ms`);
console.log(`PASS calculator scenarios=4 exposure=${exposed.penalty.toFixed(2)} covered=${covered.penalty.toFixed(2)} average=${average.toFixed(2)}ms max=${maximum.toFixed(2)}ms topA=${scenarioA[0].package.join("+")}`);
