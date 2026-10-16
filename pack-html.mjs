import fs from "fs";
import esbuild from "esbuild";
import {
  compileA6Container,
  decodeA6Container,
  createSelfExtractingA6Html,
  stripDesktopControlsForAndroid,
} from "./a6-crypt.mjs";
import { applyRosettaCamouflage, generateRosettaMasterTxt } from "./a6-rosetta.mjs";

const css = fs.readFileSync("src/index.css", "utf8");
const rawJs = fs.readFileSync("src/chemicats-v30-9.js", "utf8");
const audioTs = fs.readFileSync("src/chem-audio-player.ts", "utf8");
const rawAudioJs = esbuild.transformSync(
  `${audioTs}\nif (document.readyState === "loading") { window.addEventListener("DOMContentLoaded", () => initChemAudioPlayer(), { once: true }); } else { initChemAudioPlayer(); }`,
  { loader: "ts", format: "iife", minify: true, target: "es2020" }
).code;

// Apply A6-ROSETTA Adversarial Anti-Human & Anti-AI Semantic Camouflage across the entire bundle
const camouflagedMain = applyRosettaCamouflage(rawJs);
const camouflagedAudio = applyRosettaCamouflage(rawAudioJs);
const js = camouflagedMain.code;
const audioJs = camouflagedAudio.code;
const totalRosettaTokens = camouflagedMain.replacedTokens + camouflagedAudio.replacedTokens;

const fullHtml = `<!DOCTYPE html><html lang="pl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"><title>Chemicats</title><style>${css}</style></head><body><div id="root"></div><script>${js}\n${audioJs}<\/script></body></html>`;

// 1. Single-File Web Build (A6-CRYPT 4-Layer + A6-ROSETTA Camouflage + Variable-Bit Base96 13/14-bit)
const WEB_KEY = process.env.A6_WEB_KEY || "CHEMICATS-A6-WEB-RELEASE-KEY-2026";
const webBuild = createSelfExtractingA6Html(fullHtml, WEB_KEY, { mobileStripped: false });

fs.writeFileSync("chemicats-packed.html", webBuild.html, "utf8");
fs.writeFileSync("public/chemicats-packed.html", webBuild.html, "utf8");

// 2. Steam / Tauri Native Binary Build (`public/game.a6` - 0% Base96 text overhead + A6-ROSETTA Camouflage)
const STEAM_KEY = process.env.A6_STEAM_KEY || "CHEMICATS-STEAM-APPID-3184920-A6-SECRET";
const steamBuild = compileA6Container(Buffer.from(fullHtml, "utf8"), STEAM_KEY, {
  mobileStripped: false,
});
const verifySteam = decodeA6Container(steamBuild.container, STEAM_KEY);
if (verifySteam.sourceSHA256 !== steamBuild.stats.sourceSHA256) {
  throw new Error("Steam A6 binary verification failed!");
}
fs.writeFileSync("public/game.a6", steamBuild.container);

// 3. Google Play / Android APK Binary Build (`public/game-android.a6` - PC controls physically stripped + A6-ROSETTA + Cert SHA-256 key)
const ANDROID_CERT_SHA256 =
  process.env.A6_ANDROID_CERT_SHA256 ||
  "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
const { code: androidJs, removedBindings } = stripDesktopControlsForAndroid(js);
const androidHtml = `<!DOCTYPE html><html lang="pl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"><title>Chemicats</title><style>${css}</style></head><body><div id="root"></div><script>${androidJs}\n${audioJs}<\/script></body></html>`;

const androidBuild = compileA6Container(Buffer.from(androidHtml, "utf8"), ANDROID_CERT_SHA256, {
  mobileStripped: true,
});
const verifyAndroid = decodeA6Container(androidBuild.container, ANDROID_CERT_SHA256);
if (verifyAndroid.sourceSHA256 !== androidBuild.stats.sourceSHA256) {
  throw new Error("Android A6 binary verification failed!");
}
fs.writeFileSync("public/game-android.a6", androidBuild.container);

// 4. Auto-generate & update local plaintext Decryption & Rosetta Master Key (`A6_KLUCZ_ODSZYFROWUJACY_ROSETTA.txt`)
const masterTxt = generateRosettaMasterTxt({
  timestamp: new Date().toISOString(),
  totalRosettaTokens,
  webKB: (webBuild.stats.htmlBytes / 1024).toFixed(2),
  sourceMB: (webBuild.stats.sourceBytes / 1024 / 1024).toFixed(2),
  steamKB: (steamBuild.stats.containerBytes / 1024).toFixed(2),
  steamSHA256: steamBuild.stats.sourceSHA256,
  androidKB: (androidBuild.stats.containerBytes / 1024).toFixed(2),
  androidSHA256: androidBuild.stats.sourceSHA256,
  removedBindings,
});
fs.writeFileSync("A6_KLUCZ_ODSZYFROWUJACY_ROSETTA.txt", masterTxt, "utf8");

console.log("=== A6-CRYPT + A6-ROSETTA Multi-Target Build Summary ===");
console.log(
  `[A6-ROSETTA]   Camouflaged ${camouflagedMain.uniqueModulesCamouflaged} engine modules (${totalRosettaTokens} identifier occurrences rewritten to _q0x... decoys)`
);
console.log(
  `[Master .txt]  A6_KLUCZ_ODSZYFROWUJACY_ROSETTA.txt updated (${(Buffer.byteLength(masterTxt, "utf8") / 1024).toFixed(2)} KB)`
);
console.log(
  `[Web HTML]     chemicats-packed.html : ${(webBuild.stats.htmlBytes / 1024).toFixed(2)} KB (${webBuild.stats.htmlBytes} B) -> unpacks in RAM to ${(webBuild.stats.sourceBytes / 1024 / 1024).toFixed(2)} MB`
);
console.log(
  `[Steam .a6]    public/game.a6        : ${(steamBuild.stats.containerBytes / 1024).toFixed(2)} KB (${steamBuild.stats.containerBytes} B, 0% Base96 overhead, saved ${((webBuild.stats.htmlBytes - steamBuild.stats.containerBytes) / 1024).toFixed(2)} KB)`
);
console.log(
  `[Android .a6]  public/game-android.a6: ${(androidBuild.stats.containerBytes / 1024).toFixed(2)} KB (${androidBuild.stats.containerBytes} B, stripped ${removedBindings} PC keyboard/mouse bindings)`
);
