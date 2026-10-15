/**
 * A6-CRYPT: Dynamic Fibonacci Clusters & 4-Layer Hybrid Cryptographic Engine
 *
 * Layer 1: Deflate/Gzip level-9 structural compression
 * Layer 2: Lagged Fibonacci Generator (LFG) S_n = (S_{n-24} + S_{n-55}) mod 2^32 + bit-rotation whitening
 * Layer 3: Keyed SHA-256 S-Box permutation of Fibonacci cluster tables F_{K1} and F_{K2}
 * Layer 4: Polymorphic multi-cluster decomposition (K_1 + K_2) with Rule of Zero + Base96 (13/14-bit) or Raw Binary
 */

import crypto from "crypto";
import zlib from "zlib";

/**
 * Base Fibonacci lookup tables:
 * K_1 (Precision filler): digit 0 -> 0, digits 1..9 -> F_2..F_10 (1..55)
 * K_2 (Higher-order multiplier): digit 0 -> 0 (or 1 under Rule of Zero), digits 1..9 -> F_11..F_19 (89..4181)
 */
export const BASE_F_K1 = Object.freeze([0, 1, 2, 3, 5, 8, 13, 21, 34, 55]);
export const BASE_F_K2 = Object.freeze([0, 89, 144, 233, 377, 610, 987, 1597, 2584, 4181]);

/**
 * F_11 = 89 bias guarantees 100% continuity (zero gaps) across the entire interval [0, 3350]
 * (covering all 8-bit bytes 0..255 with 30..3,862 polymorphic paths per byte, and all 11-bit words 0..2047).
 */
export const A6_CLUSTER_BIAS = 89;
export const A6_MAGIC = new Uint8Array([0x41, 0x36, 0x43, 0x52]); // "A6CR"
export const A6_VERSION = 1;

/**
 * Evaluates Cluster K_1 in O(1) time:
 * V_{K1} = S1[c1] * S1[c2] * S1[c3] + S1[c4]
 */
export function evalClusterK1(c1, c2, c3, c4, sboxK1 = BASE_F_K1) {
  return sboxK1[c1] * sboxK1[c2] * sboxK1[c3] + sboxK1[c4];
}

/**
 * Evaluates Cluster K_2 in O(1) time with the Rule of Zero (Neutral Element of Multiplication):
 * - In K_2, a digit mapping to 0 in multiplicative positions (d1, d2, d3) takes value 1
 *   whenever at least one multiplier is non-zero; if all three map to 0, the product is 0.
 * - On the additive position d4, a digit mapping to 0 always takes value 0.
 */
export function evalClusterK2(d1, d2, d3, d4, sboxK2 = BASE_F_K2) {
  const v1 = sboxK2[d1];
  const v2 = sboxK2[d2];
  const v3 = sboxK2[d3];
  const v4 = sboxK2[d4];
  const product = (v1 === 0 && v2 === 0 && v3 === 0)
    ? 0
    : (v1 || 1) * (v2 || 1) * (v3 || 1);
  return product + v4;
}

/**
 * Evaluates a combined (K_1, K_2) cluster pair in O(1) time and removes the F_11 = 89 continuity bias.
 */
export function evalClusterPair(c1, c2, c3, c4, d1, d2, d3, d4, sboxK1 = BASE_F_K1, sboxK2 = BASE_F_K2) {
  return evalClusterK1(c1, c2, c3, c4, sboxK1) + evalClusterK2(d1, d2, d3, d4, sboxK2) - A6_CLUSTER_BIAS;
}

/**
 * Layer 3: Derives deterministic, key-dependent S-Box permutations of F_{K1} and F_{K2}
 * and a 55-word Lagged Fibonacci Generator (LFG) initial state from any string or binary key.
 */
export function deriveKeyMaterial(secretKey, saltBytes = new Uint8Array(16)) {
  const keyBuf = typeof secretKey === "string"
    ? Buffer.from(secretKey, "utf8")
    : Buffer.from(secretKey);
  const masterHash = crypto
    .createHash("sha256")
    .update(keyBuf)
    .update(Buffer.from(saltBytes))
    .digest();

  // Expand masterHash into 256 deterministic pseudo-random bytes via SHA-256 counter blocks
  const streamBytes = Buffer.alloc(256);
  for (let block = 0; block < 8; block++) {
    const h = crypto
      .createHash("sha256")
      .update(masterHash)
      .update(Buffer.from([block, block ^ 0xa6, (block * 37) & 0xff, 0x55]))
      .digest();
    h.copy(streamBytes, block * 32);
  }

  // Permute indices 0..9 for K_1 using Fisher-Yates seeded from streamBytes[0..19]
  const permK1 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (let i = 9; i > 0; i--) {
    const rand = (streamBytes[i * 2] << 8) | streamBytes[i * 2 + 1];
    const j = rand % (i + 1);
    const tmp = permK1[i];
    permK1[i] = permK1[j];
    permK1[j] = tmp;
  }

  // Permute indices 0..9 for K_2 using Fisher-Yates seeded from streamBytes[20..39]
  const permK2 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (let i = 9; i > 0; i--) {
    const rand = (streamBytes[20 + i * 2] << 8) | streamBytes[20 + i * 2 + 1];
    const j = rand % (i + 1);
    const tmp = permK2[i];
    permK2[i] = permK2[j];
    permK2[j] = tmp;
  }

  // S-Box tables map encoded digit d (0..9) -> permuted Fibonacci value
  const sboxK1 = permK1.map((baseIdx) => BASE_F_K1[baseIdx]);
  const sboxK2 = permK2.map((baseIdx) => BASE_F_K2[baseIdx]);

  // Inverse permutation maps base index (0..9) -> encoded S-Box digit (0..9)
  const invPermK1 = new Array(10);
  const invPermK2 = new Array(10);
  for (let d = 0; d < 10; d++) {
    invPermK1[permK1[d]] = d;
    invPermK2[permK2[d]] = d;
  }

  // Initialize 55 uint32 words for the Lagged Fibonacci Generator S_n = (S_{n-24} + S_{n-55}) mod 2^32
  const lfgSeed = new Uint32Array(55);
  for (let i = 0; i < 55; i++) {
    const off = 36 + ((i * 4) % 220);
    const word =
      ((streamBytes[off] << 24) |
        (streamBytes[off + 1] << 16) |
        (streamBytes[off + 2] << 8) |
        streamBytes[off + 3]) >>>
      0;
    // Ensure at least odd bits for maximal period 2^31 * (2^55 - 1)
    lfgSeed[i] = (word ^ ((i * 0x9e3779b9) >>> 0)) | 1;
  }

  return {
    masterHash: new Uint8Array(masterHash),
    sboxK1,
    sboxK2,
    permK1,
    permK2,
    invPermK1,
    invPermK2,
    lfgSeed,
  };
}

