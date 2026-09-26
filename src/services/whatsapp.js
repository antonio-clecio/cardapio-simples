export function buildWhatsAppUrl(phone, message) {
  const url = new URL(`https://wa.me/${phone}`);

  url.searchParams.set("text", message);

  return url.href;
}
