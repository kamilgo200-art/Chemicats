// Steam Native Container (Tauri / Rust) — A6-CRYPT v2 Hybrid + A6-ROSETTA Camouflaged Bridge
//
// Security upgrades against reverse engineering (WebView2 CDP debugging / Goldberg Emu / Ghidra):
// 1. WebView2 Env & Argument Sanitizer (`q0x00_scrub_raster_env`): immediately purges
//    `WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS` and `WEBVIEW2_PIPE_FOR_DEVTOOLS` before spawning
//    `msedgewebview2.exe`, blocking the `--remote-debugging-port=9222` attack vector.
// 2. Anti-Goldberg `steam_api64.dll` Binary Hash Binding (`q0x3c_build_aa_matrix`): mixes the
//    physical SHA-256 of `steam_api64.dll` into the A6-CRYPT S-Box key (branchless key poisoning:
//    swapping `steam_api64.dll` with Goldberg Emu corrupts the Fibonacci S-Box without an `if` branch).
// 3. A6-CRYPT v2 Hybrid: 352B Polymorphic Fibonacci Clusters (K_1 + K_2 with Rule of Zero) unwrap
//    the 256-bit ephemeral key + 96-bit IV for hardware AES-NI `aes-256-gcm` decryption.

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use aes_gcm::{
    aead::{Aead, KeyInit},
    Aes256Gcm, Nonce,
};
use flate2::read::GzDecoder;
use sha2::{Digest, Sha256};
use std::io::Read;

const Q0X_APP_ID: u32 = 3184920;
const Q0X10_SPLINE_KNOT_A: [u32; 10] = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55];
const Q0X11_SPLINE_KNOT_B: [u32; 10] = [0, 89, 144, 233, 377, 610, 987, 1597, 2584, 4181];
const Q0X_TANGENT_BIAS: i32 = 89;

// Expected SHA-256 prefix of official Valve steam_api64.dll for this build
const Q0X_VALVE_DLL_TAG: [u8; 4] = [0x8f, 0x42, 0xc9, 0x17];

// Embedded binary payload (0% Base96 overhead)
const Q0X0B_SVG_GLYPH_STREAM: &[u8] = include_bytes!("../../../public/game.a6");

struct Q0xMeshLut {
    m_hash: [u8; 32],
    k_a: [u32; 10],
    k_b: [u32; 10],
    r_55: [u32; 55],
}

/// Scrubs WebView2 remote debugging environment variables BEFORE Tauri/WebView2 initializes
/// and returns a branchless drift byte (0x00 if clean, non-zero if debugging flags were injected).
pub fn q0x00_scrub_raster_env() -> u8 {
    let mut drift: u8 = 0;

    for var_name in [
        "WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS",
        "WEBVIEW2_PIPE_FOR_DEVTOOLS",
        "WEBVIEW2_BROWSER_EXECUTABLE_FOLDER",
    ] {
        if let Ok(val) = std::env::var(var_name) {
            let lower = val.to_ascii_lowercase();
            if lower.contains("remote-debugging")
                || lower.contains("inspect")
                || lower.contains("devtools")
            {
                drift |= 0x5a;
            }
            std::env::remove_var(var_name);
        }
    }

    // Lock WebView2 arguments to explicitly disable DevTools protocol pipes
    std::env::set_var(
        "WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS",
        "--disable-dev-tools --disable-features=msWebOOUI,msPdfOOUI",
    );

    for arg in std::env::args() {
        let lower = arg.to_ascii_lowercase();
        if lower.contains("remote-debugging") || lower.contains("--inspect") {
            drift |= 0xa6;
        }
    }

    drift
}

fn q0x21_glyph_kern_box(a: &[u8], b: &[u8]) -> [u8; 32] {
    let mut hasher = Sha256::new();
    hasher.update(a);
    hasher.update(b);
    hasher.finalize().into()
}