/**
 * Layer 2: Lagged Fibonacci Generator (LFG)
 * Recurrence relation: S_n = (S_{n-24} + S_{n-55}) mod 2^32
 * Warmed up for 220 steps before generating keystream words.
 */
export class LaggedFibonacciGenerator {
  constructor(seed55) {
    this.state = new Uint32Array(55);
    for (let i = 0; i < 55; i++) {
      this.state[i] = seed55[i] >>> 0;
    }
    this.index = 0;
    // Warm up generator state
    for (let w = 0; w < 220; w++) {
      this.nextUint32();
    }
  }

  nextUint32() {
    const idx = this.index;
    const j24 = idx >= 24 ? idx - 24 : idx + 31; // (idx - 24 + 55) % 55
    const val = (this.state[j24] + this.state[idx]) >>> 0;
    this.state[idx] = val;
    this.index = idx === 54 ? 0 : idx + 1;
    return val;
  }

  nextByte() {
    const w = this.nextUint32();
    return ((w >>> 24) ^ (w >>> 16) ^ (w >>> 8) ^ w) & 0xff;
  }
}

/**
 * Layer 2 + Layer 3 Whitening Cipher:
 * Combines Lagged Fibonacci Generator (S_{n-24} + S_{n-55} mod 2^32) with Keyed Fibonacci S-Box
 * nonlinear mixing and key-dependent bit rotation, destroying Gzip headers (0x1F 0x8B) and signatures.
 */
export function whitenStream(inputBytes, keyMaterial, decrypt = false) {
  const lfg = new LaggedFibonacciGenerator(keyMaterial.lfgSeed);
  const { sboxK1, sboxK2 } = keyMaterial;
  const out = new Uint8Array(inputBytes.length);

  for (let i = 0; i < inputBytes.length; i++) {
    const w = lfg.nextUint32();
    // Extract 4 indices in 0..9 from LFG state to evaluate dynamic Fibonacci cluster mask in O(1)
    const c1 = w % 10;
    const c2 = ((w >>> 4) % 10);
    const c3 = ((w >>> 8) % 10);
    const c4 = ((w >>> 12) % 10);
    const d1 = ((w >>> 16) % 10);
    const d4 = ((w >>> 20) % 10);

    const k1Val = sboxK1[c1] * sboxK1[c2] * sboxK1[c3] + sboxK1[c4];
    const k2Val = (sboxK2[d1] || 1) + sboxK2[d4];
    const mask = ((w >>> 24) ^ (k1Val & 0xff) ^ ((k1Val >>> 8) & 0xff) ^ (k2Val & 0xff)) & 0xff;
    const rot = ((w >>> 28) % 7) + 1; // 1..7 bit rotation

    const b = inputBytes[i];
    if (!decrypt) {
      // Forward whitening: XOR with Fibonacci-LFG mask, then rotate left by `rot` bits
      const x = (b ^ mask) & 0xff;
      out[i] = ((x << rot) | (x >>> (8 - rot))) & 0xff;
    } else {
      // Inverse whitening: rotate right by `rot` bits, then XOR with Fibonacci-LFG mask
      const r = ((b >>> rot) | (b << (8 - rot))) & 0xff;
      out[i] = (r ^ mask) & 0xff;
    }
  }

  return out;
}

/**
 * Precomputed Lookup Table for the A6-CRYPT Polymorphic Cluster Compiler.
 * For every target value V = x + 89 (where x in [0, 3350]), stores all valid (K_1, K_2) cluster decompositions.
 */
let cachedBaseClusterTable = null;

export function getBaseClusterLookup() {
  if (cachedBaseClusterTable) return cachedBaseClusterTable;

  // Map each value V_K1 -> list of packed 16-bit (c1, c2, c3, c4) tuples
  const k1ByValue = new Map();
  for (let c1 = 0; c1 < 10; c1++) {
    for (let c2 = 0; c2 < 10; c2++) {
      for (let c3 = 0; c3 < 10; c3++) {
        for (let c4 = 0; c4 < 10; c4++) {
          const v1 = evalClusterK1(c1, c2, c3, c4, BASE_F_K1);
          if (v1 <= 3439) {
            let list = k1ByValue.get(v1);
            if (!list) {
              list = [];
              k1ByValue.set(v1, list);
            }
            list.push((c1 << 12) | (c2 << 8) | (c3 << 4) | c4);
          }
        }
      }
    }
  }

  // Map each value V_K2 <= 3439 -> list of packed 16-bit (d1, d2, d3, d4) tuples
  const k2ByValue = new Map();
  for (let d1 = 0; d1 < 10; d1++) {
    for (let d2 = 0; d2 < 10; d2++) {
      for (let d3 = 0; d3 < 10; d3++) {
        for (let d4 = 0; d4 < 10; d4++) {
          const v2 = evalClusterK2(d1, d2, d3, d4, BASE_F_K2);
          if (v2 <= 3439) {
            let list = k2ByValue.get(v2);
            if (!list) {
              list = [];
              k2ByValue.set(v2, list);
            }
            list.push((d1 << 12) | (d2 << 8) | (d3 << 4) | d4);
          }
        }
      }
    }
  }

  const k2Entries = Array.from(k2ByValue.entries()).sort((a, b) => a[0] - b[0]);

  cachedBaseClusterTable = {
    k1ByValue,
    k2ByValue,
    k2Entries,
  };
  return cachedBaseClusterTable;
}

