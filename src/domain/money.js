const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function assertCents(value, label = "Valor monetário") {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError(
      `${label} deve ser um inteiro seguro, não negativo, em centavos.`,
    );
  }
}

export function formatBRL(cents) {
  assertCents(cents);

  const reais = BigInt(cents) / 100n;
  const fraction = String(cents % 100).padStart(2, "0");

  return currencyFormatter
    .formatToParts(reais)
    .map((part) => (part.type === "fraction" ? fraction : part.value))
    .join("");
}
