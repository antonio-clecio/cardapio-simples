import { test, expect } from "./fixtures.mjs";

test.use({ captureWindowOpen: true });

const OPEN_TIME = "2026-09-26T19:00:00-03:00";
const CLOSED_TIME = "2026-09-26T22:00:00-03:00";

const VALID_ADDRESS = "Rua São José, 10, Centro";

const CLOSED_MESSAGE =
  "Estamos fechados no momento. Consulte nosso horário de funcionamento no início da página.";

async function loadStore(
  page,
  time = OPEN_TIME,
  expectedStatus = "Aberto agora",
) {
  await page.clock.setFixedTime(new Date(time));

  const response = await page.goto("/");

  expect(response?.status()).toBe(200);

  await expect(page.locator("#store-status")).toHaveText(
    expectedStatus,
  );
}

async function addProduct(page, name, quantity = 1) {
  const button = page.getByRole("button", {
    name: `Adicionar ${name} ao carrinho`,
    exact: true,
  });

  for (let count = 0; count < quantity; count += 1) {
    await button.click();
  }
}

async function openCart(page) {
  await page.locator("#cart-btn").click();

  await expect(
    page.getByRole("dialog", { name: "Meu carrinho" }),
  ).toBeVisible();
}

async function submitOrder(page) {
  await page.getByRole("button", {
    name: "Enviar pedido",
    exact: true,
  }).click();
}

async function expectNoWindowOpened(page) {
  const calls = await page.evaluate(
    () => window.__testOpenedWindows,
  );

  expect(calls).toEqual([]);
}

function normalizeCurrencySpaces(value) {
  return value.replace(/[\u00a0\u202f]/g, " ");
}

test("carrinho vazio impede o checkout e foca a mensagem", async ({
  page,
}) => {
  await loadStore(page);
  await openCart(page);

  // Endereço válido para verificar especificamente o carrinho vazio.
  await page.locator("#address").fill(VALID_ADDRESS);
  await submitOrder(page);

  await expect(page.locator("#checkout-warn")).toBeVisible();

  await expect(page.locator("#checkout-warn")).toHaveText(
    "Seu carrinho está vazio. Adicione um produto para continuar.",
  );

  await expect(page.locator("#checkout-warn")).toBeFocused();
  await expectNoWindowOpened(page);
});

for (const scenario of [
  { name: "vazio", value: "" },
  { name: "composto apenas por espaços", value: "   " },
]) {
  test(`endereço ${scenario.name} impede o checkout`, async ({
    page,
  }) => {
    await loadStore(page);
    await addProduct(page, "Space Classic");
    await openCart(page);

    await page.locator("#address").fill(scenario.value);
    await submitOrder(page);

    await expect(page.locator("#address-warn")).toBeVisible();

    await expect(page.locator("#address-warn")).toHaveText(
      "Informe o endereço de entrega.",
    );

    await expect(page.locator("#address")).toHaveAttribute(
      "aria-invalid",
      "true",
    );

    await expect(page.locator("#address")).toBeFocused();

    await expect(page.locator("#cart-total")).toHaveText(
      /^R\$\s*24,90$/,
    );

    await expectNoWindowOpened(page);
  });
}

test("corrigir o endereço remove o erro e permite nova tentativa", async ({
  page,
}) => {
  await loadStore(page);
  await addProduct(page, "Space Classic");
  await openCart(page);

  await submitOrder(page);

  await expect(page.locator("#address")).toHaveAttribute(
    "aria-invalid",
    "true",
  );

  await expectNoWindowOpened(page);

  await page.locator("#address").fill(VALID_ADDRESS);

  await expect(page.locator("#address")).toHaveAttribute(
    "aria-invalid",
    "false",
  );

  await expect(page.locator("#address-warn")).toBeHidden();

  // Digitar o endereço não deve abrir uma janela por conta própria.
  await expectNoWindowOpened(page);

  await submitOrder(page);

  const calls = await page.evaluate(
    () => window.__testOpenedWindows,
  );

  expect(calls).toHaveLength(1);

  await expect(page.locator("#checkout-warn")).toBeHidden();
  await expect(page.locator("#address")).toHaveValue(VALID_ADDRESS);
});

test("endereço acima de 300 caracteres é rejeitado pelo JavaScript", async ({
  page,
}) => {
  await loadStore(page);
  await addProduct(page, "Space Classic");
  await openCart(page);

  await expect(page.locator("#address")).toHaveAttribute(
    "maxlength",
    "300",
  );

  // Atribuição direta intencional para ultrapassar o maxlength do HTML.
  await page.locator("#address").evaluate((input) => {
    input.value = "A".repeat(301);
  });

  await submitOrder(page);

  await expect(page.locator("#address-warn")).toBeVisible();

  await expect(page.locator("#address-warn")).toHaveText(
    "O endereço deve ter no máximo 300 caracteres.",
  );

  await expect(page.locator("#address")).toHaveAttribute(
    "aria-invalid",
    "true",
  );

  await expect(page.locator("#address")).toBeFocused();
  await expectNoWindowOpened(page);
});

