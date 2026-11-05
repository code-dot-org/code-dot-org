package org.codeai

import android.webkit.WebResourceResponse
import java.io.ByteArrayInputStream

/** Answers the app gives requests in place of the network. */
internal object WebResponses {
    /** For a blocked host: an empty 403, so pages see it fail. */
    fun forbidden() = WebResourceResponse(
        "text/plain", "utf-8", 403, "Forbidden", null, ByteArrayInputStream(ByteArray(0)),
    )

    /** For a page load the app refuses: a 204 leaves the current page. */
    fun noContent() = WebResourceResponse(
        "text/plain", "utf-8", 204, "No Content", null, ByteArrayInputStream(ByteArray(0)),
    )

    /** For a request the app answers itself: [body] as plain text. */
    fun plainText(body: String) = WebResourceResponse(
        "text/plain", "utf-8", 200, "OK", mapOf("Cache-Control" to "no-store"),
        ByteArrayInputStream(body.toByteArray(Charsets.UTF_8)),
    )
}
