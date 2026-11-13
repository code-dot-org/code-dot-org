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
    private val localUrl = "https://codeai-mobile-app.localhost"

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
        assertFalse(SitePolicy.isSitePage("$localUrl/launcher"))
        assertFalse(SitePolicy.isSitePage(null))
    }

    @Test
    fun leadsHome_rootHomeAndAccountPages() {
        assertTrue(SitePolicy.leadsHome(uri(SitePolicy.HOME_URL)))
        assertTrue(SitePolicy.leadsHome(uri("https://studio.code.org")))
        assertTrue(SitePolicy.leadsHome(uri("https://studio.code.org/")))
        assertTrue(SitePolicy.leadsHome(uri("https://studio.code.org/home")))
        assertTrue(SitePolicy.leadsHome(uri("https://studio.code.org/users/sign_in")))
        assertTrue(SitePolicy.leadsHome(uri("https://studio.code.org/users/sign_up/account_type")))
        assertTrue(SitePolicy.leadsHome(uri("https://studio.code.org/users/auth/google_oauth2")))
        assertFalse(SitePolicy.leadsHome(uri("https://studio.code.org/flappy/1")))
        assertFalse(SitePolicy.leadsHome(uri("https://studio.code.org/usersx")))
        assertFalse(SitePolicy.leadsHome(uri("https://studio.code.org/courses/oceans/units/1")))
        assertFalse(SitePolicy.leadsHome(uri("https://code.org/")))
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
    fun resetCourse_onlyWellFormedCourseName() {
        val reset = "https://studio.code.org/codeai-app/reset"
        assertEquals("oceans", SitePolicy.resetCourse(uri("$reset?course=oceans&next=x")))
        assertEquals("pre-express-2025", SitePolicy.resetCourse(uri("$reset?course=pre-express-2025")))
        assertNull(SitePolicy.resetCourse(uri(reset)))
        assertNull(SitePolicy.resetCourse(uri("$reset?course=")))
        assertNull(SitePolicy.resetCourse(uri("$reset?course=a%3Bb%3Dc")))
    }

    @Test
    fun mayReset_onlyFromLandingPageOrWithToken() {
        val reset = "https://studio.code.org/codeai-app/reset?course=oceans"
        val appUrl = "$localUrl/launcher"
        assertTrue(SitePolicy.mayReset(uri(reset), appUrl, appUrl, null))
        assertTrue(SitePolicy.mayReset(uri(reset), "$appUrl#finished=oceans", appUrl, null))
        assertFalse(SitePolicy.mayReset(uri(reset), "$localUrl/offline?url=x", appUrl, null))
        assertFalse(SitePolicy.mayReset(uri(reset), "https://studio.code.org/flappy/1", appUrl, null))
        assertFalse(SitePolicy.mayReset(uri(reset), null, appUrl, null))
        assertTrue(SitePolicy.mayReset(uri("$reset&token=t1"), "https://studio.code.org/flappy/1", appUrl, "t1"))
        assertFalse(SitePolicy.mayReset(uri("$reset&token=t2"), "https://studio.code.org/flappy/1", appUrl, "t1"))
        assertFalse(SitePolicy.mayReset(uri("$reset&token="), "https://studio.code.org/flappy/1", appUrl, null))
    }

    @Test
    fun isBundledPage_onlyLocalOrigin() {
        assertTrue(SitePolicy.isBundledPage(uri("$localUrl/launcher"), localUrl))
        assertTrue(SitePolicy.isBundledPage(uri("$localUrl/offline?url=x"), localUrl))
        assertFalse(SitePolicy.isBundledPage(uri("http://codeai-mobile-app.localhost/launcher"), localUrl))
        assertFalse(SitePolicy.isBundledPage(uri("$localUrl:8080/launcher"), localUrl))
        assertFalse(SitePolicy.isBundledPage(uri("$localUrl.example.com/launcher"), localUrl))
        assertFalse(SitePolicy.isBundledPage(uri("https://studio.code.org/launcher"), localUrl))
    }

    @Test
    fun isFinishedScreen_onlyBundledPageWithFinishedFragment() {
        assertTrue(SitePolicy.isFinishedScreen(uri("$localUrl/launcher#finished=oceans"), localUrl))
        assertFalse(SitePolicy.isFinishedScreen(uri("$localUrl/launcher"), localUrl))
        assertFalse(SitePolicy.isFinishedScreen(uri("$localUrl/launcher#other"), localUrl))
        assertFalse(SitePolicy.isFinishedScreen(uri("https://studio.code.org/launcher#finished=oceans"), localUrl))
    }

    @Test
    fun isAllowedOrigin_onlyDefaultPort() {
        assertTrue(SitePolicy.isAllowedOrigin(uri("https://studio.code.org:443/courses/oceans")))
        assertFalse(SitePolicy.isAllowedOrigin(uri("https://studio.code.org:8443/courses/oceans")))
        assertFalse(SitePolicy.isResetUrl(uri("https://studio.code.org:8443/codeai-app/reset")))
        assertTrue(SitePolicy.isResetUrl(uri("https://studio.code.org:443/codeai-app/reset")))
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
        assertTrue(SitePolicy.isCertificatePage(uri("https://studio.code.org/api/hour/finish/flappy")))
        assertFalse(SitePolicy.isCertificatePage(uri("https://studio.code.org/api/hour/other")))
        assertFalse(SitePolicy.isCertificatePage(uri("https://studio.code.org/congratsx")))
        assertFalse(SitePolicy.isCertificatePage(uri("https://studio.code.org/courses/oceans/units/1")))
        assertFalse(SitePolicy.isCertificatePage(uri("https://code.org/congrats")))
    }

    @Test
    fun finishedCourse_fromPathOrBase64Parameter() {
        val encoded = Base64.encodeToString("oceans".toByteArray(), Base64.URL_SAFE or Base64.NO_WRAP)
        assertEquals("oceans", SitePolicy.finishedCourse(uri("https://studio.code.org/congrats/oceans")))
        assertEquals("flappy", SitePolicy.finishedCourse(uri("https://studio.code.org/api/hour/finish/flappy")))
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
    fun userAgentToken_namesTheAppVersionAndEdition() {
        assertEquals("CodeAIApp/1.0.0 (android; Amazon Kids+ Edition)", SitePolicy.userAgentToken("1.0.0"))
    }
}
