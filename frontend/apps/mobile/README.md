# @code-dot-org/mobile

The CodeAI Android app for Amazon Fire tablets (Amazon Kids+), packaged with
[Capacitor](https://capacitorjs.com). The landing page is [Studio](../studio)'s
`/launcher` route; `yarn android:sync` builds it into Studio's `dist-mobile/`
and Capacitor copies that into `android/`.

The app is the landing page only, and everything runs in one WebView: the
landing page, every studio.code.org page, `window.open` and `target=_blank`.
Pages therefore share one browser session, so sessionStorage, session cookies
and localStorage carry across every page load. It lists the Amazon Fire Kids
Content Library, the 10 curricula in Studio's `src/config/curricula.ts`, as
cards laid out like the course catalog's (`CurriculumCatalogCard` in `apps/`),
with the catalog's images, descriptions, topics, grades and durations; tapping
one navigates the app's WebView to that curriculum's studio.code.org URL.
Only studio.code.org, the one host in `server.allowNavigation`
(`capacitor.config.ts`), opens inside the app. `MainActivity.kt` ignores
links to any other host, support.code.org and code.org included, because
Amazon Kids+ allows no links that lead outside its environment, and the page
script hides every `http`, `https` and `//` link to another host, such as
Get help and Report a problem, so none is left to do nothing when tapped;
links with other schemes, such as `mailto:`, stay. For the
same reason the launcher's header gives the privacy policy as text a parent
can copy, not a link, and selected text offers only Copy and Select All: the
WebView's text classifier, which offers to open addresses, is off, and Share
and other apps' actions are hidden. Apart from
YouTube, only page navigations are
filtered: scripts, fetch and XHR calls, and iframes load from any host, so
Statsig, Google Analytics, Google Tag Manager and Sentry run as they do on the
web. YouTube is unreachable so that video levels use Code.org's own player,
which has no "Watch on YouTube" link. Android Back steps back through page
history and exits from the landing page.

The app runs in landscape only (`screenOrientation` in `AndroidManifest.xml`).

`res/raw/hide_site_chrome.js` runs in every studio.code.org page the app loads
and applies "Elements to Hide in the Wrapper", whose item numbers its comments
cite. In the header, the logo links to
`https://studio.code.org/codeai-app/home`, which `MainActivity.kt`
intercepts and handles by returning to the landing page; the site links are
hidden; and New project, sign-in, help, the menu,
Share, Remix and "I finished!" are made invisible but keep their space, so
the lesson navigation stays centered. It also hides the footers and their
language selector, Download Video links, sharing after the last level, the
"Need help?" videos, the cookie banner, the translation widget and the
unsupported-browser warning. It
answers the Dance Party age prompt as under 13, and provides a silent
`speechSynthesis`, which Android's WebView lacks and Lab2 labs need to load,
and the few newer JavaScript functions the site calls that WebViews before
Chromium 103 lack (`Object.hasOwn`, `at`, `findLast`, `findLastIndex`,
`AbortSignal.timeout`); without them Music Lab and Dance Party fail to load
on older Fire tablets.
Rules for a single level, such as the Finish button on Dance Party: AI Edition
level 10, are listed in `LEVEL_RULES`.

Finishing a curriculum leads to a certificate page, which asks for a name and
offers sharing. `MainActivity.kt` intercepts it instead, returns to the
landing page and opens `#finished=<course>` there, taking the course from the
certificate URL. The landing page then congratulates the child and offers
Try again, which resets the session (below) and opens the curriculum's first
level, and Choose another curriculum, which returns to the list. The app opens the fragment itself
rather than the page pushing it, because Chromium's Back skips history
entries a page adds without a tap, and Back would then leave the app.

`PageInjector.kt` fetches each studio.code.org page for the WebView and puts
the script at the top of `<head>`, the way content blockers apply cosmetic
filters, so nothing hidden is ever drawn. It answers same-site redirects with
a `location.replace()` stub so the target is injected too, and passes anything
else back to the WebView, where the script runs when the page commits. A
MutationObserver keeps the changes applied to elements the site adds later.

The app is English only for now, whatever the device language: it pins the
process locale to en-US before the WebView starts, so every request sends
`Accept-Language: en-US` and `navigator.language` is `en-US`; it sets the
site's `language_=en-US` cookie on each launch and before every page
`PageInjector` fetches, and ignores any other value the server sends, because
Rails prefers the cookie over the header; the page script pins
`navigator.language` again for client-side translators; and if a page still
finds the cookie is not `en-US`, a non-English `?lang=`, or itself rendered in
another language, it sets the cookie and reloads without `?lang=`, at most
twice per tab.

A fresh start reopens the last studio.code.org page shown, on top of the
landing page, so a child continues where they left off; returning to the
landing page clears it.

While a page loads, the launch screen covers the window with a spinner below
the wordmark: on a fresh start that resumes a page, when a curriculum is
tapped, and after Try again. Many pages fetch their content and render it
after the load event, so it goes once the page script finds the page loaded,
with no studio.code.org request open and unchanged for half a second (or five
seconds after the load event); on Back to the landing page; on a load error;
or after fifteen seconds. Its logo, like the site's, returns to the landing
page, dropping the page that was loading and any page queued after it. On a Fire HD 8 a level page takes 7 to 10 seconds, most
of it in the site's scripts, which run anew on every page; they and the
page's other files already come from the WebView's cache. Google's tag
scripts (gtag.js and gtm.js) start only once a page has settled, when the
WebView is idle: `PageInjector.kt` turns the one in the HTML into a
placeholder and the page script holds the one the site adds. That brings a
level's load event about two seconds sooner; what the site reports in the
meantime waits in `window.dataLayer` and is sent when they start.

A studio.code.org page that cannot be fetched, as when the tablet is
offline, never shows the WebView's own error page: `PageInjector.kt` answers
it with a stub that replaces it with the landing page's offline screen,
`/offline?url=<page>` (studio's `routes/offline.tsx`). The screen says there
is no internet connection and offers Try again, which replaces it with the
page, and Back to curricula. `MainActivity.kt` reports the network to the
WebView, which otherwise always reports itself online, so the screen retries
by itself when the tablet reconnects. A restart while it shows retries the
page.

Signed-out progress is kept until the child resets it. The site keeps level
progress and code in sessionStorage, which the WebView forgets when the app's
process ends, so the page script copies it to localStorage and restores it
after a restart. Opening Sprite Lab, Dance Party or Music Lab, whose
`/projects/<lab>` link makes the server create a project on every visit,
reopens the last project the child edited in that lab instead.

"Try again" resets the session: it erases every cookie except the language
and zoom, all site storage, and the remembered page and projects. A cookie
the reset changes tells the next page to empty sessionStorage, which
outlives the reset in the WebView.

Debug builds add zoom out and zoom in to the right of the site header, where
the invisible sign-in and menu keep their space, drawn like the site's own
header buttons. They zoom as a browser does, reflowing the page, by setting each
page's viewport, which the WebView honors in wide-viewport mode; the old labs
set their own viewport, so the page script reapplies its own whenever the
page changes it. Release builds show every page at 100%.

`AssetCache.kt` keeps images.code.org images, which include the launcher's
catalog images, and the Font Awesome files that `injectFontAwesome()` from
`@code-dot-org/fonts` loads from dsco.code.org, in the app's cache directory
after their first load, and serves them from there, so the launcher's images
and icons never wait on the network or go blank offline. Both hosts put a
content hash or a version in every path, so a stored copy never goes stale.
dsco.code.org allows its fonts to be used by studio.code.org but not by the
landing page's local origin; the stored copies allow both.

The launcher bundles only Geist and Barlow, in their Latin subsets as WOFF2,
about 0.3MB. Studio's `vite.mobile.config.ts` drops the rest of the brand fonts and
the per-language fonts `@code-dot-org/fonts` would otherwise add, about 21MB.
Since they are local, text waits for them rather than being drawn in a
fallback font and redrawn, and the landing page preloads the weights it uses.
It also waits, for at most a second, for the Font Awesome icon font, so its
text and icons appear together.
Site pages use the site's own fonts, which the WebView caches.

The app appends `CodeAIApp/<version> (android; amazon-kids)` to the WebView's
User-Agent, so every request it makes to studio.code.org — pages, API calls
and iframes — identifies the app. Rails can test for it with
`request.user_agent.to_s.include?('CodeAIApp/')` to choose a mobile layout.

The native code in `android/app/src/main/kotlin` is Kotlin.
Building needs JDK 21 and the Android SDK (platform 36); Gradle fetches the
Kotlin compiler. From this directory:

```bash
yarn android:sync     # build Studio's mobile output and copy it into android/
cd android && ./gradlew assembleDebug   # app/build/outputs/apk/debug/codeai-0.2.0-debug.apk
cd android && ./gradlew testDebugUnitTest   # SitePolicy and PageInjector, on the JVM with Robolectric
yarn android:open     # or open the project in Android Studio
```

`yarn dev` serves the landing page in a browser.
