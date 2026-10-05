# Release record

The internal debug APK can be built without release inputs. A signed production
candidate and public readiness remain open: no owner-confirmed identity/artwork,
signing key, device evidence, audience, distribution route, or release owners
were supplied. The temporary debug identity/icon are not production branding.

The last assembled APK and final-source rebuild limitation are recorded in
[validation.md](validation.md). Rebuild the current source before device testing
or preparing any candidate.

## Signed builds

Have the release owner provide these environment variables outside the checkout
and normal PR jobs. Use the existing signing key when updating a distributed app.

| Variable                     | Value supplied by owner                                                      |
| ---------------------------- | ---------------------------------------------------------------------------- |
| `FIRE_TABLET_APP_ID`         | Stable Android application ID, distinct from the temporary `.debug` identity |
| `FIRE_TABLET_APP_NAME`       | Approved display name                                                        |
| `FIRE_TABLET_VERSION_CODE`   | Positive integer, greater than previously distributed codes                  |
| `FIRE_TABLET_VERSION_NAME`   | Release version label                                                        |
| `FIRE_TABLET_STORE_FILE`     | Absolute path to signing keystore outside the checkout                       |
| `FIRE_TABLET_STORE_PASSWORD` | Keystore password                                                            |
| `FIRE_TABLET_KEY_ALIAS`      | Signing key alias                                                            |
| `FIRE_TABLET_KEY_PASSWORD`   | Key password                                                                 |

With the documented native toolchain, run from `frontend/`:

```bash
yarn workspace @code-dot-org/fire-tablet android:build:release
```

The command builds/syncs current assets and runs Gradle `assembleRelease`. Missing
inputs fail explicitly. It uses the supplied signing configuration; it does not
fall back to debug signing. The expected output is
`apps/fire-tablet/android/app/build/outputs/apk/release/app-release.apk`.
Replace the generated icon/splash with owner-approved assets before a candidate.
Never commit private keys, passwords, machine SDK paths, or APKs.

Before accepting a candidate, inspect package name, display assets, version,
minimum SDK, merged permissions, packaged Capacitor config, HTTPS behavior and
disabled release debugging. Verify its signing certificate with `apksigner
verify --verbose --print-certs`. Install an increased-code candidate over the
prior build with the same application/signing identity and test sessions and
saved progress. These checks have not run without owner-supplied signing inputs.

## Distribution and review

Product/release must record internal versus Amazon Appstore distribution,
regions, audience/ages, supported profiles, final identity, and named owners of
signing custody, native updates, device testing and release decisions.

An Amazon submission uses an Android APK. Its discontinued Mobile Web App route
is not used. Google Play store policy is not the distribution policy for an
Amazon-only app; provider authentication restrictions still apply.
[Amazon web-app notice](https://community.amazondeveloper.com/t/web-apps-discontinued/7508)

Before public distribution, responsible owners must record findings and evidence
for these current Amazon requirements across the wrapper and hosted website:

| Review                                | Evidence still needed                                                                               | Source                                                                                                                                                              |
| ------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dedicated app/browser classification  | Reachable navigation and Amazon feedback if needed; acceptance is not guaranteed for a thin wrapper | [Device filtering](https://developer.amazon.com/docs/app-submission/device-filtering-and-compatibility.html#device-filtering-by-web-browser-apps)                   |
| Fire Tablet behavior, group 2b        | Launch, Back/Home, lifecycle, loading feedback beyond 15 seconds, working advertised authentication | [Test criteria](https://developer.amazon.com/docs/app-testing/test-criteria.html#test-criteria-group-2b-app-behavior-on-fire-tablet-device)                         |
| Children/audience and data disclosure | Intended ages/regions, existing website/SDK data handling, consent and accurate disclosures         | [Children](https://developer.amazon.com/docs/policy-center/privacy-children.html), [Privacy](https://developer.amazon.com/docs/policy-center/privacy-security.html) |
| Account deletion                      | Applicable in-app deletion request and external deletion URL for reachable account flows            | [User data/deletion](https://developer.amazon.com/docs/policy-center/user-data-privacy.html#user-account-deletion)                                                  |
| User-generated content                | Applicable project/gallery terms, reporting and moderation controls                                 | [UGC](https://developer.amazon.com/docs/policy-center/restricted-content.html#user-generated-content)                                                               |

If product explicitly selects internal-only distribution, mark store-only items
inapplicable with that decision; functionality, privacy and authentication still
need evidence. No wrapper analytics does not imply that the hosted site collects
no data. Record separate remediation for website policy gaps. This change does
not authorize redesigning hosted flows or publishing/submitting the APK.

## Operations

Studio continues its normal website deployments; the APK contains only the
launcher. The designated native owner reruns relevant device smoke checks after
website changes to authentication, navigation, browser support or required labs.
Pin native dependencies and repeat session/Back/network tests on upgrades.
Signing-key custody belongs to the release owner and remains outside source
control. Native fixes require a signed binary with a higher version code.
Pausing distribution does not remove installed apps or permit automatic
downgrades. Website regressions use the existing website rollback process.

There is no automatic publishing, separate remote updater, or new Rails flag.
The final handoff must distinguish internal APK availability, signed-candidate
validation, and public-release gates, and link the actual validation record.
