## ADDED Requirements

### Requirement: Installable PWA build of the studio app

The studio Vite bundle SHALL be installable as a Progressive Web App on browsers that support installation, including Chrome on desktop and Android, and Safari "Add to Home Screen" on iOS.

#### Scenario: Web app manifest is served
- **WHEN** a user loads the studio app over HTTPS
- **THEN** the page MUST include a `<link rel="manifest">` pointing to a manifest with `name`, `short_name`, `start_url`, `display: "standalone"`, `theme_color`, `background_color`, and at least one `icons` entry sized 192×192 and one sized 512×512

#### Scenario: Install prompt fires on supported browsers
- **WHEN** the user has visited the app at least once on Chrome (desktop or Android) over HTTPS
- **THEN** the browser MUST surface its native install affordance
- **AND** accepting it MUST install the app with the manifest's name and icon, launching to `start_url` in standalone mode

#### Scenario: iOS home-screen install
- **WHEN** the user adds the app to home screen from iOS Safari
- **THEN** the launched app MUST display without the Safari URL bar
- **AND** MUST use the apple-touch-icon defined in the manifest

### Requirement: Service worker precaches the app shell

The studio app SHALL register a service worker that precaches the app shell (HTML entry, primary JS/CSS bundles, fonts, and core icons) so the catalog screen renders without network on subsequent launches.

#### Scenario: Cold launch with no network renders the catalog shell
- **WHEN** a user has previously loaded the app online at least once
- **AND** then opens the app with the device in airplane mode
- **THEN** the app MUST render the catalog screen header, navigation chrome, and any cached tile content without showing a browser network-error page

#### Scenario: Service worker updates do not break the running session
- **WHEN** a new service worker version is deployed and the user has the app open
- **THEN** the running session MUST continue to function using the previously cached shell
- **AND** the new shell MUST be activated on the next full app launch

### Requirement: Capacitor wrapper produces iOS and Android builds

The studio app SHALL be wrappable in Capacitor to produce native iOS and Android binaries that load the same Vite-built bundle from local file storage.

#### Scenario: `yarn build:mobile` produces a Capacitor-ready bundle
- **WHEN** a developer runs `yarn build:mobile` in `frontend/apps/studio`
- **THEN** the command MUST produce a `dist/` directory whose `index.html` uses relative asset paths (no leading `/` on bundled assets)
- **AND** the bundle MUST load successfully when opened via `file://`

#### Scenario: iOS Capacitor project syncs and runs
- **WHEN** a developer runs `npx cap sync ios` after `yarn build:mobile`
- **THEN** the Capacitor iOS project MUST be updated with the new web assets
- **AND** running the iOS project in the Xcode simulator MUST display the studio catalog screen

#### Scenario: Android Capacitor project syncs and runs
- **WHEN** a developer runs `npx cap sync android` after `yarn build:mobile`
- **THEN** the Capacitor Android project MUST be updated with the new web assets
- **AND** running the Android project in Android Studio's emulator MUST display the studio catalog screen

### Requirement: Build target separation preserves Rails-served studio

The studio app SHALL continue to build and serve correctly under its existing Rails-integrated mode after PWA and Capacitor capabilities are added.

#### Scenario: Existing `yarn dev` continues to work with Rails
- **WHEN** a developer runs `yarn dev` in `frontend/apps/studio`
- **AND** the dashboard Rails server is running
- **THEN** the studio app MUST mount under its existing Rails route exactly as before
- **AND** no service worker MUST be registered in this dev mode

#### Scenario: Existing `yarn build` continues to produce a Rails-compatible bundle
- **WHEN** a developer runs `yarn build` in `frontend/apps/studio`
- **THEN** the produced bundle MUST work when served by Rails via `vite-plugin-rails`, with no requirement for relative base paths

### Requirement: No authentication wall on first launch

The mobile shell SHALL allow a user to reach the catalog and launch a cached course without signing in, creating an account, or dismissing a login modal.

#### Scenario: First launch with no account and no network
- **WHEN** a user opens the app for the first time after install with the device offline
- **THEN** the catalog screen MUST render
- **AND** any tile marked as cached MUST be launchable
- **AND** no auth-required dialog, modal, or full-screen prompt MUST appear before the user has chosen to engage with one
