// import { getProductById } from "./data/products.js";
// import { assertCents, formatBRL } from "./domain/money.js";
import { formatBRL } from "./domain/money.js";

import {
  addItem,
  removeItem,
  getCartSummary,
  CartLimitError,
} from "./domain/cart.js";

const menu = document.getElementById("menu");
const cartBtn = document.getElementById("cart-btn");
const cartModal = document.getElementById("cart-modal");
const cartItemsContainer = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
// const checkoutBtn = document.getElementById("checkout-btn");
const closeModalBtn = document.getElementById("close-modal-btn");
const cartCounter = document.getElementById("cart-count");
const addressInput = document.getElementById("address");
const addressWarn = document.getElementById("address-warn");
const checkoutForm = document.getElementById("checkout-form");
const checkoutWarn = document.getElementById("checkout-warn");
const cartFeedback = document.getElementById("cart-feedback");

let cart = [];

function clearCartFeedback() {
  cartFeedback.textContent = "";
  checkoutWarn.textContent = "";
  checkoutWarn.hidden = true;
}

function showCartError(error) {
  const message =
    error instanceof CartLimitError
      ? error.message
      : "Não foi possível atualizar o carrinho. Tente novamente.";

  const feedback = cartModal.open ? checkoutWarn : cartFeedback;

  feedback.textContent = message;
  feedback.hidden = false;
  feedback.focus();

  if (!(error instanceof CartLimitError)) {
    console.error(error);
  }
}

function applyCartChange(operation, productId) {
  try {
    const nextCart = operation(cart, productId);
    const summary = getCartSummary(nextCart);

    updateCartModal(summary);

    cart = nextCart;
    clearCartFeedback();

    return true;
  } catch (error) {
    showCartError(error);
    return false;
  }
}

// // Abrir o modal do carrinho
// cartBtn.addEventListener("click", function () {
//   updateCartModal();
//   cartModal.style.display = "flex";
// });

// // Fechar o modal quando clicar fora
// cartModal.addEventListener("click", function (event) {
//   if (event.target === cartModal) {
//     cartModal.style.display = "none";
//   }
// });

// closeModalBtn.addEventListener("click", function () {
//   cartModal.style.display = "none";
// });
// Abre o diálogo e posiciona o foco no início do conteúdo.
// cartBtn.addEventListener("click", function () {
//   updateCartModal();

//   cartModal.showModal();

//   const cartTitle = document.getElementById("cart-title");
//   cartTitle.focus();
// });
// cartBtn.addEventListener("click", function () {
//   updateCartModal();

//   checkoutWarn.hidden = true;

//   cartModal.showModal();

//   const cartTitle = document.getElementById("cart-title");
//   cartTitle.focus();
// });
cartBtn.addEventListener("click", function () {
  try {
    updateCartModal();
    clearCartFeedback();

    cartModal.showModal();

    document.getElementById("cart-title").focus();
  } catch (error) {
    showCartError(error);
  }
});

// Fecha pelo botão.
closeModalBtn.addEventListener("click", function () {
  cartModal.close();
});

// Fecha ao clicar fora dos limites do diálogo.
cartModal.addEventListener("click", function (event) {
  if (event.target !== cartModal) {
    return;
  }

  const rect = cartModal.getBoundingClientRect();

  const clickedOutside =
    event.clientX < rect.left ||
    event.clientX > rect.right ||
    event.clientY < rect.top ||
    event.clientY > rect.bottom;

  if (clickedOutside) {
    cartModal.close();
  }
});

// Devolve o foco ao botão que abre o carrinho.
cartModal.addEventListener("close", function () {
  cartBtn.focus();
});

// menu.addEventListener("click", function (event) {
//   let parentButton = event.target.closest(".add-to-cart-btn");

//   if (parentButton) {
//     const name = parentButton.getAttribute("data-name");
//     const price = parseFloat(parentButton.getAttribute("data-price"));
//     addToCart(name, price);
//   }
// });

// // Função para adicionar no carrinho
// function addToCart(name, price) {
//   const existingItem = cart.find((item) => item.name === name);
//   if (existingItem) {
//     existingItem.quantity += 1;
//   } else {
//     cart.push({
//       name,
//       price,
//       quantity: 1,
//     });
//   }
//   updateCartModal();
// }

