/* Render a design/*.html card to a webp in assets/journey.

    node tools/render_design.js design/ebay-number-one.html assets/journey/ebay-number-one.webp

  The card is screenshotted at twice its size in headless Chrome, once its web fonts have
  loaded, and brought down to size with Pillow so the type is properly anti-aliased.
  Needs puppeteer-core (any install on the machine, resolved from PUPPETEER_DIR or the
  current directory) and Chrome at its usual place. */
const path = require("path");
const fs = require("fs");
const { execFileSync } = require("child_process");

const [,, src, out] = process.argv;
if (!src || !out) { console.error("usage: node tools/render_design.js design/card.html assets/journey/card.webp"); process.exit(2); }

const modDir = process.env.PUPPETEER_DIR || process.cwd();
const puppeteer = require(require.resolve("puppeteer-core", { paths: [modDir, process.cwd()] }));
const CHROME = process.env.CHROME || "C:/Program Files/Google/Chrome/Application/chrome.exe";

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ["--disable-gpu", "--no-sandbox"] });
  const page = await browser.newPage();
  await page.goto("file:///" + path.resolve(src).replace(/\\/g, "/"), { waitUntil: "networkidle0", timeout: 60000 });
  const size = await page.evaluate(async () => {
    await document.fonts.ready;
    const c = document.querySelector(".card"); const r = c.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height), fonts: [...document.fonts].filter(f => f.status === "loaded").map(f => f.family) };
  });
  await page.setViewport({ width: size.w, height: size.h, deviceScaleFactor: 2 });
  await new Promise((r) => setTimeout(r, 600));
  const png = out.replace(/\.webp$/i, "") + ".2x.png";
  await page.screenshot({ path: png, clip: { x: 0, y: 0, width: size.w, height: size.h } });
  await browser.close();
  execFileSync("python", ["-c", `
from PIL import Image
im=Image.open(${JSON.stringify(png)}).convert("RGB")
im=im.resize((${size.w},${size.h}),Image.LANCZOS)
im.save(${JSON.stringify(out)},"WEBP",quality=90,method=6)
`], { stdio: "inherit" });
  fs.unlinkSync(png);
  console.log("rendered", out, size.w + "x" + size.h, "fonts:", [...new Set(size.fonts)].join(", "));
})().catch((e) => { console.error("ERR", e.message); process.exit(1); });
