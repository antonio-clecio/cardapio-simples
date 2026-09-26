import test from "node:test";
import assert from "node:assert/strict";
import {
  addItem,
  removeItem,
  getCartSummary,
  CartLimitError,
  MAX_QUANTITY_PER_PRODUCT,
} from "../../src/domain/cart.js";

const BURGER = "space-classic";
const DRINK = "coca-lata";

function freezeCart(items) {
  return Object.freeze(items.map((item) => Object.freeze({ ...item })));
}

test("carrinho vazio tem totais zerados", () => {
  assert.deepEqual(getCartSummary([]), {
    items: [],
    totalCents: 0,
    totalQuantity: 0,
  });
});

test("adicionar produto cria um novo carrinho sem alterar o anterior", () => {
  const previous = freezeCart([]);
  const next = addItem(previous, BURGER);

  assert.deepEqual(next, [{ productId: BURGER, quantity: 1 }]);
  assert.deepEqual(previous, []);
  assert.notStrictEqual(next, previous);
});

test("adicionar produto repetido soma a quantidade sem duplicar a linha", () => {
  const previous = freezeCart([{ productId: BURGER, quantity: 1 }]);
  const next = addItem(previous, BURGER, 2);

  assert.deepEqual(next, [{ productId: BURGER, quantity: 3 }]);
  assert.equal(previous[0].quantity, 1);
  assert.notStrictEqual(next[0], previous[0]);
});

test("produtos diferentes permanecem em linhas separadas", () => {
  const previous = freezeCart([{ productId: BURGER, quantity: 1 }]);
  const next = addItem(previous, DRINK);

  assert.deepEqual(next, [
    { productId: BURGER, quantity: 1 },
    { productId: DRINK, quantity: 1 },
  ]);
  assert.equal(previous.length, 1);
});

test("remover reduz uma unidade sem alterar o carrinho anterior", () => {
  const previous = freezeCart([{ productId: BURGER, quantity: 2 }]);
  const next = removeItem(previous, BURGER);

  assert.deepEqual(next, [{ productId: BURGER, quantity: 1 }]);
  assert.equal(previous[0].quantity, 2);
});

test("remover a última unidade exclui somente o produto escolhido", () => {
  const previous = freezeCart([
    { productId: BURGER, quantity: 1 },
    { productId: DRINK, quantity: 2 },
  ]);
  const next = removeItem(previous, BURGER);

  assert.deepEqual(next, [{ productId: DRINK, quantity: 2 }]);
  assert.equal(previous.length, 2);

  assert.deepEqual(
    removeItem([{ productId: BURGER, quantity: 1 }], BURGER),
    [],
  );
});

test("remover produto ausente preserva o conteúdo do carrinho", () => {
  const previous = freezeCart([{ productId: BURGER, quantity: 1 }]);

  assert.deepEqual(removeItem(previous, DRINK), previous);
  assert.deepEqual(removeItem([], BURGER), []);
});

test("resumo calcula subtotais e total exatos com o catálogo atual", () => {
  const cart = freezeCart([
    { productId: BURGER, quantity: 2 },
    { productId: DRINK, quantity: 1 },
  ]);
  const summary = getCartSummary(cart);

  assert.deepEqual(
    summary.items.map(({ product, quantity, subtotalCents }) => ({
      id: product.id,
      quantity,
      subtotalCents,
    })),
    [
      { id: BURGER, quantity: 2, subtotalCents: 4980 },
      { id: DRINK, quantity: 1, subtotalCents: 600 },
    ],
  );

  assert.equal(summary.totalCents, 5580);
  assert.equal(summary.totalQuantity, 3);
});

test("resumo usa o preço do catálogo e ignora preço extra no item", () => {
  const summary = getCartSummary([
    { productId: BURGER, quantity: 1, priceCents: 1 },
  ]);

  assert.equal(summary.items[0].product.priceCents, 2490);
  assert.equal(summary.totalCents, 2490);
});

test("limite de 99 unidades é aplicado por produto", () => {
  assert.equal(MAX_QUANTITY_PER_PRODUCT, 99);

  let cart = addItem([], BURGER, 96);
  cart = addItem(cart, BURGER, 3);
  cart = addItem(cart, DRINK, 99);

  assert.deepEqual(cart, [
    { productId: BURGER, quantity: 99 },
    { productId: DRINK, quantity: 99 },
  ]);

  assert.equal(getCartSummary(cart).totalQuantity, 198);
});

test("exceder o limite lança CartLimitError e preserva o estado", () => {
  const previous = freezeCart([{ productId: BURGER, quantity: 99 }]);

  assert.throws(() => addItem([], BURGER, 100), CartLimitError);
  assert.throws(() => addItem(previous, BURGER), CartLimitError);

  assert.deepEqual(previous, [{ productId: BURGER, quantity: 99 }]);
});

test("adicionar rejeita quantidades inválidas", () => {
  const invalidQuantities = [
    0,
    -1,
    1.5,
    NaN,
    Infinity,
    -Infinity,
    Number.MAX_SAFE_INTEGER + 1,
    "2",
    null,
    false,
    2n,
  ];
  const previous = freezeCart([{ productId: BURGER, quantity: 1 }]);

  for (const quantity of invalidQuantities) {
    assert.throws(() => addItem(previous, DRINK, quantity), RangeError);
  }

  assert.deepEqual(previous, [{ productId: BURGER, quantity: 1 }]);
});

test("adicionar e resumir rejeitam IDs desconhecidos ou inválidos", () => {
  for (const id of ["produto-inexistente", "", null, undefined, 123, {}]) {
    assert.throws(() => addItem([], id), RangeError);

    assert.throws(
      () => getCartSummary([{ productId: id, quantity: 1 }]),
      RangeError,
    );
  }
});

test("operações rejeitam estruturas de carrinho inválidas", () => {
  const invalidCarts = [
    null,
    undefined,
    {},
    "carrinho",
    123,
    [null],
    [undefined],
    [1],
    ["item"],
    [[]],
  ];

  for (const cart of invalidCarts) {
    assert.throws(() => getCartSummary(cart), TypeError);
    assert.throws(() => addItem(cart, BURGER), TypeError);
    assert.throws(() => removeItem(cart, BURGER), TypeError);
  }
});

test("operações rejeitam quantidades inválidas já presentes no carrinho", () => {
  for (const quantity of [0, -1, 1.5, 100, NaN, Infinity, "1", undefined]) {
    const cart = [{ productId: BURGER, quantity }];

    assert.throws(() => getCartSummary(cart), RangeError);
    assert.throws(() => addItem(cart, DRINK), RangeError);
    assert.throws(() => removeItem(cart, BURGER), RangeError);
  }
});

test("operações rejeitam produtos duplicados no estado recebido", () => {
  const cart = freezeCart([
    { productId: BURGER, quantity: 1 },
    { productId: BURGER, quantity: 2 },
  ]);

  assert.throws(() => getCartSummary(cart), RangeError);
  assert.throws(() => addItem(cart, DRINK), RangeError);
  assert.throws(() => removeItem(cart, BURGER), RangeError);
});
