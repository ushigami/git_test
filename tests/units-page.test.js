const assert = require("assert");
const path = require("path");
const { loadData } = require("./load-data");

function render(mutate) {
  const { data } = loadData();
  if (mutate) mutate(data);
  let html = "";
  const status = { hidden: false, className: "data-status", textContent: "" };
  global.window = global;
  global.document = {
    getElementById(id) {
      if (id === "unit-list") return { set innerHTML(value) { html = value; }, get innerHTML() { return html; } };
      return status;
    }
  };
  const target = path.resolve(__dirname, "..", "units-page.js");
  delete require.cache[target];
  require(target);
  delete global.window;
  delete global.document;
  return { html, status };
}

const rendered = render();
assert(rendered.html.includes("RECOMMENDED TECH SET"), "recommended tech heading must render");
assert(rendered.html.includes("Grid Integration"), "Vortex setup must render");
assert(rendered.html.includes("IMPORTANT TECH EXCEPTIONS"), "existing tech exceptions must remain");
assert.strictEqual((rendered.html.match(/class="unit-guide"/g) || []).length, 33, "all 33 unit details must render");

const fallback = render((data) => { data.units[0].recommendedTechSets = []; });
assert(fallback.html.includes("Tech setup data unavailable"), "missing per-unit setup needs a safe fallback");

const css = require("fs").readFileSync("style.css", "utf8");
assert(css.includes(".tech-pills { display: flex; flex-wrap: wrap;"), "recommended techs must wrap at iPhone width");
console.log("PASS units-page units=33 recommended=fallback mobile=wrap");