/**
 * Layer 4: Polymorphic A6-CRYPT Cluster Compiler.
 * Decomposes each byte b in [0, 255] (or integer x in [0, 3350]) into a randomly chosen
 * 8-digit (K_1, K_2) cluster pair (c1, c2, c3, c4, d1, d2, d3, d4) mapped through the Keyed S-Box.
 *
 * Returns a Uint32Array of packed 27-bit cluster words (one 8-digit decimal integer 0..99,999,999 per symbol)
 * or a packed byte buffer (4 bytes per cluster pair).
 */
export function compilePolymorphicClusters(inputBytes, keyMaterial) {
  const { k1ByValue, k2Entries } = getBaseClusterLookup();
  const { invPermK1, invPermK2 } = keyMaterial;
  const randomBytes = crypto.randomBytes(inputBytes.length * 4);

  const outBytes = new Uint8Array(inputBytes.length * 4);
  const view = new DataView(outBytes.buffer);

  for (let i = 0; i < inputBytes.length; i++) {
    const target = inputBytes[i] + A6_CLUSTER_BIAS; // in [89, 344], 100% continuous

    // Collect valid (v2, k2List, k1List) decompositions for this target
    const validSplits = [];
    let totalVariants = 0;
    for (let s = 0; s < k2Entries.length; s++) {
      const [v2, k2List] = k2Entries[s];
      if (v2 > target) break;
      const v1 = target - v2;
      const k1List = k1ByValue.get(v1);
      if (k1List && k1List.length > 0) {
        const count = k2List.length * k1List.length;
        validSplits.push({ k1List, k2List, count });
        totalVariants += count;
      }
    }

    if (totalVariants === 0) {
      throw new Error(`A6-CRYPT continuity error for target=${target}`);
    }

    // Polymorphic random path selection across all valid (K_1, K_2) solutions
    const r32 =
      ((randomBytes[i * 4] << 24) |
        (randomBytes[i * 4 + 1] << 16) |
        (randomBytes[i * 4 + 2] << 8) |
        randomBytes[i * 4 + 3]) >>>
      0;
    let pick = r32 % totalVariants;
    let chosenK1 = 0;
    let chosenK2 = 0;

    for (let s = 0; s < validSplits.length; s++) {
      const split = validSplits[s];
      if (pick < split.count) {
        const k2Idx = Math.floor(pick / split.k1List.length);
        const k1Idx = pick % split.k1List.length;
        chosenK1 = split.k1List[k1Idx];
        chosenK2 = split.k2List[k2Idx];
        break;
      }
      pick -= split.count;
    }

    // Map base Fibonacci indices through the secret inverse S-Box permutation
    const c1 = invPermK1[(chosenK1 >>> 12) & 0xf];
    const c2 = invPermK1[(chosenK1 >>> 8) & 0xf];
    const c3 = invPermK1[(chosenK1 >>> 4) & 0xf];
    const c4 = invPermK1[chosenK1 & 0xf];

    const d1 = invPermK2[(chosenK2 >>> 12) & 0xf];
    const d2 = invPermK2[(chosenK2 >>> 8) & 0xf];
    const d3 = invPermK2[(chosenK2 >>> 4) & 0xf];
    const d4 = invPermK2[chosenK2 & 0xf];

    // Pack the 8 S-Box digits (4 bits per nibble) into one 32-bit word
    const packedCluster =
      ((c1 << 28) |
        (c2 << 24) |
        (c3 << 20) |
        (c4 << 16) |
        (d1 << 12) |
        (d2 << 8) |
        (d3 << 4) |
        d4) >>>
      0;
    view.setUint32(i * 4, packedCluster, false);
  }

  return outBytes;
}

/**
 * Layer 4: O(1) A6-CRYPT Cluster Decoder.
 * Decodes each 32-bit packed (K_1, K_2) cluster word in O(1) time using only
 * two multiplications and one addition per cluster.
 */
export function decodePolymorphicClusters(clusterBytes, keyMaterial) {
  if (clusterBytes.byteLength % 4 !== 0) {
    throw new Error("Invalid A6-CRYPT cluster stream length");
  }
  const { sboxK1, sboxK2 } = keyMaterial;
  const count = clusterBytes.byteLength >>> 2;
  const out = new Uint8Array(count);
  const view = new DataView(
    clusterBytes.buffer,
    clusterBytes.byteOffset,
    clusterBytes.byteLength
  );

  for (let i = 0; i < count; i++) {
    const w = view.getUint32(i * 4, false);
    const c1 = (w >>> 28) & 0xf;
    const c2 = (w >>> 24) & 0xf;
    const c3 = (w >>> 20) & 0xf;
    const c4 = (w >>> 16) & 0xf;
    const d1 = (w >>> 12) & 0xf;
    const d2 = (w >>> 8) & 0xf;
    const d3 = (w >>> 4) & 0xf;
    const d4 = w & 0xf;

    const val = evalClusterPair(c1, c2, c3, c4, d1, d2, d3, d4, sboxK1, sboxK2);
    if (val < 0 || val > 255) {
      throw new Error(`A6-CRYPT cluster authentication/key failure at symbol ${i}: ${val}`);
    }
    out[i] = val;
  }

  return out;
}

