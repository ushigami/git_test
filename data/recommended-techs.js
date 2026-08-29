(function (root) {
  "use strict";

  const techSet = (name, techs, note) => ({ name, techs, note });

  // Verified names are intentionally separate from the recommendations so a
  // typo or a tech belonging to another unit fails validation.
  const verifiedTechs = {
    Abyss: ["Range Enhancement", "Dark Companion", "Photon Coating", "Efficient Maintenance", "Disintegration", "Swarm Missiles", "Wreckage Recycling", "Vertical Sweep"],
    Arclight: ["Range Enhancement", "Electromagnetic Shot", "Charged Shot", "Armor Enhancement", "Anti-Aircraft Ammunition", "Elite Marksman"],
    Crawler: ["Mechanical Rage", "Replicate", "Subterranean Blitz", "Acidic Explosion", "Impact Drill", "Loose Formation"],
    "Death Knell": ["Energy Diffraction", "Range Enhancement", "Steel Ball Production", "Barrier", "Energy Absorption", "Electromagnetic Bomb"],
    Fang: ["Ignite", "Range Enhancement", "Mechanical Rage", "Portable Shield", "Armor-Piercing Bullets"],
    Farseer: ["Photon Emission", "Scanning Radar", "Missile Interceptor", "Electromagnetic Explosion", "Range Enhancement"],
    "Fire Badger": ["Range Enhancement", "Napalm", "Ignite", "Field Maintenance", "Scorching Fire", "Scorching Charge", "Counter-Fire"],
    Fortress: ["Barrier", "Range Enhancement", "Anti-Air Barrage", "Fang Production", "Launcher Overload", "Elite Marksman", "Doubleshot", "Armor Enhancement", "Rocket Punch"],
    Hacker: ["Multi Control", "Barrier", "Range Enhancement", "Enhanced Control", "Electromagnetic Interference"],
    Hound: ["Mechanical Rage", "Range Enhancement", "Fire Extinguisher", "Incendiary Bomb", "Armor Enhancement"],
    Marksman: ["Doubleshot", "Range Enhancement", "Quick Reload", "Electromagnetic Shot", "Elite Marksman", "Shooting Squad", "Assault Mode", "Aerial Specialization"],
    "Melting Point": ["Energy Absorption", "Range Enhancement", "Energy Diffraction", "Electromagnetic Barrage", "Crawler Production", "Armor Enhancement"],
    Mountain: ["Gun-launched Missile", "Mountain Plating", "Saturation Bombardment", "Extended Range Ammo", "Smoke Bomb", "Photon Loop", "Anti-Aircraft Ammunition", "Range Enhancement"],
    Mustang: ["Missile Interceptor", "Range Enhancement", "High-Explosive Ammo", "Aerial Specialization", "Armor-Piercing Bullets", "Culling Rounds"],
    Overlord: ["Overlord Artillery", "Launcher Overload", "Mothership", "Jump Drive", "Photon Emission", "Range Enhancement", "Armor Enhancement", "Field Maintenance", "High-Explosive Ammo"],
    "Phantom Ray": ["Burst Mode", "Range Enhancement", "Armor Enhancement", "Sticky Oil Bomb", "Stealth Cloak", "High-Explosive Ammo", "Energy Shield"],
    Phoenix: ["Quantum Reassembly", "Range Enhancement", "Launcher Overload", "Energy Shield", "Jump Drive", "Electromagnetic Shot", "Elite Marksman", "Charged Shot"],
    Raiden: ["Fork", "Chain", "Ionization", "Range Enhancement", "Electromagnetic Shot"],
    Rhino: ["Whirlwind", "Photon Coating", "Field Maintenance", "Final Blitz", "Mechanical Rage", "Wreckage Recycling", "Power Armor", "Armor Enhancement"],
    Sabertooth: ["Range Enhancement", "Field Maintenance", "Missile Interceptor", "Doubleshot", "Secondary Armament"],
    Sandworm: ["Mechanical Rage", "Armor Enhancement", "Mechanical Division", "Anti-Aerial", "Burrow Maintenance", "Replicate", "Sandstorm", "Strike"],
    Scorpion: ["Acid Attack", "Siege Mode", "Range Enhancement", "Doubleshot", "Field Maintenance", "Armor Enhancement", "Convergent Fire"],
    Sledgehammer: ["Field Maintenance", "Damage Sharing", "Mechanical Rage", "Range Enhancement", "Electromagnetic Shot", "Armor-Piercing Bullets", "Armor Enhancement"],
    "Steel Ball": ["Energy Absorption", "Damage Sharing", "Range Enhancement", "Mechanical Division", "Armor Enhancement", "Fortified Target Lock"],
    Stormcaller: ["Incendiary Bomb", "Range Enhancement", "Launcher Overload", "High-Explosive Ammo", "Electromagnetic Explosion", "Heavy Missile"],
    Tarantula: ["Spider Mine", "Range Enhancement", "Mechanical Rage", "Armor-Piercing Bullets", "Field Maintenance", "Armor Enhancement", "Anti-Aircraft Ammunition", "High-Explosive Ammo"],
    Typhoon: ["Range Enhancement", "Air Defense Mark", "Reactive Armor", "Maintenance Array", "Field Entrenchment", "Field Reassembly", "Wreckage Detonation"],
    "Void Eye": ["Range Enhancement", "Energy Shield", "Charged Shot", "Aerial Mode", "Energy Absorption", "Suppression Shots", "Electromagnetic Armor"],
    Vortex: ["Range Enhancement", "Mobile Power Station", "Electromagnetic Cloud", "Electromagnetic Twin", "Accumulator Shield", "Grid Integration", "Emergency Armor", "Field Maintenance"],
    Vulcan: ["Ignite", "Range Enhancement", "Incendiary Bomb", "Scorching Fire", "Best Partner", "Sticky Oil Bomb", "Armor Enhancement"],
    "War Factory": ["Range Enhancement", "Efficient Maintenance", "Phoenix Production", "Steel Ball Production", "Sledgehammer Production", "Missile Interceptor", "Launcher Overload", "Photon Coating", "Armor Enhancement", "High-Explosive Ammo"],
    Wasp: ["Energy Shield", "Range Enhancement", "Jump Drive", "Ground Specialization", "Elite Marksman", "Ignite", "Electromagnetic Shot", "High-Explosive Ammo", "Armor-Piercing Bullets", "Aerial Specialization"],
    Wraith: ["Floating Artillery Array", "Range Enhancement", "Armor Enhancement", "Degeneration Beam", "Field Maintenance", "High-Explosive Ammo"]
  };

  const setups = {
    Abyss: [techSet("STANDARD", ["Range Enhancement", "Efficient Maintenance", "Photon Coating", "Vertical Sweep"], "射程と継戦力を確保する汎用carry型。")],
    Arclight: [techSet("CARRY", ["Range Enhancement", "Elite Marksman", "Charged Shot", "Electromagnetic Shot"], "levelを集めて後衛carryへ伸ばす型。")],
    Crawler: [techSet("AGGRO", ["Mechanical Rage", "Subterranean Blitz", "Loose Formation", "Impact Drill"], "接近速度と生存率を上げて後衛へ圧をかける。")],
    "Death Knell": [techSet("STANDARD", ["Range Enhancement", "Barrier", "Energy Absorption", "Electromagnetic Bomb"], "長射程beamを守りつつpackage全体を支える。")],
    Fang: [techSet("CARRY", ["Range Enhancement", "Portable Shield", "Mechanical Rage", "Ignite"], "射撃時間を伸ばし、巨体にも割合damageを通す。")],
    Farseer: [techSet("UTILITY", ["Range Enhancement", "Photon Emission", "Scanning Radar", "Missile Interceptor"], "射程を保ちながら主力への支援をまとめる。")],
    "Fire Badger": [techSet("STANDARD", ["Range Enhancement", "Napalm", "Scorching Fire", "Counter-Fire"], "chaff clearを主目的に射程と火炎密度を確保。")],
    Fortress: [techSet("FRONTLINE", ["Barrier", "Range Enhancement", "Armor Enhancement", "Anti-Air Barrage"], "前線と周囲を守り、空への最低限の圧も持つ。")],
    Hacker: [techSet("CONTROL", ["Range Enhancement", "Barrier", "Multi Control", "Enhanced Control"], "安全距離から複数の価値targetを奪う。")],
    Hound: [techSet("AGGRO", ["Range Enhancement", "Mechanical Rage", "Fire Extinguisher", "Armor Enhancement"], "高速frontを維持しつつfire回答を持つ。")],
    Marksman: [techSet("STANDARD", ["Range Enhancement", "Elite Marksman", "Doubleshot", "Aerial Specialization"], "長射程single-targetと対空を両立する。")],
    "Melting Point": [techSet("STANDARD", ["Range Enhancement", "Energy Absorption", "Crawler Production", "Electromagnetic Barrage"], "巨体beamを守り、EMPでtech依存frontへ対応。"), techSet("MULTI", ["Range Enhancement", "Energy Diffraction", "Electromagnetic Barrage", "Energy Absorption"], "短射程aggroや中型密集へbeamを分散する。")],
    Mountain: [techSet("FRONTLINE", ["Range Enhancement", "Mountain Plating", "Photon Loop", "Gun-launched Missile"], "高耐久frontlineを維持しながら遠距離火力を足す。")],
    Mustang: [techSet("ANTI-AIR", ["Range Enhancement", "Aerial Specialization", "Armor-Piercing Bullets", "Missile Interceptor"], "空とmissileへのsupportを優先。"), techSet("CLEAR", ["Range Enhancement", "High-Explosive Ammo", "Armor-Piercing Bullets", "Culling Rounds"], "ground chaff clearと中型処理を重視。")],
    Overlord: [techSet("STANDARD", ["Range Enhancement", "Mothership", "Photon Emission", "Overlord Artillery"], "air packageを守りつつ地上への圧も確保。")],
    "Phantom Ray": [techSet("STANDARD", ["Range Enhancement", "Armor Enhancement", "Stealth Cloak", "Burst Mode"], "接敵まで生存し、迎撃を越えるsalvoを作る。"), techSet("OIL", ["Range Enhancement", "Sticky Oil Bomb", "Armor Enhancement", "Energy Shield"], "Fire Badger等と組みground clearを補う。")],
    Phoenix: [techSet("STANDARD", ["Range Enhancement", "Charged Shot", "Quantum Reassembly", "Electromagnetic Shot"], "長射程burstを維持し、復帰とEMPを備える。")],
    Raiden: [techSet("CARRY", ["Range Enhancement", "Ionization", "Fork", "Electromagnetic Shot"], "中型密集から高HPまで処理範囲を広げる。")],
    Rhino: [techSet("AGGRO", ["Field Maintenance", "Mechanical Rage", "Power Armor", "Final Blitz"], "接近と継戦を優先して後衛へ到達する。")],
    Sabertooth: [techSet("STANDARD", ["Range Enhancement", "Field Maintenance", "Doubleshot", "Missile Interceptor"], "duel性能とfrontline utilityを両立する。")],
    Sandworm: [techSet("FRONTLINE", ["Mechanical Division", "Burrow Maintenance", "Armor Enhancement", "Replicate"], "再潜行まで耐え、撃破後のchaffで時間を作る。")],
    Scorpion: [techSet("STANDARD", ["Range Enhancement", "Doubleshot", "Siege Mode", "Acid Attack"], "中型密集を長射程から処理し、巨体にも対応。")],
    Sledgehammer: [techSet("STANDARD", ["Range Enhancement", "Field Maintenance", "Mechanical Rage", "Armor-Piercing Bullets"], "screen性能を保ちながら継続火力を伸ばす。")],
    "Steel Ball": [techSet("AGGRO", ["Range Enhancement", "Energy Absorption", "Mechanical Division", "Fortified Target Lock"], "高HP targetへbeamを繋ぎ、死亡後もscreenを残す。")],
    Stormcaller: [techSet("STANDARD", ["Range Enhancement", "Incendiary Bomb", "Electromagnetic Explosion", "Heavy Missile"], "射程・fire・EMPを揃え、迎撃にはHeavy Missile。")],
    Tarantula: [techSet("STANDARD", ["Range Enhancement", "Field Maintenance", "Mechanical Rage", "Spider Mine"], "中盤frontlineを維持しながらlate chaffを作る。")],
    Typhoon: [techSet("UTILITY", ["Range Enhancement", "Air Defense Mark", "Reactive Armor", "Maintenance Array"], "現行rework後の対空支援と前線維持を重視。")],
    "Void Eye": [techSet("CARRY", ["Suppression Shots", "Range Enhancement", "Aerial Mode", "Charged Shot"], "射程優位を作り、空を含む高HP targetへ伸ばす。")],
    Vortex: [techSet("STANDARD", ["Range Enhancement", "Grid Integration", "Mobile Power Station", "Field Maintenance"], "少数でも周囲へ価値を出せる現行frontline型。"), techSet("CARRY", ["Range Enhancement", "Grid Integration", "Electromagnetic Twin", "Accumulator Shield"], "複数Vortexを連結して主力化する型。")],
    Vulcan: [techSet("STANDARD", ["Range Enhancement", "Ignite", "Scorching Fire", "Best Partner"], "chaff clearを伸ばし、Marksmanで単体火力を補完。")],
    "War Factory": [techSet("UTILITY", ["Efficient Maintenance", "Missile Interceptor", "Phoenix Production", "Steel Ball Production"], "本体を維持しつつ迎撃と継続生産を担う。")],
    Wasp: [techSet("CARRY", ["Range Enhancement", "Energy Shield", "Aerial Specialization", "Electromagnetic Shot"], "air massを守り、対空戦とEMPを強化。")],
    Wraith: [techSet("STANDARD", ["Range Enhancement", "Floating Artillery Array", "Field Maintenance", "Degeneration Beam"], "chaff clearと前線debuffを両立する。")]
  };

  const units = root.MECH_DATA && root.MECH_DATA.units;
  if (Array.isArray(units)) {
    units.forEach((unit) => {
      unit.recommendedTechSets = (setups[unit.name] || []).map((item) => ({
        name: item.name,
        techs: item.techs.slice(),
        note: item.note
      }));
    });
  }

  root.MECH_DATA = root.MECH_DATA || {};
  root.MECH_DATA.recommendedTechCatalog = verifiedTechs;
  root.MECH_DATA.recommendedTechSetSources = {
    patch: "Live 1.11.1.3",
    official: "https://steamcommunity.com/app/669330/announcements/",
    wiki: "https://wiki.mbxmas.com/units/",
    strategy: "https://wiki.mbxmas.com/guides/"
  };
})(typeof globalThis !== "undefined" ? globalThis : window);
