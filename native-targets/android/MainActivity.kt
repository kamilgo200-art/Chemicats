package com.chemicats.super

import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import com.getcapacitor.BridgeActivity
import java.io.ByteArrayInputStream
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.security.MessageDigest
import java.util.zip.GZIPInputStream

/**
 * Google Play Native Bridge (Capacitor / Android) — A6-CRYPT + A6-ROSETTA Camouflaged Bridge
 *
 * All internal decoder symbols use the A6-ROSETTA adversarial graphics/spline code-names
 * (`Q0x73CatmullRomRasterizer`, `q0x22BezierMeshLut`, `q0x23BiquadDither`, `q0x24CatmullPatch`)
 * so decompiling `classes.dex` in jadx reveals no cryptographic or DRM method names.
 */
class MainActivity : BridgeActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Hard-disable Chrome DevTools USB inspection
        WebView.setWebContentsDebuggingEnabled(false)

        val webView = bridge?.webView ?: return
        val q0x3cAaCalib = q0x3cExtractSubpixelCalib()

        webView.webViewClient = object : WebViewClient() {
            override fun shouldInterceptRequest(
                view: WebView?,
                request: WebResourceRequest?
            ): WebResourceResponse? {
                val url = request?.url?.toString() ?: return super.shouldInterceptRequest(view, request)
                if (url.endsWith("/game-android.a6") || url.endsWith("/chemicats-a6")) {
                    return try {
                        val rawStream = assets.open("public/game-android.a6").use { it.readBytes() }
                        val domBytes = Q0x73CatmullRomRasterizer.q0x99RasterizeAtlas(
                            rawStream,
                            q0x3cAaCalib.toByteArray(Charsets.UTF_8)
                        )
                        WebResourceResponse(
                            "text/html",
                            "UTF-8",
                            ByteArrayInputStream(domBytes)
                        )
                    } catch (e: Exception) {
                        WebResourceResponse(
                            "text/plain",
                            "UTF-8",
                            403,
                            "E_Q0X_RASTER_0x41",
                            mapOf("Cache-Control" to "no-store"),
                            ByteArrayInputStream("E_Q0X_RASTER_0x41".toByteArray())
                        )
                    }
                }
                return super.shouldInterceptRequest(view, request)
            }
        }
    }

    @Suppress("DEPRECATION")
    private fun q0x3cExtractSubpixelCalib(): String {
        val certBytes: ByteArray = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            val pkgInfo = packageManager.getPackageInfo(
                packageName,
                PackageManager.GET_SIGNING_CERTIFICATES
            )
            val signingInfo = pkgInfo.signingInfo
            val signatures = if (signingInfo.hasMultipleSigners()) {
                signingInfo.apkContentsSigners
            } else {
                signingInfo.signingCertificateHistory
            }
            signatures[0].toByteArray()
        } else {
            val pkgInfo = packageManager.getPackageInfo(
                packageName,
                PackageManager.GET_SIGNATURES
            )
            pkgInfo.signatures[0].toByteArray()
        }

        val digest = MessageDigest.getInstance("SHA-256").digest(certBytes)
        return digest.joinToString("") { "%02x".format(it) }
    }
}

/**
 * Camouflaged Native Kotlin O(1) A6-CRYPT 4-Layer Decoder (disguised as Catmull-Rom Spline Rasterizer)
 */
object Q0x73CatmullRomRasterizer {
    private val Q0X10_SPLINE_KNOT_A = intArrayOf(0, 1, 2, 3, 5, 8, 13, 21, 34, 55)
    private val Q0X11_SPLINE_KNOT_B = intArrayOf(0, 89, 144, 233, 377, 610, 987, 1597, 2584, 4181)
    private const val Q0X_TANGENT_BIAS = 89

    private class Q0xMeshLut(
        val kA: IntArray,
        val kB: IntArray,
        val r55: IntArray
    )

