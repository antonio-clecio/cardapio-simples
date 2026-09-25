const catalog = [
  {
    id: "space-classic",
    category: "burgers",
    name: "Space Classic",
    emoji: "🚀",
    description:
      "Pão brioche, hambúrguer bovino artesanal de 150g, queijo cheddar derretido, alface americana, tomate fresco e molho especial da casa.",
    price: 24.9,
    image: "./assets/hamb-1.png",
    imageAlt: "Hambúrguer Space Classic",
  },
  {
    id: "lunar-bacon",
    category: "burgers",
    name: "Lunar Bacon",
    emoji: "🌕",
    description:
      "Hambúrguer bovino de 180g, cheddar cremoso, bacon crocante em dobro, cebola caramelizada e molho barbecue no pão australiano.",
    price: 32.9,
    image: "./assets/hamb-2.png",
    imageAlt: "Hambúrguer Lunar Bacon",
  },
  {
    id: "saturn-ring",
    category: "burgers",
    name: "Saturn Ring",
    emoji: "🪐",
    description:
      "Dois hambúrgueres bovinos de 120g, queijo prato, anéis de cebola empanados, alface, picles e molho Space Burger.",
    price: 36.9,
    image: "./assets/hamb-3.png",
    imageAlt: "Hambúrguer Saturn Ring",
  },
  {
    id: "cometa-picante",
    category: "burgers",
    name: "Cometa Picante",
    emoji: "☄️",
    description:
      "Hambúrguer bovino de 180g, queijo pepper jack, jalapeños, cebola roxa, alface crocante e molho spicy.",
    price: 34.9,
    image: "./assets/hamb-4.png",
    imageAlt: "Hambúrguer Cometa Picante",
  },
  {
    id: "galaxia-suprema",
    category: "burgers",
    name: "Galáxia Suprema",
    emoji: "🌌",
    description:
      "Hambúrguer de 200g, cheddar, bacon crocante, onion rings, ovo frito, alface e molho especial no pão brioche.",
    price: 42.9,
    image: "./assets/hamb-5.png",
    imageAlt: "Hambúrguer Galáxia Suprema",
  },
  {
    id: "alien-cheese",
    category: "burgers",
    name: "Alien Cheese",
    emoji: "👽",
    description:
      "Hambúrguer bovino de 150g recheado com cheddar, queijo mussarela derretido, cebola caramelizada e maionese defumada.",
    price: 38.9,
    image: "./assets/hamb-6.png",
    imageAlt: "Hambúrguer Alien Cheese",
  },
  {
    id: "coca-lata",
    category: "drinks",
    name: "Coca lata",
    emoji: "",
    description: "",
    price: 6,
    image: "./assets/refri-1.png",
    imageAlt: "Coca lata",
  },
  {
    id: "guarana-lata",
    category: "drinks",
    name: "Guaraná lata",
    emoji: "",
    description: "",
    price: 6,
    image: "./assets/refri-2.png",
    imageAlt: "Guaraná lata",
  },
];

export const products = Object.freeze(
  catalog.map((product) => Object.freeze(product)),
);

const productsById = new Map();

for (const product of products) {
  if (
    typeof product.id !== "string" ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(product.id)
  ) {
    throw new Error("Produto com ID inválido no catálogo.");
  }

  if (productsById.has(product.id)) {
    throw new Error(`ID de produto duplicado: ${product.id}`);
  }

  productsById.set(product.id, product);
}

export function getProductById(productId) {
  return productsById.get(productId);
}
