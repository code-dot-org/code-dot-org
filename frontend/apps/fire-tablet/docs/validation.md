# Validation record

This is an internal testing build. No physical Fire Tablet, audience-specific
test account, or verified device/profile matrix was supplied for implementation.
Device and authentication feasibility remain **unverified**. Build success and
mocked plugin tests do not establish those results.

## Inputs and ownership

| Input                                                              | Current status                                                                                       | Responsible role           |
| ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- | -------------------------- |
| Exact models/generations, Fire OS/API/WebView versions, RAM        | User selected the oldest current model sold new; candidate below, actual test device/WebView missing | Product + device tester    |
| Normal versus Amazon Kids/child profiles                           | Missing                                                                                              | Product + device tester    |
| Student/teacher audience and required first-party/provider sign-in | Missing                                                                                              | Product + Studio owner     |
| Representative courses/activities and required device capabilities | Missing                                                                                              | Product + curriculum owner |
| Distribution, ages, regions, stable identity and artwork           | Missing                                                                                              | Product + release owner    |

Do not advertise a model/profile/login method until its required checks pass.

The requested baseline is interpreted as the oldest generation still sold new
by Amazon in its current lineup. Initial candidate: **Fire 7 (2022, 12th Gen)**,
model **KFQUWI**, 2 GB RAM, 1024 × 600 display, Fire OS 8 / Android 11 / API 30.
Amazon's developer specification still lists this model and links a retail page.
Live checkout availability for the intended region was not confirmed; the
catalog also includes discontinued devices. Confirm availability before
procuring a test device. The installed OS patch and WebView version remain
unverified. The API 28 manifest minimum does not add a support claim for older
models.
[Amazon specifications](https://developer.amazon.com/docs/device-specs/ft-device-specifications-fire-models.html),
[retail listing](https://www.amazon.com/dp/B096WKKK2K)

## Selected implementation

Versions verified against published package metadata on 2026-10-05:
Capacitor core/Android/CLI **8.5.2**; official InAppBrowser **4.0.3**, whose peer
dependency requires Capacitor 8. CLI requires Node 22+, independently of web
checks. The Android dependencies use Java/Kotlin toolchain 21, AGP 8.13.0,
compile/target API 36, and native library `ioninappbrowser-android:2.0.2`.
Capacitor 8 is the current supported major. Sources:
[InAppBrowser API](https://capacitorjs.com/docs/apis/inappbrowser),
[plugin source](https://github.com/ionic-team/capacitor-os-inappbrowser/tree/258203817d175eb8d6f30388f5b9b3a6ec086e86),
[Capacitor support policy](https://capacitorjs.com/docs/main/reference/support-policy).

`openInWebView` uses the stock options: hidden toolbar/URL/navigation buttons;
Android hardware Back, zoom, background media pause, and process isolation
enabled; user interaction required for media; cache/session clearing disabled.
No page-load or navigation listener is used. An accepted open request only
updates local view state. The plugin offers no public page-error/reload or
pre-navigation cancellation API; test the visible native loading/error/Back
experience before claiming usability.

## Automated/build evidence

| Check                                                                  | Result                                                                                                                                                                                                     |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Yarn workspace installation with Node 20.20.2                          | Passed; existing workspace peer warnings remain                                                                                                                                                            |
| TypeScript/Vite web build with Node 20.20.2                            | Passed                                                                                                                                                                                                     |
| Plugin-boundary lifecycle tests                                        | Passed: initial ordering, duplicate suppression, deliberate reopen, initialization/open retry, stale completion, listener disposal                                                                         |
| Android debug build                                                    | Passed for the final source with Node 22.12.0, OpenJDK 21.0.2, SDK 36/build tools 36.0.0, Gradle 8.14.3                                                                                                    |
| Filtered lint/release checks, immutable install, existing Studio build | Passed under Node 20; nine launcher tests pass. Existing peer, shared-lint and Studio routing/chunk warnings remain                                                                                        |
| CI execution on GitHub                                                 | Not run locally; workflow and equivalent commands reviewed                                                                                                                                                 |
| Desktop keyboard/contrast/reflow                                       | Passed in Chromium 146: truthful preview; mocked failure/closure restores focus; Enter/Space retry; visible 3px focus; 48px target; 320px viewport with 400% text enlargement; no axe WCAG A/AA violations |
| Screen reader and physical Fire checks                                 | Unverified; no device/service available                                                                                                                                                                    |

The final-source debug artifact is
`android/app/build/outputs/apk/debug/app-debug.apk`, **18,728,587 bytes**, SHA-256
`4d7d6ce339967a03163f4d628f386399b09a36be80b670b8ef7d6a9fcb7f08de`.
Inspection confirmed the temporary package/display identity, version code 1,
minimum/target SDK 28/36, only `INTERNET` and AndroidX's app-scoped signature
receiver permission, cleartext and backup disabled, and local Capacitor config
with WebView debugging disabled. Its assets matched `dist` at that build and
its debug signature verified. Runtime dependencies contain no Google Play
services or Firebase. The generated host FileProvider was removed to avoid
sharing an authority with the plugin's own provider.

The final `yarn lint:fix --filter @code-dot-org/fire-tablet` and
`yarn release:dryrun --filter @code-dot-org/fire-tablet` passed. The repository
pre-commit hook passed against the staged source in this checkout.
Workflow YAML, change-filter selection and new action SHA pins were checked
locally. Release without signing/identity inputs fails with their missing
variable names; no unsigned/debug fallback is used. No signed production
candidate, GitHub CI run, or Fire installation was performed. ADB also could not
start its local socket in the restricted environment. Screen-reader testing is
unverified; the browser smoke check used a mocked plugin and is not Fire or
hosted-Studio evidence.

## Physical-device checklist

For each tested build/device/profile, record date, commit/APK SHA-256, exact
model/generation, Fire OS/API/WebView versions, RAM, role/login method, steps,
expected/observed result, pass/fail/unverified/inapplicable, and blocker owner.
Keep passwords, real student data, tokens, and callback URLs out of the record.

All rows below are currently **unverified**:

| Area                  | Required checks                                                                                                                                                                                 |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Launch and Back       | Cold launch stays in app; local and remote WebViews work; Back traverses history and exits at its beginning; Open Studio deliberately reopens; repeated actions/resume create no duplicate view |
| Network failures      | Offline start; slow load beyond 15 seconds with visible feedback; lost connectivity mid-navigation; safe DNS/TLS failure; Back provides an exit and deliberate reopen recovers                  |
| Authentication        | Required student/teacher first-party methods; relevant exposed providers; persistent reopen/restart; explicit logout followed by reopen; normal server expiry                                   |
| Learning              | Agreed activities load, accept touch input, run, save and reload; required media and popups/redirects work                                                                                      |
| Navigation            | Studio/auth/help/legal/user-content links; external transitions and return; no claim of a domain allowlist                                                                                      |
| Lifecycle             | Home/resume, sleep/wake, rotation, restart, saved progress; no promise of restoring arbitrary unsaved editor state                                                                              |
| Accessibility         | Discover and activate the local action after close with the device's supported accessibility service; keyboard and enlarged text                                                                |
| Optional capabilities | File/camera/microphone flows only if product requires them; removed permissions mean capture access is not supported by this phase                                                              |

Google OAuth prohibits embedded user agents independently of store policy;
Google sign-in is an unresolved architecture risk, not a tested working flow.
Do not spoof the user agent or copy cookies/tokens. A required failing provider,
unusable loading/error path, or required native customization blocks the cheap
wrapper's release and needs a separate scope decision.
[Google OAuth policy](https://developers.google.com/identity/protocols/oauth2/policies#use-secure-browsers)

## Verified support matrix

Empty. No physical Fire device or profile has passed acceptance yet.
