(function (root) {
  "use strict";

  const tech = (id, name, effect, changes) => ({ id, name, effect, changes });
  const exceptions = {
    Arclight: [
      tech("anti-aircraft-ammunition", "Anti-Aircraft Ammunition", "Ground OnlyからAir攻撃可能になる。", ["target", "anti_air"]),
      tech("charged-shot", "Charged Shot", "小型clear中心から高火力single-target寄りになる。", ["role", "matchup"])
    ],
    Fang: [
      tech("grenade-launcher", "Grenade Launcher", "splashを得るがAirを攻撃できなくなる。", ["target", "chaff_clear"]),
      tech("portable-shield", "Portable Shield", "各bodyの初撃耐性が上がり、chaffとしての時間が大きく伸びる。", ["survival", "screen"])
    ],
    "Void Eye": [
      tech("aerial-mode", "Aerial Mode", "飛行化しAir攻撃可能。通常時のAir安全策が成立しなくなる。", ["mobility", "target", "matchup"]),
      tech("charged-shot", "Charged Shot", "高HP targetへのburst性能が上がる。", ["role", "matchup"])
    ],
    Mustang: [
      tech("missile-interceptor", "Missile Interceptor", "攻撃を止めてmissile defenseへ回るため、Stormcaller・Phantom Ray・Farseer等との関係が変わる。", ["role", "missile"])
    ],
    "Phantom Ray": [
      tech("burst-mode", "Burst Mode", "missile HPが上がり、anti-missileへの耐性が増す。", ["missile", "matchup"]),
      tech("sticky-oil-bomb", "Sticky Oil Bomb", "groundへ油を撒き、Fire Badger等のfireで着火できる。", ["synergy", "chaff_clear"]),
      tech("ground-targeting", "Ground Targeting", "ground targetへの実効射程と交戦位置が変わる。", ["placement", "matchup"])
    ],
    Marksman: [
      tech("assault-mode", "Assault Mode", "長射程sniperから短射程・高耐久・splash型へ役割が変わる。", ["role", "range", "matchup"]),
      tech("aerial-specialization", "Aerial Specialization", "Airへのcounter能力が大きく上がる。", ["anti_air", "matchup"]),
      tech("shooting-squad", "Shooting Squad", "Fangを生成しscreen/chaff要素を追加する。", ["spawn", "screen"])
    ],
    Tarantula: [
      tech("anti-aircraft-ammunition", "Anti-Aircraft Ammunition", "Air攻撃可能になる。", ["target", "anti_air"]),
      tech("high-explosive-ammo", "High-Explosive Ammo", "chaff clear性能が大きく上がる。", ["role", "chaff_clear"]),
      tech("spider-mine", "Spider Mine", "late chaffとtarget disruptionを追加する。", ["spawn", "screen"])
    ],
    Farseer: [
      tech("missile-interceptor", "Missile Interceptor", "missile defense役を追加する。", ["role", "missile"]),
      tech("aerial-specialization", "Aerial Specialization", "Airへの性能を大幅に強化する。", ["anti_air", "matchup"]),
      tech("scanning-radar", "Scanning Radar", "周囲unitへのsupport役を追加する。", ["utility", "placement"])
    ],
    Fortress: [
      tech("anti-air-barrage", "Anti-Air Barrage", "Ground Only本体でもAirを脅かせる。", ["anti_air", "missile", "matchup"]),
      tech("fang-production", "Fang Production", "自前chaffを周期生成する。", ["spawn", "screen"]),
      tech("barrier", "Barrier", "周囲package全体の耐久構造を変える。", ["survival", "package"])
    ],
    "Melting Point": [
      tech("energy-diffraction", "Energy Diffraction", "single-target ramp beamをmulti-targetへ分割する。", ["role", "chaff_clear", "matchup"]),
      tech("crawler-production", "Crawler Production", "自前screen/chaffを追加する。", ["spawn", "screen"])
    ],
    Raiden: [
      tech("ionization", "Ionization", "multi-target medium DPSから高HP削り能力を得る。", ["anti_giant", "matchup"]),
      tech("fork-chain", "Fork / Chain", "target coverageが増え、密集への性能が変わる。", ["coverage", "chaff_clear"])
    ],
    Sandworm: [
      tech("anti-aerial", "Anti-Aerial", "Air攻撃可能になる。", ["target", "anti_air"]),
      tech("replicate", "Replicate", "敵撃破からchaffを生成する。", ["spawn", "screen"]),
      tech("sandstorm", "Sandstorm", "周囲のranged fightと配置関係を変える。", ["range", "utility"])
    ],
    Wraith: [
      tech("land-cruiser", "Land Cruiser", "AirからGroundへ変化し、Air攻撃不可になる。", ["mobility", "target", "matchup"]),
      tech("degeneration-beam", "Degeneration Beam", "近傍targetへのdebuff/support役を追加する。", ["utility", "role"])
    ],
    Stormcaller: [
      tech("heavy-missile", "Heavy Missile", "ATKとmissile HPが大幅上昇し迎撃を突破しやすいが、攻撃間隔増加でlight unitsに弱くなる。", ["missile", "matchup", "role"])
    ],
    Mountain: [
      tech("anti-aircraft-ammunition", "Anti-Aircraft Ammunition", "Ground OnlyからAir攻撃可能になる。", ["target", "anti_air"])
    ],
    Overlord: [
      tech("mothership", "Mothership", "Wasp生成でAir chaffを追加する。", ["spawn", "screen"]),
      tech("photon-emission", "Photon Emission", "周囲Airへのsupport役を追加する。", ["utility", "package"]),
      tech("overlord-artillery", "Overlord Artillery", "ground DPSとtarget coverageを追加する。", ["role", "matchup"])
    ],
    Vulcan: [
      tech("best-partner", "Best Partner", "Marksmanを召喚し、chaff-clear giantにsingle-target軸を加える。", ["spawn", "synergy", "role"]),
      tech("sticky-oil-bomb", "Sticky Oil Bomb", "fire synergyと進路制御を追加する。", ["synergy", "control"])
    ],
    "Steel Ball": [
      tech("mechanical-division", "Mechanical Division", "死亡時Crawler生成でscreen/chaffを追加する。", ["spawn", "screen"]),
      tech("fortified-target-lock", "Fortified Target Lock", "高HP targetを優先しbeam接続先が変わる。", ["targeting", "matchup"])
    ],
    "Death Knell": [
      tech("energy-diffraction", "Energy Diffraction", "4 beamのanti-heavyから多数target coverageへ変化する。", ["role", "matchup"]),
      tech("steel-ball-production", "Steel Ball Production", "追加戦力を生成する。", ["spawn", "package"]),
      tech("barrier", "Barrier", "Titan周辺packageの耐久を大きく変える。", ["survival", "package"])
    ],
    "War Factory": [
      tech("missile-interceptor", "Missile Interceptor", "deployment単位で強いmissile defenseを提供する。", ["role", "missile"]),
      tech("unit-production", "Unit Production", "継続生成によりarmy roleとtarget saturationが変わる。", ["spawn", "package"])
    ],
    "Sabertooth": [
      tech("missile-interceptor", "Missile Interceptor", "frontlineからmissile defenseを追加する。", ["role", "missile"])
    ],
    "Vortex": [
      tech("baseline-ground-only", "Baseline targeting", "Live 1.11.1.3の通常攻撃はGround Only。Air packageはVortex本体から反撃されないが、敵support AAは別に確認する。", ["target", "matchup"])
    ]
  };

  const units = root.MECH_DATA && root.MECH_DATA.units;
  if (Array.isArray(units)) {
    units.forEach((unit) => {
      unit.techExceptions = (exceptions[unit.name] || []).map((item) => item.id);
    });
  }
  root.MECH_DATA = root.MECH_DATA || {};
  root.MECH_DATA.techExceptions = exceptions;
})(typeof globalThis !== "undefined" ? globalThis : window);
