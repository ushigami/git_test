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

// Single-enemy results must expose distinct counter concepts. Screening-only
// Crawler variants belong in DETAILS, while a direct Crawler counter remains.
const fangBaseline = new Map(data.matchups.Fang.map((entry) => [entry.unit, entry.grade]));
const fangOwnBaseline = new Map([["Fang", calculator.bestOwnCoverage("Fang", [])]]);
const fangPool = calculator.candidatePool(["Fang"], new Set(), fangOwnBaseline);
(["Hound", "Mustang", "Stormcaller", "Fire Badger", "Typhoon", "Wraith", "Vulcan", "Arclight"]).forEach((name) => {
  assert(fangPool.includes(name), `Fang candidate pool missing ${name}`);
});
assert.strictEqual(fangBaseline.get("Arclight"), "A", "Fang/Arclight baseline regression");
const fangResults = calculator.calculate(["Fang"], [], { limit: 10 });
const fangPackages = fangResults.map((result) => result.package.join("+"));
assert(fangPackages.includes("Hound") && fangPackages.includes("Mustang") && fangPackages.includes("Fire Badger"), "Fang top results need diverse direct counters");
assert(!fangPackages.some((name) => name === "Mustang+Crawler" || name === "Crawler+Mustang"), "Mustang support-Crawler duplicate leaked into RESULT");
assert(!fangPackages.some((name) => name === "Vulcan+Crawler" || name === "Crawler+Vulcan"), "Vulcan support-Crawler duplicate leaked into RESULT");
assert.strictEqual(new Set(fangResults.map((result) => calculator.coreSignature(result, ["Fang"]))).size, fangResults.length, "single enemy core signatures must be unique");
const marksmanNoOwn = calculator.calculate(["Marksman"], [], { limit: 10 });
assert(marksmanNoOwn.some((result) => result.package.length === 1 && result.package[0] === "Crawler"), "direct Crawler counter must be preserved");
const fangFortressOwn = calculator.calculate(["Fang", "Fortress"], ["Crawler", "Arclight"], { limit: 10 });
assert.deepStrictEqual(fangFortressOwn[0].package, ["Melting Point"], "Own Arclight should keep Fang duty while Melting Point answers Fortress");
assert.strictEqual(fangFortressOwn[0].assignments.find((item) => item.enemy === "Fang").answer, "OWN Arclight", "Own Arclight Fang coverage must be reused");
assert.strictEqual(fangFortressOwn[0].assignments.find((item) => item.enemy === "Fortress").answer, "Melting Point", "Fortress needs the direct S answer");
for (const enemy of ["Phoenix", "Wasp"]) {
  const results = calculator.calculate([enemy], [], { limit: 5 });
  assert.strictEqual(new Set(results.map((result) => calculator.coreSignature(result, [enemy]))).size, results.length, `${enemy} results repeated one core concept`);
  assert(results.filter((result) => result.package.includes("Phoenix")).length <= 1, `${enemy} results over-promoted Phoenix variants`);
  assert(results.filter((result) => result.package.includes("Mustang")).length <= 1, `${enemy} results over-promoted Mustang variants`);
}
for (const enemy of data.units.map((item) => item.name)) {
  const baseline = new Map([[enemy, calculator.bestOwnCoverage(enemy, [])]]);
  const pool = calculator.candidatePool([enemy], new Set(), baseline);
  data.matchups[enemy].forEach((entry) => assert(pool.includes(entry.unit), `${enemy} candidate pool omitted direct counter ${entry.unit}`));
  const results = calculator.calculate([enemy], [], { limit: 5 });
  assert.strictEqual(new Set(results.map((result) => calculator.coreSignature(result, [enemy]))).size, results.length, `${enemy} top results repeated a core concept`);
}

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

