package org.codeai

import android.net.Uri
import android.util.Base64
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner

@RunWith(RobolectricTestRunner::class)
class SitePolicyTest {
    private fun uri(url: String) = Uri.parse(url)

    @Test
    fun isAllowedOrigin_onlyStudioOverHttps() {
        assertTrue(SitePolicy.isAllowedOrigin(uri("https://studio.code.org/courses/oceans")))
        assertFalse(SitePolicy.isAllowedOrigin(uri("http://studio.code.org/courses/oceans")))
        assertFalse(SitePolicy.isAllowedOrigin(uri("https://support.code.org/hc/en-us")))
        assertFalse(SitePolicy.isAllowedOrigin(uri("https://code.org/privacy")))
    }

    @Test
    fun isSitePage_doesNotMatchHostsThatOnlyStartLikeStudio() {
        assertTrue(SitePolicy.isSitePage("https://studio.code.org/courses/oceans/units/1"))
        assertFalse(SitePolicy.isSitePage("https://studio.code.org.example.com/"))
        assertFalse(SitePolicy.isSitePage("https://localhost/launcher"))
        assertFalse(SitePolicy.isSitePage(null))
    }

    @Test
    fun isHomeLink_onlyTheExactSentinel() {
        assertTrue(SitePolicy.isHomeLink(uri(SitePolicy.HOME_URL)))
        assertFalse(SitePolicy.isHomeLink(uri("https://studio.code.org/")))
        assertFalse(SitePolicy.isHomeLink(uri("https://code.org/")))
        assertFalse(SitePolicy.isHomeLink(uri("https://support.code.org/")))
    }

    @Test
    fun isResetUrl_studioResetPathOnly() {
        assertTrue(SitePolicy.isResetUrl(uri("https://studio.code.org/codeai-app/reset")))
        assertTrue(
            SitePolicy.isResetUrl(
                uri("https://studio.code.org/codeai-app/reset?next=https%3A%2F%2Fstudio.code.org%2Fflappy%2F1"),
            ),
        )
        assertFalse(SitePolicy.isResetUrl(uri("https://example.com/codeai-app/reset")))
        assertFalse(SitePolicy.isResetUrl(uri("https://studio.code.org/codeai-app/reset/more")))
        assertFalse(SitePolicy.isResetUrl(uri(SitePolicy.HOME_URL)))
    }

    @Test
    fun isBlockedHost_youTubeAndItsSubdomains() {
        assertTrue(SitePolicy.isBlockedHost(uri("https://www.youtube.com/watch?v=x")))
        assertTrue(SitePolicy.isBlockedHost(uri("https://youtu.be/x")))
        assertTrue(SitePolicy.isBlockedHost(uri("https://i.ytimg.com/vi/x/0.jpg")))
        assertFalse(SitePolicy.isBlockedHost(uri("https://notyoutube.com/")))
        assertFalse(SitePolicy.isBlockedHost(uri("https://studio.code.org/")))
    }

    @Test
    fun isCertificatePage_certificatePathsOnStudio() {
        assertTrue(SitePolicy.isCertificatePage(uri("https://studio.code.org/congrats")))
        assertTrue(SitePolicy.isCertificatePage(uri("https://studio.code.org/congrats/oceans")))
        assertTrue(SitePolicy.isCertificatePage(uri("https://studio.code.org/certificates/abc")))
        assertTrue(SitePolicy.isCertificatePage(uri("https://studio.code.org/print_certificates/abc")))
        assertFalse(SitePolicy.isCertificatePage(uri("https://studio.code.org/congratsx")))
        assertFalse(SitePolicy.isCertificatePage(uri("https://studio.code.org/courses/oceans/units/1")))
        assertFalse(SitePolicy.isCertificatePage(uri("https://code.org/congrats")))
    }

    @Test
    fun finishedCourse_fromPathOrBase64Parameter() {
        val encoded = Base64.encodeToString("oceans".toByteArray(), Base64.URL_SAFE or Base64.NO_WRAP)
        assertEquals("oceans", SitePolicy.finishedCourse(uri("https://studio.code.org/congrats/oceans")))
        assertEquals("oceans", SitePolicy.finishedCourse(uri("https://studio.code.org/congrats?s=$encoded")))
    }

    @Test
    fun finishedCourse_emptyWhenUnknownOrUnsafe() {
        val unsafe = Base64.encodeToString("../x".toByteArray(), Base64.URL_SAFE or Base64.NO_WRAP)
        assertEquals("", SitePolicy.finishedCourse(uri("https://studio.code.org/congrats")))
        assertEquals("", SitePolicy.finishedCourse(uri("https://studio.code.org/congrats?s=$unsafe")))
        assertEquals("", SitePolicy.finishedCourse(uri("https://studio.code.org/congrats?s=%%%")))
        assertEquals("", SitePolicy.finishedCourse(uri("https://studio.code.org/certificates/abc")))
    }

    @Test
    fun newProjectLab_onlyTheNewProjectLink() {
        assertEquals("spritelab", SitePolicy.newProjectLab(uri("https://studio.code.org/projects/spritelab")))
        assertNull(SitePolicy.newProjectLab(uri("https://studio.code.org/projects/spritelab/abc/edit")))
        assertNull(SitePolicy.newProjectLab(uri("https://example.com/projects/spritelab")))
    }

    @Test
    fun projectEditorLab_ignoresQueryAndFragment() {
        val editor = "https://studio.code.org/projects/music/27ff60d4-e501/edit"
        assertEquals("music", SitePolicy.projectEditorLab(editor))
        assertEquals("music", SitePolicy.projectEditorLab("$editor?x=1#y"))
        assertNull(SitePolicy.projectEditorLab("https://studio.code.org/projects/music/27ff60d4-e501/view"))
    }

    @Test
    fun cookieValue_findsTheNamedCookie() {
        val header = "a=1; language_=en-US; codeai_zoom=125"
        assertEquals("en-US", SitePolicy.cookieValue(header, "language_"))
        assertEquals("125", SitePolicy.cookieValue(header, "codeai_zoom"))
        assertNull(SitePolicy.cookieValue(header, "zoom"))
        assertNull(SitePolicy.cookieValue(null, "a"))
    }

    @Test
    fun userAgentToken_namesTheAppVersionAndEdition() {
        assertEquals("CodeAIApp/0.1.0 (android; amazon-kids)", SitePolicy.userAgentToken("0.1.0"))
    }
}
