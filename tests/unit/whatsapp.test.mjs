import test from "node:test";
import assert from "node:assert/strict";
import { buildWhatsAppUrl } from "../../src/services/whatsapp.js";

const PHONE = "5561992890048";

test("URL do WhatsApp usa HTTPS, wa.me e o telefone informado", () => {
  for (const phone of [PHONE, "5511999999999"]) {
    const url = new URL(buildWhatsAppUrl(phone, "Pedido de teste"));

    assert.equal(url.protocol, "https:");
    assert.equal(url.host, "wa.me");
    assert.equal(url.pathname, `/${phone}`);
    assert.equal(url.searchParams.get("text"), "Pedido de teste");
  }
});

test("caracteres da mensagem não criam parâmetros ou fragmentos", () => {
  const message = "Rua A & phone=000&text=outro?x=1#apartamento + 50%";
  const url = new URL(buildWhatsAppUrl(PHONE, message));

  assert.deepEqual([...url.searchParams.keys()], ["text"]);
  assert.equal(url.searchParams.get("text"), message);
  assert.equal(url.hash, "");
  assert.equal(url.pathname, `/${PHONE}`);
});

const cases = [
  ["acentos e emoji", "Olá! Quero um Galáxia Suprema 🍔."],
  [
    "quebras de linha",
    "Space Classic | Quantidade: 2\nCoca lata | Quantidade: 1\r\nEndereço: Rua A, 123",
  ],
  ["espaços e sinal de mais", "Rua A + B, 123, bloco  C"],
  [
    "percentuais e sequências literais",
    "Desconto 10%; texto literal: %20 e %26",
  ],
  ["mensagem vazia", ""],
];

for (const [description, message] of cases) {
  test(`URL preserva ${description} após decodificação`, () => {
    const url = new URL(buildWhatsAppUrl(PHONE, message));

    assert.equal(url.searchParams.get("text"), message);
    assert.equal(url.searchParams.getAll("text").length, 1);
  });
}
