(function () {
  "use strict";

  const OFFICIAL = "https://steamcommunity.com/app/669330/announcements/";
  const W = "https://wiki.mbxmas.com";
  const detail = {
    "Mass Raiden": {
      flow: "前後にずらしたchaffで敵の射撃を分散し、Raidenの3目標攻撃が毎射撃で中型へ入る状態を作る。数が揃う前は高価な補助火力にすぎないため、盤面を支えるgroundを先に完成させる。",
      roles: [["Raiden", "Multi-target air carry"], ["Crawler", "Wave screen / target soak"], ["Farseer", "Long-range AA / single-target補完"]],
      entry: { best: "Crawler/Hound/Fangを既に持ち、中型が並ぶ盤面。", good: "Raiden reinforcementまたはAerial Specialistから1–2機を安く試せる時。", conditional: "敵が巨体1体や長射程AA中心なら、Mass化せず別carryを優先。" },
      techSplit: [1, 2],
      win: ["chaffが時間差で接触", "Raidenが複数の中型へ同時射撃", "敵の処理速度を上回る数へ到達", "残ったair群が後衛を掃討"],
      mistakes: ["R1からRaiden購入を急いでgroundが空になる", "Raidenを1機だけ置いてTechを重ねる", "単体TitanへMass Raidenだけで回答する"],
      placement: ["左右均等より、射線を共有できる片側寄せを基本にする。", "chaffはRaiden直前の一列ではなくfront / midへ時間差配置する。"]
    },
    "Steel Ball + Hound Aggro": {
      flow: "Houndが小型を先に消し、Steel Ballのbeamを敵本体へ接続する。Ballは突破役、Houndは接続路を開ける役なので、どちらか一方だけを増やしても勝ち筋にならない。",
      roles: [["Steel Ball", "Anti-heavy DPS / front pressure"], ["Hound", "Fast chaff clear"], ["Crawler", "Target soak / tempo layer"]],
      entry: { best: "Steel Ball + Hound starter。", good: "Ball + Crawler / Arclightから、敵chaffがBallを止め始めた時。", conditional: "ScorpionやPhoenixが既に育っている盤面への後入りは避ける。" },
      techSplit: [2, 2],
      win: ["Crawlerが初弾を吸う", "Houndが敵chaffをclear", "Ballが高HP targetへ接続", "前線崩壊からtowerへ雪崩れ込む"],
      mistakes: ["Ballだけを増やしてclear不足になる", "Crawlerを一列に置き一度に消される", "Ball counter確認後もMechanical Divisionだけを頼る"],
      placement: ["攻めるtower側へone-side concentration。", "Crawler → Hound → Ballの順で接触し、Ballを最前列へ裸で置かない。"]
    },
    "Vulcan + Marksman": {
      flow: "Vulcanが小型を消し、Marksmanが残ったmedium / heavyを射程外から抜く分業型Standard。前線を急いで押すより、layered chaffで二つの射線が仕事をする秒数を増やす。",
      roles: [["Vulcan", "Wide chaff clear / tank"], ["Marksman", "Long-range single-target"], ["Fang", "Slow screen / AA chip"]],
      entry: { best: "Marksman starterから育成を開始。", good: "敵chaffが増え、安いclearではMarksmanの射撃時間を作れなくなった時にVulcan。", conditional: "高速Aggroが完成済みならVulcan解禁よりfrontline補強を優先。" },
      techSplit: [2, 2],
      win: ["layered chaffが進軍を止める", "Vulcanが小型を除去", "Marksmanが価値targetだけを射撃", "射程差を保ったまま前進"],
      mistakes: ["早期Vulcanを複数買ってsingle-target不足", "Marksmanを同じ横列へ密集", "高速pivotを見ても後衛だけ増やす"],
      placement: ["Vulcanはtower間または脅威側のmid、Marksmanはtower後方へ分散。", "chaffをfront / tower横 / back reserveへ分ける。"]
    },
    "Stormcaller + Fang": {
      flow: "遅いFang waveで接敵時刻を制御し、Stormcallerが長射程から複数回砲撃する。砲撃密度で勝つCompなので、距離を潰す高速unitへのreserveを常に残す。",
      roles: [["Stormcaller", "Artillery / shield pressure"], ["Fang", "Slow screen / carry option"], ["Mustang", "AA / missile utility"]],
      entry: { best: "Fang starter対slow ground。", good: "敵がSledge/Tarantula等を横に並べ、初弾が価値を持つ時。", conditional: "Ball/Rhino/Sandworm型のfast pressureが見える時はStormを増やさない。" },
      techSplit: [2, 3],
      win: ["Fangが接敵を遅らせる", "Storm初弾が密集へ着弾", "二射目まで距離を維持", "削れた前線をsupportが処理"],
      mistakes: ["Stormを横一列へ固めMobile Beaconに弱くする", "Fangを一波だけにして距離を失う", "interceptor対策だけに投資しfast pushを無視"],
      placement: ["Stormはtower後方で左右にずらし、同じ着弾角へ依存しない。", "Fangはfrontとtower横reserveの二層にする。"]
    },
    "AP Sledge Pressure": {
      flow: "Armor-Piercing BulletsでSledgeを壁からmedium DPSへ変え、序中盤の供給効率でtowerへ圧を掛ける。AP後は小型処理が落ちるため、専任clearとchaffを別に用意する。",
      roles: [["Sledgehammer", "Mid-cost carry / frontline"], ["Crawler", "Shot soak / flank pressure"], ["Arclight", "Dedicated chaff clear"]],
      entry: { best: "Sledge + chaff starterと早い供給優位。", good: "敵medium/heavyがSledge射線へ並ぶ時。", conditional: "Mass chaff、Hacker、Raidenが早い盤面では通常frontline運用に留める。" },
      techSplit: [1, 2],
      win: ["chaffが初弾を受ける", "AP Sledgeがmediumを短時間で削る", "level差を作って前線を維持", "後衛DPSと共にtowerへ前進"],
      mistakes: ["AP取得後もSledgeへchaff clearを任せる", "Sledgeを横密集させScorpionへ渡す", "carry不能後もSledge Techを追加する"],
      placement: ["Sledgeは縦またはstagger配置でAoE被害を分散。", "clearはSledgeの半歩後ろ、chaffはさらにfrontへ置く。"]
    },
    "Sabertooth + Hound + Mustang": {
      flow: "Sabertoothが正面duelを担当し、Houndがchaffを開け、Mustangがairと残敵を処理する三層Standard。Saberへ価値targetを渡せるかが火力の大半を決める。",
      roles: [["Sabertooth", "Heavy duel / frontline"], ["Hound", "Fast chaff clear"], ["Mustang", "AA / light cleanup"]],
      entry: { best: "Hound + Sabertooth starter。", good: "Houndで経験値を取り、early Saber reinforcementを得た時。", conditional: "Void/Phoenix等のSaber回答が先に揃っていれば空pivotを選ぶ。" },
      techSplit: [2, 2],
      win: ["Houndがscreenを除去", "Saberがmedium/heavyへDoubleshot", "Mustangがair/lightを抑制", "三層が崩れず前進"],
      mistakes: ["Saberをchaffへ吸わせる", "Mustangを早期carry化してArmorに止まる", "Hound不足のままSaberだけ増やす"],
      placement: ["HoundをSaberよりわずかに前、Crawlerをさらに先行。", "MustangはSaber背後へ広げ、air flankにも射線を残す。"]
    },
    "Phantom Ray + Fire Badger": {
      flow: "Phantom RayのSticky OilをFire Badgerが着火し、地上chaffを広く消しながら空火力を通す。oil連携が成立しない盤面ではRayとBadgerが別々の中途半端な投資になる。",
      roles: [["Phantom Ray", "Air DPS / oil delivery"], ["Fire Badger", "Ignition / ground clear"], ["Crawler", "AA soak / screen"]],
      entry: { best: "RayまたはBadger starter + もう一方の早期入手。", good: "敵ground chaffが密集しAAが薄い時。", conditional: "Marks/Farseer/Phoenixがlevel先行していれば地上carryを選ぶ。" },
      techSplit: [2, 2],
      win: ["CrawlerがAA初弾を吸う", "RayがOilを投下", "Badgerが着火してground layerを消す", "Rayが残った価値targetを処理"],
      mistakes: ["Oil前にRayを量産する", "Badgerが遠すぎてOilを着火できない", "敵AA増加後もairだけを追加する"],
      placement: ["Badgerは攻めるsideのmid、Rayは同laneの後方上空。", "Crawlerをfrontとair直下へ分け、AA targetをずらす。"]
    },
    "Mustang + Scorpion": {
      flow: "Mustangがsmall / airを担当し、Scorpionが密集mediumへ高価値の一撃を入れる。Scorpionの射撃対象をchaffへ浪費させないscreen設計が完成度を決める。",
      roles: [["Mustang", "AA / light clear"], ["Scorpion", "Anti-medium artillery"], ["Crawler", "Screen / firing-time support"]],
      entry: { best: "Mustang starter対medium mass。", good: "Scorpion reinforcementから敵Sledge/Ball/Typhoonを咎める時。", conditional: "enemy air sniper / long siegeが先行している時はScorpionを1–2体で止める。" },
      techSplit: [2, 2],
      win: ["Mustangがsmall targetを除去", "Scorpionがmedium clusterへ射撃", "chaffが再射撃時間を作る", "残敵をMustangが追撃"],
      mistakes: ["Scorpionを横密集させる", "MustangをArmor targetへ撃たせ続ける", "中型が減った後もScorpionを増産する"],
      placement: ["Scorpionは左右へ分け、各laneのmedium塊へ射線を作る。", "Mustangは一段前、Crawlerはfront / flank reserveへ分散。"]
    },
    "Arclight + Hacker Defense": {
      flow: "Arclightがsmallを消した後、Hackerが露出したmediumを奪って数的有利を反転させる。敵chaffが残るとhackが無価値targetへ吸われるため、clear順序が最重要。",
      roles: [["Arclight", "Low-cost chaff clear"], ["Hacker", "Medium control"], ["Crawler", "Defensive wave / Hacker guard"]],
      entry: { best: "Arclight/chaff starter対medium投資。", good: "敵が同一mediumへ3pack+Techを積んだR4前後。", conditional: "Air/siege中心やShieldを先に持つ相手にはHackerを急がない。" },
      techSplit: [2, 2],
      win: ["Arclightがchaffを除去", "Hackerがmediumへlock", "奪ったunitが第二の壁になる", "後続Hackerが安全に再control"],
      mistakes: ["clear完成前にHackerを3体買う", "Hackerをtower前へ出しfast pushに触らせる", "Air switch後もHackerを追加する"],
      placement: ["Arclightはtower間mid、Hackerはtower後ろへ左右分散。", "anti-flank Crawlerをtower外側のreserveに残す。"]
    },
    "Arclight + Sandworm Standard": {
      flow: "Arclightで小型を処理し、Sandwormが片側のtarget順と前線を壊す局地突破型。Wormの潜行と再接敵で作った時間を、後衛火力へ変換する。",
      roles: [["Arclight", "Chaff clear / early carry"], ["Sandworm", "Burrow pressure / tank"], ["Crawler", "Wave screen"]],
      entry: { best: "Arclight + chaff starterで片側が薄い盤面。", good: "R5前後にWorm reinforcement、またはground backlineが一側へ偏った時。", conditional: "Melter/EMP/air single-targetが既に揃うlaneへは投入しない。" },
      techSplit: [1, 2],
      win: ["chaffが敵frontを固定", "Wormが片側へ潜行接近", "target順を崩してtower側を割る", "Arclight/後衛が残敵をclear"],
      mistakes: ["両sideへWormを分散して局地優位を失う", "Worm投入前にchaffを減らす", "counter出現後もReplicateまで直進する"],
      placement: ["本隊を攻めるtower側へ寄せ、Wormの進路を空ける。", "ArclightはWorm後方、anti-flank chaffは反対tower外側。"]
    },
    "Ball + Wraith Aggro": {
      flow: "Steel Ballが高HP targetへ接続し、Ball周辺へ集まった敵をWraithが範囲処理する。Crawler waveとMechanical Divisionが接続時間を伸ばし、空と地上の二軸でcounter投資を分散させる。",
      roles: [["Steel Ball", "Anti-heavy DPS / front pressure"], ["Wraith", "Air chaff clear / carry"], ["Crawler", "Target soak / Mechanical Division layer"]],
      entry: { best: "Ball starter（Ball/Fang以外）とheadbutt。", good: "Ballがlevelを取り、敵chaffが接続を止め始めた時にWraith。", conditional: "強いAA + Scorpionが既に揃う盤面への後入りは避ける。" },
      techSplit: [2, 2],
      win: ["layered Crawlerが射撃を吸う", "Wraithが敵chaffをclear", "Ballが本体へ接続", "Division CrawlerとWraithが後衛まで残る"],
      mistakes: ["Ballだけ増やしてchaff clear不足", "WraithをR2から急ぎ経済を崩す", "Mechanical Division取得後にBall数を増やさない", "counter pivot後もBallを買い続ける"],
      placement: ["one-side concentrationでtower pressureを作る。", "Crawler → Ball、WraithはBall後方上空。反対towerに最低限のreserveを置く。"]
    },
    "Fangs Aggro": {
      flow: "Fangを捨てchaffではなくRange / Shield / Igniteを持つcarryへ育て、片側へ弾数を集中する。Fang clearへ敵が投資したら、frontlineやairでその回答を処理する。",
      roles: [["Fang", "Ranged swarm carry / screen"], ["Fortress", "Barrier / frontline"], ["Marksman", "Clear-killer / single-target"]],
      entry: { best: "Fang starter対low-clear opener。", good: "Fangが序盤levelを取り、相手がsingle-targetへ偏った時。", conditional: "Fire Badger/Vulcan/Wraithが早く揃ったらFang carryへ固定しない。" },
      techSplit: [2, 2],
      win: ["frontlineがFangを保護", "Range Fangが同時射撃", "Shieldでclearの初動を耐える", "Ignite/火力がheavyまで削る"],
      mistakes: ["Fangを全てfront一列へ置く", "levelのないFangへ3Techを積む", "継続fire完成後もFangだけ増やす"],
      placement: ["Fangは片側へ濃く、front / midの二列へstagger。", "FortressはFangを覆うmid、single-targetはさらに後方。"]
    },
    "Fire Badger + Void Eye Defense": {
      flow: "Fire Badgerが小型を焼き、Void Eyeがslow / suppressionから中大型を削る低コスト二軸Defense。短射程Badgerをtower基準で守り、Voidの射撃時間を作る。",
      roles: [["Fire Badger", "Ground chaff clear"], ["Void Eye", "Suppression / heavy DPS"], ["Crawler", "Defensive screen"]],
      entry: { best: "Fire Badger + Void Eye starter。", good: "片方starterから敵ground standardを見てR3–4に移行。", conditional: "Raiden/long-range airが先行している時はAAを先に用意。" },
      techSplit: [2, 2],
      win: ["chaffがtower前で接敵", "Badgerがsmall layerを焼く", "Voidが露出したheavyをsuppression", "防衛線を保ったまま射程優位"],
      mistakes: ["Badgerをfrontへ出しすぎる", "Voidだけを増やしてairを見ない", "左右へ均等投資し強い防衛laneを作らない"],
      placement: ["Badgerはtower横mid、Voidはtower後ろから同laneを見る。", "反対tower外側へanti-flank chaffをreserve。"]
    },
    "Flank Pull Sledge Aggro": {
      flow: "flank unitや経路操作で敵主力を横へ引き、Sledge本隊が空いたtower laneを押す。火力そのものよりtarget順と移動時間を奪うことが勝ち筋。",
      roles: [["Sledgehammer", "Main pressure / durable DPS"], ["Crawler", "Flank pull / screen"], ["Marksman", "Backline finisher"]],
      entry: { best: "Sledge starter対one-side defense。", good: "敵が片側へ過集中しflank反応で隊列が崩れる時。", conditional: "両tower外側にreserveがあり、air/siegeが強い相手には正面型へ。" },
      techSplit: [2, 1],
      win: ["flankが敵frontを横へ誘導", "本隊Sledgeが空いたlaneへ進行", "tower debuffを獲得", "後衛DPSが追撃"],
      mistakes: ["flankと本隊を同時刻に接敵させない", "引く方向を決めず両flankへ投資", "相手のanti-flank完成後も位置技だけを繰り返す"],
      placement: ["本隊は片側front、flank packは反対端のzoneへ明確に分離。", "Sledge後ろに射撃軸を置き、引かれた敵を横から撃つ。"]
    },
    "Hound + Phoenix Aggro": {
      flow: "Houndがsmallを消して地上tempoを取り、Phoenixがmedium / heavyを安全圏から抜く。Houndの速度で前線を押し、Phoenixが移動せず撃てる距離を作る。",
      roles: [["Hound", "Fast clear / front pressure"], ["Phoenix", "Air single-target carry"], ["Crawler", "Wave screen / AA soak"]],
      entry: { best: "Hound + CrawlerをR1で作れるstarter。", good: "Houndがlevelを取り、敵mediumが増えたR3–4にPhoenix。", conditional: "Mustang/Farseer/Marksが育っている時はground pressureを先に増やす。" },
      techSplit: [2, 2],
      win: ["Crawlerが初弾を吸う", "Houndがchaffをclear", "Phoenixが価値targetを連続処理", "fast groundとairがtowerへ到達"],
      mistakes: ["R1からPhoenixを買いgroundが薄くなる", "Hound Range前にPhoenix Techを重ねる", "AA増加後もPhoenixへ全供給を使う"],
      placement: ["Hound/Crawlerを攻めるsideへ前寄せ、Phoenixは同lane後方。", "Phoenixを一塊にせず左右へ少しずらしてAA被害を分散。"]
    },
    "Mountain + Fire Badger Defense": {
      flow: "Mountainの巨大HPで接敵時間を延ばし、Fire Badgerが周囲のsmallを焼いて後衛を守る。Mountainを倒すsingle-targetが出たら、target soakと後衛火力へ投資を移す。",
      roles: [["Mountain", "Titan wall / disruption"], ["Fire Badger", "Close clear"], ["Marksman", "Backline single-target"]],
      entry: { best: "Badger starter + Giant Specialist / early Mountain。", good: "敵がshort-range / low single-targetへ寄った時。", conditional: "Melter/Ignite/Acidが既にあるならMountain解禁を急がない。" },
      tech: { core: ["Badger: Range Enhancement", "Mountain: Range Enhancement"], second: ["Mountain: Mountain Plating", "Mountain: Photon Loop"], situational: ["Badger: Napalm / fire系", "Mountain: Anti-Aircraft Ammunition"] },
      win: ["chaffが初期targetを散らす", "Mountainが主力を受け止める", "Badgerが周辺smallを除去", "backlineが安全に射撃"],
      mistakes: ["Mountainを早買いしてsupportが空になる", "MountainをMelterと同laneへ裸で置く", "Badger不足でTitanがchaffへ止まる"],
      placement: ["Mountainはtower間midで複数laneを遮る。", "BadgerはMountain横、single-targetはtower後方、chaffはMelter射線へ。"]
    },
    "Multimelter + Fire Badger Defense": {
      flow: "Badgerがsmallを除去し、Energy Diffraction Melting Pointが複数の短射程frontlineを同時に溶かすanti-Aggro Defense。beamをsmallへ吸わせない順序とMelterを守るscreenが核。",
      roles: [["Melting Point", "Multi-beam anti-frontline"], ["Fire Badger", "Chaff clear"], ["Fang", "Melter guard / AA screen"]],
      entry: { best: "Badger starter対Ball/Wraith・Rhino等のfast ground。", good: "R4までに敵が複数heavyへ継続投資した時。", conditional: "Steel Ball/long-range single-target中心なら通常Melter massは避ける。" },
      techSplit: [2, 1],
      win: ["Badgerがsmall targetを除去", "Melter beamが複数frontへ分岐", "screenがbeam継続時間を確保", "Aggroの同時接続を止める"],
      mistakes: ["chaff clear前にEnergy Diffractionを買う", "Melterをfrontへ出してBallに接続される", "long-range pivot後もMelterを増やす"],
      placement: ["Badgerはtower横mid、Melterはtower後方で脅威laneへ。", "Crawler/FangをMelter前とflank reserveへ分ける。"]
    },
    "Sledge + Marksman Defense": {
      flow: "Sledgeが数秒を買い、MarksmanがBall/Hound等の価値targetを抜くearly Defense。Sledgeは不沈tankではなく交換可能な時間なので、専任clearと後衛成長を止めない。",
      roles: [["Sledgehammer", "Time-buying frontline"], ["Marksman", "Long-range finisher"], ["Arclight", "Dedicated clear"]],
      entry: { best: "Sledge starter + early Marksman。", good: "Ball/Hound/Wraithのone-side pressureを受ける時。", conditional: "Rhino/Raiden/Sabertoothが主軸ならAssault Modeを盲目的に取らない。" },
      techSplit: [2, 2],
      win: ["SledgeがAggroをtower前で固定", "clearがsmallを除去", "Marksmanがcarryを射抜く", "次のSledge layerで再度時間を買う"],
      mistakes: ["Sledgeにclearまで任せる", "Marksmanを止めてSledge Techだけ増やす", "Assault Modeを全matchupで固定する"],
      placement: ["Sledgeはtower内側やや前へ縦配置。", "Marksmanはtower後ろへ分散し、Crawler reserveでflankを遅らせる。"]
    },
    "Spider + Phoenix Aggro": {
      flow: "Tarantulaがgroundの圧とtank時間を作り、Phoenixが後方からmedium / heavyを抜く二段Aggro。Spiderがchaffへ止まらないようsmall clearを別に持つ。",
      roles: [["Tarantula", "Ground pressure / tank"], ["Phoenix", "Air single-target"], ["Crawler", "Shot soak / screen"]],
      entry: { best: "Tarantula starter対weak AA。", good: "Tarantulaがlevelを取り、enemy heavyが増えたR3–4にPhoenix。", conditional: "Marks/Phoenix/Voidが先行してSpiderを即処理できる時は別軸へ。" },
      techSplit: [2, 1],
      win: ["chaffがsingle-targetを吸う", "Spiderがground lineを固定", "Phoenixが価値targetを処理", "二軸が同時にtowerへ到達"],
      mistakes: ["Spiderだけに全弾を受けさせる", "Phoenixを早く増やしすぎる", "enemy AAとanti-Spiderの両方が揃っても継続する"],
      placement: ["Tarantulaは片側front、Phoenixは同lane後方。", "CrawlerはSpider前とPhoenix直下へ分散する。"]
    },
    "Typhon Aggro": {
      flow: "Typhoonの持続射撃と耐久を片側へ集中し、fast frontlineが作る射撃時間でラインを押し切る。Typhoonはrareなので、得られた個体を守りつつ明確なScorpion回答が出たらspamを止める。",
      roles: [["Typhoon", "Sustained clear / AA frontline"], ["Crawler", "Target soak"], ["Phoenix", "Single-target補完"]],
      entry: { best: "Typhoon Specialist / early reinforcement。", good: "敵がlight/airへ寄り、long-range single-targetが薄い時。", conditional: "Scorpion/Melter/Siegeが先に揃う盤面ではsupport運用に留める。" },
      tech: { core: ["Typhoon: Range Enhancement"], second: ["Typhoon: Reactive Armor", "Typhoon: Maintenance Array"], situational: ["Typhoon: Air Defense Mark", "Typhoon: Field Entrenchment", "Typhoon: Wreckage Detonation"] },
      win: ["chaffが初期targetを散らす", "Typhoonが片側で持続射撃", "frontlineが射撃時間を延長", "projectile volumeでtower laneを制圧"],
      mistakes: ["Typhoonを横密集させScorpionへ渡す", "screenなしでfrontへ置く", "rare個体を失う位置で毎round固定する"],
      placement: ["Typhoonは片側midへ間隔を空けて重ねる。", "chaffはfront、single-target supportはTyphoon後方へ置く。"]
    }
  };

  const carryVortex = {
    k: "meta",
    n: "Carry Vortex",
    g: "meta current community carry mass vortex crab grid integration",
    c: "Vortex mass + Crawler layers + Mustang support",
    o: "複数Vortexを近距離でlinkし、Grid Integrationの火力とRangeでground lineを押すcommunity-derived carry。",
    s: "Vortex + Crawler / Mustang starterが最も自然。early high-level Vortex reinforcementも入口になる。敵がground mediumへ寄り、Sabertooth/Phoenix/Marksman等のsingle-targetが薄い時にだけ育成する。",
    r: [["Starter check", "Vortex starterならCrawler layerの後ろで通常unitとして交換を確認する。固定R1個数は置かない。"], ["Mid", "複数体が生存しsingle-target回答が薄い時だけ、35m以内のlinkとRangeを整える。"], ["Carry decision", "数が十分残る盤面でGrid Integration。Mustangはair/light不足を補う量だけ。"], ["Late", "Electromagnetic Twinを検討。Fortress/Sabertooth/Phoenix等で効率が落ちたらsupport型または別carryへpivot。"]],
    t: ["Vortex: Range Enhancement", "Vortex: Grid Integration（現行cost 250）", "Vortex: Electromagnetic Twin", "Vortex: Mobile Power Station（少数support型）", "Vortex: Field Maintenance（frontline型）", "Mustang: Aerial Specialization"],
    a: ["Crawler：single-targetを吸い、Vortex lineの接続時間を作る", "Mustang：Air / light clear不足を補う。Vortexと同数まで増やさない", "Melting Point / Phoenix：Vortexが苦手な超高HPやairへの別火力"],
    x: "Sabertooth、Phoenix、Marksman、Fortress等の高single-target。GridのTech費が重く、十分な数とRangeが揃う前にcounterを置かれると失速する。",
    v: "Range後にVortexを連続購入し始めたらCarry化を疑う。link lineをAoE/EMPで崩し、single-targetを複数laneから当てる。Crawler layerを先に消すことも重要。",
    u: "https://mechabellum.wiki.gg/wiki/Vortex",
    flow: "Vortexを10–35m程度の間隔で並べ、互いのGrid linkを維持したまま前進させる。現行環境ではTech費が重いため、無条件にforceするbuildではなく、敵の回答が薄い時に数とlevelを火力へ変える。",
    roles: [["Vortex", "Linked ground carry / durable line"], ["Crawler", "Target soak / flank reserve"], ["Mustang", "AA / light clear"]],
    entry: { best: "Vortex + Crawler / Mustang starter。", good: "early high-level Vortex reinforcement対ground medium。", conditional: "single-target counterが見える、またはair比率が高い時はsupport型へ。" },
    tech: { core: ["Vortex: Range Enhancement", "Vortex: Grid Integration（250）"], second: ["Vortex: Electromagnetic Twin"], situational: ["Vortex: Mobile Power Station（少数support型）", "Vortex: Field Maintenance（frontline型）", "Mustang: Aerial Specialization"] },
    win: ["Crawlerがsingle-targetを吸う", "Vortex lineがGrid linkを維持", "Range内からground mediumを連続処理", "Mustangがair/lightを除去してmassが残る"],
    mistakes: ["Vortex数が少ないままGridを購入", "link距離を無視して左右へ散らす", "MustangとVortexを同時にmassして経済を割る", "Fortress/Phoenix回答後もVortexだけを買う"],
    placement: ["one-side concentrationでVortex lineを35m以内に保つ。", "Crawlerはfront waveと反対towerのanti-flank reserve、MustangはVortex後方。"],
    refs: [["Vortex — current wiki", "https://mechabellum.wiki.gg/wiki/Vortex"], ["Official live updates", OFFICIAL], ["Current community discussion", "https://www.reddit.com/r/Mechabellum/comments/1utjew4/success_with_vortex/"]]
  };

  const techOverrides = {
    "Steel Ball + Hound Aggro": { core: ["Ball: Mechanical Division", "Hound: Range Enhancement"], second: ["Ball: Range Enhancement", "Hound: Mechanical Rage"], situational: ["Ball: Energy Absorption", "Ball: Armor Enhancement（低DPS相手）", "Hound: Incendiary Bomb（補助）"] },
    "Vulcan + Marksman": { core: ["Marksman: Range Enhancement", "Vulcan: Range Enhancement"], second: ["Marksman: Aerial Specialization", "Marksman: Doubleshot"], situational: ["Marksman: Electromagnetic Shot（状況）", "Vulcan: Ignite / fire系（大型補助）"] },
    "Stormcaller + Fang": { core: ["Storm: Range Enhancement", "Fang: Range Enhancement（carry時）"], second: ["Storm: Launcher Overload", "Fang: Portable Shield（front維持時）"], situational: ["Storm: Heavy Missile（巨体 / interception）", "Storm: High-Explosive Ammo / Incendiary Bomb（群れ）", "Storm: EMP（Tech依存）"] },
    "Sabertooth + Hound + Mustang": { core: ["Sabertooth: Doubleshot", "Hound: Range Enhancement"], second: ["Sabertooth: Range Enhancement", "Sabertooth: Field Maintenance"], situational: ["Hound: Incendiary Bomb / Mechanical Rage", "Mustang: Aerial Specialization", "Mustang: Armor-Piercing Bullets（必要時）"] },
    "Phantom Ray + Fire Badger": { core: ["Ray: Sticky Oil Bomb", "Badger: Range / fire系"], second: ["Ray: Range Enhancement", "Ray: Armor Enhancement"], situational: ["Ray: Burst Mode（迎撃突破）", "Ray: Stealth Cloak（接近）"] },
    "Mustang + Scorpion": { core: ["Scorpion: Range Enhancement", "Scorpion: Doubleshot"], second: ["Mustang: Aerial Specialization", "Scorpion: Siege Mode（射程戦）"], situational: ["Scorpion: Acid Attack（巨体）", "Mustang: Armor-Piercing / Culling（盤面次第）"] },
    "Arclight + Hacker Defense": { core: ["Arclight: Range Enhancement（R4まで）", "Hacker: Range Enhancement（R4/5投入時）"], second: ["Hacker: Barrier（R5/6+）", "Hacker: Enhanced Control（Boom Rhino等）"], situational: ["Arclight: Elite Marksman（高Lv）", "Arclight: Armor（低ATK相手）"] },
    "Ball + Wraith Aggro": { core: ["Wraith: Range Enhancement", "Ball: Mechanical Division"], second: ["Wraith: Floating Artillery Array", "Ball: Range Enhancement"], situational: ["Ball: Energy Absorption", "Wraith: Degeneration Beam（late）", "Crawler: Subterranean Blitz"] },
    "Fire Badger + Void Eye Defense": { core: ["Void: Suppression Shots", "Badger: Range Enhancement"], second: ["Void: Range Enhancement", "Void: Aerial Mode"], situational: ["Void: Charged Shot", "Badger: Napalm"] },
    "Hound + Phoenix Aggro": { core: ["Hound: Range Enhancement", "Hound: Mechanical Rage"], second: ["Phoenix: Range Enhancement（育った時）", "Hound: Fire Extinguisher"], situational: ["Hound: Armor Enhancement（Mustang/Badger）", "Phoenix: Charged Shot（高HP）"] },
    "Multimelter + Fire Badger Defense": { core: ["Badger: Range Enhancement（R3–4）", "Melter: Range Enhancement（Diffraction前/同時）"], second: ["Melter: Energy Diffraction", "Badger: Napalm（R5–6）"], situational: ["Melter: Electromagnetic Barrage", "Melter: Energy Absorption"] },
    "Sledge + Marksman Defense": { core: ["Marksman: Assault Mode（Ball/Hound/Typhoon）", "Sledge: Field Maintenance"], second: ["Marksman: Aerial Specialization", "Marksman: Range（range war）"], situational: ["Marksman: Doubleshot（必要時）", "Sledge: Armor Enhancement"] },
    "Spider + Phoenix Aggro": { core: ["Tarantula: Range Enhancement（R3–4）", "Tarantula: High-Explosive Ammo（R5–7）"], second: ["Phoenix: Jump Drive"], situational: ["Phoenix: Range Enhancement", "Phoenix: Charged Shot（高HP）"] },
    "Fangs Aggro": { core: ["Fang: Range Enhancement（通常first）", "Fang: Armor-Piercing Bullets（strong second）"], second: ["Fang: Mechanical Rage（delayed/flank）"], situational: ["Fang: Portable Shield（late luxury）", "Fortress: Barrier（対Vulcan）", "Hacker: Barrier（対Tarantula）"] },
    "Typhon Aggro": { core: ["Typhoon: Barrier", "Typhoon: Tracking Missile"], second: ["Typhoon: Mechanical Rage"], situational: ["Typhoon: Aerial Specialization"] }
  };
  const roundOverrides = {
    "Stormcaller + Fang": [["R1–2", "Fang/Crawlerで遅い層を作る。Stormは1–2packから始め、fast pushへ供給を残す。"], ["R3–4", "相手の速度が遅いならStormを増やす。対Fangや密集へHE/Incendiary、巨体やinterceptorへ現行Heavy Missileを状況で。"], ["R5–7", "Range + Launcher Overloadで砲撃密度を上げる。Heavy Missile時はlight処理が落ちるためchaff/clearを厚くする。"], ["Late", "Aggroに距離を潰されるなら別unitで回答する。"]],
    "Arclight + Hacker Defense": [["R1–3", "標準chaff + Arclightを作り、R4までにArclight Range。"], ["R4/5", "3 Hackers + Range、またはLv2 Hacker 2packのsurprise。"], ["R5/6+", "4–6 Hackersへ拡張し、必要ならBarrier。Mustang/Stormはmatchupで追加。"]],
    "Arclight + Sandworm Standard": [["R1–4", "Arclight + Crawler + Stormの通常Standard。starterはArclight + Saber/Sledge/Ballが候補。"], ["R4–5", "敵がVulcan/Storm/Marksへcommitした時だけSandworm pivot。"], ["R5+", "Mechanical Division Wormを両side、または4 Worm one-lane + Beacon。"]],
    "Ball + Wraith Aggro": [["R1", "Ball starterでone side、layered Crawler、Hound/Arclight clear。Wraithなし。"], ["R4", "Range付きWraith 2packを目標。"], ["R5–7+", "FAA、Ball Mechanical Division、R6頃の3rd Wraith。WaspはAA screenが必要な時だけ。"]],
    "Fangs Aggro": [["R1", "推奨openingはFang 3pack + Steel Ballをone flank。Fortressなし。"], ["Early", "Rangeを通常first、APをstrong second。Mustang/Tarantula openerへ無理にforceしない。"], ["Mid", "敵counterに応じてArmor Ball/Ray、Barrier Fortress/Hacker等を追加。"], ["Late", "Fortress/Hound等を追加可能。Portable ShieldはFang carryのlate luxury。"]],
    "Fire Badger + Void Eye Defense": [["R1–4", "建物の少ないsideに防衛。Suppressionは早ければR2、Badger RangeはR3–4。"], ["Around R4", "目安Badger 2、Void約5、chaff約5、backup AA。"], ["R5–7", "Void RangeをR7までに。相手の配置に応じてflankまたはtower defense。"], ["R8+", "Lv2 Voidとmatchup-specific supportを追加。"]],
    "Flank Pull Sledge Aggro": [["R1–4", "まずstandard。flank pullへcommitするかを判断。"], ["After commit", "turretを売り、両flankへCrawler+Sledge。本隊はtower後方。"], ["R4 target", "Sledge 4–6、Crawler 4–7、必要ならDPS。"], ["Late", "pull価値が落ちるため後衛DPSへ投資。"]],
    "Hound + Phoenix Aggro": [["R1", "one sideへHound/Crawler。Steel Ball starter例ではBallをCrawler間へ。"], ["R2–4", "R2 Phoenix + Hound/Crawler。R4目安Hound約5、Phoenix 1–2。Ball追加なし。"], ["R5–7", "Hound tech優先。育ったPhoenixにtech、supportはmatchup次第。"]],
    "Mountain + Fire Badger Defense": [["R1–3", "Field RecoveryでRapid-Fire Cannonを売り、Badgerをtower前、Crawler/Marksを後方。"], ["R4/5", "売却/貯蓄できればR4、通常R5にMountain。"], ["R5+", "Mountainを壁にBadger/後衛を保護。Phoenix Jump/Oilは敵aggro時だけ。"]],
    "Multimelter + Fire Badger Defense": [["R1–4", "tower近く。chaffはFang。Badger RangeをR3–4。"], ["R4–5", "最初のMelter。RangeをDiffractionより先または同時。"], ["R5–7+", "Badger Napalm R5–6、複数Melter + Fang/shield。"]],
    "Sledge + Marksman Defense": [["R1–4", "Sledgeをtower内側やや前、Crawler/Marksを後方。攻められるsideへ集中。"], ["R5–7", "Marksman carryへ。Ball/Hound/TyphoonにはAssault Mode、Saberには使わない。"], ["Late", "Field Maintenance Sledgeで時間を買い、AA/Range/Doubleshotは相手に応じる。"]],
    "Spider + Phoenix Aggro": [["R1", "Tarantula + Crawlerをone flank。Sledge edge pullはstarter option。"], ["R3–4", "Tarantula Range必須。Phoenixを後方に追加。"], ["R5–7", "Tarantula HE。Phoenix Jump推奨、Phoenix Rangeは状況次第。"]],
    "Typhon Aggro": [["R1–3", "Crawler baseをone sideへ。Field Recoveryでそのsideのturretを売り、弱い200 starterは売却候補。"], ["R4", "Typhoon 4 squads + 1 tech + Crawler chainを目標。Phoenixはtempo option。"], ["R5+", "side switch、opposite flank reinforcement、Mobile Beaconで圧を移す。"]]
  };

  const contentOverrides = {
    "Fangs Aggro": { flow: "Fang 3pack + Steel Ballをone flankへ集中して始め、Range→APでFang carryを作る。Fortress等は敵counterを見てmid/lateに入れる。", placement: ["openingはFang 3pack + Steel Ballをone flankへ集中。", "Fortress/Hacker等はcounterへの回答時だけmid/lateに追加する。"] },
    "Arclight + Sandworm Standard": { placement: ["R1–4は両面Standardでtowerを使い、Sandwormを先取りしない。", "pivot後は両side Worm、または4 Worm one-lane + Beaconのどちらか。"] },
    "Flank Pull Sledge Aggro": { placement: ["commit前はstandard。commit後はCrawler+Sledgeを両flankへ分離する。", "本隊はtower後方、towerより上へ置かず、flank pathingの空間を残す。"] },
    "Multimelter + Fire Badger Defense": { placement: ["Badgerはtower近く、Melterは後方。", "chaffはNapalmへ走り込むCrawlerでなくFangを使用する。"] },
    "Typhon Aggro": { flow: "Crawler chainをone sideへ作り、R4までにTyphoon 4 squads + 1 techを揃える。R5以降はopposite flankとMobile Beaconでside switchする。", placement: ["R1–3はone-side Crawler chain。Typhoonを先取りしない。", "R5+はopposite flankへTyphoonを補強しBeaconで圧を移す。"] }
  };

  const audit = (primary, images, rounds, strength, opening, unresolved = "") => ({
    primary, imageCount: images, roundInfo: rounds, evidenceStrength: strength,
    opening, unresolved, currentDataVerified: true
  });
  const sourceAudit = {
    "Mass Raiden": audit(`${W}/units/air/raiden/`, 0, "partial", "medium", "generic starter only", "dedicated round guideなし"),
    "Steel Ball + Hound Aggro": audit(`${W}/units/ground/steel-ball/`, 0, "partial", "medium", "representative Ball/Hound start", "dedicated guideなし"),
    "Vulcan + Marksman": audit("https://note.com/mechabellum/n/n1ca51bb62d85", 0, "partial", "medium", "Marksman base then Vulcan", "high-MMR community guide"),
    "Stormcaller + Fang": audit(OFFICIAL, 0, "partial", "medium", "representative Fang/Storm start", "dedicated guideなし"),
    "AP Sledge Pressure": audit(`${W}/units/ground/sledgehammer/`, 0, "partial", "medium", "representative Sledge starter", "dedicated guideなし"),
    "Sabertooth + Hound + Mustang": audit(`${W}/units/ground/sabertooth/`, 0, "partial", "medium", "representative Saber/Hound start", "support timing partial"),
    "Phantom Ray + Fire Badger": audit(`${W}/units/air/phantom-ray/`, 0, "partial", "medium", "Ray/Badger starter; no R1 Oil", "dedicated guideなし"),
    "Mustang + Scorpion": audit("https://mechabellum.wiki.gg/wiki/Scorpion", 0, "weak", "low", "generic Mustang starter", "round evidence weak"),
    "Arclight + Hacker Defense": audit(`${W}/guides/arclight-hacker-defense/`, 2, "explicit", "high", "R1–3 Arclight/chaff"),
    "Arclight + Sandworm Standard": audit(`${W}/guides/arclight-sandworm-standard/`, 3, "explicit", "high", "R1–4 standard; no Worm"),
    "Ball + Wraith Aggro": audit(`${W}/guides/ball-wraith-aggro/`, 3, "explicit", "high", "R1 Ball/Crawler; no Wraith"),
    "Fangs Aggro": audit(`${W}/guides/fangs-aggro/`, 2, "explicit", "high", "3 Fangs + Steel Ball; no Fortress"),
    "Fire Badger + Void Eye Defense": audit(`${W}/guides/fire-badger-void-eye-defense/`, 4, "explicit", "high", "sample Badger/Void defense"),
    "Flank Pull Sledge Aggro": audit(`${W}/guides/flank-pull-sledge-aggro/`, 7, "explicit", "high", "standard first; no forced R1 flank"),
    "Hound + Phoenix Aggro": audit(`${W}/guides/hound-phoenix-aggro/`, 5, "explicit", "high", "Hound/Crawler/Ball one-side"),
    "Mountain + Fire Badger Defense": audit(`${W}/guides/mountain-firebadger-defense/`, 3, "explicit", "high", "Badger tower defense; no Mountain"),
    "Multimelter + Fire Badger Defense": audit(`${W}/guides/multimelter-fire-badger-defense/`, 3, "explicit", "high", "Fang + Badger; no Crawler/Melter"),
    "Sledge + Marksman Defense": audit(`${W}/guides/sledge-marksman-defense/`, 2, "explicit", "high", "tower-inner Sledge + backline"),
    "Spider + Phoenix Aggro": audit(`${W}/guides/spider-phoenix-aggro/`, 3, "explicit", "high", "Tarantula + Crawler; no Hound/Phoenix"),
    "Typhon Aggro": audit(`${W}/guides/typhon-aggro/`, 3, "explicit", "high", "Crawler base; no early Typhoon"),
    "Carry Vortex": audit("https://mechabellum.wiki.gg/wiki/Vortex", 0, "weak", "low", "starter check only", "community-derived; exact rounds unknown")
  };

  GUIDE_DATA.forEach((item) => {
    const extra = detail[item.n];
    if (!extra) throw new Error(`Missing detailed comp data: ${item.n}`);
    Object.assign(item, extra);
    if (contentOverrides[item.n]) Object.assign(item, contentOverrides[item.n]);
    if (techOverrides[item.n]) item.tech = techOverrides[item.n];
    if (roundOverrides[item.n]) item.r = roundOverrides[item.n];
    item.sourceEvidence = sourceAudit[item.n];
    item.refs = [["Primary guide / unit reference", item.u], ["Official live updates", OFFICIAL], ...(extra.refs || [])];
  });
  carryVortex.sourceEvidence = sourceAudit[carryVortex.n];
  GUIDE_DATA.push(carryVortex);
})();
