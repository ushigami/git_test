(function () {
  "use strict";
  const W = "https://wiki.mbxmas.com";
  const step = (title, units, notes, source, timing, confidence = "high") => ({
    title,
    units: units.map(([unit, position]) => ({ unit, position })),
    notes: [notes],
    evidence: { source, timing, confidence }
  });
  const f = {
    "Mass Raiden": [
      step("STARTER PRINCIPLE", [["Crawler","left-front"],["Fang","right-front"],["Arclight","center-mid"]], "固定R1 openerではない。手持ちstarterでground screenを作る代表例。", `${W}/units/air/raiden/`, "Raidenは通常late/counter投入", "low"),
      step("MID / LATE ENTRY", [["Crawler","left-front"],["Fang","right-front"],["Arclight","center-mid"],["Raiden","left-back"],["Raiden","right-back"]], "中型が並ぶlaneへ複数Raidenの射線を共有。単体tankだけのlaneは避ける。", `${W}/units/air/raiden/`, "複数Raidenを一領域へ集めcritical mass", "medium")
    ],
    "Steel Ball + Hound Aggro": [
      step("REPRESENTATIVE START", [["Crawler","left-front"],["Hound","left-mid"],["Steel Ball","left-back"]], "starter依存の代表例。片側へCrawler → Hound → Ballの接触順。", `${W}/guides/hound-phoenix-aggro/`, "Ball/Hound系starterとone-side", "medium"),
      step("MID GAME", [["Crawler","left-front"],["Hound","left-mid"],["Steel Ball","center-mid"],["Steel Ball","left-back"],["Crawler","right-reserve"]], "Houndでsmallを消しBallの接続laneを開ける。Wraithは明示pivot時だけ。", `${W}/units/ground/steel-ball/`, "Hound clear + Ball pressure", "medium")
    ],
    "Vulcan + Marksman": [
      step("REPRESENTATIVE MARKSMAN START", [["Fang","left-front"],["Crawler","right-front"],["Marksman","left-back"],["Marksman","right-back"]], "starter可変の代表例。Marksmanを分散しchaffに前後差を付ける。", "https://note.com/mechabellum/n/n1ca51bb62d85", "Marksman base before Vulcan", "medium"),
      step("MID · VULCAN LINE", [["Fang","left-front"],["Crawler","right-reserve"],["Vulcan","center-mid"],["Marksman","left-back"],["Marksman","right-back"]], "Vulcanをtower前、Marksmanを後方、Crawlerをback reserveへ。", "https://note.com/mechabellum/n/n1ca51bb62d85", "front Vulcan / back Marksman", "high")
    ],
    "Stormcaller + Fang": [
      step("REPRESENTATIVE START", [["Fang","left-front"],["Fang","right-front"],["Stormcaller","left-back"]], "Fang starterからStormを試す代表例。固定R1購入順ではない。", "https://steamcommunity.com/app/669330/announcements/", "exact opener evidence partial", "low"),
      step("MID ARTILLERY LINE", [["Fang","left-front"],["Crawler","center-front"],["Fang","right-front"],["Stormcaller","left-back"],["Stormcaller","center-back"],["Stormcaller","right-back"]], "Stormを横にずらし、遅いchaff層で二射目までの距離を作る。Mustangは必要時だけ。", "https://steamcommunity.com/app/669330/announcements/", "current Heavy Missile + Fang screen", "medium")
    ],
    "AP Sledge Pressure": [
      step("REPRESENTATIVE SLEDGE START", [["Crawler","left-front"],["Sledgehammer","left-mid"],["Sledgehammer","center-mid"],["Arclight","left-back"]], "Sledge starterの代表例。AP取得前は通常frontline。", `${W}/units/ground/sledgehammer/`, "starter + dedicated clear", "medium"),
      step("MID · AFTER AP", [["Crawler","left-front"],["Fang","center-front"],["Sledgehammer","left-mid"],["Sledgehammer","center-mid"],["Arclight","left-back"],["Marksman","center-back"]], "AP後は専任clearを残し、Sledgeをstaggerしてmediumへ通す。", `${W}/units/ground/sledgehammer/`, "Range/Rage/AP carry path")
    ],
    "Sabertooth + Hound + Mustang": [
      step("REPRESENTATIVE START", [["Crawler","left-front"],["Hound","left-mid"],["Sabertooth","center-mid"]], "Saber/Hound starterの代表例。MustangはR1必須ではない。", `${W}/units/ground/sabertooth/`, "Saber + early clear", "medium"),
      step("MID · AA NEEDED", [["Crawler","left-front"],["Hound","left-mid"],["Sabertooth","center-mid"],["Mustang","left-back"],["Mustang","center-back"]], "敵airが見えた時だけMustangを追加。Saberをsmallへ吸わせない。", `${W}/units/ground/sabertooth/`, "listed composition; timing partial", "medium")
    ],
    "Phantom Ray + Fire Badger": [
      step("REPRESENTATIVE START", [["Crawler","left-front"],["Fire Badger","left-mid"],["Phantom Ray","left-back"]], "Ray/Badger starterの代表例。R1からOil前提とはしない。", `${W}/units/air/phantom-ray/`, "early Ray + Badger composition", "medium"),
      step("MID · AFTER STICKY OIL", [["Crawler","left-front"],["Fire Badger","left-mid"],["Fire Badger","center-mid"],["Phantom Ray","left-back"],["Phantom Ray","center-back"],["Fang","right-reserve"]], "Sticky Oil取得後に同laneへ重ねる。RayはAAへ一塊にしない。", `${W}/units/air/phantom-ray/`, "Sticky Oil + Badger ignition")
    ],
    "Mustang + Scorpion": [
      step("STARTER PRINCIPLE", [["Crawler","left-front"],["Fang","right-front"],["Mustang","center-mid"]], "Mustang starterの代表原則。ScorpionをR1に先取りしない。", "https://mechabellum.wiki.gg/wiki/Mustang", "dedicated round guide unavailable", "low"),
      step("MID · SCORPION ENTRY", [["Crawler","left-front"],["Fang","right-front"],["Mustang","left-mid"],["Mustang","right-mid"],["Scorpion","left-back"],["Scorpion","right-back"]], "Scorpionを左右へ分け、Mustangはair/light補完に留める。", "https://mechabellum.wiki.gg/wiki/Scorpion", "unit-role cross-check", "low")
    ],
    "Arclight + Hacker Defense": [
      step("ROUNDS 1–3", [["Crawler","left-front"],["Fang","right-front"],["Arclight","left-mid"],["Arclight","right-mid"],["Crawler","right-reserve"]], "標準chaff + Arclightを先に作り、R4までにArclight Range。", `${W}/guides/arclight-hacker-defense/`, "R1–3 setup"),
      step("ROUND 4/5 · HACKER SURPRISE", [["Crawler","left-front"],["Fang","right-front"],["Arclight","left-mid"],["Arclight","right-mid"],["Hacker","left-back"],["Hacker","center-back"],["Hacker","right-back"]], "3 Hackers + Range（またはLv2を2pack）のsurprise。", `${W}/guides/arclight-hacker-defense/`, "R4/5 three Hacker surprise"),
      step("ROUND 5/6+", [["Crawler","left-front"],["Fang","right-front"],["Arclight","left-mid"],["Arclight","right-mid"],["Hacker","left-back"],["Hacker","center-back"],["Hacker","right-back"],["Mustang","right-reserve"]], "4–6 Hackersへ広げ、Barrierはこの段階以降。supportはmatchup次第。", `${W}/guides/arclight-hacker-defense/`, "R5/6+ scaling")
    ],
    "Arclight + Sandworm Standard": [
      step("ROUNDS 1–4 · STANDARD", [["Crawler","left-front"],["Crawler","right-front"],["Arclight","left-mid"],["Arclight","right-mid"],["Stormcaller","center-back"]], "通常の両面Standard。R4–5の敵commitまでSandwormなし。", `${W}/guides/arclight-sandworm-standard/`, "R1–4 standard"),
      step("ROUND 5+ · DUAL-SIDE WORMS", [["Crawler","left-front"],["Crawler","right-front"],["Sandworm","left-mid"],["Sandworm","right-mid"],["Arclight","center-mid"],["Stormcaller","center-back"]], "Vulcan/Storm/Marksへのpivot時に両sideへMechanical Division Worm。", `${W}/guides/arclight-sandworm-standard/`, "image: dual-side Worms"),
      step("ROUND 5+ · ONE-LANE BEACON", [["Crawler","left-front"],["Sandworm","left-mid"],["Sandworm","center-mid"],["Sandworm","left-back"],["Sandworm","center-back"],["Arclight","right-reserve"]], "別案は4 Wormsを一laneへ集めMobile Beacon。", `${W}/guides/arclight-sandworm-standard/`, "image: four-Worm lane")
    ],
    "Ball + Wraith Aggro": [
      step("ROUND 1", [["Crawler","left-front"],["Steel Ball","left-mid"],["Hound","left-back"],["Crawler","right-reserve"]], "Wraithなし。one sideへBall、layered Crawler、Hound/Arclight clear。", `${W}/guides/ball-wraith-aggro/`, "image: R1 opener"),
      step("ROUND 4", [["Crawler","left-front"],["Steel Ball","left-mid"],["Steel Ball","center-mid"],["Wraith","left-back"],["Wraith","center-back"],["Crawler","right-reserve"]], "Ranged Wraith 2packを目標にCrawler wavesを厚くする。", `${W}/guides/ball-wraith-aggro/`, "R4 two Wraiths + Range"),
      step("ROUNDS 5–7+", [["Crawler","left-front"],["Steel Ball","left-mid"],["Steel Ball","center-mid"],["Wraith","left-back"],["Wraith","center-back"],["Wraith","right-back"],["Wasp","right-mid"],["Crawler","right-reserve"]], "FAA、Ball Mechanical Division、R6頃の3rd Wraith。Waspは必要時だけ。", `${W}/guides/ball-wraith-aggro/`, "image: R7 board")
    ],
    "Fangs Aggro": [
      step("ROUND 1", [["Fang","left-front"],["Fang","center-front"],["Fang","left-mid"],["Steel Ball","center-mid"]], "推奨openingどおり3 Fang packs + Steel Ballをone flankへ。Fortressなし。", `${W}/guides/fangs-aggro/`, "image + recommended opener"),
      step("MID · COUNTER-DRIVEN SUPPORT", [["Fang","left-front"],["Fang","center-front"],["Fang","left-mid"],["Steel Ball","center-mid"],["Fortress","left-back"]], "Range→APを基本。Fortressは敵VulcanへのBarrier回答時だけ。", `${W}/guides/fangs-aggro/`, "Barrier Fortress vs Vulcan"),
      step("LATE SCALE", [["Fang","left-front"],["Fang","center-front"],["Fang","right-front"],["Steel Ball","left-mid"],["Fortress","center-mid"],["Fang","right-reserve"]], "late tank/supportの例。Fortress/Hound等はopeningではない。", `${W}/guides/fangs-aggro/`, "late example image")
    ],
    "Fire Badger + Void Eye Defense": [
      step("ROUND 1 · SAMPLE", [["Crawler","left-front"],["Fang","right-front"],["Fire Badger","tower-left"],["Void Eye","left-back"],["Crawler","right-reserve"]], "建物が少ないsideを選ぶsample。starterでchaffは変わる。", `${W}/guides/fire-badger-void-eye-defense/`, "image: sample opening"),
      step("AROUND ROUND 4", [["Crawler","left-front"],["Fang","right-front"],["Fire Badger","tower-left"],["Fire Badger","center-mid"],["Void Eye","left-back"],["Void Eye","center-back"],["Void Eye","right-back"]], "目安Badger 2、Void約5、chaff約5 + backup AA。図は層を抽象化。", `${W}/guides/fire-badger-void-eye-defense/`, "image: R4 composition"),
      step("ROUND 6+ · ADAPT", [["Crawler","left-front"],["Fang","right-front"],["Fire Badger","tower-left"],["Fire Badger","tower-right"],["Void Eye","left-back"],["Void Eye","center-back"],["Void Eye","right-back"]], "R7までにVoid Range。defense相手はflank、aggro相手はtower近く。", `${W}/guides/fire-badger-void-eye-defense/`, "images: matchup adaptations")
    ],
    "Flank Pull Sledge Aggro": [
      step("ROUNDS 1–4 · STANDARD FIRST", [["Crawler","left-front"],["Crawler","right-front"],["Sledgehammer","left-mid"],["Sledgehammer","right-mid"],["Marksman","center-back"]], "R1からflank固定ではない。standardを作りR1–4にcommit判断。", `${W}/guides/flank-pull-sledge-aggro/`, "image: standard R1"),
      step("ROUNDS 2–4 · AFTER COMMIT", [["Crawler","left-flank"],["Sledgehammer","left-mid"],["Crawler","right-flank"],["Sledgehammer","right-mid"],["Marksman","center-back"]], "両flankへCrawler+Sledge。本隊はtower後方、commit時にturret売却。", `${W}/guides/flank-pull-sledge-aggro/`, "images: flank pathing"),
      step("MID / LATE", [["Crawler","left-flank"],["Sledgehammer","left-mid"],["Crawler","right-flank"],["Sledgehammer","right-mid"],["Sledgehammer","center-mid"],["Marksman","center-back"]], "R4目安4–6 Sledge/4–7 Crawler。lateはDPS追加。", `${W}/guides/flank-pull-sledge-aggro/`, "images: mid/late")
    ],
    "Hound + Phoenix Aggro": [
      step("ROUND 1", [["Hound","left-front"],["Hound","center-front"],["Crawler","left-mid"],["Steel Ball","center-mid"],["Crawler","left-back"]], "one sideへHound、Crawlerを縦後置き、BallをCrawler間へ。", `${W}/guides/hound-phoenix-aggro/`, "image: R1"),
      step("ROUNDS 2–4", [["Hound","left-front"],["Hound","center-front"],["Hound","right-front"],["Crawler","left-mid"],["Crawler","center-mid"],["Phoenix","left-back"],["Phoenix","center-back"]], "R2にPhoenix。R4目安Hound約5、Phoenix 1–2。Ball追加なし。", `${W}/guides/hound-phoenix-aggro/`, "R2–4 section"),
      step("ROUNDS 5–7", [["Hound","left-front"],["Hound","center-front"],["Hound","right-front"],["Crawler","left-mid"],["Crawler","center-mid"],["Phoenix","left-back"],["Phoenix","center-back"],["Wasp","right-back"]], "Hound tech、育ったPhoenix tech。Rhino/Mustang/Waspは必要時だけ。", `${W}/guides/hound-phoenix-aggro/`, "late images")
    ],
    "Mountain + Fire Badger Defense": [
      step("ROUNDS 1–3", [["Crawler","left-back"],["Crawler","right-reserve"],["Fire Badger","tower-left"],["Fire Badger","tower-right"],["Marksman","center-back"]], "Badgerはtower前、Crawler/Marksは後ろ。Rapid-Fire Cannonを売る。", `${W}/guides/mountain-firebadger-defense/`, "image: opener"),
      step("ROUND 4/5 · MOUNTAIN", [["Crawler","left-front"],["Fang","right-front"],["Mountain","center-mid"],["Fire Badger","tower-left"],["Fire Badger","tower-right"],["Marksman","center-back"]], "売却/貯蓄ならR4、通常R5にMountain。Phoenix Jump/Oilは条件付き。", `${W}/guides/mountain-firebadger-defense/`, "timing + final image")
    ],
    "Multimelter + Fire Badger Defense": [
      step("ROUNDS 1–4", [["Fang","left-front"],["Fang","right-front"],["Fire Badger","tower-left"],["Marksman","center-back"]], "tower近く。chaffはCrawlerでなくFang。Badger RangeをR3–4。", `${W}/guides/multimelter-fire-badger-defense/`, "image + R1–4"),
      step("ROUNDS 4–5 · FIRST MELTER", [["Fang","left-front"],["Fang","right-front"],["Fire Badger","tower-left"],["Fire Badger","tower-right"],["Melting Point","center-back"]], "R4–5にMelter。RangeをDiffractionより前または同時。", `${W}/guides/multimelter-fire-badger-defense/`, "image: first Melter"),
      step("ROUNDS 5–7+", [["Fang","left-front"],["Fang","right-front"],["Fire Badger","tower-left"],["Fire Badger","tower-right"],["Melting Point","left-back"],["Melting Point","right-back"]], "Badger Napalm R5–6、複数Melter + Fang/shield。", `${W}/guides/multimelter-fire-badger-defense/`, "image: R7")
    ],
    "Sledge + Marksman Defense": [
      step("ROUNDS 1–4", [["Crawler","left-back"],["Sledgehammer","tower-left"],["Sledgehammer","center-mid"],["Sledgehammer","tower-right"],["Marksman","left-back"],["Marksman","right-back"]], "Sledgeをtower内側やや前、Crawlerは後方。外側Sledgeでflankを覆う。", `${W}/guides/sledge-marksman-defense/`, "image: R3"),
      step("ROUNDS 5–7", [["Crawler","left-back"],["Sledgehammer","tower-left"],["Sledgehammer","center-mid"],["Sledgehammer","tower-right"],["Arclight","right-mid"],["Marksman","left-back"],["Marksman","right-back"]], "Marksman carryへ。Assault ModeはBall/Hound/Typhoon向けでSaberには使わない。", `${W}/guides/sledge-marksman-defense/`, "image: R7")
    ],
    "Spider + Phoenix Aggro": [
      step("ROUND 1", [["Crawler","left-front"],["Tarantula","left-mid"],["Crawler","left-back"],["Sledgehammer","left-flank"]], "Tarantula + Crawlerをone flank。Sledgeはedge pull代表例。Houndなし。", `${W}/guides/spider-phoenix-aggro/`, "image: opener + pull"),
      step("ROUNDS 3–4", [["Crawler","left-front"],["Tarantula","left-mid"],["Tarantula","center-mid"],["Phoenix","left-back"],["Phoenix","center-back"]], "Tarantula RangeをR3–4。Phoenixは価値targetへ。", `${W}/guides/spider-phoenix-aggro/`, "R3–4 transition"),
      step("ROUNDS 5–7", [["Crawler","left-front"],["Tarantula","left-mid"],["Tarantula","center-mid"],["Phoenix","left-back"],["Phoenix","center-back"],["Crawler","right-reserve"]], "Tarantula HEをR5–7。Phoenix Jump推奨、Rangeは状況次第。", `${W}/guides/spider-phoenix-aggro/`, "late image + tech timing")
    ],
    "Typhon Aggro": [
      step("ROUNDS 1–3", [["Crawler","left-front"],["Crawler","center-front"],["Crawler","left-mid"],["Phoenix","left-back"]], "one sideのCrawler base。turretを売り、Phoenixはtempo option。", `${W}/guides/typhon-aggro/`, "images: early chain"),
      step("ROUND 4 TARGET", [["Crawler","left-front"],["Crawler","center-front"],["Typhoon","left-mid"],["Typhoon","center-mid"],["Typhoon","right-mid"],["Typhoon","left-back"],["Phoenix","center-back"]], "目標はTyphoon 4 squads + 1 tech + Crawler chain。", `${W}/guides/typhon-aggro/`, "R4 explicit target"),
      step("ROUND 5+ · SIDE SWITCH", [["Crawler","left-front"],["Crawler","center-front"],["Typhoon","left-mid"],["Typhoon","center-mid"],["Typhoon","right-mid"],["Typhoon","right-flank"],["Phoenix","center-back"]], "opposite flankへ補強しMobile Beaconでside switch。", `${W}/guides/typhon-aggro/`, "images: opposite side/beacon")
    ],
    "Carry Vortex": [
      step("STARTER CHECK", [["Crawler","left-front"],["Vortex","left-mid"],["Mustang","left-back"]], "Vortex starterの代表例。固定R1個数やGridを断定しない。", "https://mechabellum.wiki.gg/wiki/Vortex", "no dedicated round guide", "low"),
      step("MID · LINKED LINE", [["Crawler","left-front"],["Vortex","left-mid"],["Vortex","center-mid"],["Vortex","left-back"],["Mustang","right-back"],["Crawler","right-reserve"]], "十分な数が残る時だけ35m以内へ。Range後にGridを検討。", "https://steamcommunity.com/app/669330/announcements/", "1.11.1 current tech data", "medium"),
      step("LATE · CONDITIONAL CARRY", [["Crawler","left-front"],["Fang","center-front"],["Vortex","left-mid"],["Vortex","center-mid"],["Vortex","right-mid"],["Vortex","left-back"],["Mustang","right-back"]], "single-target回答が薄い時だけcarry化。Mustangは補完量だけ。", "https://www.reddit.com/r/Mechabellum/comments/1utjew4/success_with_vortex/", "community progression evidence weak", "low")
    ]
  };
  GUIDE_DATA.forEach((item) => {
    item.formationSteps = f[item.n];
    if (!item.formationSteps) throw new Error(`Missing formation data: ${item.n}`);
  });
})();
