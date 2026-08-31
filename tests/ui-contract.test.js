const assert = require("assert");
const fs = require("fs");

const css = fs.readFileSync("style.css", "utf8");
const app = fs.readFileSync("app.js", "utf8");
const index = fs.readFileSync("index.html", "utf8");

const palette = {
  bg: "#0d1117", p: "#151b24", p2: "#1b2330", tx: "#eef3f8", mu: "#9aa6b6",
  ln: "#2c3646", ac: "#7dd3fc", hot: "#fbbf24", bad: "#fb7185", ok: "#86efac"
};
for (const [name, value] of Object.entries(palette)) {
  assert(css.includes(`--${name}: ${value}`), `old palette token --${name} must be restored`);
}
assert(!css.includes("#5ee7ff"), "strong cyan must be removed");
assert(!/radial-gradient/i.test(css), "body radial gradient must be removed");
assert(/body\s*\{[\s\S]*?background:\s*var\(--bg\)/.test(css), "body must use the single old background color");

for (const token of [
  'class="nav"', "COUNTER</a><a href=\"units.html\">UNITS", 'id="clear-all"', 'id="enemy-grid"',
  'id="own-panel"', 'id="own-grid"', 'id="results"'
]) assert(index.includes(token), `existing page structure missing ${token}`);
for (const token of [
  'class="result-top"', 'class="rank"', 'class="package"', 'class="recommendation"',
  'class="assignments"', 'class="assignment"', 'list("ROLE"', 'list("CHAFF"',
  'list("TANK / FRONTLINE"', 'list("CLEAR / SUPPORT"', "CLOSE DETAILS", "NO NEW UNIT",
  "result.displayPackage || result.package", "item.displayAnswer || item.answer"
]) assert(app.includes(token), `result UI contract missing ${token}`);
assert(!app.includes('list("WHY"'), "duplicate WHY block must be removed from DETAILS");
assert(app.includes('details.open = false'), "CLOSE DETAILS must close only its containing details element");

for (const signature of [
  ".nav {", "grid-template-columns: repeat(3, 1fr)",
  ".unit-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr))",
  ".assignment { display: grid; grid-template-columns: minmax(0, 1fr) 14px minmax(0, 1fr) 25px",
  ".results { display: grid; gap: 9px; }"
]) assert(css.includes(signature), `unchanged layout signature missing: ${signature}`);

console.log("PASS ui-contract palette=old details=organized closedCard=unchanged layout=unchanged");
