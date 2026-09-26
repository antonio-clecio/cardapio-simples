import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { checkRestaurantOpen } from "../../src/domain/business-hours.js";

const cases = [
  ["00:00:00.000", false],
  ["12:00:00.000", false],
  ["17:59:00.000", false],
  ["17:59:59.999", false],
  ["18:00:00.000", true],
  ["21:59:59.999", true],
  ["22:00:00.000", false],
  ["23:59:59.999", false],
];

const dates = cases.map(([time]) => `2026-09-25T${time}-03:00`);
const expectedResults = cases.map(([, expected]) => expected);

for (const [index, [time, expected]] of cases.entries()) {
  test(`horário de São Paulo ${time}: ${expected ? "aberto" : "fechado"}`, () => {
    assert.equal(checkRestaurantOpen(new Date(dates[index])), expected);
  });
}

test("a regra de funcionamento vale de segunda a domingo", () => {
  for (let day = 21; day <= 27; day += 1) {
    const date = `2026-09-${day}`;

    assert.equal(
      checkRestaurantOpen(new Date(`${date}T17:59:59-03:00`)),
      false,
    );

    assert.equal(checkRestaurantOpen(new Date(`${date}T18:00:00-03:00`)), true);

    assert.equal(
      checkRestaurantOpen(new Date(`${date}T22:00:00-03:00`)),
      false,
    );
  }
});

test("o mesmo instante tem o mesmo resultado com offsets diferentes", () => {
  const opening = [
    "2026-09-25T18:00:00-03:00",
    "2026-09-25T21:00:00Z",
    "2026-09-26T06:00:00+09:00",
  ];

  const closing = [
    "2026-09-25T22:00:00-03:00",
    "2026-09-26T01:00:00Z",
    "2026-09-26T10:00:00+09:00",
  ];

  for (const value of opening) {
    assert.equal(checkRestaurantOpen(new Date(value)), true);
  }

  for (const value of closing) {
    assert.equal(checkRestaurantOpen(new Date(value)), false);
  }
});

test("a regra rejeita datas inválidas e valores que não são Date", () => {
  const invalidValues = [
    new Date(NaN),
    "2026-09-25T18:00:00-03:00",
    0,
    null,
    true,
    {},
    [],
  ];

  for (const value of invalidValues) {
    assert.throws(() => checkRestaurantOpen(value), TypeError);
  }
});

const moduleUrl = new URL("../../src/domain/business-hours.js", import.meta.url)
  .href;

const childCode = `
  import { checkRestaurantOpen } from ${JSON.stringify(moduleUrl)};
  const dates = ${JSON.stringify(dates)};
  const results = dates.map((value) => checkRestaurantOpen(new Date(value)));
  console.log(JSON.stringify(results));
`;

for (const timeZone of [
  "Etc/UTC",
  "America/Sao_Paulo",
  "America/Los_Angeles",
  "Pacific/Honolulu",
  "Asia/Tokyo",
]) {
  test(`a regra mantém os resultados com o processo em ${timeZone}`, () => {
    const result = spawnSync(
      process.execPath,
      ["--input-type=module", "--eval", childCode],
      {
        env: { ...process.env, TZ: timeZone },
        encoding: "utf8",
        timeout: 10_000,
        shell: false,
      },
    );

    assert.ifError(result.error);
    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(JSON.parse(result.stdout.trim()), expectedResults);
  });
}
