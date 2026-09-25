import { formatBRL } from "../domain/money.js";
// const currencyFormatter = new Intl.NumberFormat("pt-BR", {
//   style: "currency",
//   currency: "BRL",
// });

function escapeHtml(value) {
  const entities = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };

  return String(value).replace(/[&<>"']/g, (character) => entities[character]);
}

function renderProduct(product) {
  const description = product.description
    ? `<p class="text-sm">${escapeHtml(product.description)}</p>`
    : "";

  const emoji = product.emoji
    ? `<span aria-hidden="true">${escapeHtml(product.emoji)}</span> `
    : "";

  return `
    <article class="flex gap-2 w-full">
      <img
        src="${escapeHtml(product.image)}"
        alt="${escapeHtml(product.imageAlt)}"
        class="w-28 h-28 rounded-md hover:scale-110 hover:-rotate-2 duration-300"
      />
      <div class="w-full">
        <p class="font-bold">${emoji}${escapeHtml(product.name)}</p>
        ${description}
        <div class="flex flex-wrap items-center gap-2 justify-between mt-3">
          <p class="font-bold text-lg">${formatBRL(product.priceCents)}</p>
          <button
            type="button"
            class="add-to-cart-btn inline-flex items-center justify-center gap-2 bg-gray-900 text-white text-sm px-3 py-2 rounded min-h-[44px]"
            data-product-id="${escapeHtml(product.id)}"
            aria-label="Adicionar ${escapeHtml(product.name)} ao carrinho"
          >
            <i class="fa fa-cart-plus text-lg" aria-hidden="true"></i>
            <span>Adicionar</span>
          </button>
        </div>
      </div>
    </article>`;
}

export function renderCatalog(products) {
  for (const product of products) {
    if (!["burgers", "drinks"].includes(product.category)) {
      throw new Error(`Categoria inválida no produto: ${product.id}`);
    }
  }

  const burgers = products.filter((product) => product.category === "burgers");
  const drinks = products.filter((product) => product.category === "drinks");

  return `
    <main id="menu">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-7 md:gap-10 mx-auto max-w-7xl px-2 mb-16">
        ${burgers.map(renderProduct).join("\n")}
      </div>
      <div class="mx-auto max-w-7xl px-2 my-2">
        <h2 class="font-bold text-3xl">Bebidas</h2>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-7 md:gap-10 mx-auto max-w-7xl px-2 mb-16">
        ${drinks.map(renderProduct).join("\n")}
      </div>
    </main>
  `.trim();
}
