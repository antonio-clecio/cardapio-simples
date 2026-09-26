import { test, expect } from "./fixtures.mjs";

function cartDialog(page) {
  return page.getByRole("dialog", {
    name: "Meu carrinho",
    exact: true,
  });
}

function removeButton(page, productName) {
  return page.getByRole("button", {
    name: `Remover uma unidade de ${productName}`,
    exact: true,
  });
}

function cartRow(page, productName) {
  return page.locator("#cart-items > div").filter({
    has: removeButton(page, productName),
  });
}

async function addProduct(page, productName, quantity = 1) {
  const button = page.getByRole("button", {
    name: `Adicionar ${productName} ao carrinho`,
    exact: true,
  });

  for (let count = 0; count < quantity; count += 1) {
    await button.click();
  }
}

async function openCart(page) {
  await page.locator("#cart-btn").click();
  await expect(cartDialog(page)).toBeVisible();
  await expect(page.locator("#cart-title")).toBeFocused();
}

test.beforeEach(async ({ page }) => {
  const response = await page.goto("/");

  expect(response?.status()).toBe(200);

  // Aguarda a inicialização do JavaScript antes de interagir.
  await expect(page.locator("#store-status")).toHaveText(
    /^(Aberto agora|Fechado agora)$/,
  );
});

test("carrinho vazio apresenta total e contador zerados", async ({ page }) => {
  await openCart(page);

  await expect(page.locator("#cart-items > div")).toHaveCount(0);
  await expect(page.locator("#cart-total")).toHaveText(/^R\$\s*0,00$/);
  await expect(page.locator("#cart-count")).toHaveText("0");
});

test("adicionar o mesmo produto soma unidades sem duplicar a linha", async ({
  page,
}) => {
  await addProduct(page, "Space Classic", 2);
  await openCart(page);

  await expect(page.locator("#cart-items > div")).toHaveCount(1);

  await expect(
    cartRow(page, "Space Classic").getByText("Qtd: 2", { exact: true }),
  ).toBeVisible();

  await expect(page.locator("#cart-total")).toHaveText(/^R\$\s*49,80$/);
  await expect(page.locator("#cart-count")).toHaveText("1");
});

test("produtos diferentes ficam separados e compõem o total correto", async ({
  page,
}) => {
  await addProduct(page, "Space Classic", 2);
  await addProduct(page, "Coca lata");
  await openCart(page);

  await expect(page.locator("#cart-items > div")).toHaveCount(2);

  await expect(
    cartRow(page, "Space Classic").getByText("Qtd: 2", { exact: true }),
  ).toBeVisible();

  await expect(
    cartRow(page, "Coca lata").getByText("Qtd: 1", { exact: true }),
  ).toBeVisible();

  await expect(page.locator("#cart-total")).toHaveText(/^R\$\s*55,80$/);
  await expect(page.locator("#cart-count")).toHaveText("2");
});

test("remover atualiza quantidades, totais e foco até esvaziar o carrinho", async ({
  page,
}) => {
  await addProduct(page, "Space Classic", 2);
  await addProduct(page, "Coca lata");
  await openCart(page);

  // Duas unidades passam a ser uma; o foco permanece nesse produto.
  await removeButton(page, "Space Classic").click();

  await expect(
    cartRow(page, "Space Classic").getByText("Qtd: 1", { exact: true }),
  ).toBeVisible();

  await expect(page.locator("#cart-items > div")).toHaveCount(2);
  await expect(page.locator("#cart-total")).toHaveText(/^R\$\s*30,90$/);
  await expect(page.locator("#cart-count")).toHaveText("2");
  await expect(removeButton(page, "Space Classic")).toBeFocused();

  // A última unidade sai; o foco segue para o produto restante.
  await page.keyboard.press("Enter");

  await expect(cartRow(page, "Space Classic")).toHaveCount(0);
  await expect(page.locator("#cart-items > div")).toHaveCount(1);
  await expect(page.locator("#cart-total")).toHaveText(/^R\$\s*6,00$/);
  await expect(page.locator("#cart-count")).toHaveText("1");
  await expect(removeButton(page, "Coca lata")).toBeFocused();

  // Sem produtos, o foco vai para Fechar.
  await page.keyboard.press("Enter");

  await expect(page.locator("#cart-items > div")).toHaveCount(0);
  await expect(page.locator("#cart-total")).toHaveText(/^R\$\s*0,00$/);
  await expect(page.locator("#cart-count")).toHaveText("0");
  await expect(page.locator("#close-modal-btn")).toBeFocused();
  await expect(cartDialog(page)).toBeVisible();

  // O botão em foco deve funcionar pelo teclado.
  await page.keyboard.press("Enter");

  await expect(cartDialog(page)).toBeHidden();
  await expect(page.locator("#cart-btn")).toBeFocused();
});

test("remover o quarto produto preserva os demais e posiciona o foco", async ({
  page,
}) => {
  const names = [
    "Space Classic",
    "Lunar Bacon",
    "Saturn Ring",
    "Cometa Picante",
  ];

  for (const name of names) {
    await addProduct(page, name);
  }

  await addProduct(page, "Cometa Picante");
  await openCart(page);

  await removeButton(page, "Cometa Picante").click();

  await expect(page.locator("#cart-items > div")).toHaveCount(4);
  await expect(removeButton(page, "Cometa Picante")).toBeFocused();

  for (const name of names) {
    await expect(
      cartRow(page, name).getByText("Qtd: 1", { exact: true }),
    ).toBeVisible();
  }

  await expect(page.locator("#cart-total")).toHaveText(/^R\$\s*129,60$/);

  await page.keyboard.press("Enter");

  await expect(cartRow(page, "Cometa Picante")).toHaveCount(0);
  await expect(page.locator("#cart-items > div")).toHaveCount(3);
  await expect(page.locator("#cart-count")).toHaveText("3");
  await expect(page.locator("#cart-total")).toHaveText(/^R\$\s*94,70$/);
  await expect(removeButton(page, "Space Classic")).toBeFocused();

  for (const name of names.slice(0, 3)) {
    await expect(
      cartRow(page, name).getByText("Qtd: 1", { exact: true }),
    ).toBeVisible();
  }
});

test("Fechar devolve o foco e reabrir preserva o carrinho", async ({ page }) => {
  await addProduct(page, "Space Classic");
  await openCart(page);

  await page.locator("#close-modal-btn").click();

  await expect(cartDialog(page)).toBeHidden();
  await expect(page.locator("#cart-btn")).toBeFocused();

  await openCart(page);

  await expect(page.locator("#cart-items > div")).toHaveCount(1);

  await expect(
    cartRow(page, "Space Classic").getByText("Qtd: 1", { exact: true }),
  ).toBeVisible();

  await expect(page.locator("#cart-total")).toHaveText(/^R\$\s*24,90$/);
  await expect(page.locator("#cart-count")).toHaveText("1");
});

test("abre pelo teclado e Escape fecha devolvendo o foco", async ({ page }) => {
  await page.locator("#cart-btn").focus();
  await page.keyboard.press("Enter");

  await expect(cartDialog(page)).toBeVisible();
  await expect(page.locator("#cart-title")).toBeFocused();

  await page.keyboard.press("Escape");

  await expect(cartDialog(page)).toBeHidden();
  await expect(page.locator("#cart-btn")).toBeFocused();
});