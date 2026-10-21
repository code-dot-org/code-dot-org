package org.codeai

import android.net.Uri
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import java.net.URLEncoder
import okhttp3.mockwebserver.MockResponse
import okhttp3.mockwebserver.MockWebServer
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.json.JSONTokener
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner

@RunWith(RobolectricTestRunner::class)
class PageInjectorTest {
    private val server = MockWebServer()
    private lateinit var origin: String
    private lateinit var injector: PageInjector

    @Before
    fun setUp() {
        server.start()
        origin = server.url("/").toString().removeSuffix("/")
        injector = PageInjector(origin, SCRIPT, "test-agent", OFFLINE_URL)
    }

    @After
    fun tearDown() {
        server.shutdown()
    }

    @Test
    fun html_getsTheScriptAtTheTopOfHead() {
        server.enqueue(html("<html><head><title>Level</title></head><body></body></html>"))
        val body = bodyOf(injector.intercept(request("$origin/courses/oceans")))
        assertTrue(body, body.contains("<head><script>$SCRIPT</script><title>"))
    }

    @Test
    fun html_defersGooglesTagScript() {
        server.enqueue(
            html("<head><script async src=\"https://www.googletagmanager.com/gtag/js?id=G\"></script></head>"),
        )
        val body = bodyOf(injector.intercept(request("$origin/")))
        assertTrue(body, body.contains("data-codeai-deferred-src=\"https://www.googletagmanager.com/gtag/js?id=G\""))
        assertFalse(body, body.contains(" src=\"https://www.googletagmanager.com/"))
    }

    @Test
    fun redirectWithinTheSite_isAStubThatReplacesThePage() {
        server.enqueue(MockResponse().setResponseCode(302).setHeader("Location", "/courses/oceans/units/1"))
        val url = "$origin/s/oceans"
        val body = bodyOf(injector.intercept(request(url)))
        assertEquals("$origin/courses/oceans/units/1", replacedWith(body))
        assertTrue(injector.wasRedirectStub(url))
        assertFalse("answers once", injector.wasRedirectStub(url))
    }

    @Test
    fun redirectOffTheSite_isLeftToTheWebView() {
        server.enqueue(MockResponse().setResponseCode(302).setHeader("Location", "https://example.com/"))
        assertNull(injector.intercept(request("$origin/out")))
    }

    @Test
    fun unreachablePage_isAStubThatOpensTheOfflineScreen() {
        val url = "$origin/courses/oceans/units/1"
        server.shutdown()
        val body = bodyOf(injector.intercept(request(url)))
        assertEquals("$OFFLINE_URL?url=${URLEncoder.encode(url, "UTF-8")}", replacedWith(body))
        assertTrue(injector.wasRedirectStub(url))
    }

    @Test
    fun nonHtmlResponse_isLeftToTheWebView() {
        server.enqueue(MockResponse().setHeader("Content-Type", "application/json").setBody("{}"))
        assertNull(injector.intercept(request("$origin/api/x")))
    }

    @Test
    fun otherRequests_areNotFetched() {
        assertNull(injector.intercept(request("$origin/", mainFrame = false)))
        assertNull(injector.intercept(request("$origin/", method = "POST")))
        assertNull(injector.intercept(request("https://example.com/")))
        assertEquals(0, server.requestCount)
    }

    private fun html(body: String) =
        MockResponse().setHeader("Content-Type", "text/html; charset=utf-8").setBody(body)

    private fun bodyOf(response: WebResourceResponse?): String {
        assertNotNull(response)
        return response!!.data.use { it.readBytes().toString(Charsets.UTF_8) }
    }

    // The address a stub passes to location.replace(), as JavaScript reads it.
    private fun replacedWith(body: String): String {
        val literal = STUB.find(body)?.groupValues?.get(1)
        assertNotNull(body, literal)
        return JSONTokener(literal).nextValue() as String
    }

    private fun request(url: String, mainFrame: Boolean = true, method: String = "GET") =
        object : WebResourceRequest {
            override fun getUrl(): Uri = Uri.parse(url)
            override fun isForMainFrame() = mainFrame
            override fun isRedirect() = false
            override fun hasGesture() = false
            override fun getMethod() = method
            override fun getRequestHeaders() = emptyMap<String, String>()
        }

    private companion object {
        const val SCRIPT = "window.codeaiTest = true;"
        const val OFFLINE_URL = "https://localhost/offline"
        val STUB = Regex("""location\.replace\(("(?:[^"\\]|\\.)*")\)""")
    }
}
