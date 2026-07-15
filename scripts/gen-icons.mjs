// Generate PWA icons (shuttlecock on brand teal) with sharp + librsvg.
// Run: node scripts/gen-icons.mjs
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "public");
const TEAL = "#0f766e";

/**
 * Build the icon SVG.
 * @param {number} scale  shuttlecock size relative to canvas (0..1)
 * @param {number} radius corner radius of the background (0 = square)
 */
function svg(scale, radius) {
  const s = scale;
  // shuttlecock drawn around center (256,256), then scaled about the center
  const shuttle = `
    <g transform="translate(256 256) scale(${s}) translate(-256 -256)">
      <!-- feather skirt -->
      <path d="M150 140 L362 140 L300 330 L212 330 Z"
            fill="#ffffff" stroke="${TEAL}" stroke-width="4" stroke-linejoin="round"/>
      <!-- feather separators -->
      <g stroke="${TEAL}" stroke-width="7" stroke-linecap="round">
        <line x1="203" y1="140" x2="235" y2="330"/>
        <line x1="256" y1="140" x2="256" y2="330"/>
        <line x1="309" y1="140" x2="277" y2="330"/>
      </g>
      <!-- binding band -->
      <path d="M196 250 L316 250" stroke="${TEAL}" stroke-width="8" stroke-linecap="round"/>
      <!-- cork -->
      <circle cx="256" cy="360" r="52" fill="#ffffff"/>
      <path d="M212 342 A52 52 0 0 1 300 342 Z" fill="#f1f5f4"/>
    </g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
    <rect width="512" height="512" rx="${radius}" fill="${TEAL}"/>
    ${shuttle}
  </svg>`;
}

async function render(svgStr, size, name) {
  await sharp(Buffer.from(svgStr))
    .resize(size, size)
    .png()
    .toFile(join(OUT, name));
  console.log("wrote", name, `${size}x${size}`);
}

await mkdir(OUT, { recursive: true });

// Standard (rounded) icons — purpose "any"
const std = svg(0.82, 112);
await render(std, 192, "icon-192.png");
await render(std, 512, "icon-512.png");

// Maskable — square bg + extra padding so content stays in the safe zone
const mask = svg(0.6, 0);
await render(mask, 192, "icon-maskable-192.png");
await render(mask, 512, "icon-maskable-512.png");

// Apple touch icon — square, iOS applies its own rounding
await render(svg(0.82, 0), 180, "apple-touch-icon.png");

// Favicon
await render(std, 32, "favicon-32.png");

console.log("done");
