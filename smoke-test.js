const fs = require("fs");
const vm = require("vm");

for (const file of ["data0.js", "data1.js", "data2.js", "data3.js"]) {
  new vm.Script(fs.readFileSync(file, "utf8"), { filename: file }).runInThisContext();
}
if (!Array.isArray(GUIDE_DATA) || GUIDE_DATA.length < 15) throw new Error("existing GUIDE_DATA missing/too small");

const expected = {
  "index.html": ["COUNTER", "enemy-grid", "own-panel", "clear-all", "results", "data/units.js?v=20260830d", "calculator.js?v=20260830e"],
  "units.html": ["UNITS", "unit-list", "data/recommended-techs.js?v=20260830a", "units-page.js?v=20260830c"],
  "comps.html": ["COMPS", "comp-list", "data0.js?v=20260830b", "comps-page.js?v=20260830b"]
};
for (const [file, tokens] of Object.entries(expected)) {
  const html = fs.readFileSync(file, "utf8");
  tokens.forEach((token) => { if (!html.includes(token)) throw new Error(`${file} missing ${token}`); });
  if (!html.includes('name="viewport"')) throw new Error(`${file} missing viewport`);
  if (/<img\b/i.test(html)) throw new Error(`${file} must not use images`);
}
const index = fs.readFileSync("index.html", "utf8");
if (/type=["']number["']/i.test(index)) throw new Error("quantity input must not exist");
const app = fs.readFileSync("app.js", "utf8");
if (!app.includes("state = { enemy: new Set(), own: new Set() }")) throw new Error("selection state changed unexpectedly");
if (!app.includes("function clearAll()")) throw new Error("one-tap Clear All handler missing");
const workflow = fs.readFileSync(".github/workflows/pages.yml", "utf8");
for (const command of ["node tests/validate-data.js", "node tests/calculator.test.js", "node tests/ui-contract.test.js", "node tests/units-page.test.js", "node smoke-test.js"]) {
  if (!workflow.includes(command)) throw new Error(`workflow missing ${command}`);
}
console.log(`PASS pages=3 comps=${GUIDE_DATA.length} noImages=true noQuantity=true calculatorCacheBust=20260830e`);