// //Atualiza o carrinho
// function updateCartModal() {
//   cartItemsContainer.innerHTML = "";
//   let total = 0;

//   cart.forEach((item) => {
//     const cartItemElement = document.createElement("div");
//     cartItemElement.classList.add(
//       "flex",
//       "justify-between",
//       "mb-4",
//       "flex-col",
//     );

//     cartItemElement.innerHTML = `
//       <div class="flex items-center justify-between">
//         <div>
//           <p class="font-medium">${item.name}</p>
//           <p>Qtd: ${item.quantity}</p>
//           <p class="font-medium mt-2">R$ ${item.price.toFixed(2)}</p>
//         </div>
//           <button class="remove-from-cart-btn" data-name="${item.name}">
//             Remover
//           </button>
//       </div>
//     `;

//     total += item.price * item.quantity;

//     cartItemsContainer.appendChild(cartItemElement);
//   });

//   cartTotal.textContent = total.toLocaleString("pt-BR", {
//     style: "currency",
//     currency: "BRL",
//   });

//   cartCounter.innerHTML = cart.length;
// }

// //Função para remover o item do carrinho
// cartItemsContainer.addEventListener("click", function (event) {
//   if (event.target.classList.contains("remove-from-cart-btn")) {
//     const name = event.target.getAttribute("data-name");

//     removeItemCart(name);
//   }
// });

// atualização abaixo, excluir depois
// function removeItemCart(name) {
//   const index = cart.findIndex((item) => item.name === name);

//   if (index !== 1) {
//     const item = cart[index];

//     if (item.quantity > 1) {
//       item.quantity -= 1;
//       updateCartModal();
//       return;
//     }
//     cart.splice(index, 1);
//     updateCartModal();
//   }
// }
// function removeItemCart(name) {
//   const index = cart.findIndex((item) => item.name === name);

//   // Encerra sem alterar o carrinho se o produto não existir.
//   if (index === -1) {
//     return;
//   }

//   const item = cart[index];

//   if (item.quantity > 1) {
//     item.quantity -= 1;
//   } else {
//     cart.splice(index, 1);
//   }

//   updateCartModal();
// }

// addressInput.addEventListener("input", function (event) {
//   let inputValue = event.target.inputValue;

//   if (inputValue !== "") {
//     addressInput.classList.remove("border-red-500");
//     addressWarn.classList.add("hidden");
//   }
// });
// const currencyFormatter = new Intl.NumberFormat("pt-BR", {
//   style: "currency",
//   currency: "BRL",
// });

menu.addEventListener("click", function (event) {
  if (!(event.target instanceof Element)) return;

  const button = event.target.closest(".add-to-cart-btn");

  if (!button || !menu.contains(button)) return;

  addToCart(button.dataset.productId);
});

// function addToCart(productId) {
//   if (!getProductById(productId)) return;

//   const existingItem = cart.find((item) => item.productId === productId);

//   if (existingItem) {
//     existingItem.quantity += 1;
//   } else {
//     cart.push({ productId, quantity: 1 });
//   }

//   updateCartModal();
// }
function addToCart(productId) {
  applyCartChange(addItem, productId);
}

function createCartItemElement(product, quantity) {
  const row = document.createElement("div");
  row.className = "flex items-center justify-between gap-3 mb-4";

  const details = document.createElement("div");

  const name = document.createElement("p");
  name.className = "font-medium";
  name.textContent = product.name;

  const quantityText = document.createElement("p");
  quantityText.textContent = `Qtd: ${quantity}`;

  const price = document.createElement("p");
  price.className = "font-medium mt-2";
  // price.textContent = currencyFormatter.format(product.price);
  price.textContent = formatBRL(product.priceCents);

  const removeButton = document.createElement("button");
  removeButton.type = "button";
  removeButton.className = "remove-from-cart-btn";
  removeButton.dataset.productId = product.id;
  removeButton.textContent = "Remover";
  removeButton.setAttribute(
    "aria-label",
    `Remover uma unidade de ${product.name}`,
  );

  details.append(name, quantityText, price);
  row.append(details, removeButton);

  return row;
}

