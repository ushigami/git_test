# Mechabellum Counter + Package Guide

Season 8 / Live 1.11.1.3向けの静的GitHub Pagesツールです。画像、数量入力、Tech入力、backend、外部APIは使いません。

- `index.html`: Counter / 1–3 unit Package Calculator
- `units.html`: 33 unit A–Z guide
- `comps.html`: 既存Current/Wiki comp guide

## Data

- `data/units.js`: roles、target、support needs、配置、主要相性、synergy、risk、source key
- `data/matchups.js`: enemyごとのDirect S/A/B/C/D matchup
- `data/tech-exceptions.js`: target・role・package関係を変えるTech
- `data/strategy.js`: UI labelと既存盤面patternの移植

Live rosterとpatchは、Mechabellum公式Steam announcements、Mechabellum Wiki、Mechabellum Companionで照合しています。2026-08-28開始の2.0/CenturionはPublic Test Server限定のため、Live datasetには含めません。

## Test

```sh
node tests/validate-data.js
node tests/calculator.test.js
node smoke-test.js
```

Pages workflowは上記3検査に成功した場合だけdeployへ進みます。
