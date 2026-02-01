import { rm, readFile, writeFile, cp, mkdir } from 'node:fs/promises';
import { minify } from 'terser';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const CleanCSS = require('clean-css');

const OUT_DIR = './dist';

console.log('Starting Pure-JS Build...');

// 1. Clean output directory
await rm(OUT_DIR, { recursive: true, force: true });
await mkdir(OUT_DIR, { recursive: true });
await mkdir(`${OUT_DIR}/js`, { recursive: true });
await mkdir(`${OUT_DIR}/css`, { recursive: true });

// 2. Build and Minify JS
console.log('Minifying JS...');
const appJs = await readFile('js/app.js', 'utf8');
const minifiedJs = await minify(appJs);
if (!minifiedJs.code) throw new Error('Terser failed to produce code');
await writeFile(`${OUT_DIR}/js/app.js`, minifiedJs.code);

// 3. Minify CSS
console.log('Minifying CSS...');
const styleCss = await readFile('css/style.css', 'utf8');
const cssOutput = new CleanCSS({ inline: false }).minify(styleCss);
if (cssOutput.errors.length > 0) throw new Error(cssOutput.errors.join('\n'));
await writeFile(`${OUT_DIR}/css/style.css`, cssOutput.styles);

console.log('Minifying Fonts CSS...');
const fontsCss = await readFile('css/fonts.css', 'utf8');
const fontsOutput = new CleanCSS({ inline: false }).minify(fontsCss);
if (fontsOutput.errors.length > 0) throw new Error(fontsOutput.errors.join('\n'));
await writeFile(`${OUT_DIR}/css/fonts.css`, fontsOutput.styles);

// 4. Minify HTML
console.log('Minifying HTML...');
const srcHtml = await readFile('index.html', 'utf8');
let minHtml = srcHtml.replace(/<!--[\s\S]*?-->/g, '');
minHtml = minHtml.replace(/\s+/g, ' ');
await writeFile(`${OUT_DIR}/index.html`, minHtml);

// 5. Copy Fonts
console.log('Copying Fonts...');
await cp('fonts', `${OUT_DIR}/fonts`, { recursive: true });
await cp('favicon.ico', `${OUT_DIR}/favicon.ico`);

console.log('Build Complete!');