// function updateCartModal() {
//   const fragment = document.createDocumentFragment();
//   let total = 0;

//   for (const item of cart) {
//     const product = getProductById(item.productId);

//     fragment.append(createCartItemElement(product, item.quantity));
//     total += product.price * item.quantity;
//   }

//   cartItemsContainer.replaceChildren(fragment);
//   cartTotal.textContent = currencyFormatter.format(total);
//   cartCounter.textContent = cart.length;
// }
// function updateCartModal() {
//   const fragment = document.createDocumentFragment();
//   let totalCents = 0;

//   for (const item of cart) {
//     const product = getProductById(item.productId);
//     const subtotalCents = product.priceCents * item.quantity;

//     assertCents(subtotalCents, "Subtotal do produto");

//     totalCents += subtotalCents;

//     assertCents(totalCents, "Total do carrinho");

//     fragment.append(createCartItemElement(product, item.quantity));
//   }

//   cartItemsContainer.replaceChildren(fragment);
//   cartTotal.textContent = formatBRL(totalCents);
//   cartCounter.textContent = cart.length;
// }
function updateCartModal(summary = getCartSummary(cart)) {
  const fragment = document.createDocumentFragment();

  for (const item of summary.items) {
    fragment.append(createCartItemElement(item.product, item.quantity));
  }

  cartItemsContainer.replaceChildren(fragment);

  cartTotal.textContent = formatBRL(summary.totalCents);
  cartCounter.textContent = summary.items.length;
}

cartItemsContainer.addEventListener("click", function (event) {
  if (!(event.target instanceof Element)) return;

  const button = event.target.closest(".remove-from-cart-btn");

  if (!button || !cartItemsContainer.contains(button)) return;

  removeItemCart(button.dataset.productId);
});

// function removeItemCart(productId) {
//   const index = cart.findIndex((item) => item.productId === productId);

//   if (index === -1) return;

//   if (cart[index].quantity > 1) {
//     cart[index].quantity -= 1;
//   } else {
//     cart.splice(index, 1);
//   }

//   updateCartModal();
// }
function removeItemCart(productId) {
  if (!applyCartChange(removeItem, productId)) return;

  const buttons = [
    ...cartItemsContainer.querySelectorAll(".remove-from-cart-btn"),
  ];

  const focusTarget =
    buttons.find((button) => button.dataset.productId === productId) ??
    buttons[0] ??
    closeModalBtn;

  focusTarget.focus();
}

function getAddressError(value) {
  const address = value.trim();

  if (address.length === 0) {
    return "Informe o endereço de entrega.";
  }

  if (address.length > 300) {
    return "O endereço deve ter no máximo 300 caracteres.";
  }

  return "";
}

// function setAddressError(message) {
//   const hasError = message !== "";

//   addressWarn.textContent = message;
//   addressWarn.hidden = !hasError;

//   addressInput.setAttribute("aria-invalid", hasError ? "true" : "false");

//   addressInput.classList.toggle("border-red-500", hasError);
// }
function setAddressError(message) {
  const hasError = message !== "";

  addressWarn.textContent = message;
  addressWarn.hidden = !hasError;

  addressInput.setAttribute("aria-invalid", hasError ? "true" : "false");

  addressInput.classList.toggle("border-gray-500", !hasError);
  addressInput.classList.toggle("border-red-700", hasError);
}

addressInput.addEventListener("input", function () {
  // Reavalia o campo quando já existe um erro apresentado.
  if (addressInput.getAttribute("aria-invalid") === "true") {
    setAddressError(getAddressError(addressInput.value));
  }
});

function buildWhatsAppUrl(phone, message) {
  const url = new URL(`https://wa.me/${phone}`);

  url.searchParams.set("text", message);

  return url.href;
}

// checkoutBtn.addEventListener("click", function () {
//   const isOpen = checkRestaurantOpen();
//   if (!isOpen) {
//     Toastify({
//       text: "Ops! Não estamos funcionando!",
//       duration: 3000,
//       close: true,
//       gravity: "top",
//       position: "right",
//       stopOnFocus: true,
//       style: {
//         background: "#ef4444",
//       },
//     }).showToast();
//     return;
//   }

