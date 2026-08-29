(function (root, factory) {
  "use strict";
  const api = factory(root.MECH_DATA || {});
  root.MECH_CALCULATOR = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : window, function (data) {
  "use strict";

  const gradeValue = { S: 5, A: 4, B: 3, C: 2, D: 0 };
  const byName = new Map((data.units || []).map((unit) => [unit.name, unit]));
  const matchupIndex = new Map(Object.entries(data.matchups || {}).map(([enemy, entries]) => [
    enemy, new Map(entries.map((entry) => [entry.unit, entry]))
  ]));
  const unitByName = () => byName;

  function matchup(candidate, enemy) {
    const exact = matchupIndex.get(enemy)?.get(candidate);
    if (exact) return exact;
    const unit = unitByName().get(candidate);
    if (unit && unit.goodAgainst.includes(enemy)) {
      return { unit: candidate, grade: "B", reason: "strategy data上のsoft counter" };
    }
    return { unit: candidate, grade: "C", reason: "直接相性は中立。package内のsupport役" };
  }

  function roleSet(names) {
    const byName = unitByName();
    const roles = new Set();
    names.forEach((name) => (byName.get(name)?.roles || []).forEach((role) => roles.add(role)));
    return roles;
  }

  function combinations(items, maxSize) {
    const output = [];
    function walk(start, selected) {
      if (selected.length) output.push(selected.slice());
      if (selected.length === maxSize) return;
      for (let index = start; index < items.length; index += 1) {
        selected.push(items[index]);
        walk(index + 1, selected);
        selected.pop();
      }
    }
    walk(0, []);
    return output;
  }

  function candidatePool(enemies, ownSet) {
    const scores = new Map();
    const add = (name, value) => {
      if (byName.has(name) && !ownSet.has(name)) scores.set(name, Math.max(scores.get(name) || 0, value));
    };
    enemies.forEach((enemy) => {
      (data.matchups?.[enemy] || []).forEach((entry) => {
        add(entry.unit, gradeValue[entry.grade] * 10);
        const unit = byName.get(entry.unit);
        Object.values(unit.preferredSupport).flat().forEach((name) => add(name, 8));
        unit.synergies.forEach((item) => add(item.unit, 9));
      });
    });
    return [...scores]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 22)
      .map(([name]) => name);
  }

  function coreFor(packageUnits, enemies) {
    return packageUnits
      .map((name) => ({ name, value: enemies.reduce((sum, enemy) => sum + gradeValue[matchup(name, enemy).grade], 0) }))
      .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name))[0].name;
  }

  function supportPenalty(core, roles) {
    const penalties = { high: 12, medium: 5, low: 0 };
    let value = 0;
    if (!roles.has("chaff") && !roles.has("screen")) value += penalties[core.supportNeeds.screening];
    if (!roles.has("chaff_clear")) value += penalties[core.supportNeeds.chaffClear];
    if (!roles.has("tank") && !roles.has("screen")) value += penalties[core.supportNeeds.tanking];
    return value;
  }

  function synergyBonus(packageUnits) {
    const byName = unitByName();
    let value = 0;
    packageUnits.forEach((name) => {
      const partners = new Set((byName.get(name)?.synergies || []).map((item) => item.unit));
      packageUnits.forEach((other) => { if (other !== name && partners.has(other)) value += 1.5; });
    });
    return value;
  }

  function redundancyPenalty(packageUnits, enemies) {
    if (packageUnits.length < 2) return 0;
    let penalty = 0;
    packageUnits.forEach((name) => {
      const useful = enemies.some((enemy) => {
        const own = gradeValue[matchup(name, enemy).grade];
        const bestOther = Math.max(...packageUnits.filter((item) => item !== name).map((item) => gradeValue[matchup(item, enemy).grade]));
        return own > bestOther;
      });
      if (!useful) penalty += 2.5;
    });
    return penalty;
  }

  function scorePackage(packageUnits, enemies, ownArmy) {
    const assignments = enemies.map((enemy) => {
      const best = packageUnits
        .map((candidate) => ({ candidate, ...matchup(candidate, enemy) }))
        .sort((a, b) => gradeValue[b.grade] - gradeValue[a.grade] || a.candidate.localeCompare(b.candidate))[0];
      return { enemy, answer: best.candidate, grade: best.grade, reason: best.reason };
    });
    const coverage = assignments.reduce((sum, item) => sum + gradeValue[item.grade] * 10, 0);
    const strongCoverage = assignments.filter((item) => gradeValue[item.grade] >= 4).length * 5;
    const roles = roleSet([...ownArmy, ...packageUnits]);
    const coreName = coreFor(packageUnits, enemies);
    const core = unitByName().get(coreName);
    const ownRoles = roleSet(ownArmy);
    const ownComplement = core && (
      (core.supportNeeds.screening !== "low" && (ownRoles.has("chaff") || ownRoles.has("screen"))) ||
      (core.supportNeeds.chaffClear !== "low" && ownRoles.has("chaff_clear")) ||
      (core.supportNeeds.tanking !== "low" && (ownRoles.has("tank") || ownRoles.has("screen")))
    ) ? 5 : 0;
    const penalty = (core ? supportPenalty(core, roles) : 0)
      + (packageUnits.length - 1) * 4.5
      + redundancyPenalty(packageUnits, enemies);
    return {
      package: packageUnits,
      core: coreName,
      assignments,
      score: coverage + strongCoverage + synergyBonus(packageUnits) + ownComplement - penalty
    };
  }

  function details(result, enemies, ownArmy) {
    const byName = unitByName();
    const allRoles = roleSet([...ownArmy, ...result.package]);
    const core = byName.get(result.core);
    const missing = [];
    if (core.supportNeeds.screening !== "low" && !allRoles.has("chaff") && !allRoles.has("screen")) missing.push("screen/chaffが不足");
    if (core.supportNeeds.chaffClear !== "low" && !allRoles.has("chaff_clear")) missing.push("chaff clearが不足");
    if (core.supportNeeds.tanking !== "low" && !allRoles.has("tank") && !allRoles.has("screen")) missing.push("frontlineが不足");

    const techNotes = [];
    [...new Set([...enemies, ...result.package])].forEach((name) => {
      (data.techExceptions?.[name] || [])
        .filter((item) => item.changes.some((change) => ["target", "matchup", "role", "missile", "spawn"].includes(change)))
        .slice(0, 2)
        .forEach((item) => techNotes.push(`${name} — ${item.name}: ${item.effect}`));
    });
    if (!techNotes.length) techNotes.push("Role-changing Techが見えたらbaseline相性を再確認。");

    return {
      why: result.assignments.map((item) => `${item.enemy} → ${item.answer} (${item.grade}): ${item.reason}`),
      placement: result.package.map((name) => {
        const unit = byName.get(name);
        const depth = data.strategy?.depth?.[unit.placement.depth] || unit.placement.depth;
        return `${name}: ${depth} / ${unit.placement.notes.join(" / ")}`;
      }),
      support: missing.length ? missing : [ownArmy.length ? "入力済みOwn Armyをsupportとして考慮済み。" : "package内で主要support roleを確保。"],
      risks: [...new Set(result.package.flatMap((name) => byName.get(name).risks))].slice(0, 4),
      techNotes
    };
  }

  function calculate(enemySelection, ownSelection, options) {
    const enemies = [...new Set(enemySelection || [])].filter((name) => unitByName().has(name));
    const ownArmy = [...new Set(ownSelection || [])].filter((name) => unitByName().has(name));
    if (!enemies.length) return [];
    const limit = Math.max(1, Math.min(10, options?.limit || 5));
    const ownSet = new Set(ownArmy);
    const candidates = candidatePool(enemies, ownSet);
    const ranked = combinations(candidates, 3)
      .map((packageUnits) => scorePackage(packageUnits, enemies, ownArmy))
      .sort((a, b) => b.score - a.score || a.package.length - b.package.length || a.package.join("+").localeCompare(b.package.join("+")))
      .slice(0, limit)
      .map((result, index) => ({
        ...result,
        label: index === 0 ? "RECOMMENDED" : (result.score >= rankedThreshold(enemies.length, 4) ? "GOOD" : "CONDITIONAL"),
        details: details(result, enemies, ownArmy)
      }));
    return ranked;
  }

  function rankedThreshold(enemyCount, grade) {
    return enemyCount * grade * 10;
  }

  return { calculate, matchup, combinations, gradeValue };
});
