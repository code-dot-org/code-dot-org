# Changelog

What changed in each version of the CodeAI Android app. The version is
`versionName` in `android/app/build.gradle` and `version` in `package.json`;
`versionCode` rises by one with each.

## 1.0.0 (2026-11-04)

The first release: a Capacitor app for Amazon Fire tablets (Amazon Kids+)
that lists the ten curricula of the Amazon Fire Kids Content Library and
opens each in one WebView on studio.code.org.

### Screens

- The landing page follows the "Amazon Fire Kids Screen" design in Figma:
  all ten curricula on one screen, five to a row, each card showing image,
  category, title, ages and Try Now. Titles, categories and ages come from
  the design.
- On landscape tablets wider than a Fire HD 8, the screens grow with the
  screen, as the design's Fire HD 10 frames do.
- The app stays in landscape and hides the status bar; a swipe from the top
  edge shows it.
- The header gives the privacy policy, centered beside the logo, as text a
  parent can copy rather than a link, on the landing page and the offline
  screen.
- A loading screen, the wordmark and a spinner on the landing page's grey
  background, covers the WebView while a page loads. Its logo returns to the
  landing page.
- Finishing a curriculum leads to a congratulations screen instead of the
  certificate page, offering Try again and Choose another curriculum.
- An offline screen replaces pages that cannot load. It reads "Check that the
  Wi-Fi is on, or ask a grown-up for help.", retries when the tablet
  reconnects, and offers a way back to the curricula.
- Headings and card titles use Space Grotesk. The landing page bundles only
  the fonts it uses, and its build carries none of the labs' code.

### Site pages

- Links that lead off studio.code.org are blocked and hidden, and YouTube is
  unreachable, so video levels use Code.org's own player. Selected text
  offers only Copy and Select All.
- The page script hides the site's header links, menus, footers, sharing,
  certificates, cookie banner, "Need help?" videos, the "You are not signed
  in" callout and the unsupported-browser warning, before anything is drawn.
- The app is English only, whatever the device language.
- Pages style correctly on Fire OS 7, whose WebView predates CSS cascade
  layers, and Music Lab and Dance Party load on WebViews before Chromium 103.
- Google's tag scripts start only once a page has settled, bringing a level's
  load event about two seconds sooner.
- images.code.org images and Font Awesome files are kept after their first
  load, so the landing page's images and icons never wait on the network.

### Progress

- Signed-out progress survives app restarts and updates, and a fresh start
  reopens the last page shown, from which Back returns to the landing page.
  Free-play labs reopen the last project.
- Opening a curriculum that starts on a level (Flappy Bird Code, Code with
  Anna and Elsa, Minecraft's Hero Journey) continues at the first level not
  yet passed, and so does Continue on a unit's overview.
- Try again on the congratulations screen forgets only that curriculum's
  progress; other curricula and projects stay.

### Identification

- The app names itself in the User-Agent, as
  `CodeAIApp/<version> (android; Amazon Kids+ Edition)`, and, where the
  WebView supports it, in `navigator.userAgentData` and the `Sec-CH-UA`
  headers.
- The Statsig stable ID, which is also the anonymous user ID, is derived from
  `ANDROID_ID`. Where the saved consent allows performance cookies, the app
  sets it before the first page loads; otherwise the cookie is left to the
  site. It survives updates, reinstalls and resets, and its cookie is renewed
  for a year on every page.

### Accessibility and safety

- While the loading screen shows, screen readers and keyboards reach only it,
  starting on its home control, not the page underneath.
- Try Now's accessible name keeps its visible label, as in "Try Now: AI for
  Oceans".
- Only the page itself, not an iframe, can go home or finish a curriculum,
  and only the landing page and the app's page script can reset one. A form
  cannot take the page to another site either, and a studio.code.org address
  on another port counts as another site.
- Pages get no camera, microphone or location, and a file input opens
  nothing. The app asks for no permission beyond the network.
- Nothing the app keeps is backed up or moved to another device.
- The volume keys set the volume of the app's sound.

### Packaging

- Targets Android 16 (API 36) and runs from Fire OS 7 (API 28), on 64-bit
  ARM, and installs to external storage where the tablet has it, as Amazon
  Kids+ requires.
- The release APK is named "CodeAI - Amazon Kids+ Edition.apk".

### Debug builds

- Header controls, as far from the right edge as the logo starts from the
  left and evenly spaced: Reset course, on course pages, which forgets that
  course's progress and reopens its first level; Show hidden elements, which
  outlines and shows everything the app hides, with a floating button to hide
  them again; and zoom out and zoom in, with the level between them when it
  is not 100%.