//   if (cart.length === 0) return;
//   if (addressInput.value === "") {
//     addressWarn.classList.remove("hidden");
//     addressInput.classList.add("border-red-500");
//     return;
//   }

//   //Enviar o pedido para api whats
//   const cartItems = cart
//     .map((item) => {
//       return `${item.name} Quantidade: (${item.quantity} Preço: R$${item.price} |`;
//     })
//     .join("");

//   // const message = encodeURIComponent(cartItems);
//   // const phone = "61992890048";

//   // window.open(
//   //   `https://wa.me/${phone}?text=${message} Endereço: ${addressInput.value}`,
//   //   "_blank",
//   // );
//   const phone = "5561992890048";

//   const message = [cartItems, `Endereço: ${addressInput.value.trim()}`].join(
//     "\n",
//   );

//   const whatsappUrl = buildWhatsAppUrl(phone, message);

//   window.open(whatsappUrl, "_blank");

//   // cart = [];
//   // updateCartModal();
// });
checkoutForm.addEventListener("submit", function (event) {
  // event.preventDefault();

  // checkoutWarn.hidden = true;
  // checkoutWarn.textContent = "";

  // if (cart.length === 0) {
  //   checkoutWarn.textContent =
  //     "Seu carrinho está vazio. Adicione um produto para continuar.";

  //   checkoutWarn.hidden = false;
  //   checkoutWarn.focus();

  //   return;
  event.preventDefault();
  clearCartFeedback();

  let summary;

  try {
    summary = getCartSummary(cart);
  } catch (error) {
    showCartError(error);
    return;
  }

  if (summary.items.length === 0) {
    checkoutWarn.textContent =
      "Seu carrinho está vazio. Adicione um produto para continuar.";

    checkoutWarn.hidden = false;
    checkoutWarn.focus();

    return;
  }

  const addressError = getAddressError(addressInput.value);

  setAddressError(addressError);

  if (addressError) {
    addressInput.focus();
    return;
  }

  const isOpen = checkRestaurantOpen();

  if (!isOpen) {
    Toastify({
      text: "Ops! Não estamos funcionando!",
      duration: 3000,
      close: true,
      gravity: "top",
      position: "right",
      stopOnFocus: true,
      style: {
        background: "#b91c1c",
        color: "#ffffff",
      },
    }).showToast();

    return;
  }

  // const cartItems = cart
  //   .map((item) => {
  //     return `${item.name} Quantidade: (${item.quantity} Preço: R$${item.price} |`;
  //   })
  //   .join("");
  // const cartItems = cart
  //   .map((item) => {
  //     const product = getProductById(item.productId);

  //     return `${product.name} | Quantidade: ${item.quantity} | Preço unitário: ${currencyFormatter.format(product.price)}`;
  //   })
  //   .join("\n");

  // const phone = "5561992890048";

  // const message = [cartItems, `Endereço: ${addressInput.value.trim()}`].join(
  //   "\n",
  // );
  // const cartItems = cart
  //   .map((item) => {
  //     const product = getProductById(item.productId);

  //     return `${product.name} | Quantidade: ${item.quantity} | Preço unitário: ${formatBRL(product.priceCents)}`;
  //   })
  //   .join("\n");
  const cartItems = summary.items
    .map(({ product, quantity }) => {
      return `${product.name} | Quantidade: ${quantity} | Preço unitário: ${formatBRL(product.priceCents)}`;
    })
    .join("\n");

  const whatsappUrl = buildWhatsAppUrl(phone, message);

  window.open(whatsappUrl, "_blank");
});

//Verificar a hora e manipular o card horario
function checkRestaurantOpen() {
  const data = new Date();
  const hora = data.getHours();
  return hora >= 18 && hora < 22;
}

const spanItem = document.getElementById("date-span");
const isOpen = checkRestaurantOpen();

if (isOpen) {
  spanItem.classList.remove("bg-red-700");
  spanItem.classList.add("bg-green-700");
} else {
  spanItem.classList.remove("bg-green-700");
  spanItem.classList.add("bg-red-700");
}
