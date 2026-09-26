import test from "node:test";
import assert from "node:assert/strict";
import { assertCents, formatBRL } from "../../src/domain/money.js";

function normalizeSpaces(value) {
  return value.replace(/[\u00a0\u202f]/gu, " ");
}

const invalidValues = [
  -1,
  1.5,
  NaN,
  Infinity,
  -Infinity,
  Number.MAX_SAFE_INTEGER + 1,
  "2490",
  null,
  undefined,
  true,
  {},
  [],
  2490n,
];

test("assertCents aceita inteiros seguros e não negativos", () => {
  for (const value of [0, 1, 2490, Number.MAX_SAFE_INTEGER]) {
    assert.doesNotThrow(() => assertCents(value));
  }
});

test("assertCents rejeita valores inválidos sem convertê-los", () => {
  for (const value of invalidValues) {
    assert.throws(
      () => assertCents(value),
      RangeError,
      `Deveria rejeitar ${typeof value}: ${String(value)}`,
    );
  }
});

test("formatBRL formata zero", () => {
  assert.equal(normalizeSpaces(formatBRL(0)), "R$ 0,00");
});

test("formatBRL preserva os centavos e usa duas casas decimais", () => {
  const cases = [
    [1, "R$ 0,01"],
    [9, "R$ 0,09"],
    [10, "R$ 0,10"],
    [99, "R$ 0,99"],
    [100, "R$ 1,00"],
    [101, "R$ 1,01"],
    [2490, "R$ 24,90"],
  ];

  for (const [cents, expected] of cases) {
    assert.equal(normalizeSpaces(formatBRL(cents)), expected);
  }
});

test("formatBRL usa os separadores brasileiros de milhar e decimal", () => {
  assert.equal(normalizeSpaces(formatBRL(123456789)), "R$ 1.234.567,89");
});

test("formatBRL preserva os centavos no maior inteiro seguro", () => {
  assert.equal(
    normalizeSpaces(formatBRL(Number.MAX_SAFE_INTEGER)),
    "R$ 90.071.992.547.409,91",
  );
});

test("formatBRL rejeita entradas inválidas", () => {
  for (const value of invalidValues) {
    assert.throws(
      () => formatBRL(value),
      RangeError,
      `Deveria rejeitar ${typeof value}: ${String(value)}`,
    );
  }
});
