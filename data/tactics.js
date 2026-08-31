(function (root) {
  "use strict";

  const data = root.MECH_DATA || {};
  const units = data.units || [];
  const unique = (items) => [...new Set(items)];
  const roleCapabilities = {
    chaff: ["chaff", "screen"], screen: ["screen"], tank: ["tank", "frontline", "pressure_mitigation"],
    chaff_clear: ["clear"], single_target: ["heavy_dps"], anti_air: ["anti_air"],
    anti_giant: ["heavy_dps", "anti_giant"], artillery: ["long_range", "backline_pressure"],
    control: ["control", "pressure_mitigation"], backline_pressure: ["backline_pressure", "fast_approach"],
    carry: ["formation_dps"], utility: ["utility"]
  };
  const capabilityOverrides = {
    Arclight: ["clear"], Crawler: ["chaff", "screen", "target_saturation"], Fang: ["chaff", "screen", "anti_air"],
    Fortress: ["frontline", "tank", "pressure_mitigation", "anti_giant"],
    Mustang: ["anti_air", "clear"], Phoenix: ["anti_air", "heavy_dps"],
    Raiden: ["anti_air", "anti_formation", "formation_dps"],
    Scorpion: ["anti_formation", "heavy_dps", "long_range"],
    Typhoon: ["frontline", "pressure_mitigation", "clear", "anti_air"],
    Wasp: ["screen", "target_saturation", "anti_air"]
  };

  const capabilityProfiles = {};
  units.forEach((unit) => {
    const capabilities = [];
    unit.roles.forEach((role) => capabilities.push(...(roleCapabilities[role] || [])));
    capabilities.push(...(capabilityOverrides[unit.name] || []));
    if (unit.target === "air_ground") capabilities.push("air_targeting");
    capabilityProfiles[unit.name] = unique(capabilities);
  });
  const capabilityStrengths = {
    Fortress: { pressure_mitigation: "A", frontline: "A", tank: "A" },
    Raiden: { anti_air: "A", anti_formation: "S" },
    Scorpion: { anti_formation: "S", heavy_dps: "A" },
    "Melting Point": { heavy_dps: "A", anti_giant: "A" },
    Marksman: { anti_air: "A", heavy_dps: "A" },
    Phoenix: { anti_air: "A", heavy_dps: "A" },
    Mustang: { anti_air: "A", clear: "A" },
    Wasp: { anti_air: "A", screen: "A" },
    Mountain: { pressure_mitigation: "A", tank: "A" },
    Rhino: { fast_approach: "A" }
  };

  const defaultThreats = (unit) => {
    const tags = [];
    if (unit.target === "air_ground") tags.push("air_capable");
    unit.roles.forEach((role) => {
      if (role === "chaff") tags.push("chaff", "target_saturation");
      if (role === "screen") tags.push("screen");
      if (role === "tank") tags.push("frontline_pressure", "tank");
      if (role === "chaff_clear") tags.push("chaff_clear");
      if (role === "single_target") tags.push("single_target");
      if (role === "anti_air") tags.push("anti_air");
      if (role === "anti_giant") tags.push("anti_heavy");
      if (role === "artillery") tags.push("artillery", "long_range");
      if (role === "backline_pressure") tags.push("backline_pressure");
      if (role === "carry") tags.push("formation_dps");
      if (role === "control") tags.push("control");
    });
    return unique(tags);
  };
  const threatOverrides = {
    Phoenix: ["air", "single_target", "high_value_backline", "anti_medium", "anti_heavy"],
    Typhoon: ["ground", "medium_pack", "sustained_pressure", "chaff_clear", "formation_dps", "frontline_pressure"],
    Marksman: ["long_range", "single_target", "anti_air", "backline_dps"],
    Crawler: ["chaff", "screen", "target_saturation", "backline_pressure"],
    Fortress: ["giant", "frontline_pressure", "tank", "barrier_possible"],
    Stormcaller: ["artillery", "long_range", "missile", "backline_pressure"],
    Wasp: ["air", "chaff", "target_saturation", "anti_air"],
    Wraith: ["air", "chaff_clear", "sustained_pressure"],
    "Phantom Ray": ["air", "missile", "single_target", "frontline_pressure"],
    "Melting Point": ["anti_heavy", "single_target", "sustained_pressure"],
    Sabertooth: ["tank", "single_target", "frontline_pressure"],
    Fang: ["chaff", "screen", "target_saturation"]
  };
  const responseRules = {
    air: [{ role: "anti_air", grade: "A", weight: 4 }, { role: "screen", grade: "B", weight: 2 }],
    chaff: [{ role: "clear", grade: "A", weight: 4 }],
    target_saturation: [{ role: "clear", grade: "A", weight: 3.5 }],
    single_target: [{ role: "screen", grade: "B", weight: 2.5 }],
    sustained_pressure: [{ role: "pressure_mitigation", grade: "A", weight: 3.5 }, { role: "frontline", grade: "B", weight: 3 }, { role: "tank", grade: "B", weight: 2.5 }],
    frontline_pressure: [{ role: "frontline", grade: "B", weight: 3 }, { role: "heavy_dps", grade: "A", weight: 3.5 }],
    medium_pack: [{ role: "anti_formation", grade: "S", weight: 4.5 }, { role: "heavy_dps", grade: "A", weight: 3 }],
    giant: [{ role: "anti_giant", grade: "A", weight: 4 }, { role: "heavy_dps", grade: "A", weight: 3.5 }],
    tank: [{ role: "anti_giant", grade: "A", weight: 4 }, { role: "heavy_dps", grade: "A", weight: 3.5 }],
    artillery: [{ role: "fast_approach", grade: "A", weight: 3.5 }, { role: "missile_defense", grade: "A", weight: 3 }],
    missile: [{ role: "missile_defense", grade: "A", weight: 4 }],
    long_range: [{ role: "fast_approach", grade: "A", weight: 3.5 }, { role: "backline_pressure", grade: "A", weight: 3 }],
    backline_pressure: [{ role: "fast_approach", grade: "A", weight: 3 }],
    chaff_clear: [{ role: "frontline", grade: "B", weight: 2.5 }],
    formation_dps: [{ role: "pressure_mitigation", grade: "A", weight: 3 }]
  };
  const threatProfiles = {};
  units.forEach((unit) => {
    const tags = unique(threatOverrides[unit.name] || defaultThreats(unit));
    threatProfiles[unit.name] = {
      tags,
      responses: unique(tags.flatMap((tag) => (responseRules[tag] || []).map((item) => item.role)))
    };
  });

  const tacticalTechs = [
    { unit: "Fortress", id: "anti-air-barrage", name: "Anti-Air Barrage", short: "AA", cost: 200, add: ["anti_air", "air_targeting"], threatTags: ["air"], grade: "A", note: "Air coverageにはこのTechが必要。", source: "https://mechabellum-companion.netlify.app/" },
    { unit: "Void Eye", id: "aerial-mode", name: "Aerial Mode", short: "AIR", cost: 150, add: ["anti_air", "air_targeting", "mobility"], threatTags: ["air"], grade: "B", note: "Air攻撃可能になるが射程が低下。", source: "https://steamcommunity.com/app/669330/announcements/" },
    { unit: "Mustang", id: "missile-interceptor", name: "Missile Interceptor", short: "INT", cost: 200, add: ["missile_defense"], threatTags: ["missile", "artillery"], grade: "A", note: "迎撃中は通常攻撃を止める。", source: "https://wiki.mbxmas.com/mechanics/missile-interception/" },
    { unit: "Marksman", id: "aerial-specialization", name: "Aerial Specialization", short: "AA", cost: 250, add: ["anti_air"], threatTags: ["air"], grade: "A", matchups: { Wraith: "S", Phoenix: "A", Wasp: "A" }, note: "Airへの火力とtarget priorityを強化。", source: "https://mechabellum.wiki.gg/wiki/Marksman" },
    { unit: "Tarantula", id: "anti-aircraft-ammunition", name: "Anti-Aircraft Ammunition", short: "AA", cost: 300, add: ["anti_air", "air_targeting"], threatTags: ["air"], grade: "B", note: "Air攻撃可能になる。", source: "https://wiki.mbxmas.com/units/ground/tarantula/" },
    { unit: "Arclight", id: "anti-aircraft-ammunition", name: "Anti-Aircraft Ammunition", short: "AA", cost: 300, add: ["anti_air", "air_targeting"], threatTags: ["air"], grade: "B", matchups: { Wasp: "A" }, note: "Air攻撃可能。Wasp向けの用途が中心。", source: "https://mechabellum.wiki.gg/wiki/Arclight" },
    { unit: "Mountain", id: "anti-aircraft-ammunition", name: "Anti-Aircraft Ammunition", short: "AA", cost: 300, add: ["anti_air", "air_targeting"], threatTags: ["air"], grade: "A", note: "ATK低下と引き換えにAir攻撃可能。", source: "https://mechabellum.wiki.gg/wiki/Mountain" },
    { unit: "Sandworm", id: "anti-aerial", name: "Anti-Aerial", short: "AA", cost: 300, add: ["anti_air", "air_targeting"], threatTags: ["air"], grade: "B", note: "Air target軸を追加。", source: "https://mechamonarch.com/unit/sandworm/" },
    { unit: "Melting Point", id: "energy-diffraction", name: "Energy Diffraction", short: "DIFF", cost: 150, add: ["anti_formation"], threatTags: ["medium_pack", "sustained_pressure"], grade: "A", note: "beamを複数targetへ分割。Rangeとの併用負担に注意。", source: "https://wiki.mbxmas.com/guides/multimelter-fire-badger-defense/" },
    { unit: "Steel Ball", id: "mechanical-division", name: "Mechanical Division", short: "DIV", cost: 300, add: ["screen", "target_saturation"], threatTags: ["single_target", "long_range"], grade: "B", note: "死亡後Crawlerでscreenを継続。", source: "https://wiki.mbxmas.com/units/ground/steel-ball/" },
    { unit: "Raiden", id: "ionization", name: "Ionization", short: "ION", cost: 200, add: ["anti_giant", "heavy_dps"], threatTags: ["giant", "tank"], grade: "A", note: "高HP target回答を追加するがmedium処理とtrade-off。", source: "https://wiki.mbxmas.com/units/air/raiden/" },
    { unit: "Phantom Ray", id: "sticky-oil-bomb", name: "Sticky Oil Bomb", short: "OIL", cost: 100, add: ["control"], threatTags: ["chaff", "frontline_pressure"], grade: "B", note: "Fire sourceがある時にclear/controlへ変換。", requiresAny: ["Fire Badger", "Vulcan"], source: "https://wiki.mbxmas.com/units/air/phantom-ray/" },
    { unit: "Phantom Ray", id: "burst-mode", name: "Burst Mode", short: "BURST", cost: 200, add: ["missile_breakthrough"], threatTags: ["missile_defense"], grade: "B", note: "anti-missile突破用。", source: "https://wiki.mbxmas.com/units/air/phantom-ray/" }
  ];

  root.MECH_DATA = data;
  data.capabilityProfiles = capabilityProfiles;
  data.capabilityStrengths = capabilityStrengths;
  data.threatProfiles = threatProfiles;
  data.threatResponseRules = responseRules;
  data.tacticalTechs = tacticalTechs;
})(typeof globalThis !== "undefined" ? globalThis : window);
