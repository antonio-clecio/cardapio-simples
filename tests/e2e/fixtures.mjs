import { test as base, expect } from "@playwright/test";

export const test = base.extend({
  captureWindowOpen: [false, { option: true }],

  page: async (
    { page, context, baseURL, captureWindowOpen },
    use,
  ) => {
    const pageErrors = [];
    const localOrigin = new URL(baseURL).origin;

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    await context.route("**/*", async (route) => {
      const requestOrigin = new URL(route.request().url()).origin;

      if (requestOrigin === localOrigin) {
        await route.continue();
        return;
      }

      await route.abort();
    });

    await context.addInitScript((capture) => {
      window.__testOpenedWindows = [];

      window.open = (url, target) => {
        if (!capture) {
          throw new Error(
            "Abertura inesperada de janela durante o teste.",
          );
        }

        window.__testOpenedWindows.push({
          url: String(url),
          target,
        });

        return null;
      };
    }, captureWindowOpen);

    await use(page);

    expect(
      pageErrors,
      "Erros de JavaScript capturados na página",
    ).toEqual([]);
  },
});

export { expect };