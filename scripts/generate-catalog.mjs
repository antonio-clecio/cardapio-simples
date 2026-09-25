import { readFile, writeFile } from "node:fs/promises";
import { products } from "../src/data/products.js";
import { renderCatalog } from "../src/ui/catalog.js";

const indexUrl = new URL("../index.html", import.meta.url);
const startMarker = "<!-- CATALOG:START -->";
const endMarker = "<!-- CATALOG:END -->";

const html = await readFile(indexUrl, "utf8");

if (
  html.split(startMarker).length !== 2 ||
  html.split(endMarker).length !== 2
) {
  throw new Error(
    "O index.html deve conter exatamente um marcador de início e um de fim do catálogo.",
  );
}

const start = html.indexOf(startMarker) + startMarker.length;
const end = html.indexOf(endMarker);

if (end < start) {
  throw new Error("Os marcadores do catálogo estão na ordem errada.");
}

const catalogHtml = renderCatalog(products);

const updatedHtml = `${html.slice(0, start)}\n${catalogHtml}\n${html.slice(end)}`;

if (updatedHtml !== html) {
  await writeFile(indexUrl, updatedHtml, "utf8");
}

console.log(`Catálogo gerado: ${products.length} produtos.`);
