(function () {
  "use strict";
  const step = (title, units, notes) => ({
    title,
    units: units.map(([unit, position]) => ({ unit, position })),
    notes
  });
  const formations = {
    "Mass Raiden": [
      step("ROUND 1", [["Crawler", "left-front"], ["Fang", "right-front"], ["Arclight", "center-mid"], ["Crawler", "right-reserve"]], ["Raidenを急がず、まず時間差chaffとclearを作る。"]),
      step("MID GAME · R3–4", [["Crawler", "left-front"], ["Fang", "right-front"], ["Arclight", "center-mid"], ["Raiden", "left-back"], ["Raiden", "right-back"]], ["Raidenを左右へ少しずらし、同じAA射線へ重ねない。"]),
      step("LATE · MASS FORM", [["Crawler", "left-front"], ["Fang", "center-front"], ["Crawler", "right-front"], ["Raiden", "left-mid"], ["Raiden", "right-mid"], ["Raiden", "left-back"], ["Raiden", "right-back"], ["Farseer", "center-back"]], ["3–5機の射線を共有しつつ、単一clusterにはしない。"])
    ],
    "Steel Ball + Hound Aggro": [
      step("ROUND 1", [["Crawler", "left-front"], ["Hound", "left-mid"], ["Steel Ball", "left-back"], ["Crawler", "right-reserve"]], ["攻める左tower側へ集中。Crawler → Hound → Ballの接触順。"]),
      step("MID GAME · R3–5", [["Crawler", "left-front"], ["Hound", "left-mid"], ["Steel Ball", "center-mid"], ["Steel Ball", "left-back"], ["Wraith", "center-back"], ["Crawler", "right-reserve"]], ["Ballの接続laneをclearで開け、反対towerには最低限のreserve。"])
    ],
    "Vulcan + Marksman": [
      step("ROUND 1", [["Fang", "left-front"], ["Crawler", "right-front"], ["Marksman", "left-back"], ["Marksman", "right-back"]], ["Marksmanを分散し、chaffは一度に消えない前後差を付ける。"]),
      step("MID GAME · R3–5", [["Fang", "left-front"], ["Crawler", "right-front"], ["Vulcan", "center-mid"], ["Marksman", "left-back"], ["Marksman", "right-back"], ["Crawler", "right-reserve"]], ["Vulcanがtower間のsmallを消し、Marksmanが両laneを見る。"])
    ],
    "Stormcaller + Fang": [
      step("ROUND 1", [["Fang", "left-front"], ["Fang", "right-front"], ["Stormcaller", "left-back"], ["Stormcaller", "right-back"]], ["Fang waveの後ろからStormが初弾を撃てる距離を確保。"]),
      step("MID GAME · R3–5", [["Fang", "left-front"], ["Crawler", "center-front"], ["Fang", "right-front"], ["Stormcaller", "left-back"], ["Stormcaller", "center-back"], ["Stormcaller", "right-back"], ["Mustang", "right-reserve"]], ["砲台を横にずらし、fast push用のAA/clear reserveを残す。"])
    ],
    "AP Sledge Pressure": [
      step("ROUND 1", [["Crawler", "left-front"], ["Sledgehammer", "left-mid"], ["Sledgehammer", "center-mid"], ["Arclight", "left-back"]], ["Sledgeを縦にずらし、AP射撃をsmallへ吸わせない。"]),
      step("MID GAME · R3–5", [["Crawler", "left-front"], ["Fang", "center-front"], ["Sledgehammer", "left-mid"], ["Sledgehammer", "center-mid"], ["Arclight", "left-back"], ["Marksman", "center-back"]], ["専任clearとsingle-targetを追加し、Sledgeへ全役割を負わせない。"])
    ],
    "Sabertooth + Hound + Mustang": [
      step("ROUND 1", [["Crawler", "left-front"], ["Hound", "left-mid"], ["Sabertooth", "center-mid"], ["Crawler", "right-reserve"]], ["Houndがsmallへ先に触れ、Saberを価値targetへ通す。"]),
      step("MID GAME · R4–6", [["Crawler", "left-front"], ["Hound", "left-mid"], ["Sabertooth", "center-mid"], ["Mustang", "left-back"], ["Mustang", "center-back"], ["Crawler", "right-reserve"]], ["Mustangは後方へ広げ、air flankにも射線を残す。"])
    ],
    "Phantom Ray + Fire Badger": [
      step("ROUND 1", [["Crawler", "left-front"], ["Fire Badger", "left-mid"], ["Phantom Ray", "left-back"], ["Crawler", "right-reserve"]], ["Oilとfireが同じlaneへ届く片側配置。"]),
      step("MID GAME · R3–5", [["Crawler", "left-front"], ["Fire Badger", "left-mid"], ["Fire Badger", "center-mid"], ["Phantom Ray", "left-back"], ["Phantom Ray", "center-back"], ["Fang", "right-reserve"]], ["Rayを一塊にせず、CrawlerでAA targetを散らす。"])
    ],
    "Mustang + Scorpion": [
      step("ROUND 1", [["Crawler", "left-front"], ["Fang", "right-front"], ["Mustang", "left-mid"], ["Mustang", "right-mid"]], ["Mustangは補助clearとして両laneへ射線を持つ。"]),
      step("MID GAME · R3–5", [["Crawler", "left-front"], ["Fang", "right-front"], ["Mustang", "left-mid"], ["Mustang", "right-mid"], ["Scorpion", "left-back"], ["Scorpion", "right-back"]], ["Scorpionを左右へ分け、同じAoEへまとめて失わない。"])
    ],
    "Arclight + Hacker Defense": [
      step("ROUND 1", [["Crawler", "left-front"], ["Fang", "right-front"], ["Arclight", "left-mid"], ["Arclight", "right-mid"], ["Crawler", "right-reserve"]], ["clearを先に完成。tower外側へanti-flank reserve。"]),
      step("MID GAME · R4–5", [["Crawler", "left-front"], ["Fang", "right-front"], ["Arclight", "left-mid"], ["Arclight", "right-mid"], ["Hacker", "left-back"], ["Hacker", "center-back"], ["Hacker", "right-back"], ["Crawler", "right-reserve"]], ["Hackerはtower後方へ分散し、small除去後のmediumを掴む。"])
    ],
    "Arclight + Sandworm Standard": [
      step("ROUND 1", [["Crawler", "left-front"], ["Arclight", "left-mid"], ["Arclight", "center-mid"], ["Crawler", "right-reserve"]], ["突破するtower側を決め、Arclightとchaffで安定。"]),
      step("MID GAME · R5+", [["Crawler", "left-front"], ["Sandworm", "left-mid"], ["Arclight", "center-mid"], ["Marksman", "left-back"], ["Crawler", "right-reserve"]], ["Wormの進路を空け、火力を同じ片側へ集中。"])
    ],
    "Ball + Wraith Aggro": [
      step("ROUND 1", [["Crawler", "left-front"], ["Steel Ball", "left-mid"], ["Hound", "left-back"], ["Crawler", "right-reserve"]], ["この時点ではWraithなし。Ballの育成とlayered Crawlerを優先。"]),
      step("MID GAME · R3–4", [["Crawler", "left-front"], ["Steel Ball", "left-mid"], ["Steel Ball", "center-mid"], ["Wraith", "left-back"], ["Wraith", "center-back"], ["Crawler", "right-reserve"]], ["R4目安のWraith 2体。Ball周辺のsmallをclearする。"]),
      step("LATE · R6+", [["Crawler", "left-front"], ["Steel Ball", "left-mid"], ["Steel Ball", "center-mid"], ["Wraith", "left-back"], ["Wraith", "center-back"], ["Wraith", "right-back"], ["Wasp", "right-mid"], ["Crawler", "right-reserve"]], ["WaspでAAを吸い、反対towerのreserveは残す。"])
    ],
    "Fangs Aggro": [
      step("ROUND 1", [["Fang", "left-front"], ["Fang", "center-front"], ["Fortress", "left-mid"], ["Fang", "right-reserve"]], ["Fangを片側へ濃くしつつ、全packを同一列へ置かない。"]),
      step("MID GAME · R3–6", [["Fang", "left-front"], ["Fang", "center-front"], ["Fortress", "left-mid"], ["Fang", "center-mid"], ["Marksman", "left-back"], ["Stormcaller", "center-back"], ["Fang", "right-reserve"]], ["frontlineとbacklineを足し、敵clearへFang以外の回答を作る。"])
    ],
    "Fire Badger + Void Eye Defense": [
      step("ROUND 1", [["Crawler", "left-front"], ["Fang", "right-front"], ["Fire Badger", "tower-left"], ["Void Eye", "left-back"], ["Crawler", "right-reserve"]], ["Badgerはtower横、Voidは同laneのtower後ろ。"]),
      step("MID GAME · R3–5", [["Crawler", "left-front"], ["Fang", "right-front"], ["Fire Badger", "tower-left"], ["Fire Badger", "center-mid"], ["Void Eye", "left-back"], ["Void Eye", "center-back"], ["Crawler", "right-reserve"]], ["強い防衛laneを作り、反対側はanti-flank reserveで遅らせる。"])
    ],
    "Flank Pull Sledge Aggro": [
      step("ROUND 1", [["Crawler", "left-flank"], ["Crawler", "right-front"], ["Sledgehammer", "right-mid"], ["Marksman", "right-back"]], ["flank pullと本隊を分離し、空いたright tower laneを押す。"]),
      step("MID GAME · R3–5", [["Crawler", "left-flank"], ["Fang", "left-front"], ["Crawler", "right-front"], ["Sledgehammer", "right-mid"], ["Sledgehammer", "center-mid"], ["Marksman", "right-back"]], ["引かれた敵を横から撃てるよう本隊後衛をright sideへ。"])
    ],
    "Hound + Phoenix Aggro": [
      step("ROUND 1", [["Crawler", "left-front"], ["Hound", "left-mid"], ["Hound", "center-mid"], ["Crawler", "right-reserve"]], ["この時点ではPhoenixなし。Houndが経験値を取る地上層を作る。"]),
      step("MID GAME · R3–4", [["Crawler", "left-front"], ["Hound", "left-mid"], ["Hound", "center-mid"], ["Phoenix", "left-back"], ["Phoenix", "center-back"], ["Crawler", "right-reserve"]], ["PhoenixはHoundが開けた同laneを後方から射撃。"])
    ],
    "Mountain + Fire Badger Defense": [
      step("ROUND 1", [["Crawler", "left-front"], ["Fang", "right-front"], ["Fire Badger", "tower-left"], ["Marksman", "left-back"], ["Crawler", "right-reserve"]], ["Mountain前にBadger/chaff/backlineを完成。"]),
      step("MID GAME · R4–5", [["Crawler", "left-front"], ["Fang", "right-front"], ["Mountain", "center-mid"], ["Fire Badger", "tower-left"], ["Fire Badger", "tower-right"], ["Marksman", "left-back"], ["Crawler", "right-reserve"]], ["Mountainをtower間の壁にし、Badgerは両脇でsmallを処理。"])
    ],
    "Multimelter + Fire Badger Defense": [
      step("ROUND 1", [["Crawler", "left-front"], ["Fang", "right-front"], ["Fire Badger", "tower-left"], ["Crawler", "right-reserve"]], ["まずsmall clearとMelterを守るscreenを準備。"]),
      step("MID GAME · R5–7", [["Crawler", "left-front"], ["Fang", "right-front"], ["Fire Badger", "tower-left"], ["Fire Badger", "tower-right"], ["Melting Point", "left-back"], ["Melting Point", "right-back"], ["Crawler", "right-reserve"]], ["Badgerでsmallを消した後、複数Melterがfrontlineへbeamを接続。"])
    ],
    "Sledge + Marksman Defense": [
      step("ROUND 1", [["Crawler", "left-front"], ["Sledgehammer", "tower-left"], ["Sledgehammer", "center-mid"], ["Marksman", "left-back"], ["Crawler", "right-reserve"]], ["Sledgeをtower内側へ縦配置し、Marksmanの射撃時間を作る。"]),
      step("MID GAME · R3–5", [["Crawler", "left-front"], ["Sledgehammer", "tower-left"], ["Sledgehammer", "center-mid"], ["Arclight", "right-mid"], ["Marksman", "left-back"], ["Marksman", "center-back"], ["Crawler", "right-reserve"]], ["dedicated clearを足し、Marksmanをtower後方へ分散。"])
    ],
    "Spider + Phoenix Aggro": [
      step("ROUND 1", [["Crawler", "left-front"], ["Tarantula", "left-mid"], ["Hound", "left-back"], ["Crawler", "right-reserve"]], ["この時点ではPhoenixなし。Spiderをchaffの後ろへ置く。"]),
      step("MID GAME · R3–4", [["Crawler", "left-front"], ["Tarantula", "left-mid"], ["Tarantula", "center-mid"], ["Phoenix", "left-back"], ["Phoenix", "center-back"], ["Crawler", "right-reserve"]], ["PhoenixはSpiderが固定した同laneの価値targetを抜く。"])
    ],
    "Typhon Aggro": [
      step("ROUND 1", [["Crawler", "left-front"], ["Fang", "center-front"], ["Sledgehammer", "left-mid"], ["Crawler", "right-reserve"]], ["Typhoon投入前にfast frontlineと射撃時間を作る。"]),
      step("MID GAME · R4–5", [["Crawler", "left-front"], ["Fang", "center-front"], ["Typhoon", "left-mid"], ["Typhoon", "center-mid"], ["Phoenix", "left-back"], ["Crawler", "right-reserve"]], ["rare個体を片側へ寄せつつ、Scorpionへ一塊にしない。"])
    ],
    "Carry Vortex": [
      step("ROUND 1", [["Crawler", "left-front"], ["Vortex", "left-mid"], ["Vortex", "center-mid"], ["Mustang", "left-back"], ["Crawler", "right-reserve"]], ["1–2体を通常unitとして試し、Range / Gridをまだ急がない。"]),
      step("MID GAME · R3–5", [["Crawler", "left-front"], ["Vortex", "left-mid"], ["Vortex", "center-mid"], ["Vortex", "left-back"], ["Vortex", "center-back"], ["Mustang", "right-back"], ["Crawler", "right-reserve"]], ["Vortex同士を35m以内に保ち、Range後にGridを有効化。"]),
      step("LATE · MASS FORM", [["Crawler", "left-front"], ["Fang", "center-front"], ["Vortex", "left-mid"], ["Vortex", "center-mid"], ["Vortex", "right-mid"], ["Vortex", "left-back"], ["Vortex", "center-back"], ["Mustang", "right-back"], ["Crawler", "right-reserve"]], ["linked lineを維持し、Mustangはair/light不足を補う量だけ。"])
    ]
  };

  GUIDE_DATA.forEach((item) => {
    item.formationSteps = formations[item.n];
    if (!item.formationSteps) throw new Error(`Missing formation data: ${item.n}`);
  });
})();
