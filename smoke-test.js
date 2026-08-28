const fs=require('fs');const vm=require('vm');
for(const f of ['data0.js','data1.js','data2.js','data3.js','counters-v2.js']){const src=fs.readFileSync(f,'utf8');new vm.Script(src,{filename:f}).runInThisContext();}
if(!Array.isArray(GUIDE_DATA)||GUIDE_DATA.length<15)throw new Error('GUIDE_DATA missing/too small');
if(!Array.isArray(BOARD_COUNTERS)||BOARD_COUNTERS.length<20)throw new Error('BOARD_COUNTERS missing/too small');
if(!Array.isArray(COUNTERS)||COUNTERS.length<30)throw new Error('COUNTERS missing/too small');
const html=fs.readFileSync('index.html','utf8');
if(!html.includes('counters-v2.js?v=20260829b'))throw new Error('index does not reference cache-safe counter bundle');
if(!html.includes('BOARD_COUNTERS.map'))throw new Error('counter renderer missing');
const renderedBoard=BOARD_COUNTERS.map(x=>`<div>${x[0]} → ${x[1]}</div>`).join('');
const renderedUnits=COUNTERS.map(x=>`<div>${x[0]} → ${x[1]}</div>`).join('');
if(!renderedBoard.includes('中型密集')||!renderedBoard.includes('Raiden'))throw new Error('board render smoke failed');
if(!renderedUnits.includes('Rhino')||!renderedUnits.includes('Vortex'))throw new Error('unit render smoke failed');
console.log(`PASS guides=${GUIDE_DATA.length} boardCounters=${BOARD_COUNTERS.length} unitCounters=${COUNTERS.length}`);