// Threat/capability engine regressions A-E.
const tacticalA = calculator.calculate(["Phoenix", "Typhoon"], [], { limit: 10 });
assert.notDeepStrictEqual(tacticalA[0].package, ["Marksman"], "Case A must not pin Marksman single to rank 1");
assert(tacticalA.slice(0, 6).some((result) => result.package.length === 1 && result.package[0] === "Fortress" && result.techPackages.some((tech) => tech.id === "anti-air-barrage")), "Case A top results missing Fortress + Anti-Air Barrage");
assert(tacticalA.slice(0, 6).some((result) => result.package.includes("Raiden")), "Case A top results missing multi-threat Raiden");
assert(tacticalA.slice(0, 3).some((result) => result.package.includes("Scorpion") && result.package.includes("Wasp")), "Case A top results missing Scorpion + Wasp");

const tacticalOwn = ["Crawler", "Arclight"];
const tacticalB = calculator.calculate(["Phoenix", "Typhoon"], tacticalOwn, { limit: 10 });
const fortressBIndex = tacticalB.findIndex((result) => result.package.length === 1 && result.package[0] === "Fortress" && result.techPackages.some((tech) => tech.id === "anti-air-barrage"));
const marksmanBIndex = tacticalB.findIndex((result) => result.package.length === 1 && result.package[0] === "Marksman");
assert(fortressBIndex >= 0 && fortressBIndex <= 2, "Case B Fortress + AA must rank in top 3");
assert(marksmanBIndex < 0 || fortressBIndex < marksmanBIndex, "Case B Fortress + AA must outrank Marksman single");
const fortressB = tacticalB[fortressBIndex];
assert(fortressB.roleGapsBefore.includes("frontline") && fortressB.roleGapsBefore.includes("tank") && fortressB.roleGapsBefore.includes("anti_air"), "Case B dynamic role gaps incomplete");
assert(!fortressB.roleGapsAfter.includes("frontline") && !fortressB.roleGapsAfter.includes("tank") && !fortressB.roleGapsAfter.includes("anti_air"), "Case B Fortress package did not close role gaps");
assert(fortressB.roleCompression > 0 && fortressB.structuralSynergy > 0, "Case B compression/structure score missing");
assert(fortressB.details.techNotes.some((line) => line.includes("Anti-Air Barrage") && line.includes("Phoenix") && line.includes("必要")), "Case B TECH NOTES requirement missing");

const tacticalC = calculator.calculate(["Phoenix", "Typhoon"], ["Fortress", "Mustang"], { limit: 10 });
assert.deepStrictEqual(tacticalC[0].package, [], "Case C covered tank/frontline/AA should avoid unnecessary pivot");
assert(!tacticalC[0].techPackages.some((tech) => tech.id === "anti-air-barrage"), "Case C must not buy redundant Fortress AA");

const tacticalD = calculator.calculate(["Phoenix"], ["Fortress"], { limit: 10 });
const fortressDIndex = tacticalD.findIndex((result) => result.package[0] === "Fortress" && result.techPackages.some((tech) => tech.id === "anti-air-barrage"));
assert(fortressDIndex >= 0 && fortressDIndex <= 2, "Case D existing Fortress + AA must be a top-3 investment axis");
assert(tacticalD[fortressDIndex].existingUnitAdvantage > 0, "Case D existing-unit advantage missing");
assert.strictEqual(tacticalD[fortressDIndex].totalCoreCount, 1, "Unit + Tech must remain one core type");

const tacticalE = calculator.calculate(["Typhoon"], tacticalOwn, { limit: 10 });
assert.deepStrictEqual(tacticalE[0].package, ["Scorpion"], "Case E Scorpion S counter must remain rank 1");
assert.strictEqual(tacticalE[0].assignments[0].grade, "S", "Case E direct S grade lost");

// Result-quality follow-up: eight diverse answers, explicit required-Tech
// markers, owned-Tech axes, and fair native-counter competition.
const fangPhoenix = calculator.calculate(["Fang", "Phoenix"], tacticalOwn);
assert.strictEqual(fangPhoenix.length, 8, "default result count must be 8");
const fangPhoenixWasp = fangPhoenix.find((result) => result.displayPackage.join("+") === "Wasp");
assert(fangPhoenixWasp, "Fang + Phoenix must keep Wasp as a visible native answer");
assert(!fangPhoenixWasp.techPackages.some((tech) => tech.unit === "Arclight"), "Wasp answer must not select redundant Arclight AA");
assert(!fangPhoenixWasp.details.techNotes.some((line) => line.includes("Arclight") && line.includes("Anti-Aircraft")), "redundant Arclight AA leaked into TECH NOTES");
assert(fangPhoenix.slice(0, 8).some((result) => result.package.includes("Mustang")), "Fang + Phoenix must retain Mustang in top 8");

