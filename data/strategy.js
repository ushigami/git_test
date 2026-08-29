(function (root) {
  "use strict";
  const strategy = {
    patch: "Season 8 / Live 1.11.1.3",
    updated: "2026-08-30",
    disclaimer: "No-tech・同Lv・中立配置を基準にした判断補助です。Lv、Tech、配置、spellで相性は変わります。",
    roles: {
      chaff: "Chaff", screen: "Screen", tank: "Tank", chaff_clear: "Chaff clear",
      single_target: "Single target", anti_air: "Anti-air", anti_giant: "Anti-giant",
      artillery: "Artillery", control: "Control", backline_pressure: "Backline pressure",
      carry: "Carry", utility: "Utility"
    },
    depth: { front: "Front", mid: "Mid", back: "Back", very_back: "Very back" },
    boardPatterns: [
      { name: "Crawler mass", answers: ["Arclight", "Fire Badger", "Wraith", "Vulcan", "Typhoon"] },
      { name: "Fang / Shield Fang", answers: ["Mustang", "Stormcaller", "Vulcan", "Typhoon", "Tarantula"] },
      { name: "Ball + Hound", answers: ["Scorpion", "Phoenix", "Hacker", "Fire Badger"] },
      { name: "Ball + Wraith", answers: ["Marksman", "Farseer", "Phoenix", "Scorpion", "Hacker"] },
      { name: "Tarantula + Rhino", answers: ["Phoenix", "Melting Point", "Hacker", "Sabertooth"] },
      { name: "Stormcaller mass", answers: ["Rhino", "Phoenix", "Overlord", "War Factory"] },
      { name: "Vulcan + Marksman", answers: ["Stormcaller", "Sandworm", "Rhino", "Abyss"] },
      { name: "Hacker", answers: ["Crawler", "Fang", "Fortress", "Stormcaller", "Phoenix"] },
      { name: "Melting Point", answers: ["Steel Ball", "Crawler", "Marksman", "Phoenix", "Stormcaller"] },
      { name: "Marksman mass", answers: ["Crawler", "Fang", "Wasp", "Stormcaller", "Rhino"] },
      { name: "Rhino rush", answers: ["Steel Ball", "Phoenix", "Melting Point", "Hacker"] },
      { name: "Vortex frontline", answers: ["Phoenix", "Phantom Ray", "Sabertooth", "Marksman"] },
      { name: "War Factory", answers: ["Melting Point", "Mountain", "Abyss", "Death Knell"] },
      { name: "Abyss", answers: ["Melting Point", "Wasp", "Farseer", "Crawler"] },
      { name: "Mountain", answers: ["Melting Point", "Abyss", "Death Knell", "Phoenix"] }
    ]
  };
  root.MECH_DATA = root.MECH_DATA || {};
  root.MECH_DATA.strategy = strategy;
})(typeof globalThis !== "undefined" ? globalThis : window);
