import { copyFile, cp, mkdir, rm } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const dist = join(root, "dist");
const require = createRequire(import.meta.url);

const runtimeFiles = [
  "src/main.js",
  "src/config/store.js",
  "src/data/products.js",
  "src/domain/business-hours.js",
  "src/domain/cart.js",
  "src/domain/money.js",
  "src/services/whatsapp.js",
  "src/ui/store-status.js",
];

function runNode(script, args = []) {
  const result = spawnSync(process.execPath, [script, ...args], {
    cwd: root,
    stdio: "inherit",
    shell: false,
  });

  if (result.error) throw result.error;

  if (result.status !== 0) {
    throw new Error(`Falha ao executar ${script}.`);
  }
}

async function copyToDist(relativePath) {
  const destination = join(dist, relativePath);

  await mkdir(dirname(destination), { recursive: true });
  await copyFile(join(root, relativePath), destination);
}

try {
  await rm(dist, { recursive: true, force: true });

  runNode(join(root, "scripts/generate-catalog.mjs"));

  await mkdir(join(dist, "styles"), { recursive: true });

  runNode(require.resolve("tailwindcss/lib/cli.js"), [
    "--config", "tailwind.config.js",
    "--input", "styles/style.css",
    "--output", "dist/styles/output.css",
    "--content", "./index.html,./src/**/*.js",
    "--minify",
  ]);

  await copyToDist("index.html");

  for (const file of runtimeFiles) {
    await copyToDist(file);
  }

  await cp(join(root, "assets"), join(dist, "assets"), {
    recursive: true,
  });

  console.log("Build concluído: arquivos de publicação gerados em dist/.");
} catch (error) {
  console.error("Build interrompido:", error);

  await rm(dist, { recursive: true, force: true });

  process.exitCode = 1;
}