fn q0x22_bezier_mesh_lut(k_bytes: &[u8], s_bytes: &[u8]) -> Q0xMeshLut {
    let m_hash = q0x21_glyph_kern_box(k_bytes, s_bytes);
    let mut s_buf = [0u8; 256];
    for blk in 0..8u8 {
        let counter = [blk, blk ^ 0xa6, blk.wrapping_mul(37), 0x55];
        let h = q0x21_glyph_kern_box(&m_hash, &counter);
        s_buf[(blk as usize) * 32..((blk as usize) + 1) * 32].copy_from_slice(&h);
    }

    let mut p_a = [0usize, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    for i in (1..=9).rev() {
        let rand = ((s_buf[i * 2] as usize) << 8) | (s_buf[i * 2 + 1] as usize);
        let j = rand % (i + 1);
        p_a.swap(i, j);
    }

    let mut p_b = [0usize, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    for i in (1..=9).rev() {
        let rand = ((s_buf[20 + i * 2] as usize) << 8) | (s_buf[20 + i * 2 + 1] as usize);
        let j = rand % (i + 1);
        p_b.swap(i, j);
    }

    let mut k_a = [0u32; 10];
    let mut k_b = [0u32; 10];
    for d in 0..10 {
        k_a[d] = Q0X10_SPLINE_KNOT_A[p_a[d]];
        k_b[d] = Q0X11_SPLINE_KNOT_B[p_b[d]];
    }

    let mut r_55 = [0u32; 55];
    for i in 0..55 {
        let off = 36 + ((i * 4) % 220);
        let word = u32::from_be_bytes([s_buf[off], s_buf[off + 1], s_buf[off + 2], s_buf[off + 3]]);
        r_55[i] = (word ^ ((i as u32).wrapping_mul(0x9e3779b9))) | 1;
    }

    Q0xMeshLut {
        m_hash,
        k_a,
        k_b,
        r_55,
    }
}

fn q0x23_biquad_dither(in_buf: &[u8], mesh: &Q0xMeshLut) -> Vec<u8> {
    let mut st = mesh.r_55;
    let mut ptr = 0usize;

    let mut step_ring = || -> u32 {
        let j24 = if ptr >= 24 { ptr - 24 } else { ptr + 31 };
        let val = st[j24].wrapping_add(st[ptr]);
        st[ptr] = val;
        ptr = if ptr == 54 { 0 } else { ptr + 1 };
        val
    };

    for _ in 0..220 {
        step_ring();
    }

    let s1 = &mesh.k_a;
    let s2 = &mesh.k_b;
    let mut out = vec![0u8; in_buf.len()];

    for (i, &b) in in_buf.iter().enumerate() {
        let u = step_ring();
        let c1 = (u % 10) as usize;
        let c2 = ((u >> 4) % 10) as usize;
        let c3 = ((u >> 8) % 10) as usize;
        let c4 = ((u >> 12) % 10) as usize;
        let d1 = ((u >> 16) % 10) as usize;
        let d4 = ((u >> 20) % 10) as usize;

        let v_a = s1[c1] * s1[c2] * s1[c3] + s1[c4];
        let v_b = (if s2[d1] == 0 { 1 } else { s2[d1] }) + s2[d4];
        let m = (((u >> 24) & 0xff) ^ (v_a & 0xff) ^ ((v_a >> 8) & 0xff) ^ (v_b & 0xff)) as u8;
        let r = (((u >> 28) % 7) + 1) as u32;

        let d = b.rotate_right(r);
        out[i] = d ^ m;
    }

    out
}

fn q0x24_catmull_patch(patch_bytes: &[u8], mesh: &Q0xMeshLut) -> Result<Vec<u8>, &'static str> {
    if patch_bytes.len() % 4 != 0 {
        return Err("E_SVG_LEN_0x25");
    }
    let s1 = &mesh.k_a;
    let s2 = &mesh.k_b;
    let cnt = patch_bytes.len() / 4;
    let mut out = vec![0u8; cnt];

    for i in 0..cnt {
        let w = u32::from_be_bytes([
            patch_bytes[i * 4],
            patch_bytes[i * 4 + 1],
            patch_bytes[i * 4 + 2],
            patch_bytes[i * 4 + 3],
        ]);
        let vk1 = s1[((w >> 28) & 0xf) as usize]
            * s1[((w >> 24) & 0xf) as usize]
            * s1[((w >> 20) & 0xf) as usize]
            + s1[((w >> 16) & 0xf) as usize];

        let v1 = s2[((w >> 12) & 0xf) as usize];
        let v2 = s2[((w >> 8) & 0xf) as usize];
        let v3 = s2[((w >> 4) & 0xf) as usize];
        let v4 = s2[(w & 0xf) as usize];

        let mult = if v1 == 0 && v2 == 0 && v3 == 0 {
            0
        } else {
            (if v1 == 0 { 1 } else { v1 })
                * (if v2 == 0 { 1 } else { v2 })
                * (if v3 == 0 { 1 } else { v3 })
        };
        let vk2 = mult + v4;
        let val = (vk1 + vk2) as i32 - Q0X_TANGENT_BIAS;
        if !(0..=255).contains(&val) {
            return Err("E_GLYPH_KERN_0x71");
        }
        out[i] = val as u8;
    }

    Ok(out)
}

fn q0x26_srgb_matrix_3x3(
    tex_bytes: &[u8],
    key32: &[u8; 32],
    iv12: &[u8],
) -> Result<Vec<u8>, &'static str> {
    let cipher = Aes256Gcm::new_from_slice(key32).map_err(|_| "E_GCM_KEY_0x26")?;
    let nonce = Nonce::from_slice(iv12);
    cipher
        .decrypt(nonce, tex_bytes)
        .map_err(|_| "E_GCM_AUTH_0x26")
}