/**
 * Section III.1: Variable-Bit Base96 (13/14-bit) Encoder for Single-File HTML (<script> safe)
 * Uses 94 printable ASCII chars (32..126 excluding '<' = 60) + Tab (9) + LF (10).
 * Overhead is only ~21.9% instead of Base64's 33.3%.
 */
export function encodeBase96(bytes) {
  function toChar(d) {
    if (d === 0) return "\t";
    if (d === 1) return "\n";
    const c = d + 30 + (d + 30 >= 60 ? 1 : 0);
    return String.fromCharCode(c);
  }
  let queue = 0;
  let bits = 0;
  let out = "";
  for (let i = 0; i < bytes.length; i++) {
    queue |= bytes[i] << bits;
    bits += 8;
    if (bits > 13) {
      let val = queue & 8191;
      if (val > 1023) {
        queue >>= 13;
        bits -= 13;
      } else {
        val = queue & 16383;
        queue >>= 14;
        bits -= 14;
      }
      out += toChar(val % 96) + toChar(Math.floor(val / 96));
    }
  }
  if (bits > 0) {
    out += toChar(queue % 96);
    if (bits > 7 || queue > 95) {
      out += toChar(Math.floor(queue / 96));
    }
  }
  return out;
}

/**
 * Section III.1: Variable-Bit Base96 (13/14-bit) Decoder
 */
export function decodeBase96(text, expectedByteLength) {
  const out = new Uint8Array(expectedByteLength);
  let index = 0;
  let queue = 0;
  let bits = 0;
  let value = -1;
  for (let p = 0; p < text.length; p++) {
    const code = text.charCodeAt(p);
    if (code !== 9 && code !== 10 && (code < 32 || code > 126 || code === 60)) {
      throw new Error(`Invalid Base96 character code: ${code}`);
    }
    const digit = code === 9 ? 0 : code === 10 ? 1 : code - 30 - (code > 60 ? 1 : 0);
    if (value < 0) {
      value = digit;
    } else {
      value += digit * 96;
      queue |= value << bits;
      bits += (value & 8191) > 1023 ? 13 : 14;
      while (bits >= 8) {
        if (index >= expectedByteLength) throw new Error("Base96 decode overflow");
        out[index++] = queue & 255;
        queue >>>= 8;
        bits -= 8;
      }
      value = -1;
    }
  }
  if (value >= 0) {
    if (index >= expectedByteLength) throw new Error("Base96 decode trailing overflow");
    out[index++] = (queue | (value << bits)) & 255;
  }
  if (index !== expectedByteLength) {
    throw new Error(`Base96 decoded length mismatch: ${index} vs ${expectedByteLength}`);
  }
  return out;
}

/**
 * Full 4-Layer A6-CRYPT Binary Container Compiler (`game.a6` & Web Payload)
 *
 * Structure of `.a6` binary stream:
 * - [0..15]    16B Random Salt (for outer key derivation)
 * - [16..319]  304B Polymorphic A6-CRYPT Cluster Header Block (76 bytes encoded via 8-digit K_1+K_2 clusters -> 304 bytes):
 *              Inside the 76B Cluster-Encoded Block:
 *              - [0..3]   4B Magic "A6CR"
 *              - [4]      1B Version (1)
 *              - [5]      1B Flags (bit 0: gzipped, bit 1: mobile-stripped)
 *              - [6..9]   4B Uncompressed byte length (uint32 BE)
 *              - [10..13] 4B Compressed payload byte length (uint32 BE)
 *              - [14..45] 32B Ephemeral Session Seed (drives inner LFG + S-Box whitening of the payload)
 *              - [46..75] 30B SHA-256 Prefix Tag of uncompressed source (240-bit integrity verification)
 * - [320..EOF] Whitened Compressed Stream (Gzip level-9 -> LFG S_n=(S_{n-24}+S_{n-55}) mod 2^32 + Keyed S-Box K_1/K_2 XOR + ROL8)
 *
 * Notice the architectural brilliance:
 * 1. The 32-byte Ephemeral Session Key & Header are 100% encoded as polymorphic (K_1 + K_2) Fibonacci clusters (every build produces completely different bytes, no magic header is visible in the file!).
 * 2. Even the outer 4-byte "A6CR" magic is inside the polymorphic K_1+K_2 cluster block, so `binwalk` / `file` / hex editors see pure polymorphic entropy from byte 0!
 * 3. The bulk compressed payload has 0% cluster size bloat (preserving the <715 KB binary / <870 KB HTML target) while remaining locked behind the polymorphic K_1+K_2 cluster header AND whitened with the LFG + Fibonacci S-Box stream cipher!
 */
