import { test, expect } from "./fixtures.mjs";

test("carrega o catálogo e abre o carrinho sem erros de JavaScript", async ({
  page,
}) => {
  const response = await page.goto("/");

  expect(response?.status()).toBe(200);

  await expect(
    page.locator("#menu .add-to-cart-btn"),
  ).toHaveCount(8);

  await expect(page.locator("#store-status")).toHaveText(
    /^(Aberto agora|Fechado agora)$/,
  );

  await page.locator("#cart-btn").click();

  await expect(
    page.getByRole("dialog", { name: "Meu carrinho" }),
  ).toBeVisible();

  await expect(page.locator("#cart-title")).toBeFocused();
});