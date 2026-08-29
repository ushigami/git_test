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

  // matchups[target] contains the units that counter that target. Keeping the
  // argument names explicit prevents the table from being read backwards.
  function directCounter(counter, target) {
    return matchupIndex.get(target)?.get(counter) || null;
  }

  function directMatchup(candidate, enemy) {
    return directCounter(candidate, enemy);
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

  function existingMatchup(candidate, enemy) {
    if (candidate === enemy) {
      return { unit: candidate, grade: "B", reason: "同型unitはbaselineではneutral / parity" };
    }
    return matchup(candidate, enemy);
  }

  function bestOwnCoverage(enemy, ownArmy) {
    if (!ownArmy.length) return { enemy, answer: null, answerUnit: null, source: "none", grade: "D", reason: "Own Armyに回答なし" };
    const best = ownArmy
      .map((candidate) => ({ candidate, ...existingMatchup(candidate, enemy) }))
      .sort((a, b) => gradeValue[b.grade] - gradeValue[a.grade] || a.candidate.localeCompare(b.candidate))[0];
    return { enemy, answer: `OWN ${best.candidate}`, answerUnit: best.candidate, source: "own", grade: best.grade, reason: best.reason };
  }

  function coverageState(grade) {
    const value = gradeValue[grade];
    return value >= 4 ? "covered" : (value === 3 ? "partial" : "uncovered");
  }

  function roleSet(names) {
    const byName = unitByName();
    const roles = new Set();
    names.forEach((name) => (byName.get(name)?.roles || []).forEach((role) => roles.add(role)));
    return roles;
  }

  const isChaffSlot = (name) => name === "Crawler";

  function coreTypeCount(names) {
    return new Set(names.filter((name) => !isChaffSlot(name))).size;
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

  function candidatePool(enemies, ownSet, baseline) {
    const scores = new Map();
    const add = (name, value) => {
      if (byName.has(name) && !ownSet.has(name)) scores.set(name, Math.max(scores.get(name) || 0, value));
    };
    enemies.forEach((enemy) => {
      const state = coverageState(baseline.get(enemy)?.grade || "D");
      const needWeight = state === "uncovered" ? 42 : (state === "partial" ? 24 : 2);
      (data.matchups?.[enemy] || []).forEach((entry) => {
        add(entry.unit, needWeight + gradeValue[entry.grade] * 4);
        const unit = byName.get(entry.unit);
        Object.values(unit.preferredSupport).flat().forEach((name) => add(name, state === "covered" ? 1 : 7));
        unit.synergies.forEach((item) => add(item.unit, state === "covered" ? 1 : 8));
      });
    });
    return [...scores]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 14)
      .map(([name]) => name);
  }

  function coreFor(packageUnits, enemies) {
    const coreUnits = packageUnits.filter((name) => !isChaffSlot(name));
    return (coreUnits.length ? coreUnits : packageUnits)
      .map((name) => ({ name, value: enemies.reduce((sum, enemy) => sum + gradeValue[matchup(name, enemy).grade], 0) }))
      .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name))[0].name;
  }

  function synergyBonus(packageUnits, ownArmy) {
    const byName = unitByName();
    let value = 0;
    packageUnits.forEach((name) => {
      const partners = new Set((byName.get(name)?.synergies || []).map((item) => item.unit));
      packageUnits.forEach((other) => { if (other !== name && partners.has(other)) value += 2.5; });
      ownArmy.forEach((other) => { if (partners.has(other)) value += 3; });

      const unit = byName.get(name);
      const ownRoles = roleSet(ownArmy);
      if (ownArmy.includes("Crawler") && unit?.supportNeeds?.screening !== "low") value += 3;
      if (ownRoles.has("chaff_clear") && ["medium", "high"].includes(unit?.supportNeeds?.chaffClear)) value += 3;
      if ((unit?.roles || []).some((role) => ["anti_giant", "single_target"].includes(role))
        && ownRoles.has("chaff_clear")) value += 2;
    });
    return value;
  }

  function chooseAssignment(enemy, ownArmy, packageUnits) {
    const candidates = [
      ...ownArmy.map((candidate) => ({ candidate, source: "own", ...existingMatchup(candidate, enemy) })),
      ...packageUnits.map((candidate) => ({ candidate, source: "package", ...matchup(candidate, enemy) }))
    ];
    if (!candidates.length) {
      return { enemy, answer: "UNKNOWN", answerUnit: null, source: "none", grade: "D", reason: "回答unitなし" };
    }
    const best = candidates.sort((a, b) => {
      const ownBonus = (item) => item.source === "own" ? (gradeValue[item.grade] >= 4 ? 12 : (gradeValue[item.grade] === 3 ? 4 : 0)) : 0;
      const value = (item) => gradeValue[item.grade] * 10 + ownBonus(item);
      const sourceOrder = a.source === b.source ? 0 : (a.source === "own" ? -1 : 1);
      return value(b) - value(a) || sourceOrder || a.candidate.localeCompare(b.candidate);
    })[0];
    return {
      enemy,
      answer: best.source === "own" ? `OWN ${best.candidate}` : best.candidate,
      answerUnit: best.candidate,
      source: best.source,
      grade: best.grade,
      reason: best.reason
    };
  }

  function roleRedundancy(packageUnits, ownArmy, necessaryUnits) {
    const ownRoles = roleSet(ownArmy);
    let penalty = 0;
    packageUnits.forEach((name) => {
      const roles = byName.get(name)?.roles || [];
      const overlapOwn = roles.filter((role) => ownRoles.has(role)).length;
      penalty += overlapOwn * (necessaryUnits.has(name) ? 0.75 : 2.5);
      const partners = packageUnits.filter((other) => other !== name);
      const overlapPackage = roles.filter((role) => partners.some((other) => (byName.get(other)?.roles || []).includes(role))).length;
      penalty += overlapPackage * (necessaryUnits.has(name) ? 0.35 : 1.25);
    });
    return penalty;
  }

  function roleGroupsFor(name) {
    const groups = new Set();
    const roles = byName.get(name)?.roles || [];
    roles.forEach((role) => {
      if (["chaff", "screen"].includes(role)) groups.add("screen");
      if (role === "tank") groups.add("frontline");
      if (role === "chaff_clear") groups.add("clear");
      if (["single_target", "anti_giant"].includes(role)) groups.add("heavy_dps");
      if (["artillery", "backline_pressure"].includes(role)) groups.add("pressure");
      if (role === "anti_air") groups.add("anti_air");
      if (["control", "utility"].includes(role)) groups.add("utility");
      if (role === "carry") groups.add("carry");
    });
    if (byName.get(name)?.target === "air_ground") groups.add("air_ground_axis");
    return groups;
  }

  function complementaryCoreBonus(packageUnits, ownArmy) {
    const established = new Set();
    ownArmy.forEach((name) => roleGroupsFor(name).forEach((role) => established.add(role)));
    let bonus = 0;
    packageUnits.forEach((name) => {
      if (isChaffSlot(name)) return;
      const novel = [...roleGroupsFor(name)].filter((role) => !established.has(role));
      bonus += Math.min(6, novel.length * 2);
      roleGroupsFor(name).forEach((role) => established.add(role));
    });
    return bonus;
  }

  function economyPenalty(packageUnits) {
    return packageUnits.reduce((sum, name) => {
      const unit = byName.get(name);
      const baseline = (unit.cost / 100) * 1.5 + (unit.unlockCost / 100) * 2.5;
      return sum + (isChaffSlot(name) ? baseline * 0.25 : baseline);
    }, 0);
  }

  function coreDiversityPenalty(packageUnits, ownArmy) {
    const count = coreTypeCount([...ownArmy, ...packageUnits]);
    if (count <= 3) return 0;
    if (count === 4) return 9;
    if (count === 5) return 25;
    return 1000;
  }

  function marginalThreshold(totalCoreCount) {
    if (totalCoreCount <= 3) return 0;
    if (totalCoreCount === 4) return 8;
    if (totalCoreCount === 5) return 18;
    return Number.POSITIVE_INFINITY;
  }

  function evaluateExposure(packageUnits, enemies) {
    const items = [];
    packageUnits.forEach((candidate) => {
      enemies.forEach((threat) => {
        // A threat counters candidate only when it appears in candidate's
        // target table: matchups[candidate].find(threat).
        const incoming = directCounter(threat, candidate);
        if (!incoming || gradeValue[incoming.grade] < 4) return;
        const mitigation = packageUnits
          .filter((other) => other !== candidate)
          .map((other) => ({ unit: other, matchup: directCounter(other, threat) }))
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
    const baselineCoverage = enemies.map((enemy) => bestOwnCoverage(enemy, ownArmy));
    const baselineByEnemy = new Map(baselineCoverage.map((item) => [item.enemy, item]));
    const assignments = enemies.map((enemy) => chooseAssignment(enemy, ownArmy, packageUnits));
    let coverageScore = 0;
    let adequateReplacementPenalty = 0;
    assignments.forEach((item) => {
      const baseline = baselineByEnemy.get(item.enemy);
      const before = gradeValue[baseline.grade];
      const after = gradeValue[item.grade];
      if (before >= 4) {
        if (item.source === "package") adequateReplacementPenalty += 24;
        return;
      }
      if (before === 3) {
        if (after >= 4) coverageScore += 24 + (after - 4) * 8;
        else if (after > before) coverageScore += 8;
        return;
      }
      if (after >= 4) coverageScore += after === 5 ? 64 : 48;
      else if (after === 3) coverageScore += 16;
    });

    const necessaryUnits = new Set();
    const marginalValues = {};
    packageUnits.forEach((name) => {
      const without = enemies.map((enemy) => chooseAssignment(enemy, ownArmy, packageUnits.filter((item) => item !== name)));
      const necessary = assignments.some((item, index) => gradeValue[item.grade] >= 4 && gradeValue[without[index].grade] < 4);
      if (necessary) necessaryUnits.add(name);
      const coverageValue = assignments.reduce((sum, item, index) => {
        const gain = Math.max(0, gradeValue[item.grade] - gradeValue[without[index].grade]);
        const crossesAdequate = gradeValue[item.grade] >= 4 && gradeValue[without[index].grade] < 4;
        return sum + gain * 4 + (crossesAdequate ? 8 : 0);
      }, 0);
      const otherGroups = new Set();
      [...ownArmy, ...packageUnits.filter((item) => item !== name)].forEach((unitName) => roleGroupsFor(unitName).forEach((role) => otherGroups.add(role)));
      const novelRoles = [...roleGroupsFor(name)].filter((role) => !otherGroups.has(role)).length;
      const partners = new Set((byName.get(name)?.synergies || []).map((item) => item.unit));
      const partnerValue = [...ownArmy, ...packageUnits.filter((item) => item !== name)].filter((unitName) => partners.has(unitName)).length * 3;
      marginalValues[name] = coverageValue + Math.min(6, novelRoles * 2) + partnerValue;
    });
    const unnecessaryPivotPenalty = packageUnits.reduce((sum, name) => {
      const required = isChaffSlot(name) ? 2 : 7;
      return sum + Math.max(0, required - marginalValues[name]) * (isChaffSlot(name) ? 0.35 : 1.5);
    }, 0);
    const ownRoles = roleSet(ownArmy);
    const missingRoleSet = new Set();
    packageUnits.forEach((name) => {
      if (!necessaryUnits.has(name)) return;
      (byName.get(name)?.roles || []).forEach((role) => { if (!ownRoles.has(role)) missingRoleSet.add(role); });
    });
    const missingRoleBonus = Math.min(12, missingRoleSet.size * 4);
    const complementBonus = complementaryCoreBonus(packageUnits, ownArmy);
    const roleRedundancyPenalty = roleRedundancy(packageUnits, ownArmy, necessaryUnits);
    const newUnitPenalty = packageUnits.reduce((sum, name) => sum + (isChaffSlot(name) ? 1.5 : 4), 0);
    const costPenalty = economyPenalty(packageUnits);
    const diversityPenalty = coreDiversityPenalty(packageUnits, ownArmy);
    const coreName = packageUnits.length ? coreFor(packageUnits, enemies) : null;
    const exposure = evaluateExposure(packageUnits, enemies);
    const adequateCoverage = assignments.filter((item) => gradeValue[item.grade] >= 4).length;
    const baselineGapCount = baselineCoverage.filter((item) => gradeValue[item.grade] < 4).length;
    const newCoreCount = coreTypeCount(packageUnits);
    const simpleCompositionPenalty = enemies.length <= 2
      ? Math.max(0, newCoreCount - Math.min(1, baselineGapCount)) * 18
      : 0;
    const titanValuePenalty = packageUnits.reduce((sum, name) => {
      if ((byName.get(name)?.cost || 0) < 800) return sum;
      const strongDuties = assignments.filter((item) => item.answerUnit === name && gradeValue[item.grade] >= 4).length;
      const explicitPartners = (byName.get(name)?.synergies || []).filter((item) => ownArmy.includes(item.unit) || packageUnits.includes(item.unit)).length;
      const multiValue = strongDuties + explicitPartners;
      return sum + Math.max(0, 2 - multiValue) * 12;
    }, 0);
    return {
      package: packageUnits,
      core: coreName,
      assignments,
      baselineCoverage,
      adequateCoverage,
      exposure: exposure.items,
      exposurePenalty: exposure.penalty,
      newUnitPenalty,
      roleRedundancyPenalty,
      missingRoleBonus,
      complementBonus,
      costPenalty,
      diversityPenalty,
      titanValuePenalty,
      simpleCompositionPenalty,
      unnecessaryPivotPenalty,
      adequateReplacementPenalty,
      marginalValues,
      totalCoreCount: coreTypeCount([...ownArmy, ...packageUnits]),
      necessaryUnits: [...necessaryUnits],
      score: coverageScore + missingRoleBonus + complementBonus + synergyBonus(packageUnits, ownArmy)
        - newUnitPenalty - roleRedundancyPenalty - unnecessaryPivotPenalty
        - adequateReplacementPenalty - exposure.penalty - costPenalty
        - diversityPenalty - titanValuePenalty - simpleCompositionPenalty
    };
  }

  function details(result, enemies, ownArmy) {
    const byName = unitByName();
    const core = byName.get(result.core);

    const namesWithRole = (names, roles) => names.filter((name) => (byName.get(name)?.roles || []).some((role) => roles.includes(role)));
    const supportLine = (roles, key, fallback, need, securedLabel) => {
      const ownProviders = namesWithRole(ownArmy, roles);
      if (ownProviders.length) return [`✓ ${ownProviders.join(" / ")}で${securedLabel}確保済み`];
      const packageProviders = namesWithRole(result.package, roles);
      if (packageProviders.length) return [`✓ ${packageProviders.join(" / ")}で${securedLabel}確保`];
      if (!core) return ["今回のEnemy coverageでは追加不要"];
      const recommendations = [...new Set([...(core.preferredSupport?.[key] || []), ...fallback])].slice(0, 2);
      return recommendations.map((name, index) => `${index === 0 && need === "high" ? "◎" : "○"} ${name}`);
    };

    const roleUnits = result.package.length ? result.package : ownArmy;
    const roles = roleUnits.map((name) => {
      const labels = (byName.get(name)?.roles || []).map((role) => data.strategy?.roles?.[role] || role);
      return `${result.package.length ? name : `OWN ${name}`} → ${labels.join(" / ")}`;
    });
    const support = {
      chaff: supportLine(["chaff", "screen"], "chaff", ["Crawler", "Fang"], core?.supportNeeds.screening || "low", ""),
      tank: supportLine(["tank"], "tank", ["Sledgehammer", "Fortress"], core?.supportNeeds.tanking || "low", ""),
      clear: supportLine(["chaff_clear"], "clear", ["Arclight", "Fire Badger"], core?.supportNeeds.chaffClear || "low", "Chaff clear")
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
      placement: result.package.length ? result.package.map((name) => {
        const unit = byName.get(name);
        const depth = data.strategy?.depth?.[unit.placement.depth] || unit.placement.depth;
        return `${name}: ${depth} — ${unit.placement.notes[0]}`;
      }) : ["新規unitなし。既存配置を維持。"],
      support,
      risks: ([...new Set([...exposureRisks, ...unitRisks])].slice(0, 4).length
        ? [...new Set([...exposureRisks, ...unitRisks])].slice(0, 4)
        : ["新規pivotなし。Lv / Tech差を確認。"]),
      techNotes: techNotes.slice(0, 3)
    };
  }

  function compareResults(a, b) {
    return b.adequateCoverage - a.adequateCoverage
      || b.score - a.score
      || a.totalCoreCount - b.totalCoreCount
      || a.package.length - b.package.length
      || a.package.join("+").localeCompare(b.package.join("+"));
  }

  function explorePackages(candidates, enemies, ownArmy) {
    const empty = scorePackage([], enemies, ownArmy);
    const ranked = [empty];
    let frontier = [{ packageUnits: [], lastIndex: -1, result: empty }];
    const maxPackageSize = Math.min(candidates.length, ownArmy.includes("Crawler") ? 5 : 6);
    const beamWidth = 20;

    for (let depth = 1; depth <= maxPackageSize && frontier.length; depth += 1) {
      const next = [];
      frontier.forEach((state) => {
        for (let index = state.lastIndex + 1; index < candidates.length; index += 1) {
          const packageUnits = [...state.packageUnits, candidates[index]];
          const totalCoreCount = coreTypeCount([...ownArmy, ...packageUnits]);
          if (totalCoreCount > 5) continue;
          const result = scorePackage(packageUnits, enemies, ownArmy);
          const addedCore = totalCoreCount > state.result.totalCoreCount;
          const threshold = addedCore ? marginalThreshold(totalCoreCount) : 0;
          if (threshold && result.score - state.result.score < threshold) continue;
          next.push({ packageUnits, lastIndex: index, result });
          ranked.push(result);
        }
      });
      next.sort((a, b) => compareResults(a.result, b.result));
      frontier = next.slice(0, beamWidth);
    }
    return ranked;
  }

  function calculate(enemySelection, ownSelection, options) {
    const enemies = [...new Set(enemySelection || [])].filter((name) => unitByName().has(name));
    const ownArmy = [...new Set(ownSelection || [])].filter((name) => unitByName().has(name));
    if (!enemies.length) return [];
    const limit = Math.max(1, Math.min(10, options?.limit || 5));
    const ownSet = new Set(ownArmy);
    const baseline = new Map(enemies.map((enemy) => [enemy, bestOwnCoverage(enemy, ownArmy)]));
    const candidates = candidatePool(enemies, ownSet, baseline);
    const ranked = explorePackages(candidates, enemies, ownArmy)
      .sort(compareResults)
      .slice(0, limit)
      .map((result, index) => ({
        ...result,
        label: index === 0 ? "RECOMMENDED" : (result.adequateCoverage === enemies.length ? "GOOD" : "CONDITIONAL"),
        details: details(result, enemies, ownArmy)
      }));
    return ranked;
  }

  return {
    calculate, matchup, existingMatchup, bestOwnCoverage, chooseAssignment,
    directCounter, directMatchup, evaluateExposure, scorePackage, combinations,
    coreTypeCount, isChaffSlot, marginalThreshold, economyPenalty,
    coreDiversityPenalty, explorePackages, gradeValue
  };
});