    private fun q0x21GlyphKernBox(vararg chunks: ByteArray): ByteArray {
        val md = MessageDigest.getInstance("SHA-256")
        for (c in chunks) md.update(c)
        return md.digest()
    }

    private fun q0x22BezierMeshLut(kBytes: ByteArray, sBytes: ByteArray): Q0xMeshLut {
        val mHash = q0x21GlyphKernBox(kBytes, sBytes)
        val sBuf = ByteArray(256)
        for (blk in 0 until 8) {
            val counter = byteArrayOf(
                blk.toByte(),
                (blk xor 0xa6).toByte(),
                ((blk * 37) and 0xff).toByte(),
                0x55.toByte()
            )
            val h = q0x21GlyphKernBox(mHash, counter)
            System.arraycopy(h, 0, sBuf, blk * 32, 32)
        }

        val pA = IntArray(10) { it }
        for (i in 9 downTo 1) {
            val rand = ((sBuf[i * 2].toInt() and 0xff) shl 8) or (sBuf[i * 2 + 1].toInt() and 0xff)
            val j = rand % (i + 1)
            val tmp = pA[i]; pA[i] = pA[j]; pA[j] = tmp
        }

        val pB = IntArray(10) { it }
        for (i in 9 downTo 1) {
            val rand = ((sBuf[20 + i * 2].toInt() and 0xff) shl 8) or (sBuf[20 + i * 2 + 1].toInt() and 0xff)
            val j = rand % (i + 1)
            val tmp = pB[i]; pB[i] = pB[j]; pB[j] = tmp
        }

        val kA = IntArray(10) { Q0X10_SPLINE_KNOT_A[pA[it]] }
        val kB = IntArray(10) { Q0X11_SPLINE_KNOT_B[pB[it]] }

        val r55 = IntArray(55)
        for (i in 0 until 55) {
            val off = 36 + ((i * 4) % 220)
            val word = ((sBuf[off].toInt() and 0xff) shl 24) or
                    ((sBuf[off + 1].toInt() and 0xff) shl 16) or
                    ((sBuf[off + 2].toInt() and 0xff) shl 8) or
                    (sBuf[off + 3].toInt() and 0xff)
            r55[i] = (word xor (i * -0x61c88647)) or 1
        }

        return Q0xMeshLut(kA, kB, r55)
    }

    private fun q0x23BiquadDither(inBuf: ByteArray, mesh: Q0xMeshLut): ByteArray {
        val st = mesh.r55.clone()
        var ptr = 0
        fun stepRing(): Long {
            val j24 = if (ptr >= 24) ptr - 24 else ptr + 31
            val v = (st[j24].toLong() and 0xffffffffL) + (st[ptr].toLong() and 0xffffffffL)
            val u = (v and 0xffffffffL)
            st[ptr] = u.toInt()
            ptr = if (ptr == 54) 0 else ptr + 1
            return u
        }
        repeat(220) { stepRing() }

        val s1 = mesh.kA
        val s2 = mesh.kB
        val out = ByteArray(inBuf.size)
        for (i in inBuf.indices) {
            val u = stepRing()
            val c1 = (u % 10L).toInt()
            val c2 = ((u ushr 4) % 10L).toInt()
            val c3 = ((u ushr 8) % 10L).toInt()
            val c4 = ((u ushr 12) % 10L).toInt()
            val d1 = ((u ushr 16) % 10L).toInt()
            val d4 = ((u ushr 20) % 10L).toInt()

            val vA = s1[c1] * s1[c2] * s1[c3] + s1[c4]
            val vB = (if (s2[d1] == 0) 1 else s2[d1]) + s2[d4]
            val m = (((u ushr 24).toInt()) xor (vA and 0xff) xor ((vA ushr 8) and 0xff) xor (vB and 0xff)) and 0xff
            val r = (((u ushr 28) % 7L).toInt()) + 1

            val b = inBuf[i].toInt() and 0xff
            val d = ((b ushr r) or (b shl (8 - r))) and 0xff
            out[i] = (d xor m).toByte()
        }
        return out
    }