pub fn q0x99_rasterize_atlas(buf_a: &[u8], q0x3c_aa_calib: &[u8]) -> Result<Vec<u8>, &'static str> {
    if buf_a.len() < 368 {
        return Err("E_SVG_LEN_0x25");
    }
    let q0x30_inset_pad = &buf_a[0..16];
    let q0x31_kern_pairs = &buf_a[16..368];
    let q0x32_mipmap_tex = &buf_a[368..];

    let q0x33_outer_mesh = q0x22_bezier_mesh_lut(q0x3c_aa_calib, q0x30_inset_pad);
    let q0x34_patch_raw = q0x24_catmull_patch(q0x31_kern_pairs, &q0x33_outer_mesh)?;
    let q0x35_patch_norm = q0x23_biquad_dither(&q0x34_patch_raw, &q0x33_outer_mesh);

    if &q0x35_patch_norm[0..4] != b"A6CR" {
        return Err("E_BEZIER_HDR_0x41");
    }

    let q0x36_glyph_cnt = u32::from_be_bytes([
        q0x35_patch_norm[6],
        q0x35_patch_norm[7],
        q0x35_patch_norm[8],
        q0x35_patch_norm[9],
    ]) as usize;
    let q0x37_texel_cnt = u32::from_be_bytes([
        q0x35_patch_norm[10],
        q0x35_patch_norm[11],
        q0x35_patch_norm[12],
        q0x35_patch_norm[13],
    ]) as usize;
    let q0x38_ao_kernel = &q0x35_patch_norm[14..46];
    let q0x3d_frustum_iv = &q0x35_patch_norm[46..58];
    let q0x39_chroma_tag = &q0x35_patch_norm[58..88];

    if q0x32_mipmap_tex.len() != q0x37_texel_cnt {
        return Err("E_MIPMAP_LEN_0x37");
    }

    let q0x3a_inner_mesh = q0x22_bezier_mesh_lut(q0x3c_aa_calib, q0x38_ao_kernel);
    let mut q0x3b_pcm_buf =
        q0x26_srgb_matrix_3x3(q0x32_mipmap_tex, &q0x3a_inner_mesh.m_hash, q0x3d_frustum_iv)?;

    let pref_len = q0x3b_pcm_buf.len().min(256);
    let restored_prefix = q0x23_biquad_dither(&q0x3b_pcm_buf[0..pref_len], &q0x3a_inner_mesh);
    q0x3b_pcm_buf[0..pref_len].copy_from_slice(&restored_prefix);

    let mut decoder = GzDecoder::new(&q0x3b_pcm_buf[..]);
    let mut buf_b = Vec::with_capacity(q0x36_glyph_cnt);
    decoder
        .read_to_end(&mut buf_b)
        .map_err(|_| "E_PCM_INF_0x3B")?;

    if buf_b.len() != q0x36_glyph_cnt {
        return Err("E_GLYPH_CNT_0x36");
    }

    let mut hasher = Sha256::new();
    hasher.update(&buf_b);
    let dig: [u8; 32] = hasher.finalize().into();
    if &dig[0..30] != q0x39_chroma_tag {
        return Err("E_CHROMA_TAG_0x39");
    }

    Ok(buf_b)
}

/// Branchlessly binds the A6-CRYPT key to:
/// 1. WebView2 environment cleanliness (`q0x00_scrub_raster_env()`)
/// 2. Official Valve `steam_api64.dll` SHA-256 integrity digest (defeats Goldberg Emu DLL swap without an `if` branch!)
pub fn q0x3c_build_aa_matrix(app_id: u32) -> Vec<u8> {
    let env_drift = q0x00_scrub_raster_env();
    let mut dll_drift: u8 = 0;

    if let Ok(dll_bytes) = std::fs::read("steam_api64.dll") {
        let mut hasher = Sha256::new();
        hasher.update(&dll_bytes);
        let digest: [u8; 32] = hasher.finalize().into();
        for i in 0..4 {
            dll_drift |= digest[i] ^ Q0X_VALVE_DLL_TAG[i];
        }
    }

    let mut key_bytes = format!("CHEMICATS-STEAM-APPID-{}-A6-SECRET", app_id).into_bytes();
    if !key_bytes.is_empty() {
        key_bytes[0] ^= env_drift ^ dll_drift;
    }
    key_bytes
}

