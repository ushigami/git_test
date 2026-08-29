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

  function directMatchup(candidate, enemy) {
    return matchupIndex.get(enemy)?.get(candidate) || null;
  }

  function matchup(candidate, enemy) {
    const exact = directMatchup(candidate, enemy);
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

  function evaluateExposure(packageUnits, enemies) {
    const items = [];
    packageUnits.forEach((candidate) => {
      enemies.forEach((threat) => {
        const incoming = directMatchup(threat, candidate);
        if (!incoming || gradeValue[incoming.grade] < 4) return;
        const mitigation = packageUnits
          .filter((other) => other !== candidate)
          .map((other) => ({ unit: other, matchup: directMatchup(other, threat) }))
          .filter((item) => item.matchup && gradeValue[item.matchup.grade] >= 4)
          .sort((a, b) => gradeValue[b.matchup.grade] - gradeValue[a.matchup.grade] || a.unit.localeCompare(b.unit))[0];
        const basePenalty = incoming.grade === "S" ? 14 : 9;
        const mitigationRate = mitigation ? (mitigation.matchup.grade === "S" ? 0.75 : 0.55) : 0;
        const appliedPenalty = Number((basePenalty * (1 - mitigationRate)).toFixed(2));
        items.push({
          candidate,
          threat,
          grade: incoming.grade,
          reason: incoming.reason,
          condition: incoming.condition || "baseline",
          mitigatedBy: mitigation?.unit || null,
          mitigationGrade: mitigation?.matchup.grade || null,
          basePenalty,
          appliedPenalty
        });
      });
    });
    return { items, penalty: items.reduce((sum, item) => sum + item.appliedPenalty, 0) };
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
    const exposure = evaluateExposure(packageUnits, enemies);
    return {
      package: packageUnits,
      core: coreName,
      assignments,
      exposure: exposure.items,
      exposurePenalty: exposure.penalty,
      score: coverage + strongCoverage + synergyBonus(packageUnits) + ownComplement - penalty - exposure.penalty
    };
  }

  function details(result, enemies, ownArmy) {
    const byName = unitByName();
    const core = byName.get(result.core);

    const namesWithRole = (names, roles) => names.filter((name) => (byName.get(name)?.roles || []).some((role) => roles.includes(role)));
    const supportLine = (roles, key, fallback, need) => {
      const ownProviders = namesWithRole(ownArmy, roles);
      if (ownProviders.length) return [`✓ ${ownProviders.join(" / ")}で確保済み`];
      const packageProviders = namesWithRole(result.package, roles);
      if (packageProviders.length) return [`✓ ${packageProviders.join(" / ")}で確保`];
      const recommendations = [...new Set([...(core.preferredSupport?.[key] || []), ...fallback])].slice(0, 2);
      return recommendations.map((name, index) => `${index === 0 && need === "high" ? "◎" : "○"} ${name}`);
    };

    const roles = result.package.map((name) => {
      const labels = (byName.get(name)?.roles || []).map((role) => data.strategy?.roles?.[role] || role);
      return `${name} → ${labels.join(" / ")}`;
    });
    const support = {
      chaff: supportLine(["chaff", "screen"], "chaff", ["Crawler", "Fang"], core.supportNeeds.screening),
      tank: supportLine(["tank"], "tank", ["Sledgehammer", "Fortress"], core.supportNeeds.tanking),
      clear: supportLine(["chaff_clear"], "clear", ["Arclight", "Fire Badger"], core.supportNeeds.chaffClear)
    };

    const techNotes = [];
    [...new Set([...enemies, ...result.package])].forEach((name) => {
      (data.techExceptions?.[name] || [])
        .filter((item) => item.changes.some((change) => ["target", "matchup", "role"].includes(change)))
        .forEach((item) => {
          if (techNotes.length < 3) techNotes.push(`${name} — ${item.name}: ${item.effect}`);
        });
    });
    if (!techNotes.length) techNotes.push("該当なし（baseline相性を使用）");

    const exposureRisks = result.package.flatMap((candidate) => {
      const items = result.exposure.filter((item) => item.candidate === candidate);
      if (!items.length) return [];
      const threats = items.map((item) => `${item.threat} (${item.grade})`).join("・");
      const covers = [...new Set(items.map((item) => item.mitigatedBy).filter(Boolean))];
      const mitigation = covers.length ? `${covers.join(" / ")}で緩和` : "package内カバーなし";
      return [`${candidate}: ${threats}に露出 / ${mitigation}`];
    });
    const unitRisks = result.package.map((name) => `${name}: ${byName.get(name).risks[0]}`);

    return {
      roles,
      placement: result.package.map((name) => {
        const unit = byName.get(name);
        const depth = data.strategy?.depth?.[unit.placement.depth] || unit.placement.depth;
        return `${name}: ${depth} — ${unit.placement.notes[0]}`;
      }),
      support,
      risks: [...new Set([...exposureRisks, ...unitRisks])].slice(0, 4),
      techNotes: techNotes.slice(0, 3)
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

  return { calculate, matchup, directMatchup, evaluateExposure, scorePackage, combinations, gradeValue };
});
