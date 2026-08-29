const path = require("path");

function loadData() {
  delete global.MECH_DATA;
  delete global.MECH_CALCULATOR;
  ["units.js", "tech-exceptions.js", "matchups.js", "strategy.js"].forEach((file) => {
    const target = path.resolve(__dirname, "..", "data", file);
    delete require.cache[target];
    require(target);
  });
  const calculatorPath = path.resolve(__dirname, "..", "calculator.js");
  delete require.cache[calculatorPath];
  const calculator = require(calculatorPath);
  return { data: global.MECH_DATA, calculator };
}

module.exports = { loadData };
