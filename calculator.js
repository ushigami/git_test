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
  const ownCoverageCache = new Map();
  const roleSetCache = new Map();
  const roleGroupsCache = new Map();
  const scorePackageCache = new Map();
  const roleNeedsCache = new Map();
  const tacticalSelectionCache = new Map();
  const calculateCache = new Map();
  const tacticalTechIndex = new Map();
  (data.tacticalTechs || []).forEach((tech) => {
    if (!tacticalTechIndex.has(tech.unit)) tacticalTechIndex.set(tech.unit, []);
    tacticalTechIndex.get(tech.unit).push(tech);
  });
  const unitByName = () => byName;

  // matchups[target] contains the units that counter that target. Keeping the
  // argument names explicit prevents the table from being read backwards.
  function directCounter(counter, target) {
    return matchupIndex.get(target)?.get(counter) || null;
  }

  function directMatchup(candidate, enemy) {
    return directCounter(candidate, enemy);
  }

  function techForUnit(candidate, techPackages) {
    return (techPackages || []).find((item) => item.unit === candidate) || null;
  }

  function capabilityProfile(names, techPackages) {
    const capabilities = new Set();
    names.forEach((name) => (data.capabilityProfiles?.[name] || []).forEach((role) => capabilities.add(role)));
    (techPackages || []).forEach((item) => (item.add || []).forEach((role) => capabilities.add(role)));
    return capabilities;
  }

  function roleNeeds(enemies) {
    const cacheKey = enemies.slice().sort().join("+");
    if (roleNeedsCache.has(cacheKey)) return roleNeedsCache.get(cacheKey);
    const needs = new Map();
    enemies.forEach((enemy) => {
      (data.threatProfiles?.[enemy]?.tags || []).forEach((tag) => {
        (data.threatResponseRules?.[tag] || []).forEach((response) => {
          const current = needs.get(response.role) || { role: response.role, weight: 0, threats: new Set() };
          current.weight = Math.max(current.weight, response.weight || 1);
          current.threats.add(enemy);
          needs.set(response.role, current);
        });
      });
    });
    const result = [...needs.values()].map((item) => ({ ...item, threats: [...item.threats] }));
    roleNeedsCache.set(cacheKey, result);
    return result;
  }

  function roleResponse(candidate, enemy, techPackages) {
    const capabilities = capabilityProfile([candidate], techPackages?.filter((item) => item.unit === candidate));
    let best = null;
    (data.threatProfiles?.[enemy]?.tags || []).forEach((tag) => {
      (data.threatResponseRules?.[tag] || []).forEach((response) => {
        if (!capabilities.has(response.role)) return;
        const auditedStrength = data.capabilityStrengths?.[candidate]?.[response.role];
        const grade = auditedStrength
          ? (gradeValue[auditedStrength] < gradeValue[response.grade] ? auditedStrength : response.grade)
          : (gradeValue[response.grade] > gradeValue.B ? "B" : response.grade);
        if (!best || gradeValue[grade] > gradeValue[best.grade]) {
          best = { unit: candidate, grade, reason: `${response.role}で${tag} threatを処理` };
        }
      });
    });
    return best;
  }

  function matchup(candidate, enemy, techPackages) {
    if (candidate === enemy) return { unit: candidate, grade: "B", reason: "同型unitはbaselineではneutral / parity" };
    const exact = directMatchup(candidate, enemy);
    let best = exact;
    const selectedTech = techForUnit(candidate, techPackages);
    if (selectedTech) {
      const explicitGrade = selectedTech.matchups?.[enemy];
      const tags = data.threatProfiles?.[enemy]?.tags || [];
      const tagGrade = selectedTech.threatTags?.some((tag) => tags.includes(tag)) ? selectedTech.grade : null;
      const grade = explicitGrade || tagGrade;
      if (grade && (!best || gradeValue[grade] > gradeValue[best.grade])) {
        best = { unit: candidate, grade, reason: `${selectedTech.name}によるTech-adjusted coverage`, condition: selectedTech.name };
      }
    }
    const response = roleResponse(candidate, enemy, techPackages);
    if (response && (!best || gradeValue[response.grade] > gradeValue[best.grade])) best = response;
    if (best) return best;
    const unit = unitByName().get(candidate);
    if (unit && unit.goodAgainst.includes(enemy)) {
      return { unit: candidate, grade: "B", reason: "strategy data上のsoft counter" };
    }
    return { unit: candidate, grade: "C", reason: "直接相性は中立。package内のsupport役" };
  }

  function existingMatchup(candidate, enemy, techPackages) {
    if (candidate === enemy) {
      return { unit: candidate, grade: "B", reason: "同型unitはbaselineではneutral / parity" };
    }
    return matchup(candidate, enemy, techPackages);
  }

  function bestOwnCoverage(enemy, ownArmy) {
    const cacheKey = `${enemy}|${ownArmy.slice().sort().join("+")}`;
    if (ownCoverageCache.has(cacheKey)) return ownCoverageCache.get(cacheKey);
    if (!ownArmy.length) {
      const empty = { enemy, answer: null, answerUnit: null, source: "none", grade: "D", reason: "Own Armyに回答なし" };
      ownCoverageCache.set(cacheKey, empty);
      return empty;
    }
    const best = ownArmy
      .map((candidate) => ({ candidate, ...existingMatchup(candidate, enemy) }))
      .sort((a, b) => gradeValue[b.grade] - gradeValue[a.grade] || a.candidate.localeCompare(b.candidate))[0];
    const result = { enemy, answer: `OWN ${best.candidate}`, answerUnit: best.candidate, source: "own", grade: best.grade, reason: best.reason };
    ownCoverageCache.set(cacheKey, result);
    return result;
  }

  function coverageState(grade) {
    const value = gradeValue[grade];
    return value >= 4 ? "covered" : (value === 3 ? "partial" : "uncovered");
  }

  function roleSet(names) {
    const cacheKey = names.slice().sort().join("+");
    if (roleSetCache.has(cacheKey)) return roleSetCache.get(cacheKey);
    const byName = unitByName();
    const roles = new Set();
    names.forEach((name) => (byName.get(name)?.roles || []).forEach((role) => roles.add(role)));
    roleSetCache.set(cacheKey, roles);
    return roles;
  }

  function selectTacticalTechs(packageUnits, enemies, ownArmy) {
    const cacheKey = `${packageUnits.slice().sort().join("+")}|${enemies.slice().sort().join("+")}|${ownArmy.slice().sort().join("+")}`;
    if (tacticalSelectionCache.has(cacheKey)) return tacticalSelectionCache.get(cacheKey);
    const needs = roleNeeds(enemies);
    const armyUnits = [...new Set([...ownArmy, ...packageUnits])];
    const selected = [];
    [...new Set(packageUnits)].forEach((name) => {
      const candidates = tacticalTechIndex.get(name) || [];
      let best = null;
      candidates.forEach((tech) => {
        if (tech.requiresAny?.length && !tech.requiresAny.some((unit) => ownArmy.includes(unit) || packageUnits.includes(unit))) return;
        const withTech = [...selected, tech];
        let value = 0;
        enemies.forEach((enemy) => {
          const tags = data.threatProfiles?.[enemy]?.tags || [];
          if (!tech.threatTags?.some((tag) => tags.includes(tag)) && !tech.matchups?.[enemy]) return;
          const before = gradeValue[chooseAssignment(enemy, ownArmy, packageUnits, selected).grade];
          const after = gradeValue[chooseAssignment(enemy, ownArmy, packageUnits, withTech).grade];
          const gain = Math.max(0, after - before);
          if (gain) value += gain * 5 + (before < 4 && after >= 4 ? 8 : 0);
        });
        const beforeCapabilities = capabilityProfile(armyUnits, selected);
        const afterCapabilities = capabilityProfile(armyUnits, withTech);
        needs.forEach((need) => {
          if (!beforeCapabilities.has(need.role) && afterCapabilities.has(need.role)) value += need.weight * 2;
        });
        value += ownArmy.includes(name) ? 3 : 0;
        value -= (tech.cost || 0) / 100 * 1.5;
        if (!best || value > best.value) best = { ...tech, value };
      });
      if (best && best.value >= 5) selected.push(best);
    });
    if (tacticalSelectionCache.size >= 8000) tacticalSelectionCache.clear();
    tacticalSelectionCache.set(cacheKey, selected);
    return selected;
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

  function candidatePool(enemies, ownSet, baseline, ownArmy = [...ownSet]) {
    const scores = new Map();
    const add = (name, value, allowOwned = false) => {
      if (byName.has(name) && (!ownSet.has(name) || allowOwned)) scores.set(name, Math.max(scores.get(name) || 0, value));
    };
    enemies.forEach((enemy) => {
      const state = coverageState(baseline.get(enemy)?.grade || "D");
      const needWeight = state === "uncovered" ? 42 : (state === "partial" ? 24 : 2);
      (data.matchups?.[enemy] || []).forEach((entry) => {
        const nativePriority = entry.grade === "S" ? 18 : (entry.grade === "A" ? 8 : 0);
        add(entry.unit, needWeight + gradeValue[entry.grade] * 4 + nativePriority);
        const unit = byName.get(entry.unit);
        Object.values(unit.preferredSupport).flat().forEach((name) => add(name, state === "covered" ? 1 : 7));
        unit.synergies.forEach((item) => add(item.unit, state === "covered" ? 1 : 8));
      });

      // Diversity expansion is intentionally a single-enemy mode. Multi-enemy
      // boards keep the established coverage search and its weighting.
      if (enemies.length === 1) {
        // Reverse-index strategy data as a second source of plausible counters.
        // Direct matchup rows still receive the dominant weight.
        (data.units || []).forEach((unit) => {
          if (unit.goodAgainst.includes(enemy)) add(unit.name, needWeight + 10);
        });

        (data.strategy?.boardPatterns || [])
          .filter((pattern) => pattern.name.toLowerCase().includes(enemy.toLowerCase()))
          .forEach((pattern) => pattern.answers.forEach((name) => add(name, needWeight + 9)));

        const counterRoles = new Set();
        (byName.get(enemy)?.roles || []).forEach((role) => {
          if (["chaff", "screen"].includes(role)) counterRoles.add("chaff_clear");
          if (["tank", "carry"].includes(role)) ["single_target", "anti_giant", "control"].forEach((item) => counterRoles.add(item));
          if (["artillery", "backline_pressure"].includes(role)) counterRoles.add("backline_pressure");
        });
        if (counterRoles.size) {
          (data.units || []).forEach((unit) => {
            if (unit.roles.some((role) => counterRoles.has(role))) add(unit.name, needWeight + 3);
          });
        }
      }
    });
    const needs = roleNeeds(enemies);
    const needWeights = new Map(needs.map((item) => [item.role, item.weight]));
    (data.units || []).forEach((unit) => {
      const fit = (data.capabilityProfiles?.[unit.name] || []).reduce((sum, role) => sum + (needWeights.get(role) || 0), 0);
      if (fit) add(unit.name, 14 + fit * 3);
      const multiThreatFit = enemies.filter((enemy) => gradeValue[matchup(unit.name, enemy, []).grade] >= 4).length;
      if (multiThreatFit >= 2) add(unit.name, 35 + multiThreatFit * 12);
      if (ownArmy.some((own) => (unit.synergies || []).some((item) => item.unit === own))) add(unit.name, 13 + fit);
    });
    (data.tacticalTechs || []).forEach((tech) => {
      const relevant = enemies.some((enemy) => {
        const tags = data.threatProfiles?.[enemy]?.tags || [];
        return tech.matchups?.[enemy] || tech.threatTags?.some((tag) => tags.includes(tag));
      });
      if (relevant) add(tech.unit, 30 + (ownSet.has(tech.unit) ? 25 : 0), true);
    });
    return [...scores]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, enemies.length === 2 ? 15 : (enemies.length === 1 ? 20 : 24))
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

  function chooseAssignment(enemy, ownArmy, packageUnits, techPackages = []) {
    const candidates = [
      ...ownArmy.map((candidate) => ({ candidate, source: "own", ...existingMatchup(candidate, enemy, techPackages) })),
      ...packageUnits.map((candidate) => ({ candidate, source: ownArmy.includes(candidate) ? "own" : "package", ...matchup(candidate, enemy, techPackages) }))
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
    if (roleGroupsCache.has(name)) return roleGroupsCache.get(name);
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
    roleGroupsCache.set(name, groups);
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

  function economyPenalty(packageUnits, techPackages = [], ownArmy = []) {
    return packageUnits.reduce((sum, name) => {
      if (ownArmy.includes(name)) return sum;
      const unit = byName.get(name);
      const baseline = (unit.cost / 100) * 1.5 + (unit.unlockCost / 100) * 2.5;
      return sum + (isChaffSlot(name) ? baseline * 0.25 : baseline);
    }, 0) + techPackages.reduce((sum, tech) => sum + (tech.cost / 100) * 1.5, 0);
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

  function supportBurden(packageUnits, ownArmy, techPackages) {
    const available = capabilityProfile([...ownArmy, ...packageUnits], techPackages);
    let penalty = 0;
    packageUnits.forEach((name) => {
      if (ownArmy.includes(name)) return;
      const needs = byName.get(name)?.supportNeeds || {};
      const charge = (level, role, high, medium) => {
        if (available.has(role)) return;
        if (level === "high") penalty += high;
        else if (level === "medium") penalty += medium;
      };
      charge(needs.screening, "screen", 8, 4);
      charge(needs.chaffClear, "clear", 8, 4);
      charge(needs.tanking, "frontline", 7, 3.5);
    });
    return penalty;
  }

  function structuralSynergy(packageUnits, ownArmy, techPackages) {
    const before = capabilityProfile(ownArmy, []);
    const after = capabilityProfile([...ownArmy, ...packageUnits], techPackages);
    const layers = ["screen", "frontline", "clear", "heavy_dps", "anti_air"];
    const beforeCount = layers.filter((role) => before.has(role)).length;
    const afterCount = layers.filter((role) => after.has(role)).length;
    let bonus = Math.max(0, afterCount - beforeCount) * 3;
    if (after.has("screen") && after.has("frontline") && after.has("clear")) bonus += 8;
    if (after.has("screen") && after.has("clear") && (after.has("heavy_dps") || after.has("anti_air"))) bonus += 4;
    return bonus;
  }

  function scorePackage(packageUnits, enemies, ownArmy) {
    const cacheKey = `${packageUnits.slice().sort().join("+")}|${enemies.slice().sort().join("+")}|${ownArmy.slice().sort().join("+")}`;
    if (scorePackageCache.has(cacheKey)) return scorePackageCache.get(cacheKey);
    const techPackages = selectTacticalTechs(packageUnits, enemies, ownArmy);
    const baselineCoverage = enemies.map((enemy) => bestOwnCoverage(enemy, ownArmy));
    const baselineByEnemy = new Map(baselineCoverage.map((item) => [item.enemy, item]));
    const assignments = enemies.map((enemy) => chooseAssignment(enemy, ownArmy, packageUnits, techPackages));
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
      const reducedPackage = packageUnits.filter((item) => item !== name);
      const reducedTechs = selectTacticalTechs(reducedPackage, enemies, ownArmy);
      const without = enemies.map((enemy) => chooseAssignment(enemy, ownArmy, reducedPackage, reducedTechs));
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
    const newUnitPenalty = packageUnits.reduce((sum, name) => sum + (ownArmy.includes(name) ? 0 : (isChaffSlot(name) ? 1.5 : 4)), 0);
    const costPenalty = economyPenalty(packageUnits, techPackages, ownArmy);
    const diversityPenalty = coreDiversityPenalty(packageUnits, ownArmy);
    const coreName = packageUnits.length ? coreFor(packageUnits, enemies) : null;
    const exposure = evaluateExposure(packageUnits, enemies);
    const adequateCoverage = assignments.filter((item) => gradeValue[item.grade] >= 4).length;
    const baselineGapCount = baselineCoverage.filter((item) => gradeValue[item.grade] < 4).length;
    const newCoreCount = coreTypeCount(packageUnits.filter((name) => !ownArmy.includes(name)));
    const simpleCompositionPenalty = enemies.length <= 2
      ? Math.max(0, newCoreCount - Math.min(1, baselineGapCount)) * 18
      : 0;
    const excessAxisPenalty = enemies.length <= 2
      ? Math.max(0, newCoreCount - Math.min(2, baselineGapCount)) * 35
      : 0;
    const investmentAxisPenalty = enemies.length <= 2 ? Math.max(0, packageUnits.length - 1) * 10 : 0;
    const titanValuePenalty = packageUnits.reduce((sum, name) => {
      if (ownArmy.includes(name)) return sum;
      if ((byName.get(name)?.cost || 0) < 800) return sum;
      const strongDuties = assignments.filter((item) => item.answerUnit === name && gradeValue[item.grade] >= 4).length;
      const explicitPartners = (byName.get(name)?.synergies || []).filter((item) => ownArmy.includes(item.unit) || packageUnits.includes(item.unit)).length;
      const multiValue = strongDuties + explicitPartners;
      return sum + Math.max(0, 2 - multiValue) * 12;
    }, 0);
    const neededRoles = roleNeeds(enemies);
    const beforeCapabilities = capabilityProfile(ownArmy, []);
    const afterCapabilities = capabilityProfile([...ownArmy, ...packageUnits], techPackages);
    const roleGapsBefore = neededRoles.filter((item) => !beforeCapabilities.has(item.role));
    const roleGapsAfter = neededRoles.filter((item) => !afterCapabilities.has(item.role));
    const filledRoles = roleGapsBefore.filter((item) => afterCapabilities.has(item.role));
    const roleGapFill = Math.min(
      filledRoles.reduce((sum, item) => sum + item.weight * 4, 0),
      Math.max(0, baselineGapCount) * 18
    );
    const axisCompression = packageUnits.reduce((sum, name) => {
      const unitTechs = techPackages.filter((item) => item.unit === name);
      const caps = capabilityProfile([name], unitTechs);
      const threatDuties = assignments.filter((item) => item.answerUnit === name && gradeValue[item.grade] >= 4).length;
      if (!threatDuties && !unitTechs.length) return sum;
      const gapDuties = roleGapsBefore.filter((item) => caps.has(item.role)).length;
      const multiThreatAxis = packageUnits.length === 1 && threatDuties >= 2 && gapDuties >= 2 ? 14 : 0;
      return sum + Math.max(0, Math.min(5, threatDuties + gapDuties) - 1) * 4.5 + multiThreatAxis;
    }, 0);
    const roleCompression = Math.min(30, axisCompression);
    const structuralSynergyBonus = structuralSynergy(packageUnits, ownArmy, techPackages);
    const supportBurdenPenalty = supportBurden(packageUnits, ownArmy, techPackages);
    const existingUnitAdvantage = techPackages.filter((item) => ownArmy.includes(item.unit)).length * 15;
    const inactiveExistingAxisPenalty = packageUnits.filter(
      (name) => ownArmy.includes(name) && !techPackages.some((item) => item.unit === name)
    ).length * 100;
    const threatCoverage = coverageScore;
    const directMatchupBonus = assignments.reduce((sum, item) => {
      if (item.source !== "package") return sum;
      const grade = directCounter(item.answerUnit, item.enemy)?.grade;
      return sum + (grade === "S" ? 24 : (grade === "A" ? 4 : 0));
    }, 0);
    const unassignedAxisPenalty = packageUnits.reduce((sum, name) => {
      if (assignments.some((item) => item.answerUnit === name)) return sum;
      const otherNames = [...ownArmy, ...packageUnits.filter((item) => item !== name)];
      const otherTechs = techPackages.filter((item) => item.unit !== name);
      const others = capabilityProfile(otherNames, otherTechs);
      const ownAxis = capabilityProfile([name], techPackages.filter((item) => item.unit === name));
      const uniquelyFillsGap = roleGapsBefore.some((gap) => ownAxis.has(gap.role) && !others.has(gap.role));
      const allThreatsCovered = assignments.every((item) => gradeValue[item.grade] >= 4);
      if (allThreatsCovered && enemies.length <= 2 && packageUnits.length > 2) return sum + 45;
      return sum + (uniquelyFillsGap ? 0 : 24);
    }, 0);
    const result = {
      package: packageUnits,
      core: coreName,
      assignments,
      baselineCoverage,
      adequateCoverage,
      threatCoverage,
      roleGapsBefore: roleGapsBefore.map((item) => item.role),
      roleGapsAfter: roleGapsAfter.map((item) => item.role),
      roleGapFill,
      roleCompression,
      techPackages,
      supportBurden: supportBurdenPenalty,
      structuralSynergy: structuralSynergyBonus,
      existingUnitAdvantage,
      inactiveExistingAxisPenalty,
      directMatchupBonus,
      unassignedAxisPenalty,
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
      excessAxisPenalty,
      investmentAxisPenalty,
      unnecessaryPivotPenalty,
      adequateReplacementPenalty,
      marginalValues,
      totalCoreCount: coreTypeCount([...ownArmy, ...packageUnits]),
      necessaryUnits: [...necessaryUnits],
      score: coverageScore + directMatchupBonus + roleGapFill + roleCompression + structuralSynergyBonus + existingUnitAdvantage
        + missingRoleBonus + complementBonus + synergyBonus(packageUnits, ownArmy)
        - newUnitPenalty - roleRedundancyPenalty - unnecessaryPivotPenalty
        - adequateReplacementPenalty - exposure.penalty - costPenalty
        - diversityPenalty - titanValuePenalty - simpleCompositionPenalty - excessAxisPenalty - investmentAxisPenalty
        - supportBurdenPenalty - unassignedAxisPenalty - inactiveExistingAxisPenalty
    };
    if (scorePackageCache.size >= 20000) scorePackageCache.clear();
    scorePackageCache.set(cacheKey, result);
    return result;
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
    (result.techPackages || []).forEach((item) => {
      const covered = enemies.filter((enemy) => {
        const tags = data.threatProfiles?.[enemy]?.tags || [];
        return item.matchups?.[enemy] || item.threatTags?.some((tag) => tags.includes(tag));
      });
      const requirement = covered.length ? `${covered.join(" / ")} coverageにはこのTechが必要。` : "role変換に使用。";
      techNotes.push(`${item.unit} — ${item.name}: ${requirement} ${item.note}`);
    });
    [...new Set([...enemies, ...result.package])].forEach((name) => {
      (data.techExceptions?.[name] || [])
        .filter((item) => item.changes.some((change) => ["target", "matchup", "role"].includes(change)))
        .forEach((item) => {
          if (techNotes.length < 3 && !(result.techPackages || []).some((chosen) => chosen.unit === name && chosen.id === item.id)) {
            techNotes.push(`${name} — ${item.name}: ${item.effect}`);
          }
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

  function crawlerIsDirectCore(enemies) {
    return enemies.some((enemy) => gradeValue[directCounter("Crawler", enemy)?.grade] >= 4);
  }

  function coreSignature(result, enemies) {
    if (enemies.length === 1) {
      if (!result.package.length) return "NO_NEW_UNIT";
      const enemy = enemies[0];
      const primary = result.package
        .map((name) => ({
          name,
          grade: gradeValue[directCounter(name, enemy)?.grade || "D"],
          cost: (byName.get(name)?.cost || 0) + (byName.get(name)?.unlockCost || 0)
        }))
        .sort((a, b) => b.grade - a.grade || a.cost - b.cost || a.name.localeCompare(b.name))[0];
      return primary.name;
    }
    const keepCrawler = crawlerIsDirectCore(enemies);
    const names = [...new Set(result.package.filter((name) => name !== "Crawler" || keepCrawler))].sort();
    return names.join("+") || "NO_NEW_UNIT";
  }

  function requiredTechForAssignment(assignment, techPackages) {
    if (!assignment.answerUnit) return null;
    const tech = techForUnit(assignment.answerUnit, techPackages);
    if (!tech) return null;
    const withoutTech = techPackages.filter((item) => item !== tech);
    const baseline = assignment.source === "own"
      ? existingMatchup(assignment.answerUnit, assignment.enemy, withoutTech)
      : matchup(assignment.answerUnit, assignment.enemy, withoutTech);
    return gradeValue[assignment.grade] > gradeValue[baseline.grade] ? tech : null;
  }

  function primaryAnswerSignature(result) {
    return result.assignments.map((assignment) => {
      const tech = requiredTechForAssignment(assignment, result.techPackages);
      return `${assignment.enemy}=${assignment.answerUnit || "NONE"}${tech ? `+${tech.id}` : ""}`;
    }).join("|");
  }

  function hasUniqueNeededSupport(result, ownArmy) {
    const assigned = new Set(result.assignments.map((item) => item.answerUnit).filter(Boolean));
    return result.package.some((name) => {
      if (assigned.has(name)) return false;
      const otherUnits = [...ownArmy, ...result.package.filter((item) => item !== name)];
      const otherTechs = result.techPackages.filter((item) => item.unit !== name);
      const others = capabilityProfile(otherUnits, otherTechs);
      const axis = capabilityProfile([name], result.techPackages.filter((item) => item.unit === name));
      return result.roleGapsBefore.some((role) => axis.has(role) && !others.has(role));
    });
  }

  function diversifyResults(results, enemies, ownArmy, targetCount) {
    if (enemies.length < 2) return results;
    const selected = [];
    const groups = new Map();
    results.forEach((result) => {
      const signature = primaryAnswerSignature(result);
      const group = groups.get(signature) || [];
      if (!group.length || (group.length === 1 && (hasUniqueNeededSupport(group[0], ownArmy) || hasUniqueNeededSupport(result, ownArmy)))) {
        group.push(result);
        groups.set(signature, group);
        selected.push(result);
      }
    });
    // If strict unique-role filtering leaves an otherwise useful result slot
    // empty, allow one alternate per concept while preserving the hard cap of
    // two identical primary-answer signatures.
    if (selected.length < targetCount) {
      results.forEach((result) => {
        if (selected.length >= targetCount || selected.includes(result)) return;
        const signature = primaryAnswerSignature(result);
        const group = groups.get(signature) || [];
        if (group.length >= 2) return;
        group.push(result);
        groups.set(signature, group);
        selected.push(result);
      });
    }
    const selectedSet = new Set(selected);
    return results.filter((result) => selectedSet.has(result));
  }

  function dedupeCoreResults(results, enemies) {
    const selected = new Map();
    results.forEach((result) => {
      const signature = coreSignature(result, enemies);
      const current = selected.get(signature);
      if (!current) {
        selected.set(signature, result);
        return;
      }
      if (enemies.length === 1 && current.package.length !== result.package.length) {
        if (result.package.length < current.package.length) selected.set(signature, result);
        return;
      }
      // Crawler used only as screening belongs in DETAILS, not as a second
      // RESULT variation of the same counter concept.
      const supportCrawler = (item) => item.package.includes("Crawler") && !crawlerIsDirectCore(enemies);
      if (supportCrawler(current) !== supportCrawler(result)) {
        if (!supportCrawler(result)) selected.set(signature, result);
        return;
      }
      if (compareResults(result, current) < 0) selected.set(signature, result);
    });
    return [...selected.values()];
  }

  function singleEnemyCompare(a, b, enemy) {
    const directGrade = (result) => result.package.reduce((best, name) => {
      const grade = directCounter(name, enemy)?.grade || "D";
      return Math.max(best, gradeValue[grade]);
    }, 0);
    const effectiveGrade = (result) => result.package.reduce(
      (best, name) => Math.max(best, gradeValue[matchup(name, enemy, result.techPackages).grade]), 0
    );
    return effectiveGrade(b) - effectiveGrade(a)
      || b.adequateCoverage - a.adequateCoverage
      || b.score - a.score
      || directGrade(b) - directGrade(a)
      || coreTypeCount(a.package) - coreTypeCount(b.package)
      || a.costPenalty - b.costPenalty
      || a.exposurePenalty - b.exposurePenalty
      || a.package.join("+").localeCompare(b.package.join("+"));
  }

  function explorePackages(candidates, enemies, ownArmy) {
    const empty = scorePackage([], enemies, ownArmy);
    const ranked = [empty];
    let frontier = [{ packageUnits: [], lastIndex: -1, result: empty }];
    const maxPackageSize = enemies.length === 1
      ? 1
      : Math.min(candidates.length, enemies.length === 2 ? 2 : (enemies.length >= 5 ? 4 : 3));
    const beamWidth = enemies.length <= 2 ? 8 : (enemies.length >= 5 ? 24 : 14);

    for (let depth = 1; depth <= maxPackageSize && frontier.length; depth += 1) {
      const next = [];
      frontier.forEach((state) => {
        for (let index = state.lastIndex + 1; index < candidates.length; index += 1) {
          const packageUnits = [...state.packageUnits, candidates[index]];
          const totalCoreCount = coreTypeCount([...ownArmy, ...packageUnits]);
          if (totalCoreCount > 5) continue;
          const result = scorePackage(packageUnits, enemies, ownArmy);
          const addedCore = totalCoreCount > state.result.totalCoreCount;
          const threshold = addedCore && !(enemies.length >= 5 && depth === 4) ? marginalThreshold(totalCoreCount) : 0;
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
    const limit = Math.max(1, Math.min(10, options?.limit || 8));
    const calculationKey = `${enemies.slice().sort().join("+")}|${ownArmy.slice().sort().join("+")}|${limit}`;
    if (calculateCache.has(calculationKey)) return calculateCache.get(calculationKey);
    const ownSet = new Set(ownArmy);
    const baseline = new Map(enemies.map((enemy) => [enemy, bestOwnCoverage(enemy, ownArmy)]));
    const candidates = candidatePool(enemies, ownSet, baseline, ownArmy);
    const needsSingleEnemyAnswer = enemies.length === 1 && gradeValue[baseline.get(enemies[0])?.grade || "D"] < 4;
    const comparator = needsSingleEnemyAnswer
      ? (a, b) => singleEnemyCompare(a, b, enemies[0])
      : compareResults;
    const sorted = diversifyResults(
      dedupeCoreResults(explorePackages(candidates, enemies, ownArmy), enemies).sort(comparator),
      enemies,
      ownArmy,
      limit
    );
    const selected = sorted.slice(0, limit);
    // Complex boards keep one qualifying fifth-core alternative visible. This
    // preserves the established multi-enemy search breadth after de-duplication.
    if (enemies.length >= 5 && !selected.some((result) => result.totalCoreCount === 5)) {
      const fiveCoreAlternative = sorted.find((result) => result.totalCoreCount === 5);
      if (fiveCoreAlternative && selected.length) selected[selected.length - 1] = fiveCoreAlternative;
    }
    const ranked = selected.map((result, index) => {
      const assignments = result.assignments.map((assignment) => {
        const tech = requiredTechForAssignment(assignment, result.techPackages);
        return { ...assignment, requiredTech: tech?.id || null, displayAnswer: `${assignment.answer}${tech ? ` (+${tech.short || "TECH"})` : ""}` };
      });
      const displayPackage = result.package
        .filter((name) => !ownSet.has(name) || result.techPackages.some((tech) => tech.unit === name))
        .map((name) => {
          const tech = result.techPackages.find((item) => item.unit === name);
          return `${ownSet.has(name) ? "OWN " : ""}${name}${tech ? ` (+${tech.short || "TECH"})` : ""}`;
        });
      return {
        ...result,
        assignments,
        displayPackage,
        label: index === 0 ? "RECOMMENDED" : (result.adequateCoverage === enemies.length ? "GOOD" : "CONDITIONAL"),
        details: details(result, enemies, ownArmy)
      };
    });
    if (calculateCache.size >= 256) calculateCache.clear();
    calculateCache.set(calculationKey, ranked);
    return ranked;
  }

  return {
    calculate, matchup, existingMatchup, bestOwnCoverage, chooseAssignment,
    directCounter, directMatchup, evaluateExposure, scorePackage, combinations,
    coreTypeCount, isChaffSlot, marginalThreshold, economyPenalty,
    coreDiversityPenalty, explorePackages, candidatePool, coreSignature, primaryAnswerSignature,
    dedupeCoreResults, singleEnemyCompare, gradeValue, roleNeeds,
    capabilityProfile, selectTacticalTechs, supportBurden, structuralSynergy
  };
});
