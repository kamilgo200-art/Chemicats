import fs from "fs";
import zlib from "zlib";
import esbuild from "esbuild";
import {
  compileA6Container,
  decodeA6Container,
  stripDesktopControlsForAndroid,
} from "./a6-crypt.mjs";
import { applyRosettaCamouflage, generateRosettaMasterTxt } from "./a6-rosetta.mjs";

const css = fs.readFileSync("src/index.css", "utf8");
const matrioszkaJs = fs.readFileSync("src/chemicats-v30-9.js", "utf8");
globalThis.ChemMatrioszkaOpener = null;
(0, eval)(matrioszkaJs);
const rawJs = globalThis.ChemMatrioszkaOpener
  ? globalThis.ChemMatrioszkaOpener.unpack()
  : matrioszkaJs;

const audioTs = fs.readFileSync("src/chem-audio-player.ts", "utf8");
const rawAudioJs = esbuild.transformSync(
  `${audioTs}\nif (document.readyState === "loading") { window.addEventListener("DOMContentLoaded", () => initChemAudioPlayer(), { once: true }); } else { initChemAudioPlayer(); }`,
  { loader: "ts", format: "iife", minify: true, target: "es2020" }
).code.trim();

// Apply A6-ROSETTA Adversarial Anti-Human & Anti-AI Semantic Camouflage across the entire bundle
const camouflagedMain = applyRosettaCamouflage(rawJs);
const camouflagedAudio = applyRosettaCamouflage(rawAudioJs);
const js = camouflagedMain.code;
const audioJs = camouflagedAudio.code;
const totalRosettaTokens = camouflagedMain.replacedTokens + camouflagedAudio.replacedTokens;

const fullHtml = `<!DOCTYPE html><html lang="pl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"><title>Chemicats</title><style>${css}</style></head><body><div id="root"></div><script>${js}\n${audioJs}<\/script></body></html>`;

// Columnar Long-Range LZ77 (2.4MB window beyond Deflate's 32KB) + Deflate-Raw + Base122 (7-bit UTF-8)
function compressLRLZ(buf, minLen = 15, minGain = 10) {
  const n = buf.length;
  const head = new Int32Array(1 << 18).fill(-1);
  const prev = new Int32Array(n).fill(-1);
  function h4(p) {
    return (
      (((buf[p] * 2654435761) ^
        (buf[p + 1] * 2246822519) ^
        (buf[p + 2] * 3266489917) ^
        (buf[p + 3] * 668265263)) >>>
        14) &
      ((1 << 18) - 1)
    );
  }
  const litStream = [];
  const lenCol = [];
  const dHi = [],
    dMid = [],
    dLo = [];
  let lastEndPos = 0;
  let i = 0;
  while (i < n) {
    if (i + minLen <= n) {
      const h = h4(i);
      let cand = head[h];
      let bestLongLen = 0,
        bestLongPos = -1;
      let bestShortLen = 0;
      let steps = 0;
      while (cand !== -1 && steps < 192) {
        const dist = i - cand;
        const maxCheck = dist <= 32768 ? 258 : 270;
        const targetBest = dist <= 32768 ? bestShortLen : bestLongLen;
        if (i + targetBest < n && buf[cand + targetBest] === buf[i + targetBest]) {
          let l = 0;
          const maxL = Math.min(maxCheck, n - i);
          while (l < maxL && buf[cand + l] === buf[i + l]) l++;
          if (dist <= 32768) {
            if (l > bestShortLen) bestShortLen = l;
          } else {
            if (l > bestLongLen) {
              bestLongLen = l;
              bestLongPos = cand;
              if (l === 270) break;
            }
          }
        }
        cand = prev[cand];
        steps++;
      }
      if (bestLongLen >= minLen && bestLongLen - bestShortLen >= minGain) {
        litStream.push(0x00);
        lenCol.push(bestLongLen - minLen);
        const delta = bestLongPos - lastEndPos;
        const zz = (delta << 1) ^ (delta >> 31);
        dHi.push((zz >>> 16) & 0xff);
        dMid.push((zz >>> 8) & 0xff);
        dLo.push(zz & 0xff);
        lastEndPos = bestLongPos + bestLongLen;
        for (let k = 0; k < bestLongLen; k++) {
          if (i + k + 4 <= n) {
            const hk = h4(i + k);
            prev[i + k] = head[hk];
            head[hk] = i + k;
          }
        }
        i += bestLongLen;
        continue;
      }
      prev[i] = head[h];
      head[h] = i;
    }
    litStream.push(buf[i]);
    i++;
  }
  const mCount = lenCol.length;
  const header = Buffer.alloc(8);
  header.writeUInt32BE(n, 0);
  header.writeUInt32BE(mCount, 4);
  return Buffer.concat([
    header,
    Buffer.from(lenCol),
    Buffer.from(dHi),
    Buffer.from(dMid),
    Buffer.from(dLo),
    Buffer.from(litStream),
  ]);
}

function encodeBase122(buf, unsafeList = [0, 10, 13, 60]) {
  const unsafeMap = new Int8Array(128).fill(-1);
  unsafeList.forEach((b, idx) => {
    unsafeMap[b] = idx;
  });
  let bitPos = 0;
  const totalBits = buf.length * 8;
  function get7() {
    if (bitPos >= totalBits) return -1;
    const byteIdx = bitPos >>> 3;
    const bitOff = bitPos & 7;
    let val = (buf[byteIdx] << bitOff) & 0xfe;
    if (bitOff > 1 && byteIdx + 1 < buf.length) {
      val |= buf[byteIdx + 1] >>> (8 - bitOff);
    }
    bitPos += 7;
    return val >>> 1;
  }
  const chars = [];
  while (true) {
    const b1 = get7();
    if (b1 === -1) break;
    const uIdx = unsafeMap[b1];
    if (uIdx === -1) {
      chars.push(String.fromCharCode(b1));
    } else {
      const b2 = get7();
      if (b2 === -1) {
        chars.push(String.fromCharCode(0x100 + (7 << 7) + uIdx));
        break;
      } else {
        chars.push(String.fromCharCode(0x100 + (uIdx << 7) + b2));
      }
    }
  }
  return chars.join("");
}