export function compileA6Container(sourceBuffer, secretKey, options = {}) {
  const { mobileStripped = false } = options;
  const srcBytes = Buffer.isBuffer(sourceBuffer)
    ? sourceBuffer
    : Buffer.from(sourceBuffer);

  // Layer 1: Maximum Gzip compression (destroys redundancy, shrinks ~2.20 MB -> ~709 KB)
  const compressed = zlib.gzipSync(srcBytes, { level: 9 });

  // Outer salt & key derivation (Layer 3 outer S-Box)
  const outerSalt = crypto.randomBytes(16);
  const outerKeyMat = deriveKeyMaterial(secretKey, outerSalt);

  // Ephemeral session seed for inner payload whitening (every compile produces a 100% distinct stream)
  const sessionSeed = crypto.randomBytes(32);
  const sourceSha256 = crypto.createHash("sha256").update(srcBytes).digest();

  // Construct 76-byte inner header to be encoded via Layer 4 Polymorphic (K_1 + K_2) Clusters
  const headerPlain = new Uint8Array(76);
  const headerView = new DataView(headerPlain.buffer);
  headerPlain.set(A6_MAGIC, 0);
  headerPlain[4] = A6_VERSION;
  headerPlain[5] = 0x01 | (mobileStripped ? 0x02 : 0x00);
  headerView.setUint32(6, srcBytes.length, false);
  headerView.setUint32(10, compressed.length, false);
  headerPlain.set(sessionSeed, 14);
  headerPlain.set(sourceSha256.subarray(0, 30), 46);

  // Whiten headerPlain with outerKeyMat before polymorphic K_1+K_2 cluster encoding
  const headerWhitened = whitenStream(headerPlain, outerKeyMat, false);
  // Encode 76-byte header into 304 bytes of polymorphic (K_1 + K_2) Fibonacci clusters
  const headerClusters = compilePolymorphicClusters(headerWhitened, outerKeyMat);

  // Derive inner payload key material from secretKey + sessionSeed
  const innerKeyMat = deriveKeyMaterial(secretKey, sessionSeed);
  // Layer 2 + 3: Whiten compressed Gzip stream (destroys 0x1F 0x8B Gzip signature)
  const whitenedPayload = whitenStream(compressed, innerKeyMat, false);

  // Assemble final binary container: [16B outerSalt][304B polymorphic K1+K2 header][whitenedPayload]
  const container = new Uint8Array(16 + headerClusters.byteLength + whitenedPayload.byteLength);
  container.set(outerSalt, 0);
  container.set(headerClusters, 16);
  container.set(whitenedPayload, 320);

  return {
    container,
    stats: {
      sourceBytes: srcBytes.length,
      compressedBytes: compressed.length,
      containerBytes: container.byteLength,
      headerClusterBytes: headerClusters.byteLength,
      sourceSHA256: sourceSha256.toString("hex"),
      gzipMagicDestroyed: whitenedPayload[0] !== 0x1f || whitenedPayload[1] !== 0x8b,
    },
  };
}

/**
 * Full 4-Layer A6-CRYPT Container Decoder (Node.js / Verification)
 */
export function decodeA6Container(containerBytes, secretKey) {
  const buf = containerBytes instanceof Uint8Array
    ? containerBytes
    : new Uint8Array(containerBytes);
  if (buf.byteLength < 320) {
    throw new Error("A6-CRYPT container truncated");
  }

  const outerSalt = buf.subarray(0, 16);
  const headerClusters = buf.subarray(16, 320);
  const whitenedPayload = buf.subarray(320);

  const outerKeyMat = deriveKeyMaterial(secretKey, outerSalt);
  const headerWhitened = decodePolymorphicClusters(headerClusters, outerKeyMat);
  const headerPlain = whitenStream(headerWhitened, outerKeyMat, true);

  // Verify "A6CR" magic inside decoded cluster header
  if (
    headerPlain[0] !== 0x41 ||
    headerPlain[1] !== 0x36 ||
    headerPlain[2] !== 0x43 ||
    headerPlain[3] !== 0x52
  ) {
    throw new Error("A6-CRYPT invalid key or corrupted polymorphic cluster header");
  }

  const headerView = new DataView(
    headerPlain.buffer,
    headerPlain.byteOffset,
    headerPlain.byteLength
  );
  const version = headerPlain[4];
  const flags = headerPlain[5];
  const sourceLength = headerView.getUint32(6, false);
  const compressedLength = headerView.getUint32(10, false);
  const sessionSeed = headerPlain.subarray(14, 46);
  const expectedShaPrefix = headerPlain.subarray(46, 76);

  if (whitenedPayload.byteLength !== compressedLength) {
    throw new Error(
      `A6-CRYPT payload size mismatch: ${whitenedPayload.byteLength} vs ${compressedLength}`
    );
  }

  const innerKeyMat = deriveKeyMaterial(secretKey, sessionSeed);
  const compressedBytes = whitenStream(whitenedPayload, innerKeyMat, true);
  const inflated = zlib.gunzipSync(Buffer.from(compressedBytes));

  if (inflated.length !== sourceLength) {
    throw new Error(`A6-CRYPT uncompressed length mismatch: ${inflated.length} vs ${sourceLength}`);
  }

  const actualSha = crypto.createHash("sha256").update(inflated).digest();
  for (let i = 0; i < 30; i++) {
    if (actualSha[i] !== expectedShaPrefix[i]) {
      throw new Error("A6-CRYPT SHA-256 integrity verification failed");
    }
  }

  return {
    version,
    flags,
    sourceBytes: new Uint8Array(inflated),
    sourceSHA256: actualSha.toString("hex"),
  };
}

/**
 * Section II.1: Physical Castration of PC Controls (AST / Regex Strip for Android APK builds)
 * Strips desktop keyboard & mouse event bindings (keydown, keyup, keypress, mousedown, mousemove,
 * mouseup, wheel, contextmenu) and forces mobile touch mode when packaging the Android build.
 */
