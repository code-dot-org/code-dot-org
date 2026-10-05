# Fire Tablet Studio wrapper

This private frontend workspace packages a small TypeScript launcher in an Android
APK. On startup, the official Capacitor InAppBrowser plugin opens
`https://studio.code.org/` in an embedded WebView inside the installed app. The
website supplies the existing Rails and `apps/` experience and deploys normally.

The launcher offers retry after a local launch failure and **Open Studio** after
the embedded view closes. Android Back traverses browser history, then closes
the view. Returning from Home does not request another browser. Remote page
loading, sign-in, and navigation remain website/plugin behavior.

There is no React runtime, bundled Studio, local account flow, native lab
optimization, or wrapper telemetry. A semantic HTML button and status region fit
this non-React bootstrap; shared design-system color tokens supply the styling.
The local Capacitor bridge stays separate from the remote page. No remote
`server.url`, injected scripts, custom user agent, headers, or cookie transfer
are configured. The fixed initial URL does not restrict subsequent navigation.

## Web development

Run from `frontend/` with the repository's Node 20 setup:

```bash
yarn install --immutable
yarn workspace @code-dot-org/fire-tablet dev
yarn workspace @code-dot-org/fire-tablet build
yarn release:dryrun --filter @code-dot-org/fire-tablet
```

The browser preview displays the fallback screen. It does not launch Studio or
exercise Android. Generic frontend commands never run native tooling. The local
JavaScript target is Chrome 71 as an initial Android 9 baseline; actual Fire
WebView versions and hosted-site compatibility still require device validation.

## Android development

Use Node 22+, JDK 21, and an Android SDK containing platform API 36, build tools
36.0.0, and platform tools. The app pins Capacitor core/Android/CLI 8.5.2 and
InAppBrowser 4.0.3; the checked-in wrapper selects Gradle 8.14.3 with its archive
checksum. Set `JAVA_HOME` to the JDK and `ANDROID_HOME` to the SDK; put platform
tools on `PATH`. Android Studio can install these SDK components, or use:

```bash
sdkmanager 'platforms;android-36' 'build-tools;36.0.0' 'platform-tools'
```

Then run from `frontend/`:

```bash
yarn install --immutable
yarn workspace @code-dot-org/fire-tablet android:build:debug
adb install -r apps/fire-tablet/android/app/build/outputs/apk/debug/app-debug.apk
adb shell am start -n org.code.firetablet.debug/.MainActivity
```

Each `android:build:*` command builds current web assets, runs the pinned local
`cap sync android`, then assembles with Gradle. `android:sync` performs just the
first two steps. Native tools are required only for these explicit commands.
An Android phone/emulator is useful supplementary testing; it cannot establish
Fire compatibility.

The debug identity is **Studio (internal test)** / `org.code.firetablet.debug`,
version code 1. The standard generated icon/splash are temporary. The initial
device candidate is Fire 7 (2022, 12th generation), following the requested
oldest model still sold new criterion; see the availability caveat in validation.
Minimum API 28 is a packaging boundary, not verified support for every device or
Amazon Kids profile. Older Fire OS versions are excluded by this build.

Debug APKs are for internal validation. Camera, microphone, and location
permissions inherited from the browser library are removed; flows requiring
them are outside this phase's supported claims. HTTPS validation stays enabled,
cleartext traffic and WebView debugging are disabled, and browser cookies/cache
are not cleared on open. Verify session persistence and logout on actual tablets.

## CI and release

Frontend CI selects this app when its source, shared lint/styles, frontend root
inputs, or relevant workflow/setup inputs change. Web checks use Node 20; a
separate Node 22/JDK 21 job builds and uploads `fire-tablet-debug-<commit>` without
production secrets. Ordinary Studio/Rails builds continue to select Studio;
their existing broad frontend asset hashing may invalidate caches when files in
this workspace change.

See [validation.md](docs/validation.md) for evidence and pending device checks,
and [release.md](docs/release.md) for identity, signing, and distribution gates.
No publishing or store submission is part of the build.
