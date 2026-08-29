(function (root) {
  "use strict";
  const m = (unit, grade, reason) => ({ unit, grade, reason });
  const matchups = {
    Abyss: [m("Melting Point", "S", "Titan HPへramp beam"), m("Wasp", "S", "Air swarmでbeamを分散"), m("Farseer", "A", "長射程AA"), m("Crawler", "A", "安価なbodyでbeamを吸う")],
    Arclight: [m("Marksman", "S", "射程外からsingle-target"), m("Stormcaller", "A", "後衛砲撃"), m("Phoenix", "A", "Airから高単発"), m("Rhino", "A", "距離を詰める")],
    Crawler: [m("Arclight", "S", "安価なsplash clear"), m("Fire Badger", "S", "継続fire clear"), m("Wraith", "A", "Air splash"), m("Vulcan", "A", "大量chaff処理"), m("Typhoon", "A", "高密度clear")],
    "Death Knell": [m("Crawler", "S", "多数bodyでbeamを飽和"), m("Melting Point", "A", "Titanへのramp damage"), m("Stormcaller", "A", "長射程とEMP圧"), m("Wasp", "A", "Air chaffでtargetを散らす")],
    Fang: [m("Mustang", "S", "多段clearとAA"), m("Vulcan", "S", "広範囲clear"), m("Fire Badger", "A", "Shield後も継続fire"), m("Stormcaller", "A", "後衛splash"), m("Typhoon", "A", "継続splash")],
    Farseer: [m("Rhino", "S", "高速接近"), m("Fortress", "A", "硬いfrontで射撃時間を奪う"), m("War Factory", "A", "耐久と圧力"), m("Stormcaller", "A", "射程外砲撃")],
    "Fire Badger": [m("Sabertooth", "S", "硬い高単発front"), m("Marksman", "A", "射程外single-target"), m("Phoenix", "A", "Airから高単発"), m("Fortress", "A", "耐久でfireを受ける")],
    Fortress: [m("Melting Point", "S", "代表的anti-giant"), m("Mountain", "A", "Titan級正面性能"), m("Abyss", "A", "Titan beam"), m("Stormcaller", "A", "Barrierを遠距離で剥がす")],
    Hacker: [m("Crawler", "S", "安価なbodyを掴ませる"), m("Fang", "A", "小型screen"), m("Stormcaller", "A", "Barrier/後衛へ砲撃"), m("Phoenix", "A", "Airから処理"), m("Fortress", "A", "Barrierでhackを遮断")],
    Hound: [m("Fire Badger", "S", "複数bodyをfire clear"), m("Scorpion", "A", "密集へ高火力"), m("Wraith", "A", "Air splash"), m("Typhoon", "A", "高密度clear")],
    Marksman: [m("Crawler", "S", "高単発を安価なbodyへ吸わせる"), m("Fang", "A", "screenで射撃を浪費"), m("Wasp", "A", "Air swarm"), m("Rhino", "A", "高速接近"), m("Stormcaller", "A", "射程外砲撃")],
    "Melting Point": [m("Steel Ball", "S", "beam duelと接近"), m("Crawler", "A", "beam targetを分散"), m("Marksman", "A", "長射程single-target"), m("Phoenix", "A", "Air高単発"), m("Stormcaller", "A", "射程外砲撃")],
    Mountain: [m("Melting Point", "S", "超高HPへramp beam"), m("Abyss", "A", "Titan対Titan火力"), m("Death Knell", "A", "anti-heavy beam"), m("Phoenix", "A", "AA Tech前のAir pressure")],
    Mustang: [m("Crawler", "S", "低ATK多段をbodyで受ける"), m("Arclight", "A", "中型packへsplash"), m("Vulcan", "A", "Armorと広域clear"), m("Rhino", "A", "硬い高速front")],
    Overlord: [m("Wasp", "S", "Air swarmで高価値missileを吸う"), m("Marksman", "A", "長射程AA"), m("Melting Point", "A", "Air対応ramp beam"), m("Farseer", "A", "AAとsupport")],
    "Phantom Ray": [m("Farseer", "S", "長射程AA"), m("Marksman", "A", "高単発AA"), m("Phoenix", "A", "Air duel"), m("Melting Point", "A", "Armorを越えるramp damage")],
    Phoenix: [m("Wasp", "S", "多数bodyで高単発を吸う"), m("Marksman", "A", "長射程AA"), m("Mustang", "A", "継続AA"), m("Fang", "A", "安価なAA screen")],
    Raiden: [m("Farseer", "S", "長射程AA"), m("Marksman", "A", "高単発AA"), m("Phoenix", "A", "Air duel"), m("Melting Point", "A", "高HP Airへramp beam")],
    Rhino: [m("Steel Ball", "S", "接近後のbeam duel"), m("Phoenix", "A", "Air高単発"), m("Hacker", "A", "高HPをcontrol"), m("Melting Point", "A", "ramp beam"), m("Sabertooth", "A", "正面single-target")],
    Sabertooth: [m("Phoenix", "S", "Airから高単発"), m("Overlord", "A", "長射程Air"), m("Melting Point", "A", "高HPへramp beam"), m("Fortress", "A", "正面耐久"), m("Hacker", "A", "control")],
    Sandworm: [m("Melting Point", "S", "再浮上後へramp beam"), m("Phoenix", "A", "Air single-target"), m("War Factory", "A", "耐久と継続圧"), m("Fortress", "A", "潜行圧を受ける")],
    Scorpion: [m("Phoenix", "S", "Airから高単発"), m("Marksman", "A", "射程外single-target"), m("Stormcaller", "A", "長射程砲撃"), m("Overlord", "A", "Air長射程")],
    Sledgehammer: [m("Hacker", "S", "中型packをcontrol"), m("Scorpion", "S", "密集へ高単発"), m("Phoenix", "A", "Air single-target"), m("Marksman", "A", "射程外処理")],
    "Steel Ball": [m("Scorpion", "S", "中型密集へ高火力"), m("Phoenix", "A", "Air single-target"), m("Hacker", "A", "beam unitをcontrol"), m("Melting Point", "A", "ramp beam"), m("Phantom Ray", "A", "Air DPS")],
    Stormcaller: [m("Rhino", "S", "距離を詰めminimum rangeへ"), m("Phoenix", "A", "Airから処理"), m("Overlord", "A", "Air長射程"), m("War Factory", "A", "迎撃と圧力"), m("Sabertooth", "A", "missile interceptionと前進")],
    Tarantula: [m("Phoenix", "S", "Air高単発"), m("Marksman", "A", "長射程single-target"), m("Melting Point", "A", "高HPへramp beam"), m("Sabertooth", "A", "正面DPS"), m("Scorpion", "A", "中型密集処理")],
    Typhoon: [m("Scorpion", "S", "密集したheavyへ高火力"), m("Melting Point", "A", "高HPへramp beam"), m("Phoenix", "A", "Air single-target"), m("Marksman", "A", "長射程火力")],
    "Void Eye": [m("Marksman", "S", "通常時は射程/air advantage"), m("Phoenix", "A", "Aerial Modeも撃てる"), m("Raiden", "A", "Air multi-target"), m("Crawler", "A", "single-targetを吸う")],
    Vortex: [m("Phoenix", "S", "baseline Ground Onlyへ安全なAir火力"), m("Phantom Ray", "A", "Airからmediumを処理"), m("Wraith", "A", "Air pressure"), m("Sabertooth", "A", "ground single-target duel")],
    Vulcan: [m("Melting Point", "S", "giantへramp beam"), m("Phoenix", "A", "Air single-target"), m("Sandworm", "A", "潜行接近"), m("Stormcaller", "A", "射程外砲撃")],
    "War Factory": [m("Melting Point", "S", "代表的anti-titan"), m("Mountain", "A", "Titan正面性能"), m("Abyss", "A", "高火力Titan"), m("Death Knell", "A", "anti-heavy beam")],
    Wasp: [m("Mustang", "S", "継続AA"), m("Fang", "A", "安価なAA"), m("Typhoon", "A", "Air対応clear"), m("Farseer", "A", "長射程AA")],
    Wraith: [m("Marksman", "S", "長射程AA"), m("Farseer", "A", "AA support"), m("Phoenix", "A", "Air duel"), m("Melting Point", "A", "高HP Airへramp beam")]
  };

  root.MECH_DATA = root.MECH_DATA || {};
  root.MECH_DATA.matchups = matchups;
})(typeof globalThis !== "undefined" ? globalThis : window);
