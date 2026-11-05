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
cards drawn to the "Amazon Fire Kids Screen" design in Figma: image, category,
title and ages, all ten on one screen, five to a row. On a landscape tablet
wider than a Fire HD 8 the root font size grows with the screen, so a Fire
HD 10 shows the same screen larger, as the design does. Tapping a card
navigates the app's WebView to that curriculum's studio.code.org URL.
Only studio.code.org, the one host in `server.allowNavigation`
(`capacitor.config.ts`), opens inside the app. `MainActivity.kt` ignores
links to any other host, support.code.org and code.org included, and stops
any other page load to another host, such as a form sent there or a
studio.code.org redirect after a form, because
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

Pages get no camera, microphone or location, and a file input opens
nothing: Amazon Kids+ allows none of these, and a file picker would leave the
app. The volume keys set the volume of the app's sound. Nothing the app keeps
is backed up or moved to another device.

The app runs in landscape only (`screenOrientation` in `AndroidManifest.xml`)
and hides the status bar, as the design does; a swipe from the top edge shows
it for a moment. Android 16 ignores a fixed orientation on tablets unless the
app opts out, which it can only while it targets API 36.

`res/raw/hide_site_chrome.js` runs in every studio.code.org page the app loads
and applies "Elements to Hide in the Wrapper", whose item numbers its comments
cite. In the header, the logo links to
`https://studio.code.org/codeai-app/home`, which `MainActivity.kt`
intercepts and handles by returning to the landing page; the site links are
hidden; and New project, sign-in, help, the menu,
Share, Remix and "I finished!" are made invisible but keep their space, so
the lesson navigation stays centered. It also hides the footers and their
language selector, Download Video links, sharing after the last level, the
"Need help?" videos, the cookie banner, the translation widget, the
"You are not signed in" callout and the unsupported-browser warning. It
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
Try again, which forgets that curriculum's progress (below) and opens its
first level, and Choose another curriculum, which returns to the list. The app opens the fragment itself
rather than the page pushing it, because Chromium's Back skips history
entries a page adds without a tap, and Back would then leave the app.
Focus moves to the congratulations heading, and back to the curriculum's Try
Now on return to the list.

A link in another site's iframe can take the page to a certificate page too,
so the app congratulates only when the page started that load itself. The
page script records each page load its page starts, as the Navigation API's
`navigate` event reports it, which never fires for a load another site's
iframe starts, and `MainActivity.kt` checks the record before going on: it
must name the certificate page, or the page that redirected to it. A
WebView without the Navigation API keeps no record and is trusted.

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
landing page clears it. Chromium's Back skips the landing page under it,
since nothing there was tapped, so Back from a page with nothing behind it
returns to the landing page itself.

While a page loads, a loading screen covers the window: the wordmark and a
spinner on the landing page's grey background. It shows on a fresh start that resumes a page, when a curriculum is
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

Try again resets one course: it opens
`/codeai-app/reset?course=<course>&next=<first level>`, which `MainActivity.kt`
handles by setting a short-lived `codeai_reset_course` cookie, and the next
page's script removes that course's entries from what `clientState.js` keeps
in sessionStorage (`progress` and `source_<course>_<level>`) and from the
`progress` cookie of `ClientState` (`dashboard/lib/client_state.rb`), before
the site's scripts read them. Other courses and projects stay. A link in
another site's iframe can navigate the whole page too, so `MainActivity.kt`
honors a reset only from the landing page itself, which has no iframes, not
its offline screen, and opens the congratulations, whose Try again resets a
course, only itself. Debug builds' Reset course instead passes `token=`, set
to a value the app makes at each start and gives only the page script, which
no other site's frame can read; release builds make none, since the site's
own third-party scripts could.