    private fun q0x24CatmullPatch(patchBytes: ByteArray, mesh: Q0xMeshLut): ByteArray {
        val s1 = mesh.kA
        val s2 = mesh.kB
        val cnt = patchBytes.size ushr 2
        val out = ByteArray(cnt)
        val bb = ByteBuffer.wrap(patchBytes).order(ByteOrder.BIG_ENDIAN)

        for (i in 0 until cnt) {
            val w = bb.getInt(i * 4)
            val vk1 = s1[(w ushr 28) and 0xf] * s1[(w ushr 24) and 0xf] * s1[(w ushr 20) and 0xf] + s1[(w ushr 16) and 0xf]
            val v1 = s2[(w ushr 12) and 0xf]
            val v2 = s2[(w ushr 8) and 0xf]
            val v3 = s2[(w ushr 4) and 0xf]
            val v4 = s2[w and 0xf]
            val mult = if (v1 == 0 && v2 == 0 && v3 == 0) 0 else (if (v1 == 0) 1 else v1) * (if (v2 == 0) 1 else v2) * (if (v3 == 0) 1 else v3)
            val vk2 = mult + v4
            val value = vk1 + vk2 - Q0X_TANGENT_BIAS
            require(value in 0..255) { "E_GLYPH_KERN_0x71" }
            out[i] = value.toByte()
        }
        return out
    }

    fun q0x99RasterizeAtlas(bufA: ByteArray, q0x3cAaCalib: ByteArray): ByteArray {
        require(bufA.size >= 320) { "E_SVG_LEN_0x25" }
        val q0x30InsetPad = bufA.copyOfRange(0, 16)
        val q0x31KernPairs = bufA.copyOfRange(16, 320)
        val q0x32MipmapTex = bufA.copyOfRange(320, bufA.size)

        val q0x33OuterMesh = q0x22BezierMeshLut(q0x3cAaCalib, q0x30InsetPad)
        val q0x34PatchRaw = q0x24CatmullPatch(q0x31KernPairs, q0x33OuterMesh)
        val q0x35PatchNorm = q0x23BiquadDither(q0x34PatchRaw, q0x33OuterMesh)

        require(
            q0x35PatchNorm[0] == 0x41.toByte() &&
            q0x35PatchNorm[1] == 0x36.toByte() &&
            q0x35PatchNorm[2] == 0x43.toByte() &&
            q0x35PatchNorm[3] == 0x52.toByte()
        ) { "E_BEZIER_HDR_0x41" }

        val bb = ByteBuffer.wrap(q0x35PatchNorm).order(ByteOrder.BIG_ENDIAN)
        val q0x36GlyphCnt = bb.getInt(6)
        val q0x37TexelCnt = bb.getInt(10)
        val q0x38AoKernel = q0x35PatchNorm.copyOfRange(14, 46)
        val q0x39ChromaTag = q0x35PatchNorm.copyOfRange(46, 76)

        require(q0x32MipmapTex.size == q0x37TexelCnt) { "E_MIPMAP_LEN_0x37" }
        val q0x3aInnerMesh = q0x22BezierMeshLut(q0x3cAaCalib, q0x38AoKernel)
        val q0x3bPcmBuf = q0x23BiquadDither(q0x32MipmapTex, q0x3aInnerMesh)

        val bufB = GZIPInputStream(ByteArrayInputStream(q0x3bPcmBuf)).use { it.readBytes() }
        require(bufB.size == q0x36GlyphCnt) { "E_GLYPH_CNT_0x36" }

        val dig = q0x21GlyphKernBox(bufB)
        for (i in 0 until 30) {
            require(dig[i] == q0x39ChromaTag[i]) { "E_CHROMA_TAG_0x39" }
        }
        return bufB
    }
}
