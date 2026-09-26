import { createServer } from "node:http";
import { readFile, realpath, stat } from "node:fs/promises";
import { extname, isAbsolute, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = await realpath(
  fileURLToPath(new URL("../dist/", import.meta.url)),
);

const host = "127.0.0.1";
const port = 4173;

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

const server = createServer(async (request, response) => {
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("X-Content-Type-Options", "nosniff");

  if (!["GET", "HEAD"].includes(request.method)) {
    response.writeHead(405, { Allow: "GET, HEAD" });
    response.end();
    return;
  }

  try {
    const url = new URL(request.url, `http://${host}:${port}`);
    const pathname = decodeURIComponent(url.pathname);
    const filename = pathname === "/" ? "index.html" : pathname.slice(1);
    const file = await realpath(resolve(root, filename));
    const fromRoot = relative(root, file);

    if (
      fromRoot === ".." ||
      fromRoot.startsWith(`..${sep}`) ||
      isAbsolute(fromRoot)
    ) {
      response.writeHead(403);
      response.end();
      return;
    }

    if (!(await stat(file)).isFile()) {
      response.writeHead(404);
      response.end();
      return;
    }

    const body = await readFile(file);

    response.writeHead(200, {
      "Content-Type":
        mimeTypes[extname(file).toLowerCase()] ?? "application/octet-stream",
      "Content-Length": body.length,
    });

    response.end(request.method === "HEAD" ? undefined : body);
  } catch (error) {
    const status =
      error instanceof URIError || error.code === "ERR_INVALID_ARG_VALUE"
        ? 400
        : ["ENOENT", "ENOTDIR"].includes(error.code)
          ? 404
          : 500;

    if (status === 500) {
      console.error(error);
    }

    response.writeHead(status);
    response.end();
  }
});

server.on("error", (error) => {
  console.error("Falha ao iniciar o servidor de preview:", error.message);
  process.exitCode = 1;
});

server.listen(port, host, () => {
  console.log(`Preview de dist: http://${host}:${port}`);
});