test("loja fechada impede o checkout e preserva os dados", async ({
  page,
}) => {
  await loadStore(page, CLOSED_TIME, "Fechado agora");
  await addProduct(page, "Space Classic");
  await openCart(page);

  await page.locator("#address").fill(VALID_ADDRESS);
  await submitOrder(page);

  await expect(page.locator("#checkout-warn")).toBeVisible();

  await expect(page.locator("#checkout-warn")).toHaveText(
    CLOSED_MESSAGE,
  );

  await expect(page.locator("#checkout-warn")).toBeFocused();
  await expect(page.locator("#address-warn")).toBeHidden();
  await expect(page.locator("#address")).toHaveValue(VALID_ADDRESS);
  await expect(page.locator("#cart-items > div")).toHaveCount(1);

  await expect(page.locator("#cart-total")).toHaveText(
    /^R\$\s*24,90$/,
  );

  await expectNoWindowOpened(page);
});

test("checkout consulta o horário novamente quando a loja fecha", async ({
  page,
}) => {
  await loadStore(page, "2026-09-26T21:59:59-03:00");
  await addProduct(page, "Space Classic");
  await openCart(page);

  await page.locator("#address").fill(VALID_ADDRESS);

  // A página iniciou com a loja aberta; agora são exatamente 22h.
  await page.clock.setFixedTime(new Date(CLOSED_TIME));

  await submitOrder(page);

  await expect(page.locator("#checkout-warn")).toBeVisible();

  await expect(page.locator("#checkout-warn")).toHaveText(
    CLOSED_MESSAGE,
  );

  await expect(page.locator("#checkout-warn")).toBeFocused();
  await expectNoWindowOpened(page);
});

test("checkout válido monta a URL correta e preserva carrinho e endereço", async ({
  page,
}) => {
  await loadStore(page);
  await addProduct(page, "Space Classic", 2);
  await addProduct(page, "Coca lata");
  await openCart(page);

  const address =
    "  Rua São José, 10 & text=extra #fundos + portão 50% 🚀  ";

  await page.locator("#address").fill(address);
  await submitOrder(page);

  const calls = await page.evaluate(
    () => window.__testOpenedWindows,
  );

  expect(calls).toHaveLength(1);
  expect(calls[0].target).toBe("_blank");

  const url = new URL(calls[0].url);

  expect(url.origin).toBe("https://wa.me");
  expect(url.pathname).toBe("/5561992890048");
  expect(url.hash).toBe("");
  expect([...url.searchParams.keys()]).toEqual(["text"]);

  const expectedMessage = [
    "Space Classic | Quantidade: 2 | Preço unitário: R$ 24,90",
    "Coca lata | Quantidade: 1 | Preço unitário: R$ 6,00",
    `Endereço: ${address.trim()}`,
  ].join("\n");

  const message = url.searchParams.get("text");

  expect(message).not.toBeNull();

  expect(normalizeCurrencySpaces(message)).toBe(
    expectedMessage,
  );

  await expect(page.locator("#checkout-warn")).toBeHidden();
  await expect(page.locator("#address-warn")).toBeHidden();

  await expect(page.locator("#address")).toHaveAttribute(
    "aria-invalid",
    "false",
  );

  // A abertura do WhatsApp não comprova que o pedido foi enviado.
  await expect(page.locator("#address")).toHaveValue(address);
  await expect(page.locator("#cart-items > div")).toHaveCount(2);
  await expect(page.locator("#cart-count")).toHaveText("2");

  await expect(page.locator("#cart-total")).toHaveText(
    /^R\$\s*55,80$/,
  );

  const classicRow = page.locator("#cart-items > div").filter({
    has: page.getByRole("button", {
      name: "Remover uma unidade de Space Classic",
      exact: true,
    }),
  });

  await expect(
    classicRow.getByText("Qtd: 2", { exact: true }),
  ).toBeVisible();

  const cocaRow = page.locator("#cart-items > div").filter({
    has: page.getByRole("button", {
      name: "Remover uma unidade de Coca lata",
      exact: true,
    }),
  });

  await expect(
    cocaRow.getByText("Qtd: 1", { exact: true }),
  ).toBeVisible();

  await expect(
    page.getByRole("dialog", { name: "Meu carrinho" }),
  ).toBeVisible();
});