// 1. Single-File Self-Extracting Web Build (ChemNanoReact + LRLZ + Deflate-Raw + Base122 + A6-ROSETTA)
const fullPayloadStr = `(()=>{const s=document.createElement("style");s.textContent=${JSON.stringify(css)};document.head.appendChild(s);})();\n${js}\n${audioJs}`;
const rawHtmlBuf = Buffer.from(fullPayloadStr, "utf8");
const combHtmlBuf = compressLRLZ(rawHtmlBuf, 15, 10);
const defHtmlBuf = zlib.deflateRawSync(combHtmlBuf, { level: 9 });
const b122Html = encodeBase122(defHtmlBuf, [0, 10, 13, 60]);

const standaloneHtml = `<!DOCTYPE html><html lang="pl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover"><title>Chemicats — .kkrieger Matrioszka Self-Extracting Edition</title></head><body style="background:#020617;color:#fff;margin:0;overflow:hidden"><div id="root"></div><script id="chem-packed" type="text/plain">${b122Html}</script><script>(async()=>{const U=[0,10,13,60],s=document.getElementById("chem-packed").textContent,o=new Uint8Array(${defHtmlBuf.length});let b=0;const P=v=>{const i=b>>>3,f=b&7;if(i<o.length){o[i]|=(v<<1)>>>f;if(f>1&&i+1<o.length)o[i+1]|=(v<<(9-f))&255;}b+=7;};for(let i=0;i<s.length;i++){const c=s.charCodeAt(i);if(c<128)P(c);else{const v=c-256,u=v>>>7,w=v&127;if(u===7)P(U[w]);else{P(U[u]);P(w);}}}const d=new DecompressionStream("deflate-raw"),w=d.writable.getWriter();w.write(o);w.close();const C=new Uint8Array(await new Response(d.readable).arrayBuffer()),V=new DataView(C.buffer,C.byteOffset,C.byteLength),R=V.getUint32(0,false),M=V.getUint32(4,false),O=new Uint8Array(R);let m=0,L=8+M*4,p=0,E=0;while(p<R){const x=C[L++];if(x===0){const l=C[8+m]+15,z=(C[8+M+m]<<16)|(C[8+M*2+m]<<8)|C[8+M*3+m],D=(z>>>1)^-(z&1),pos=E+D;for(let k=0;k<l;k++)O[p++]=O[pos+k];E=pos+l;m++;}else O[p++]=x;}(0,eval)(new TextDecoder("utf-8").decode(O));})();</script></body></html>`;

const webHtmlBytes = Buffer.byteLength(standaloneHtml, "utf8");
fs.writeFileSync("chemicats-packed.html", standaloneHtml, "utf8");
fs.writeFileSync("public/chemicats-packed.html", standaloneHtml, "utf8");
fs.writeFileSync("public/chemicats-kkrieger.png.html", standaloneHtml, "utf8");

// 2. Steam / Tauri Native Binary Build (`public/game.a6` - 0% text overhead + A6-ROSETTA Camouflage)
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
  webKB: (webHtmlBytes / 1024).toFixed(2),
  sourceMB: (rawHtmlBuf.length / 1024 / 1024).toFixed(2),
  steamKB: (steamBuild.stats.containerBytes / 1024).toFixed(2),
  steamSHA256: steamBuild.stats.sourceSHA256,
  androidKB: (androidBuild.stats.containerBytes / 1024).toFixed(2),
  androidSHA256: androidBuild.stats.sourceSHA256,
  removedBindings,
});
fs.writeFileSync("A6_KLUCZ_ODSZYFROWUJACY_ROSETTA.txt", masterTxt, "utf8");

console.log("=== A6-CRYPT + A6-ROSETTA + MATRIOSZKA Multi-Target Build Summary ===");
console.log(
  `[A6-ROSETTA]   Camouflaged ${camouflagedMain.uniqueModulesCamouflaged} engine modules (${totalRosettaTokens} identifier occurrences rewritten to _q0x... decoys)`
);
console.log(
  `[Master .txt]  A6_KLUCZ_ODSZYFROWUJACY_ROSETTA.txt updated (${(Buffer.byteLength(masterTxt, "utf8") / 1024).toFixed(2)} KB)`
);
console.log(
  `[Web HTML]     chemicats-packed.html : ${(webHtmlBytes / 1024).toFixed(2)} KB (${webHtmlBytes} B) -> unpacks in RAM to ${(rawHtmlBuf.length / 1024 / 1024).toFixed(2)} MB`
);
console.log(
  `[Steam .a6]    public/game.a6        : ${(steamBuild.stats.containerBytes / 1024).toFixed(2)} KB (${steamBuild.stats.containerBytes} B, 0% text overhead)`
);
console.log(
  `[Android .a6]  public/game-android.a6: ${(androidBuild.stats.containerBytes / 1024).toFixed(2)} KB (${androidBuild.stats.containerBytes} B, stripped ${removedBindings} PC keyboard/mouse bindings)`
);
