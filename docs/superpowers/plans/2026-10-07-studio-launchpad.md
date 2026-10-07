# Studio launchpad implementation plan

**Goal:** Demonstrate `frontend/apps/studio` as the packaged React/TypeScript home screen of an Android/iOS prototype, launching five hosted activities from Exhibit A.

**Architecture:** A separate Studio HTML/React entry builds only the launchpad and design system. The Capacitor workspace packages that output. A local `CuratedActivities.open` plugin presents an isolated remote WebView, checks HTTPS/host/path navigation before allowing it, and resolves when the child returns Home. The website receives no native bridge. Normal Rails Studio keeps its existing entry and routing.

**Tech stack:** Existing React 18, TypeScript, Vite, MUI/CodeAI theme, Capacitor 8.5.2; Android Java WebView and iOS Swift WKWebView.

**Source:** [Amazon Fire Kids Phase 1 PRD, Exhibit A tracker](https://docs.google.com/document/d/1m_J9RVHiTadipL2_XcYBrzQcdVa8KCnKV4nxaHMswYE/edit?tab=t.0), read October 7, 2026. Tracker entries are untested, not an approved launch slate.

## Design decisions

- Select entries 1, 7, 8, 15, and 22: Pre-Reader Express (4–7), AI for Oceans (7–11), Dance Party: AI Edition (11–14), Minecraft Adventurer (7–14), Music Lab free play (7–14). This samples all three groups and varied age ranges, engines, audio, and guided/free-play behavior.
- Launch the hosted courses using `/s/pre-express-2025`, `/s/oceans`, `/s/dance-ai-2023`, `/s/mc`, and `/projects/music/new`. Permit each selected course's `/courses/<name>` redirect as well as its `/s/<name>` routes. Permit Music Lab project routes, which include generated IDs. Do not permit the entire Studio domain.
- Keep navigation policy scoped to the selected activity. Block website/account links, external schemes, popups, and downloads. Preserve asset/API requests so activities run unchanged. This is a prototype navigation boundary, not a complete kiosk/content filtering system.
- No accounts, activity rewrites, bundled Oceans, progress tracking, analytics, offline curriculum, or production store submission. Browser preview shows the same cards with a clearly labeled link to try the hosted activity in a browser; it cannot demonstrate native containment.
- The iOS and Android implementations expose the same `open({url,title,allowedPaths})` contract. The React UI owns selection and errors. Native views own loading, retry, Back/Home, and navigation enforcement.

## Tasks and verification

- [ ] Create the worktree at `.claude/worktrees/fire-tablet` on `stephen/fire-tablet-studio-wrapper`. Verify with `git worktree list` and `git status --short --branch`; preserve the original checkout.
- [ ] Add Studio's `launchpad/index.html`, `entrypoints/launchpad.tsx`, `vite.launchpad.config.ts`, `tsconfig.launchpad.json`, and `src/modules/launchpad/` catalog, opening boundary, and React view. Use existing design-system theme, semantic controls, visible focus, and responsive SCSS. Provide a story for the new view. Contract:

  ```ts
  interface CuratedActivitiesPlugin {
    open(options: {
      url: string;
      title: string;
      allowedPaths: string[];
    }): Promise<void>;
  }
  ```

- [ ] Add focused tests in `src/modules/launchpad/__tests__/`: native selection passes the selected URL/policy; web preview does not call native APIs; launch errors allow retry; closing restores focus; repeated taps cannot open parallel views.
- [ ] Change the packaging workspace's `webDir` to `../studio/dist-launchpad`, build through the Studio launchpad Turbo task, and remove the superseded launcher/source tests. Add the pinned iOS dependency; install with Yarn and then verify `yarn install --immutable`.
- [ ] Add Android's `CuratedActivitiesPlugin`, `CuratedActivity`, and `NavigationPolicy` next to `MainActivity`; register the plugin and non-exported isolated activity in the manifest. The policy checks exact `https://studio.code.org` origin, rejects encoded/ambiguous paths, and matches a prefix only at a path-segment boundary. Native unit tests cover valid redirects, adjacent/unrelated courses, userinfo, non-HTTPS URLs, hostile hosts, encoded separators, and dot segments.
- [ ] Generate the Capacitor iOS project, register the local plugin through a custom bridge controller, and implement the same policy in Swift. Keep WKWebView separate from the bridge and use a non-persistent store. Check project/source registration and sync; record that Xcode build/device validation is unavailable on Linux.
- [ ] Update the CI path filter to rebuild the wrapper when Studio changes. Run Android policy unit tests in the debug job. Update Studio README/architecture and wrapper README/validation with exact commands and limitations.
- [ ] Run targeted frontend tests, lint/format/style/type checks and the normal Studio build to detect regressions. Build the launchpad and inspect output to establish that lab bundles and auth/bootstrap code are absent.
- [ ] Run Chromium smoke checks of the preview, keyboard/focus, narrow portrait and tablet landscape reflow, and axe. Mock only the native boundary for native launch/return behavior. Verify every selected live URL redirects into its permitted course/project family; do not claim device compatibility from browser tests.
- [ ] If an Android toolchain can be installed locally, build `assembleDebug` and `testDebugUnitTest`, inspect the manifest and packaged launchpad, and provide the APK. Record unavailable physical Fire and iOS tests without marking them complete.

## Commands

Run from `frontend/` in this worktree:

```bash
yarn install --immutable
yarn workspace @code-dot-org/studio test
yarn build:launchpad --filter @code-dot-org/studio
yarn release:dryrun --filter @code-dot-org/fire-tablet --filter @code-dot-org/studio
yarn workspace @code-dot-org/fire-tablet dev
yarn workspace @code-dot-org/fire-tablet android:build:debug
yarn workspace @code-dot-org/fire-tablet ios:sync
```

On macOS, open `frontend/apps/fire-tablet/ios/App/App.xcodeproj`, select an iOS simulator and build/run. No iOS signing identity or release claim is supplied by this prototype.
