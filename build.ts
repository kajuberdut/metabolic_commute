// build.ts
import { rm } from "node:fs/promises";

const OUT_DIR = "./dist";

// 1. Clean output directory
await rm(OUT_DIR, { recursive: true, force: true });

// 2. Build and Minify JS & CSS (Native Bun speed)
await Bun.build({
    entrypoints: ["./js/app.js", "./css/style.css"],
    outdir: OUT_DIR,
    minify: true,
});

// 3. Minify HTML (Safe Mode)
const htmlFile = Bun.file("./index.html");
let html = await htmlFile.text();

// Safe Regex to collapse whitespace and remove comments
html = html
    .replace(/<!--[\s\S]*?-->/g, "") // Remove comments safely
    .replace(/\s+/g, " ");           // Collapse whitespace to 1 space (safe for inline-block)

// Write the minified HTML to dist
await Bun.write(`${OUT_DIR}/index.html`, html);

console.log("⚡ Build complete!");
