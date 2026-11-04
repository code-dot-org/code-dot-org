package org.codeai

import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream
import org.junit.Assert.assertArrayEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class AssetCacheTest {
    @Test
    fun copyAtMost_copiesInputWithinLimit() {
        val bytes = ByteArray(10_000) { it.toByte() }
        val output = ByteArrayOutputStream()
        assertTrue(copyAtMost(ByteArrayInputStream(bytes), output, bytes.size.toLong()))
        assertArrayEquals(bytes, output.toByteArray())
    }

    @Test
    fun copyAtMost_stopsOnceInputPassesLimit() {
        val output = ByteArrayOutputStream()
        assertFalse(copyAtMost(ByteArrayInputStream(ByteArray(10_001)), output, 10_000))
        assertTrue(output.size() <= 10_000)
    }
}