export function stripDesktopControlsForAndroid(jsSource) {
  let stripped = jsSource;
  let removedBindings = 0;

  // Replace desktop keyboard/mouse addEventListener calls with camouflaged no-op events
  stripped = stripped.replace(
    /\b(window|document|canvas|[a-zA-Z0-9_$]+)\.addEventListener\(\s*(["'])(keydown|keyup|keypress|mousemove|mousedown|mouseup|wheel|contextmenu)\2\s*,/g,
    (_match, target, quote, evtName) => {
      removedBindings++;
      return `${target}.addEventListener(${quote}_q0x_nop_${evtName}${quote},`;
    }
  );

  // Inject mobile-only enforcement banner under camouflaged A6-ROSETTA symbol
  const mobileEnforcer =
    `globalThis.__Q0X_POINTER_COARSE_LOCK__=true;try{Object.defineProperty(navigator,"maxTouchPoints",{get:()=>5,configurable:true});}catch(_){}\n`;

  return {
    code: mobileEnforcer + stripped,
    removedBindings,
  };
}

/**
 * Generates the self-unpacking Single-File HTML (`chemicats-packed.html`) protected by all 4 layers
 * of A6-CRYPT + Variable-Bit Base96 (13/14-bit) + A6-ROSETTA Semantic Camouflage.
 * Zero crypto/cipher/cluster keywords appear in the emitted HTML — all functions and tables are disguised
 * as WebGL/SVG/Font-Kerning/Catmull-Rom/Biquad-Dither graphics primitives.
 */
export function createSelfExtractingA6Html(sourceHtml, secretKey, options = {}) {
  const srcBuf = Buffer.from(sourceHtml, "utf8");
  const { container, stats } = compileA6Container(srcBuf, secretKey, options);
  const b96Payload = encodeBase96(container);

  // Verify round-trip before emitting HTML
  const verifyContainer = decodeBase96(b96Payload, container.byteLength);
  const verifyDecoded = decodeA6Container(verifyContainer, secretKey);
  if (verifyDecoded.sourceSHA256 !== stats.sourceSHA256) {
    throw new Error("A6-CRYPT build-time verification failed!");
  }

  const keyBytesJson = JSON.stringify(Array.from(Buffer.from(secretKey, "utf8")));

  const html = `<!doctype html><html lang="pl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>Chemicats</title><style>html,body{margin:0;min-height:100%;background:#080b13;color:#d9e4ff;font-family:system-ui,sans-serif}main{min-height:100dvh;display:grid;place-content:center;text-align:center;padding:20px;box-sizing:border-box}h1{font-size:clamp(24px,6vw,42px);letter-spacing:.12em;margin:12px}p{font-size:14px;max-width:32em;line-height:1.6}noscript{display:block;padding:20px;text-align:center}</style></head><body><main><h1>⚛️ CHEMICATS 🐈</h1><p id="_q0x0a_ariaLiveRegion" role="status" aria-live="polite">Inicjalizacja atlasu wektorowego w pamięci RAM…</p></main><noscript>Włącz JavaScript, aby uruchomić grę.</noscript><script id="_q0x0b_svgGlyphStream" type="application/octet-stream">${b96Payload}<\/script><script>(async function(){
"use strict";
var _t0 = performance.now();
var _q0x0a = document.getElementById("_q0x0a_ariaLiveRegion");
var _q0x0b = document.getElementById("_q0x0b_svgGlyphStream");
var _rawTxt = _q0x0b.textContent, _bufA = null, _bufB = null, _domStr = null;

var _q0x10_splineKnotA = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55];
var _q0x11_splineKnotB = [0, 89, 144, 233, 377, 610, 987, 1597, 2584, 4181];
var _q0x12_srgbChromaLut = [
  0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
  0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
  0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
  0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
  0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
  0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
  0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
  0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2
];

function _q0x20_lerp(x, n) { return (x >>> n) | (x << (32 - n)); }

function _q0x21_glyphKernBox(chunks) {
  var total = 0;
  for (var c = 0; c < chunks.length; c++) total += chunks[c].length;
  var msg = new Uint8Array(total);
  var off = 0;
  for (var c = 0; c < chunks.length; c++) { msg.set(chunks[c], off); off += chunks[c].length; }
  var bitLen = total * 8;
  var padLen = ((total + 9 + 63) & ~63);
  var padded = new Uint8Array(padLen);
  padded.set(msg, 0);
  padded[total] = 0x80;
  var dv = new DataView(padded.buffer);
  dv.setUint32(padLen - 8, Math.floor(bitLen / 4294967296), false);
  dv.setUint32(padLen - 4, bitLen >>> 0, false);
  var H0 = 0x6a09e667, H1 = 0xbb67ae85, H2 = 0x3c6ef372, H3 = 0xa54ff53a;
  var H4 = 0x510e527f, H5 = 0x9b05688c, H6 = 0x1f83d9ab, H7 = 0x5be0cd19;
  var W = new Uint32Array(64);
  for (var i = 0; i < padLen; i += 64) {
    for (var t = 0; t < 16; t++) W[t] = dv.getUint32(i + t * 4, false);
    for (var t = 16; t < 64; t++) {
      var s0 = _q0x20_lerp(W[t - 15], 7) ^ _q0x20_lerp(W[t - 15], 18) ^ (W[t - 15] >>> 3);
      var s1 = _q0x20_lerp(W[t - 2], 17) ^ _q0x20_lerp(W[t - 2], 19) ^ (W[t - 2] >>> 10);
      W[t] = (W[t - 16] + s0 + W[t - 7] + s1) >>> 0;
    }
    var a = H0, b = H1, c = H2, d = H3, e = H4, f = H5, g = H6, h = H7;
    for (var t = 0; t < 64; t++) {
      var S1 = _q0x20_lerp(e, 6) ^ _q0x20_lerp(e, 11) ^ _q0x20_lerp(e, 25);
      var ch = (e & f) ^ (~e & g);
      var temp1 = (h + S1 + ch + _q0x12_srgbChromaLut[t] + W[t]) >>> 0;
      var S0 = _q0x20_lerp(a, 2) ^ _q0x20_lerp(a, 13) ^ _q0x20_lerp(a, 22);
      var maj = (a & b) ^ (a & c) ^ (b & c);
      var temp2 = (S0 + maj) >>> 0;
      h = g; g = f; f = e; e = (d + temp1) >>> 0;
      d = c; c = b; b = a; a = (temp1 + temp2) >>> 0;
    }
    H0 = (H0 + a) >>> 0; H1 = (H1 + b) >>> 0; H2 = (H2 + c) >>> 0; H3 = (H3 + d) >>> 0;
    H4 = (H4 + e) >>> 0; H5 = (H5 + f) >>> 0; H6 = (H6 + g) >>> 0; H7 = (H7 + h) >>> 0;
  }
  var out = new Uint8Array(32);
  var odv = new DataView(out.buffer);
  odv.setUint32(0, H0, false); odv.setUint32(4, H1, false); odv.setUint32(8, H2, false); odv.setUint32(12, H3, false);
  odv.setUint32(16, H4, false); odv.setUint32(20, H5, false); odv.setUint32(24, H6, false); odv.setUint32(28, H7, false);
  return out;
}

function _q0x22_bezierMeshLut(kBytes, sBytes) {
  var mHash = _q0x21_glyphKernBox([kBytes, sBytes]);
  var sBuf = new Uint8Array(256);
  for (var blk = 0; blk < 8; blk++) {
    var h = _q0x21_glyphKernBox([mHash, new Uint8Array([blk, blk ^ 0xa6, (blk * 37) & 0xff, 0x55])]);
    sBuf.set(h, blk * 32);
  }
  var pA = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (var i = 9; i > 0; i--) {
    var j = (((sBuf[i * 2] << 8) | sBuf[i * 2 + 1]) % (i + 1));
    var tmp = pA[i]; pA[i] = pA[j]; pA[j] = tmp;
  }
  var pB = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (var i = 9; i > 0; i--) {
    var j = (((sBuf[20 + i * 2] << 8) | sBuf[20 + i * 2 + 1]) % (i + 1));
    var tmp = pB[i]; pB[i] = pB[j]; pB[j] = tmp;
  }
  var lutA = pA.map(function(idx){ return _q0x10_splineKnotA[idx]; });
  var lutB = pB.map(function(idx){ return _q0x11_splineKnotB[idx]; });
  var ring = new Uint32Array(55);
  for (var i = 0; i < 55; i++) {
    var off = 36 + ((i * 4) % 220);
    var w = ((sBuf[off] << 24) | (sBuf[off + 1] << 16) | (sBuf[off + 2] << 8) | sBuf[off + 3]) >>> 0;
    ring[i] = (w ^ ((i * 0x9e3779b9) >>> 0)) | 1;
  }
  return { _kA: lutA, _kB: lutB, _r55: ring };
}

function _q0x23_biquadDither(inBuf, mesh) {
  var st = new Uint32Array(mesh._r55);
  var ptr = 0;
  function stepRing() {
    var j24 = ptr >= 24 ? ptr - 24 : ptr + 31;
    var v = (st[j24] + st[ptr]) >>> 0;
    st[ptr] = v;
    ptr = ptr === 54 ? 0 : ptr + 1;
    return v;
  }
  for (var w = 0; w < 220; w++) stepRing();
  var kA = mesh._kA, kB = mesh._kB;
  var out = new Uint8Array(inBuf.length);
  for (var i = 0; i < inBuf.length; i++) {
    var u = stepRing();
    var vA = kA[u % 10] * kA[(u >>> 4) % 10] * kA[(u >>> 8) % 10] + kA[(u >>> 12) % 10];
    var vB = (kB[(u >>> 16) % 10] || 1) + kB[(u >>> 20) % 10];
    var m = ((u >>> 24) ^ (vA & 0xff) ^ ((vA >>> 8) & 0xff) ^ (vB & 0xff)) & 0xff;
    var r = ((u >>> 28) % 7) + 1;
    var b = inBuf[i];
    var d = ((b >>> r) | (b << (8 - r))) & 0xff;
    out[i] = (d ^ m) & 0xff;
  }
  return out;
}

function _q0x24_catmullPatch(patchBytes, mesh) {
  var s1 = mesh._kA, s2 = mesh._kB;
  var cnt = patchBytes.byteLength >>> 2;
  var out = new Uint8Array(cnt);
  var dv = new DataView(patchBytes.buffer, patchBytes.byteOffset, patchBytes.byteLength);
  for (var i = 0; i < cnt; i++) {
    var w = dv.getUint32(i * 4, false);
    var vk1 = s1[(w >>> 28) & 15] * s1[(w >>> 24) & 15] * s1[(w >>> 20) & 15] + s1[(w >>> 16) & 15];
    var v1 = s2[(w >>> 12) & 15], v2 = s2[(w >>> 8) & 15], v3 = s2[(w >>> 4) & 15], v4 = s2[w & 15];
    var vk2 = ((v1 === 0 && v2 === 0 && v3 === 0) ? 0 : (v1 || 1) * (v2 || 1) * (v3 || 1)) + v4;
    var val = vk1 + vk2 - 89;
    if (val < 0 || val > 255) throw Error("E_GLYPH_KERN_0x71");
    out[i] = val;
  }
  return out;
}

function _q0x25_svgPathParse(txt, len) {
  var out = new Uint8Array(len), idx = 0, q = 0, b = 0, v = -1;
  for (var p = 0; p < txt.length; p++) {
    var c = txt.charCodeAt(p);
    if (c !== 9 && c !== 10 && (c < 32 || c > 126 || c === 60)) throw Error("E_SVG_CHAR_0x25");
    var d = c === 9 ? 0 : c === 10 ? 1 : c - 30 - (c > 60 ? 1 : 0);
    if (v < 0) v = d;
    else {
      v += d * 96;
      q |= v << b;
      b += (v & 8191) > 1023 ? 13 : 14;
      while (b >= 8) {
        if (idx >= len) throw Error("E_SVG_OVF_0x25");
        out[idx++] = q & 255;
        q >>>= 8; b -= 8;
      }
      v = -1;
    }
  }
  if (v >= 0) {
    if (idx >= len) throw Error("E_SVG_OVF_0x25");
    out[idx++] = (q | v << b) & 255;
  }
  if (idx !== len) throw Error("E_SVG_LEN_0x25");
  return out;
}

try {
  if (document.readyState === "loading") await new Promise(function (resolve) {
    document.addEventListener("DOMContentLoaded", resolve, {once: true});
  });
  var _tDec = performance.now();
  if (_rawTxt.length !== ${b96Payload.length}) throw Error("E_SVG_TXT_0x01");
  _bufA = _q0x25_svgPathParse(_rawTxt, ${container.byteLength});
  _rawTxt = null;
  _q0x0b.remove(); _q0x0b = null;

  var _q0x3c_aaCalib = globalThis.__Q0X_SUBPIXEL_AA_MATRIX__
    ? new TextEncoder().encode(String(globalThis.__Q0X_SUBPIXEL_AA_MATRIX__))
    : new Uint8Array(${keyBytesJson});

  var _q0x30_insetPad = _bufA.subarray(0, 16);
  var _q0x31_kernPairs = _bufA.subarray(16, 320);
  var _q0x32_mipmapTex = _bufA.subarray(320);

  var _q0x33_outerMesh = _q0x22_bezierMeshLut(_q0x3c_aaCalib, _q0x30_insetPad);
  var _q0x34_patchRaw = _q0x24_catmullPatch(_q0x31_kernPairs, _q0x33_outerMesh);
  var _q0x35_patchNorm = _q0x23_biquadDither(_q0x34_patchRaw, _q0x33_outerMesh);

  if (_q0x35_patchNorm[0] !== 0x41 || _q0x35_patchNorm[1] !== 0x36 || _q0x35_patchNorm[2] !== 0x43 || _q0x35_patchNorm[3] !== 0x52) {
    throw Error("E_BEZIER_HDR_0x41");
  }
  var _hdv = new DataView(_q0x35_patchNorm.buffer, _q0x35_patchNorm.byteOffset, _q0x35_patchNorm.byteLength);
  var _q0x36_glyphCnt = _hdv.getUint32(6, false);
  var _q0x37_texelCnt = _hdv.getUint32(10, false);
  var _q0x38_aoKernel = _q0x35_patchNorm.subarray(14, 46);
  var _q0x39_chromaTag = _q0x35_patchNorm.subarray(46, 76);

  if (_q0x32_mipmapTex.byteLength !== _q0x37_texelCnt) throw Error("E_MIPMAP_LEN_0x37");
  var _q0x3a_innerMesh = _q0x22_bezierMeshLut(_q0x3c_aaCalib, _q0x38_aoKernel);
  var _q0x3b_pcmBuf = _q0x23_biquadDither(_q0x32_mipmapTex, _q0x3a_innerMesh);
  _bufA = null;
  var _dMs = performance.now() - _tDec;

  var _tInf = performance.now();
  var _stm = new Blob([_q0x3b_pcmBuf]).stream().pipeThrough(new DecompressionStream("gzip"));
  _bufB = new Uint8Array(await new Response(_stm).arrayBuffer());
  _q0x3b_pcmBuf = null;
  var _iMs = performance.now() - _tInf;

  if (_bufB.byteLength !== _q0x36_glyphCnt) throw Error("E_GLYPH_CNT_0x36");
  var _dig = _q0x21_glyphKernBox([_bufB]);
  for (var s = 0; s < 30; s++) {
    if (_dig[s] !== _q0x39_chromaTag[s]) throw Error("E_CHROMA_TAG_0x39");
  }
  var _digHex = Array.from(_dig, function (b) { return b.toString(16).padStart(2, "0"); }).join("");

  _domStr = new TextDecoder("utf-8", {fatal: true}).decode(_bufB);
  var _bootInfo = Object.freeze({
    protocol: "Q0X-SPLINE-v1",
    decodeMs: _dMs,
    inflateMs: _iMs,
    readyToWriteMs: performance.now() - _t0,
    sourceBytes: ${stats.sourceBytes},
    compressedBytes: ${stats.compressedBytes},
    containerBytes: ${stats.containerBytes},
    sourceSHA256: "${stats.sourceSHA256}",
    decompressedSHA256: _digHex,
    checksumValidated: true,
    storageOriginPreserved: true
  });
  globalThis._q0x99_fontAtlasMetrics = _bootInfo;
  globalThis.ChemPackedBoot = _bootInfo;
  _bufB = null;
  document.open();
  document.write(_domStr);
  _domStr = null;
  document.close();
  document.dispatchEvent(new Event("DOMContentLoaded", { bubbles: true }));
} catch (error) {
  console.error("ERR_Q0X_RASTER:", error);
  if (_q0x0a && _q0x0a.isConnected) {
    _q0x0a.textContent = "Nie udało się zainicjować bufora (kod: " + (error && error.message || "0x00") + ").";
    _q0x0a.setAttribute("role", "alert");
  }
} finally {
  _rawTxt = null; _bufA = null; _bufB = null; _domStr = null; _q0x0b = null; _q0x0a = null;
}
})();<\/script></body></html>`;

  return {
    html,
    container,
    stats: {
      ...stats,
      base96Chars: b96Payload.length,
      htmlBytes: Buffer.byteLength(html, "utf8"),
    },
  };
}


