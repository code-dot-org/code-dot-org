# Changelog

What changed in each version of the CodeAI Android app. The version is
`versionName` in `android/app/build.gradle` and `version` in `package.json`;
`versionCode` rises by one with each.

## 0.3.0 (2026-11-02)

### Screens

- The landing page follows the "Amazon Fire Kids Screen" design in Figma:
  all ten curricula on one screen, five to a row, each card showing image,
  category, title, ages and Try Now. Titles, categories and ages come from
  the design.
- On landscape tablets wider than a Fire HD 8, the screens grow with the
  screen, as the design's Fire HD 10 frames do.
- The status bar is hidden; a swipe from the top edge shows it.
- The header is shorter and centers the privacy policy beside the logo; the
  privacy policy shows on the landing page and the offline screen only.
- The loading screen shows the wordmark and a spinner on the landing page's
  grey background.
- The offline screen's title is larger, and its text reads "Check that the
  Wi-Fi is on, or ask a grown-up for help."
- Headings and card titles use Space Grotesk, now bundled with the app.

### Progress

- Try again on the congratulations screen forgets only that curriculum's
  progress; other curricula and projects stay. Before, it erased everything.
- Opening a curriculum that starts on a level (Flappy Bird Code, Code with
  Anna and Elsa, Minecraft's Hero Journey) continues at the first level not
  yet passed, and so does Continue on a unit's overview. Before, both opened
  the first level.
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
- Only the page itself, not an iframe, can go home, reset or finish a
  curriculum, and a studio.code.org address on another port counts as
  another site.

### Site pages

- The "You are not signed in" callout is hidden.
- The app names itself in `navigator.userAgentData` and the `Sec-CH-UA`
  headers as well as in the User-Agent.

### Debug builds

- Reset course, on course pages, forgets that course's progress and reopens
  its first level.
- Show hidden elements outlines and shows everything the app hides; a
  floating button hides them again.
- The zoom level shows between the zoom buttons when it is not 100%.
- The header controls end as far from the right edge as the logo starts from
  the left, evenly spaced.

## 0.2.0 (2026-10-21)

Aligns the app with the Amazon Kids+ submission guidelines.

- Links that lead off studio.code.org are blocked and hidden; the privacy
  policy is text a parent can copy rather than a link.
- An offline screen replaces pages that cannot load, retries when the tablet
  reconnects, and offers a way back to the curricula.
- The landing page lists the ten curricula of the Amazon Fire Kids Content
  Library.
- The app stays in landscape.
- A loading screen covers the WebView while a page loads; Google's tag
  scripts start only once the page has settled.
- The unsupported-browser warning is hidden.
- The landing page's build no longer carries the labs' code, and bundles
  only the fonts it uses.
- Pages style correctly on Fire OS 7, whose WebView predates CSS cascade
  layers.
- Kotlin unit tests cover the site policy and page injection.

## 0.1.0 (2026-10-09)

The first prototype.

- A Capacitor app whose landing page lists the curricula and opens each in
  one WebView on studio.code.org.
- The page script hides the site's header links, menus, footers, sharing and
  certificates; finishing a curriculum returns to a congratulations screen.
- Signed-out progress survives app restarts, and free-play labs reopen the
  last project.
- The app is English only, whatever the device language.
- Debug builds can zoom site pages.
