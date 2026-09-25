import { getProductById } from "../data/products.js";
import { assertCents } from "./money.js";

export const MAX_QUANTITY_PER_PRODUCT = 99;

export class CartLimitError extends RangeError {
  constructor() {
    super(
      `Você pode adicionar até ${MAX_QUANTITY_PER_PRODUCT} unidades de cada produto.`,
    );

    this.name = "CartLimitError";
  }
}

function requireProduct(productId) {
  const product = getProductById(productId);

  if (!product) {
    throw new RangeError("Produto não encontrado no catálogo.");
  }

  return product;
}

// function assertQuantity(quantity) {
//   if (
//     !Number.isSafeInteger(quantity) ||
//     quantity < 1 ||
//     quantity > MAX_QUANTITY_PER_PRODUCT
//   ) {
//     throw new RangeError(
//       `A quantidade deve ser um inteiro entre 1 e ${MAX_QUANTITY_PER_PRODUCT}.`,
//     );
//   }
// }
function assertQuantity(quantity) {
  if (!Number.isSafeInteger(quantity) || quantity < 1) {
    throw new RangeError("A quantidade deve ser um inteiro positivo.");
  }

  if (quantity > MAX_QUANTITY_PER_PRODUCT) {
    throw new CartLimitError();
  }
}

export function getCartSummary(cart) {
  if (!Array.isArray(cart)) {
    throw new TypeError("O carrinho deve ser uma lista de itens.");
  }

  const productIds = new Set();
  const items = [];
  let totalCents = 0;
  let totalQuantity = 0;

  for (const item of cart) {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      throw new TypeError("O carrinho contém um item inválido.");
    }

    const product = requireProduct(item.productId);

    if (productIds.has(product.id)) {
      throw new RangeError("O carrinho contém um produto duplicado.");
    }

    productIds.add(product.id);

    assertQuantity(item.quantity);
    assertCents(product.priceCents, "Preço do produto");

    const subtotalCents = product.priceCents * item.quantity;

    assertCents(subtotalCents, "Subtotal do produto");

    totalCents += subtotalCents;

    assertCents(totalCents, "Total do carrinho");

    totalQuantity += item.quantity;

    items.push({
      product,
      quantity: item.quantity,
      subtotalCents,
    });
  }

  return { items, totalCents, totalQuantity };
}

export function addItem(cart, productId, quantity = 1) {
  getCartSummary(cart);
  requireProduct(productId);
  assertQuantity(quantity);

  const nextCart = cart.map((item) => ({ ...item }));

  const existingItem = nextCart.find((item) => item.productId === productId);

  if (existingItem) {
    const nextQuantity = existingItem.quantity + quantity;

    assertQuantity(nextQuantity);

    existingItem.quantity = nextQuantity;
  } else {
    nextCart.push({ productId, quantity });
  }

  getCartSummary(nextCart);

  return nextCart;
}

export function removeItem(cart, productId) {
  getCartSummary(cart);

  const nextCart = cart.map((item) => ({ ...item }));

  const index = nextCart.findIndex((item) => item.productId === productId);

  if (index === -1) return nextCart;

  if (nextCart[index].quantity > 1) {
    nextCart[index].quantity -= 1;
  } else {
    nextCart.splice(index, 1);
  }

  return nextCart;
}