const steelWasp = calculator.calculate(["Steel Ball", "Wasp"], tacticalOwn);
const nativeSteelWasp = steelWasp.find((result) => result.package.includes("Scorpion") && result.package.includes("Mustang"));
const convertedSteelWasp = steelWasp.find((result) => result.package.includes("Scorpion") && result.package.includes("Arclight"));
assert(nativeSteelWasp && convertedSteelWasp, "Steel Ball + Wasp must compare native Mustang and owned Arclight AA axes");
assert(steelWasp.indexOf(nativeSteelWasp) <= 2 && steelWasp.indexOf(convertedSteelWasp) <= 2, "native and conversion axes must both rank in top 3");
assert(convertedSteelWasp.displayPackage.some((name) => name === "OWN Arclight (+AA)"), "owned Tech axis must be labeled as OWN, not a new unit");
const convertedWaspAssignment = convertedSteelWasp.assignments.find((item) => item.enemy === "Wasp");
assert(convertedWaspAssignment.requiredTech === "anti-aircraft-ammunition" && convertedWaspAssignment.displayAnswer.includes("(+AA)"), "required AA Tech must be visible on the closed-card assignment");
assert(steelWasp.slice(0, 4).some((result) => result.package.includes("Typhoon") && result.package.includes("Scorpion")), "Steel Ball + Wasp must keep Typhoon + Scorpion near the top");

const crawlerFang = calculator.calculate(["Crawler", "Fang"], []);
const signatureCounts = new Map();
crawlerFang.forEach((result) => {
  const signature = calculator.primaryAnswerSignature(result);
  signatureCounts.set(signature, (signatureCounts.get(signature) || 0) + 1);
});
assert.strictEqual(crawlerFang.length, 8, "Crawler + Fang must expose eight meaningful results");
assert(Math.max(...signatureCounts.values()) <= 2, "one primary-answer signature must not occupy more than two results");
assert(crawlerFang.some((result) => result.package.includes("Vulcan")), "audited Vulcan anti-swarm axis must remain in Crawler + Fang top 8");
assert(new Set(crawlerFang.map((result) => calculator.primaryAnswerSignature(result))).size >= 6, "Crawler + Fang top 8 needs at least six distinct counter concepts");

const goldenFollowup = calculator.calculate(["Phoenix", "Typhoon"], ["Crawler", "Arclight", "Phoenix"]);
assert(goldenFollowup[0].package.includes("Fortress") && goldenFollowup[0].techPackages.some((tech) => tech.id === "anti-air-barrage"), "Phoenix + Typhoon golden Fortress AA case regressed");
assert(goldenFollowup[0].assignments.some((item) => item.displayAnswer === "Fortress (+AA)"), "golden case must mark conditional Fortress coverage on the card");

const noNewFollowup = calculator.calculate(["Phoenix", "Typhoon"], ["Mustang", "Fortress"]);
assert.deepStrictEqual(noNewFollowup[0].package, [], "covered Phoenix + Typhoon must keep NO NEW UNIT first");
const hackerFollowup = calculator.calculate(["Sledgehammer", "Sabertooth"], tacticalOwn);
assert.strictEqual(hackerFollowup[0].package[0], "Hacker", "Hacker regression must remain top-tier");

const fortressNoSupport = calculator.scorePackage(["Fortress"], ["Phoenix", "Typhoon"], []);
assert(fortressNoSupport.supportBurden > fortressB.supportBurden, "Crawler/Arclight must reduce Fortress support burden");
assert(fortressB.costPenalty > calculator.economyPenalty(["Fortress"]), "tactical Tech cost must participate in economy");
for (const key of ["threatCoverage", "roleGapsBefore", "roleGapsAfter", "roleCompression", "techPackages", "supportBurden", "structuralSynergy"]) {
  assert(Object.hasOwn(fortressB, key), `debug score field ${key} missing`);
}

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