A signed-out child's progress is only in sessionStorage, so the server's
next-level route (`script_levels#next`, behind Continue on a unit's overview)
always answers with the first level. The page script finds the first level
not yet passed from `/api/script_structure` and that progress instead: when
Continue is tapped, and when the landing page opens a curriculum that starts
on a level, which it marks with `?codeai_resume`.

Debug builds add controls to the right of the site header, where the
invisible sign-in and menu keep their space, drawn like the site's own header
buttons and as far from the right edge as the logo is from the left: Reset
course (course pages only), Show hidden elements, and zoom out and zoom in,
with the level between them when it is not 100%. Zoom works as a browser's
does, reflowing the page, by setting each page's viewport, which the WebView
honors in wide-viewport mode; the old labs set their own viewport, so the page
script reapplies its own whenever the page changes it. Show hidden elements
outlines everything the page script hides and shows it, and swaps the header
controls for one floating button that hides them again; the choice lasts
across pages. Release builds show every page at 100%, with nothing hidden
shown.

The launcher's catalog images are bundled with it, as WebP at quality 80
(`src/config/brand/assets/catalog` in studio). `AssetCache.kt` keeps
images.code.org images and the Font Awesome files that `injectFontAwesome()`
from `@code-dot-org/fonts` loads from dsco.code.org in the app's cache
directory after their first load, and serves them from there, so the
launcher's icons never wait on the network or go blank offline. Both hosts put a
content hash or a version in every path, so a stored copy never goes stale.
dsco.code.org allows its fonts to be used by studio.code.org but not by the
landing page's local origin; the stored copies allow both.

The launcher bundles only Geist, Barlow and Space Grotesk, its headings' and
card titles' font, in their Latin subsets as WOFF2, about 0.3MB. Studio's `vite.mobile.config.ts` drops the rest of the brand fonts and
the per-language fonts `@code-dot-org/fonts` would otherwise add, about 21MB.
Since they are local, text waits for them rather than being drawn in a
fallback font and redrawn, and the landing page preloads the weights it uses.
It also waits, for at most a second, for the Font Awesome icon font, so its
text and icons appear together.
Site pages use the site's own fonts, which the WebView caches.

The app appends `CodeAIApp/<version> (android; Amazon Kids+ Edition)` to
the WebView's User-Agent, so every request it makes to studio.code.org —
pages, API calls and iframes — identifies the app. Rails can test for it with
`request.user_agent.to_s.include?('CodeAIApp/')` to choose a mobile layout.
Where the WebView supports it, the app also adds a `CodeAIApp` brand to
`navigator.userAgentData` and the `Sec-CH-UA` headers.

The site's Statsig stable ID, which is also the anonymous user ID for
signed-out progress, is this device's: `MainActivity.kt` derives a version 4
UUID from `ANDROID_ID` with HMAC-SHA256. On each launch, when OneTrust's
saved consent (`OptanonConsent`) allows performance cookies, it sets the
`statsig_stable_id` cookie to that ID before any page loads; with no saved
choice yet, or a refusal, the cookie is left to the site, which creates it
only with consent. The page script gives every write of the cookie the
device's value and a year's lifetime, and the app answers the site's request
for an ID, `/api/stable_id`, with it, so the site's scripts use the value the
cookie ends up holding. The ID lasts across updates,
reinstalls signed with the same key and resets, until a factory reset.

The native code in `android/app/src/main/kotlin` is Kotlin.
Building needs JDK 21 and the Android SDK (platform 36); Gradle fetches the
Kotlin compiler. From this directory:

```bash
yarn android:sync     # build Studio's mobile output and copy it into android/
cd android && ./gradlew assembleDebug   # app/build/outputs/apk/debug/codeai-1.0.0-debug.apk
cd android && ./gradlew assembleRelease   # app/build/outputs/apk/release/CodeAI - Amazon Kids+ Edition.apk, unsigned
cd android && ./gradlew testDebugUnitTest   # SitePolicy and PageInjector, on the JVM with Robolectric
yarn android:open     # or open the project in Android Studio
```

The release build is shrunk with R8, which drops the library code the app
never calls: the APK is about 2 MB rather than 9. Each release build writes
`app/build/outputs/mapping/release/mapping.txt`, which turns its crash stack
traces back into the original names; keep the one for every APK submitted.

`yarn dev` serves the landing page in a browser.
