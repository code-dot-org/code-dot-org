# Cucumber to Playwright migration audit

Date: 2026-09-02. Branch audited: `staging` at 86ea7a397. Scope: the 44
Cucumber feature files tagged `@playwright` and the 46 Playwright spec files
under `frontend/packages/e2e-tests/tests`. Read-only. No browser suite was run.
Evidence is static analysis, config reading, an out-of-tree lint run, and PR
history read through the GitHub API.

The question: can a migrated Playwright test go red? A test written against
already-working behavior and merged green may assert nothing, assert less than
the scenario it replaced, or not run at all. CI cannot tell that from a healthy
test. The proposal "Scaling Playwright Migration Across CodeAI" asks to stop
running all 44 tagged features on Cucumber in one step, so this is the last
point at which the two suites can be compared while both still run.

## 1. Summary

| Phase | Result |
|---|---|
| 0 Discovery | 270 Cucumber features, 750 scenarios (737 plain + 13 outlines). 44 features (137 scenarios, 153 test instances once outline rows are expanded) tagged `@playwright`. 46 Playwright specs, 153 parsed test bodies. Tracker spreadsheet is two features behind disk (42 vs 44). |
| 1 Running? | Cucumber still runs every `@playwright` feature: no runner skip exists. 21 Playwright `@visual` tests and 4 `@no_ci` tests never gate a merge. 10 conditional `test.skip`, 3 `test.fixme`, 0 `.only`. Retries = 2 in every automated lane; flaky passes are counted, reported, never failed. |
| 2 Unfailable patterns | 0 unawaited async assertions, 0 conditional expects in specs, 0 `waitForTimeout`, 0 `force: true`, 0 `expect.soft`, 0 truthy-on-locator. 21 tests have no `expect` in their own body: 13 are visual-only, 8 assert through a helper. `eslint-plugin-playwright` is not installed; type-aware lint is off. |
| 3 Equivalence | 153 instances audited. EQUIVALENT 82, EXPANDED 54, WEAKENED 12, DROPPED 1 whole claim plus 6 partial, UNMAPPED 1 (a scenario Cucumber already skipped). 0 Cucumber files deleted. The two riskiest deltas are in Global Edition project visibility and region switching. |
| 4 Process | 31 merged port PRs sampled. 0 contain a deliberate-break check. 7 show the new test red in CI for infrastructure reasons before a fix. 1 shows a test red because the app lacked the behavior. 17 carry only pass-count claims. 26 were approved with no review comment. |

Two things the migration documents state that the code does not support:

- The port workflow's commit message says the `@playwright` tag exists "so the
  Cucumber suite skips it" (`.claude/workflows/port-cucumber-to-playwright.js:954`).
  Nothing in `dashboard/test/ui/runner.rb` or anywhere else excludes that tag.
  Both suites run all 44 features on every Drone PR and every DTT.
- The stability gate (five repeats, three browsers, zero retries) proves a test
  passes. Nothing in the workflow, the PR template, or any sampled PR proves a
  test can fail.

## 2. Phase 3: migration equivalence

### 2.1 Method

Five read-only passes, one per risk group, each resolving every Cucumber step to
its Ruby definition and every Playwright assertion through page objects and
shared helpers. Pairings come from the `Source:` JSDoc comments in the specs; 5
tests were paired by title alone and are marked UNVERIFIED PAIRING below. Full
per-scenario tables with file:line citations are in Appendix A. The headline
findings were re-verified against source by hand; one agent claim did not
survive that check and is noted in 2.4.

Two facts about the Cucumber side change how EQUIVALENT should be read:

- `Then I am on "<url>"` is the navigation step (`steps.rb:126-138`). It asserts
  nothing. It appears as a `Then` 143 times in 47 feature files. Several ported
  scenarios (for example `policy_compliance.feature:15-20`) had no assertion at
  all; the Playwright replacements add a `toHaveURL`, which is why the CAP group
  is mostly EXPANDED.
- A Cucumber Eyes mismatch never fails a scenario. `I close my eyes` rescues
  `Applitools::TestFailedError` and prints (`eyes_steps.rb:41-44`); the count is
  a separate metric (`runner.rb:354,689-690`). Under the Drone config
  (`config/test.yml.erb:159`, `disable_all_eyes_running: true`) every eyes step
  is a no-op and only the functional steps of an `@eyes` scenario run. So on the
  visual claim itself the two suites are at parity. The regression is
  different: functional assertions that Cucumber ran on every PR are now inside
  Playwright `@visual` tests, which run only in the non-gating eyes lane.

### 2.2 Risk-sorted delta table (UNMAPPED and DROPPED first, then WEAKENED, then changed preconditions)

| # | Cucumber scenario | Playwright test | Verdict | What changed | Risk path |
|---|---|---|---|---|---|
| 1 | `platform/header.feature:81` Student can click on the header links (`@skip @chrome`) | none | UNMAPPED | No port. Cucumber has skipped it since before the migration, so no running coverage is lost. Needs a tracker "retire" decision rather than silence. | header |
| 2 | `platform/global_edition/fa/teacher_dashboard.feature:14` | `global-edition/fa-teacher-dashboard.spec.ts:26-28` | DROPPED (1 claim) | URL prefix `/fa/teacher_dashboard/home` no longer asserted; replaced by the `data-ge-region` attribute. UNVERIFIED PAIRING (informal "Ported from" comment, no `Source:`). | Global Edition, teacher |
| 3 | `platform/global_edition/fa/personal_project_gallery.feature:10-34` | `global-edition/fa/personal-project-gallery.spec.ts:15-50`, `pages/personal-project-gallery.ts:54-56` | WEAKENED, 3 claims dropped | Region switched with `?ge_region=fa` override instead of the footer locale selector the feature exercised. Readiness waits for the English heading "Create a new project", so the Farsi locale is never applied. Dropped: URL contains `/fa/projects`, `html[lang='fa-IR']`, persistence across reload. Student is no longer section-enrolled (`feature:8`). Verified by hand. | project visibility, Global Edition, section membership |
| 4 | `platform/global_edition/region_select.feature:4-20` | `global-edition/region-select.spec.ts:21-29` | WEAKENED | Three exact-URL checks became unanchored regexes. `:29` `/\/users\/sign_in\?lang=en-US/` also matches `/fa/users/sign_in?lang=en-US`, so failing to leave the region passes. `:26` accepts a `?lang=` the feature forbade. Verified by hand. | Global Edition |
| 5 | `platform/login_redirect.feature:12-25` (both scenarios) | `sign-in/login-redirect.spec.ts:39,49-53,78-82` | WEAKENED | Exact post-login URL became pathname-suffix plus "no login_required param"; sign-in URL check is an unanchored regex. A wrong locale prefix or stray query passes. Sign-out changed from server call (204 asserted) to cookie clear. | authentication |
| 6 | `platform/header.feature:32,45` Spanish header scenarios | `platform/header.spec.ts:65-68,116-119` | WEAKENED (browser coverage) | `test.skip` unless chromium. Cucumber scenarios carried no `@chrome` and ran on Chrome, Firefox, Safari. | header, i18n |
| 7 | `platform/header.feature:4,17` English header scenarios | `platform/header.spec.ts:24-27,48-52` | WEAKENED (minor) | Cucumber bound each `#header-*` id to its label text; Playwright checks a link with each label exists anywhere in `.headerlinks`. | header |
| 8 | `platform/global_edition/fa/sign_in_page.feature:16-21` | `global-edition/fa/sign-in-page.spec.ts:23-35` | WEAKENED (minor) | Six `form[action=...]` bindings dropped (Go posts to `/fa/join`, each OAuth button to its provider path, sign-in to `/fa/users/sign_in`); buttons located by id only. | authentication, Global Edition |
| 9 | `xteam/race_interstitial.feature:6-15` | `race-interstitial/race-interstitial.spec.ts:12-32` | WEAKENED (lane-gated) | Assertions are equal or stronger, but the whole test is `@visual`, so modal shown, declined, hidden never run in chromium/firefox/webkit. Cucumber ran them on every Drone PR (eyes steps were no-ops there). No functional twin, unlike cookie-banner. | consent flow |
| 10 | `xteam/cookie_banner.feature:8` | `platform/cookie-banner.spec.ts:20-22` | 1 claim DROPPED | "wait until no `.close` visible" (language selector dismissed) omitted on an unverified premise that LocalizeJS is force-disabled. | consent |
| 11 | `xteam/gdpr_dialog.feature:18,43` | `gdpr/gdpr-dialog.spec.ts:65-70,157-162` | EQUIVALENT with substitution | `data-gdpr.show_gdpr_dialog == "false"` script-data claim replaced by "accept POST returned ok". Reload-no-dialog persistence claim kept. | consent |
| 12 | `platform/one_trust.feature:73` embedded `music` row | `platform/one-trust.spec.ts:207` | WEAKENED (browser) | `test.fixme` on webkit for lab2 projects, issue #73740. Cucumber ran the row unconditionally. | feature flag |
| 13 | `platform/one_trust.feature:51-62` | `platform/one-trust.spec.ts:169-179` | EQUIVALENT (vacuous in both) | "not categorized by OneTrust" passes if the script tags do not exist (`steps.rb:896-898`); port preserves the vacuity. | feature flag |
| 14 | `foundations/create_dropdown.feature:48,61` young student scenarios | `foundations/create-dropdown.spec.ts:124-128,167-171` | EXPANDED, precondition changed | The under-13 account now carries `country_code US, us_state WA`. The stateless under-13 path the feature tested is no longer exercised (comment cites the student-info interstitial). | age-gating |
| 15 | `policy_compliance/lockout_phase.feature` (10), `policy_compliance.feature` (7), `manage_students_tab.feature` (1) | `policy-compliance/*.spec.ts:30,92`, `manage-students/manage-students-tab.spec.ts:29` | EQUIVALENT or EXPANDED, precondition changed | `GeolocationOverride=US` pinned; Cucumber relied on runner geolocation. Playwright scopes `#user_us_state` to `#account-information`, which makes the four not-in-Colorado "enabled" assertions non-vacuous for the first time. All 24 CAP scenarios otherwise preserved or strengthened. | age-gating, parental consent, roster |
| 16 | `policy_compliance.feature:32-58,115-142` | `policy-compliance/policy-compliance.spec.ts:76`, `components/parental-permission-nag-modal.ts:46-57` | EQUIVALENT | `dismissIfShown` waits up to 10s and proceeds either way; no assertion depends on the path, but whether the nag modal shows for these accounts is unobserved. | parental consent |
| 17 | `teacher_dashboard/manage_students_tab.feature:27-34` | `pages/teacher-dashboard/manage-students-page.ts:56-63`, `manage-students-tab.spec.ts:64-65` | EQUIVALENT (fragile) | Row select and Save located across the whole table, not `tbody tr:nth-child(1)`; "AL" accepted anywhere in the row. Sound only with one student. | roster |
| 18 | `star_labs/blocklayout.feature:9-26` | `activities/block-layout.spec.ts:16-25` | WEAKENED (expected values changed) | Expected offsets changed from the feature's (16,191), (20,166), (16,239), (20,22) to (16,189), (20,164), (16,236), (20,20), same +/-3 tolerance. The spec encodes what the app renders today, not what the feature specified. Verified by hand. This is the exact failure class the audit was asked to find. | none (lab layout) |
| 19 | `student_learning/weblab2/weblab2_preview.feature:17` | `pages/weblab2.ts:166` | WEAKENED | `#codeprojects-preview-container` check downgraded from visible to attached. `@no_ci` in both suites. | none |
| 20 | `star_labs/artist.feature:21` | `activities/artist/artist.spec.ts:62-66` | WEAKENED (minor) | Post-continue URL matched by pathname only; Cucumber required exact URL. | none |
| 21 | `eyes.feature:67-80` star wars RTL | `activities/eyes.spec.ts:244-261` | WEAKENED | Implicit `#x-close` presence claim dropped (`dismissIfShown` tolerates absence). No functional twin, so nothing from this scenario runs in a gating lane. | i18n |
| 22 | `foundations/i18n.feature:140` Pixelation Widget | `foundations/i18n.spec.ts:376` | DROPPED on webkit | `test.fixme(webkit)`, issue #73740. Cucumber had no browser exclusion. Markdown comparison replaced Redcarpet+Nokogiri with five regexes (`shared/i18n.ts:84-111`); divergence fails rather than passes. | i18n |
| 23 | `foundations/i18n.feature:29,74,129` toolbox categories | `pages/legacy-blockly-lab.ts:256-261` | EQUIVALENT, UNVERIFIED locator | Categories addressed by flattened ARIA `treeitem` index instead of `nth-child` CSS on the visible toolbox. Mapping is structural, not identical. | i18n |
| 24 | `eyes.feature`, `initial_page_views*.feature` visual rows | `activities/eyes.spec.ts:76,103,206-220`, `initial-page-views.spec.ts:27,90-95`, `markdown-rendering.spec.ts:55-57` | EXPANDED, visual subject narrowed | Masks remove the scenario's own subject: the function-editor modal in "auto open function editor", the maze playfield in both maze checkpoints, the answer column in both match checkpoints. Pixelation now screenshots with the long-instructions dialog forced open; Minecraft rows dismiss the player-selection interstitial first. Baselines depict different states than Cucumber's. | none (visual) |
| 25 | `initial_page_views2.feature:15` (7 rows), `initial_page_views3.feature:26` (2 rows) | `initial-page-views-2.spec.ts`, `initial-page-views-3.spec.ts` | EXPANDED, 1 trivially-true claim dropped each | `.uitest-attachment is not visible` and language-selector dismissal dropped; both were vacuously true because the elements never render. | none |
| 26 | `platform/signing_in.feature` (4) | `sign-in/signing-in.spec.ts:11,35,55,79` | EQUIVALENT / EXPANDED, UNVERIFIED PAIRING | No `Source:` comments; matched by title. URL checks pathname-only vs exact. Section-join scenario adds a `/logged_out` destination check. | authentication |

Everything not listed above was EQUIVALENT or EXPANDED with no caveat. The
EXPANDED rows are mostly axe WCAG-AA baselines compared with `toEqual` against an
exact violation map; those fail when a violation appears and also when a listed
violation is fixed (documented in each spec as intentional).

### 2.3 Per-feature summary

| Feature (dashboard/test/ui/features/) | Instances | EQ | EXP | WEAK | DROP | UNMAP | Notes |
|---|---|---|---|---|---|---|---|
| platform/signing_in | 4 | 3 | 1 | | | | unverified pairing |
| platform/login_redirect | 2 | | | 2 | | | URL loosening |
| foundations/user_menu | 4 | 1 | 3 | | | | |
| foundations/create_dropdown | 5 | 1 | 4 | | | | 2 with changed precondition |
| platform/header | 6 | 1 | 2 | 2 | | 1 | 2 chromium-only |
| global_edition/fa/sign_in_page | 1 | | | 1 | | | minor |
| global_edition/fa/sign_up_page | 1 | 1 | | | | | |
| global_edition/fa/personal_project_gallery | 1 | | | 1 | | | 3 claims dropped |
| global_edition/fa/teacher_dashboard | 1 | | | | 1 | | unverified pairing |
| global_edition/region_select | 2 | 1 | | 1 | | | |
| policy_compliance/lockout_phase | 10 | 10 | | | | | geolocation pinned |
| policy_compliance/policy_compliance | 7 | 3 | 4 | | | | |
| policy_compliance/parental_permission | 6 | | 6 | | | | `Source:` paths omit `platform/` |
| teacher_dashboard/manage_students_tab | 1 | 1 | | | | | table-scoped locators |
| xteam/gdpr_dialog | 5 | 4 | 1 | | | | |
| platform/one_trust | 1 + 1 + 9 rows | 10 | | 1 | | | webkit fixme on 1 row |
| xteam/cookie_banner | 1 | 1 | | | 1 claim | | |
| xteam/race_interstitial | 1 | | | 1 | | | lane-gated |
| dcdo_mocking | 1 | 1 | | | | | |
| projects/public_project_gallery_signed_out | 2 | 2 | | | | | |
| teacher_dashboard/demo_section_card | 1 | | 1 | | | | |
| teacher_tools/unnumbered_lessons | 1 | | 1 | | | | |
| teacher_tools/documentation_landing_page | 2 | 2 | | | | | |
| level_types/multi, multi2, multi3, multi4 | 13 | 10 | 3 | | | | thin tests inherited |
| level_types/map_level | 1 | | 1 | | | | |
| level_types/standalone_video | 1 | | 1 | | | | |
| teacher_tools/progress | 2 | 1 | 1 | | | | server persistence preserved |
| star_labs/artist | 3 | 2 | | 1 | | | |
| star_labs/bee | 1 | 1 | | | | | |
| star_labs/blocklayout | 3 | 2 | | 1 | | | constants changed on all 3 |
| weblab2/weblab2_general, weblab2_preview | 2 | 1 | | 1 | | | |
| teacher_tools/authored_hints | 1 | 1 | | | | | |
| teacher_tools/callouts | 5 + 2 rows + 4 | 10 | 1 | | | | |
| teacher_tools/contextual_hints | 2 | 2 | | | | | |
| eyes | 7 | | 6 | 1 | | | all visual |
| initial_page_views | 5 rows | | 5 | | | | masks narrow subject |
| initial_page_views2 | 7 rows | | 7 | | | | |
| initial_page_views3 | 3 rows | | 3 | | | | |
| foundations/markdown_rendering | 2 | 2 | | | | | second is visual-only, no twin |
| foundations/i18n | 16 | 16 | | | (1 on webkit) | | 3 locator-unverified |
| **Total** | **153** | **82** | **54** | **12** | **1 + 6 partial** | **1** | |

Counts are as reported by each group pass; group B2 counted three net-new a11y
tests in its own totals, which are excluded here.

### 2.4 Verification notes

- Confirmed by hand: the Global Edition gallery finding (#3), the region-select
  regex (#4), the block-layout constants (#18), the `I am on` navigation step,
  and the Cucumber eyes rescue.
- Rejected: group C also claimed the "malformed start blocks" input differs
  because Ruby's single-quoted `'\n\n    <xml>'` holds literal backslash-n. That
  string is interpolated into a JavaScript single-quoted literal
  (`blockly_initialization_blocks.rb:120`), where `\n` becomes a newline, so
  both suites feed the arranger the same bytes. Not a delta.
- Not independently verified: locator substitutions from Cucumber ids to
  accessible names (`#create_account_button`, `#user-edit`, `#user-signout`,
  `#section_code_submit`, `#header-*`, `go-to-lesson-dropdown-button`, the
  gallery `h1`) target the same DOM node. Each is flagged in Appendix A.

## 3. Phase 1: is it running?

### 3.1 Suite-level facts

| Fact | Where | Consequence |
|---|---|---|
| The Cucumber runner never excludes `@playwright`. | `dashboard/test/ui/runner.rb:775-814`; no `not @playwright` anywhere. | Both suites run all 44 ported features on every Drone PR and DTT. No coverage removed yet. The proposal's decision 1 would remove 137 scenarios in one commit. |
| Drone is the only merge gate for either suite. | `.drone.yml:225-265`, `lib/rake/ci.rake:124-250`. | Playwright functional (chromium only by default) and all Cucumber features gate. Firefox and WebKit Playwright projects run only on the DTT (post-merge) and the fire-and-forget GitHub Actions dispatch (`dtt.yml`). `frontend-ci.yml` never calls `e2e-tests-ci.yml`; no GitHub Actions Playwright run happens on PRs. |
| Neither suite fails a build on a visual diff. | Cucumber: `eyes_steps.rb:41-44` rescues the mismatch; `config/test.yml.erb:159` disables eyes entirely under the Drone config. Playwright: `lib/rake/test.rake:133-141` "Never stops a build"; `e2e-tests-ci.yml:165` sets `APPLITOOLS_SHOULD_REPORT_FAILURE=false` on PRs. | Parity on visual claims. But Cucumber `@eyes` scenarios still ran their functional steps in the gating lane; Playwright `@visual` tests run nowhere that gates. 21 tests, 2 of them (race interstitial, embedded-Blockly markdown) with no functional twin. |
| `forbidOnly` and `retries: 2` are keyed on `PLAYWRIGHT_PROVIDER`. | `playwright.config.ts:42-44`; provider set in `lib/rake/test.rake:625-628` (Drone when `CI` is set, `dtt` on the test system) and `e2e-tests-ci.yml`. No `--forbid-only` CLI flag anywhere. | Adequate today; a lane that forgets the env var silently gets `retries: 0` and no `.only` guard. |
| Flaky passes are reported, not failed. | `lib/rake/test.rake:683-703` prints "Flaky (passed on retry): N"; `failOnFlakyTests` unset. Cucumber uses `--retry_count 2` too (`ci.rake:214`). | A test that fails first and passes on retry is green in both suites. The proposal's "zero retries" property holds only inside the port workflow's stress gate, not in CI. |
| `@no_ci` Playwright tests are excluded on Drone only. | `playwright.config.ts:12-16`. | The 4 `@no_ci` tests run only in non-gating lanes. Matches Cucumber tagging. |
| Default `testMatch`, no `testIgnore`. | `playwright.config.ts:40`. | All 46 `*.spec.ts` collected. No `test(` exists outside `*.spec.ts`. |
| Tags `@no_mobile` (59), `@no_safari` (7), `@no_firefox` (6), `@single_session` (5), `@chrome` (1) are inert in Playwright. | Config greps only `@visual` and `@no_ci`. | Harmless; browser narrowing is done with `test.skip` instead. |

### 3.2 Non-running or weakly running Playwright tests

| File:line | What | Why it cannot gate a merge |
|---|---|---|
| 21 `@visual` tests in 12 files | Visual checkpoints and the functional claims inside them | Run only under `visual-chromium`; Drone eyes lane is warning-only; GitHub Actions eyes runs only on DTT dispatch. No twin: `race-interstitial.spec.ts:12`, `markdown-rendering.spec.ts:32`, `eyes.spec.ts:244`. |
| `initial-page-views-3.spec.ts:24,48`; `weblab2.spec.ts:61,108` | `@no_ci` | Excluded from Drone. Matches Cucumber `@no_ci` on `initial_page_views3.feature:8` and `weblab2_preview.feature:11`. |
| `platform/one-trust.spec.ts:207` | `test.fixme(lab2 && webkit)` | Issue #73740, "remove when Drone is upgraded". Drone never runs WebKit; affects DTT only. |
| `labs/sketch-lab.spec.ts:28` | `test.fixme(webkit)` | Same issue. Net-new lab, no Cucumber source. |
| `foundations/i18n.spec.ts:376` | `test.fixme(webkit)` | Same issue. Cucumber had no browser tag; WebKit coverage lost on DTT. |
| `platform/header.spec.ts:65,116` | `test.skip(project !== chromium)` | Cucumber `header.feature:32,45` had no `@chrome`. Coverage narrowed. |
| `platform/header.spec.ts:176`; `create-dropdown.spec.ts:45,49`; `global-edition/fa/*.spec.ts:5-6`; `fa-teacher-dashboard.spec.ts:5`; `weblab2.spec.ts:10` | Browser skips | Mirror Cucumber `@chrome`, `@no_safari`, `@no_firefox`. No loss. `weblab2.spec.ts:10` also skips the three net-new tests on webkit. |
| `activities/maze/progress.spec.ts:45,105` | `test.slow()` | Triples timeout; not a skip. |
| `.only` | none | `forbidOnly` guards automated lanes. |
| Specs with no `Migration status` marker | `parental-permission.spec.ts`, `fa-teacher-dashboard.spec.ts`, `signing-in.spec.ts`, `sketch-lab.spec.ts`, `smoke.spec.ts` | Tracking gap, not a running gap. Two of these are also the unverified pairings. |

### 3.3 Cucumber scenarios on disk that CI does not run

| Tag | Count | Effect | In the `@playwright` set |
|---|---|---|---|
| `@skip` | 33 tags, 27 files | Always excluded (`runner.rb:779`). Reasons on file: flakiness (`level_summary.feature:108`), deprecated homepage (`teacher_homepage.feature:1`), tickets SL-288/SL-289/SL-878, "Brad investigating (2018-04-25)" (`star_labs/weblab/versions.feature:1`), missing localization on test/drone (`fa/signed_out.feature:1`), Flash fallback (`videoplayer_eyes.feature:34`). | 1: `platform/header.feature:81`, no Playwright equivalent. |
| `@no_ci` | 14 files | Excluded on Drone; run on DTT. Java Lab (6), AI chat/tutor (2), Oceans ML, weblab v1 (2), weblab2_preview, initial_page_views3 scenario. | 2, both carried over as `@no_ci`. |
| `@eyes` / `@eyes_mobile` | 122 / 4 tags | Eyes steps are no-ops on Drone; functional steps still run and gate. On DTT a mismatch is a metric, not a failure. | 10 files. |
| `@no_device_farm` | 1 | Excluded whenever `--device-farm` is passed (Drone and DTT). `teacher_dashboard_progress_v2.feature:7` never runs in CI. | 0 |
| `@webpurify`, `@properties_encryption_key`, `@cloudfront_key`, `@contentful_key` | 1, 5, 2, 2 | Excluded when the secret is absent. | 0 |
| `@chrome` | 24 tags, 16 files | Skipped on non-Chrome unless `--local`. | 5 files. |

The tracker counts 750 scenarios. At least 33 `@skip` and 14 `@no_ci` features
contribute scenarios that CI has not run in months or years. Porting them
one-to-one reproduces coverage that never gated; retiring them is a legitimate
outcome the tracker has no row for yet.

## 4. Phase 2: unfailable-by-construction patterns

### 4.1 Lint

`eslint-plugin-playwright` is not installed (zero hits in `frontend/yarn.lock` and every `package.json`). The e2e config (`frontend/packages/e2e-tests/eslint.config.mjs`) extends `lint-config/eslint/node.mjs`: `@eslint/js` recommended plus `typescript-eslint` `recommended` (not `recommendedTypeChecked`), no `parserOptions.project`. So `@typescript-eslint/no-floating-promises` and `playwright/missing-playwright-await` are both inactive. Lint runs in CI only on changed files via `tools/hooks/lint.rb` in the Drone unit pipeline.

To get numbers, the plugin was installed into the session scratchpad and run over a copy of `tests/` with the recommended ruleset plus `expect-expect`, `missing-playwright-await`, `no-conditional-expect`, `no-force-option`, `no-wait-for-timeout`, `no-skipped-test`, and type-aware `no-floating-promises` / `await-thenable`:

| Rule | Hits | Reading |
|---|---|---|
| `missing-playwright-await` | 0 | No floating async assertion. The single most common cause of permanently-green Playwright tests is absent. |
| `@typescript-eslint/no-floating-promises` | 0 | Confirms the above at the type level, including page-object methods. |
| `no-conditional-expect`, `no-conditional-in-test` | 0 in specs | One `expect` inside an `if` lives in `pages/legacy-blockly-lab.ts:190`, inside a `toPass` retry; a readiness gate. |
| `no-force-option`, `no-wait-for-timeout`, `no-networkidle`, `no-page-pause`, `no-element-handle`, `no-focused-test` | 0 | |
| `expect-expect` | 21 | Broken down in 4.2. |
| `no-skipped-test` | 10 | The `test.skip(condition)` calls in 3.2. |
| `no-slowed-test` | 2 | `progress.spec.ts:45,105`. |
| `valid-expect` | 1 | `shared/i18n.ts:61`: `expect.poll` stored in a variable and awaited with a matcher two lines later. Fine; the rule cannot follow the variable. |
| `no-raw-locators` | 148 | CSS and id selectors, mostly in `pages/` and `components/`. Not unfailability; each survives an a11y regression the proposal says the migration should catch. |
| `prefer-strict-equal` | 46 | `toEqual` on axe violation maps. |
| `no-nth-methods` | 39 | Brittle, not unfailable. |
| `no-useless-not` | 29 | Style; autofixable. |

### 4.2 Pattern findings

| # | File:line | Pattern | What it proves now vs. intended |
|---|---|---|---|
| a1 | `initial-page-views.spec.ts:82`, `initial-page-views-2.spec.ts:140`, `initial-page-views-3.spec.ts:22,120`, `eyes.spec.ts:122,165,244`, `markdown-rendering.spec.ts:32`, `weblab2.spec.ts:77` | Zero `expect`; only `visualCheck` | Proves the page loads and the Applitools baseline matches. In every gating lane a diff is a warning. These can fail only on navigation or readiness timeouts. The a11y companion tests carry the blocking claims where one exists. |
| a2 | `block-layout.spec.ts:43,63,81` | Zero `expect` in body | False positive: `expectBlockNear` (`:27-37`) asserts attachment and a 3px tolerance. But see 2.2 #18 on the constants. |
| a3 | `i18n.spec.ts:95,112,209,226,321,352,369` | Zero `expect` in body | False positive: `expectElementHasI18nText` / `Markdown` (`shared/i18n.ts:49-111`) assert visibility and text against the backend translation. `rtl: true` downgrades exact match to `toContain`. |
| a4 | `dcdo-mocking.spec.ts:28` | Zero `expect` in body | False positive: `assertJsonKeyValue` (`:11-21`) asserts `toContainText`. |
| a5 | `weblab2.spec.ts:19` | Zero `expect` in body | False positive: `expectEditorLoaded` (`pages/weblab2.ts:152-157`) asserts three `toContainText`. |
| b | none | Unawaited async matcher | Not found by regex, brace-matching scan, or type-aware lint. |
| c | none | `toBeTruthy` / `toBeDefined` / `not.toBeNull` on a Locator | Not found. |
| d | none | `expect.soft` | Not used. |
| e1 | `pages/legacy-blockly-lab.ts:190` | `expect` inside `if` inside `toPass` | If the overlay never appears the enclosing `toPass` still times out. |
| e2 | `pages/pixelation-level.ts:50` | `.click().catch(() => {})` | Inside a `toPass(20s)` whose next line asserts dialog visibility. Acceptable. |
| e3 | `components/intro-video-modal.ts:36-45`, `components/parental-permission-nag-modal.ts:47-56` | `try/catch` around `waitFor` | Only `TimeoutError` swallowed, by design. A modal that never appears is indistinguishable from one that appears late. This is what drops the `#x-close` claim in 2.2 #21. |
| f | none | `waitForTimeout` as guard | Not found. |
| g | all `@visual` tests | Baseline created by the first run of the same test name | Applitools creates the baseline on first `eyes.check` of a new name; nothing is committed (`.visual-baselines` gitignored; `prove-visual` uses ephemeral snapshots). Whatever the first CI run saw is the truth. Cucumber had the same property. Masks in 2.2 #24 further narrow what the baseline covers. |
| h | `pages/lesson-level-page.ts:91` (`.locator('a').nth(n)`), `pages/account-edit-page.ts:84` | Broad locators | Scoped to a parent; callers assert state or click. Low risk. |
| i | none | `force: true` | Not found. |
| j1 | `platform/header.spec.ts:172-215` | Click plus `toHaveURL` five times | Equivalent to `header.feature:61-79`, which also only checked URLs. |
| j2 | `policy-compliance.spec.ts:132-148` | Create user, `goto('/home')`, `toHaveURL('/home')` | Stronger than `policy_compliance.feature:15-20`, which asserted nothing (`Then I am on` navigates). |
| j3 | `sign-in/login-redirect.spec.ts:23-75` | URL-only | Equivalent in shape to `login_redirect.feature` (redirect regression, TEACH-758), but looser matching; see 2.2 #5. |
| k | `multi2.spec.ts:74`, `multi4.spec.ts:48`, `multi.spec.ts:58`; `callouts.spec.ts:66-70`; `artist.spec.ts:42-47` | "A modal appeared" without asserting which; navigation plus one presence check | Inherited one-to-one from the Cucumber scenarios. Thin in both suites. |

No test is unfailable at the assertion level. The unfailability is structural:
21 visual tests and 4 `@no_ci` tests, about 16 percent of parsed test bodies,
cannot block a merge in any lane; and the WEAKENED rows in 2.2 are the ones
where a regression the Cucumber scenario would catch now passes.

## 5. Phase 4: process gaps and recommendations

### 5.1 Evidence of observed failure

Sample: 31 merged port PRs (all "test(e2e): port ..." PRs from #73482 through
#74869 plus #74077), read through PR body, commits, reviews, review threads, and
issue comments. Full table in Appendix B.

| Evidence | PRs |
|---|---|
| (a) Deliberate break to confirm the test goes red | 0 |
| (b)/(c) Test itself observed red in CI or reproduced failing, then fixed (all infrastructure causes: timing, WebKit crash, locator, baseline drift) | 7: #74743, #74466, #73810, #73724, #73929, #73562, #74077 |
| Weak or incidental only (one-off crash, axe count variance, mask tuning, red CI on other specs) | 7: #74869, #74557, #74522, #74434, #74184, #73928, #73923 |
| (d) only: pass-count claim ("45/45", "15 runs, zero flakes") | 17 |
| Test observed red because the application lacked the behavior it guards | 1: #74077 (WCAG test red until the aria-label fix deployed) |

Other observations from the sample:

- 26 of 31 PRs were approved with no review comment. Issue comments were empty
  on 30 of 31.
- 5 PRs were approved on a commit that is no longer in the merged history
  (#74869, #74557, #74434, #73929, #73709); intermediate commits are
  unrecoverable through the API.
- 20 of 31 carry the commit-message boilerplate "Green under the 5x/all-browser
  stress gate; original Cucumber feature tagged @playwright so the Cucumber suite
  skips it." The second clause is false today (section 3.1).
- Every validation phrase in every PR body is a pass count. None describes a red
  run.

The gap is designed in, not a lapse by individual authors. The workflow runs
against the deployed test-studio, so the application cannot be mutated to prove
a test detects a defect, and no phase mutates the test's expectations either.
The comment thread on the proposal (2026-09-01) already names this.

### 5.2 Recommendations

Each item names the smallest change that implements it.

**R1. Require demonstrated failure in the PR template.** Add one line under
"Testing story" in `.github/pull_request_template.md`:

```
- [ ] Red proof (e2e ports only): link to a run where each new test FAILS with its
      expectation deliberately broken (wrong expected text, hidden target via
      page.addStyleTag, or a mutated URL), then the passing run on the same commit.
```

Word it as a link requirement, not a checkbox, so the artifact exists. For the
port workflow, add a "Prove red" phase between Heal and Commit in
`.claude/workflows/port-cucumber-to-playwright.js` that runs the spec once with
a `PROVE_RED=1` env var honored by `tests/fixtures.ts` (inject
`page.addStyleTag({content: '#main_content, main {visibility:hidden}'})` after
each `goto`) and requires every test in the spec to fail. That works against a
read-only deployed target and catches the a1 and k classes above.

**R2. Adopt `eslint-plugin-playwright` and type-aware lint in the e2e package.**
Add the plugin to `frontend/packages/e2e-tests/package.json` and, in
`eslint.config.mjs`, spread `playwright.configs['flat/recommended']` and switch
the TypeScript base to `recommendedTypeChecked` with
`languageOptions.parserOptions.projectService: true`. Rules and their cost:

| Rule | Level | Existing violations to handle |
|---|---|---|
| `playwright/missing-playwright-await` | error | 0 |
| `@typescript-eslint/no-floating-promises` | error | 0 |
| `playwright/no-conditional-expect` | error | 0 in specs; 1 in `pages/legacy-blockly-lab.ts:190` (disable-next-line with reason) |
| `playwright/no-force-option`, `no-wait-for-timeout`, `no-networkidle`, `no-page-pause`, `no-element-handle`, `no-focused-test` | error | 0 |
| `playwright/expect-expect` with `assertFunctionNames: ['expect*', 'assert*', 'visualCheck']` | error | 0 after the option; without `visualCheck` in the list, 13 visual-only tests remain and that is arguably the right signal |
| `playwright/valid-expect` | error | 1 (`shared/i18n.ts:61`, restructure or disable-next-line) |
| `playwright/no-skipped-test` | warn | 10 existing; each already carries a reason string |
| `playwright/no-slowed-test` | warn | 2 |
| `playwright/no-useless-not` | error with `--fix` | 29, autofixable |
| `playwright/no-raw-locators`, `no-nth-methods`, `prefer-strict-equal` | warn | 148, 39, 46; ratchet later |

Then add `yarn turbo run lint typecheck --filter=@code-dot-org/e2e-tests` to a
PR-triggered workflow. Today neither runs on PRs for this package.

**R3. CI flags.**
- Pass `--forbid-only` explicitly in `bin/run-playwright-tests-ci.sh` and in
  the `E2E Tests` step of `e2e-tests-ci.yml`, so the guard does not depend on
  `PLAYWRIGHT_PROVIDER` being set.
- Set `failOnFlakyTests: provider === 'github-actions'` in
  `playwright.config.ts` first (non-gating lane, so it surfaces flake without
  blocking), and after two weeks of data set it for `drone` too. Playwright
  1.59 supports the option.
- Keep `retries: 2` on Drone until the flake baseline is known, then lower to
  1. The rollup at `test.rake:703` already prints the flaky count; add it to the
  tracker's monthly check.
- Move `@visual` tests that carry functional claims and have no twin
  (`race-interstitial.spec.ts`, `markdown-rendering.spec.ts:32`,
  `eyes.spec.ts:244`) into the functional lane by splitting them as
  `cookie-banner.spec.ts` was split.

**R4. Keep Cucumber running in parallel, and skip per feature, not all at once.**
The proposal's decision 1 (add `@playwright` to the runner skip list) is a
one-line change to `runner.rb` that removes 137 scenarios. Do it in tranches
gated by three conditions per feature, recorded in the tracker as new columns:

1. Delta accepted: every WEAKENED or DROPPED row for the feature in section 2.2
   is either fixed in the spec or marked "claim retired" with a reason.
2. Red proof exists: the R1 artifact link is on the port PR or a follow-up.
3. Flake-free: zero flaky or failed runs for the feature's spec across the last
   20 Drone runs and 5 DTTs (three browsers), with no `test.fixme` in the spec.

Features that meet all three today can be skipped immediately; from the audit,
the CAP group (`lockout_phase`, `policy_compliance`, `parental_permission`,
`manage_students_tab`), `dcdo_mocking`, `authored_hints`, `contextual_hints`,
`bee`, `multi*`, `map_level`, `standalone_video`, `progress`,
`public_project_gallery_signed_out`, `demo_section_card`, `unnumbered_lessons`,
`documentation_landing_page`, and `gdpr_dialog` meet condition 1. None yet meets
condition 2. Hold `personal_project_gallery`, `region_select`,
`login_redirect`, `header`, `fa/teacher_dashboard`, `race_interstitial`, and
`blocklayout` until their rows are resolved.

Delete Cucumber files only at final sunset, as the proposal says. Until then the
Cucumber run is the only oracle that a Playwright pass means the same thing.

**R5. Fix the tracking artifacts.** Add `Source:` comments to
`signing-in.spec.ts` and `fa-teacher-dashboard.spec.ts`; add `Migration status`
to the five specs missing it; correct the workflow commit message at
`port-cucumber-to-playwright.js:954`; add a "Retire" value to the tracker's
Cucumber Action column and use it for `header.feature:81`; add the two features
ported since 2026-08-25 to the tracker.

## 6. Not audited

- Drone build logs and the DTT status pages. "Observed failing in CI" evidence
  in section 5 comes from PR bodies, commits, and review threads only. For 5 PRs
  the approved commit is gone.
- Runtime behavior. No test was executed. Every EQUIVALENT verdict is about
  the claims the code makes, not about whether the located element is the one
  the Cucumber selector found. Substituted locators are listed in 2.4 and
  Appendix A as unverified.
- Whether `count_eyes_errors` (`runner.rb:354`) affects the DTT exit status
  downstream of the value it returns; on Drone the question is moot because
  eyes are disabled by config.
- Whether the Drone container exports `CI`, which `lib/cdo/ci_utils.rb:32`
  reads to set `PLAYWRIGHT_PROVIDER=drone`. Drone sets it by default; not
  confirmed from repo files.
- The 226 Cucumber features not yet tagged, the three "Review" mobile features
  in the tracker, and the PoC branch `stephen/playwright` (out of scope by
  instruction).
- The sibling Playwright suites in `frontend/packages/markdown`, `users`, and
  `labs/oceans`. They are component suites with their own `webServer`, not
  Cucumber ports.
- Applitools dashboards and baselines. Which baseline each `visualCheck` name
  compares against, and whether any has been accepted since the port, is not
  visible from the repo.
- The 13 earlier port PRs (#73200 through #73469, #73632) beyond the 31-PR
  sample.
- Cucumber-side weakness in general. Two findings surfaced incidentally (the
  `I am on` navigation step used as `Then` 143 times; the vacuous
  "not categorized by OneTrust" check) but no systematic pass was made over the
  Ruby step definitions.

---

## Appendix A: per-scenario equivalence tables

Verbatim output of the five Phase 3 passes. File aliases are defined at the top
of each section. Credentials in fixtures are referenced by file and line only.

### A.A

#### Phase 3 audit — Group A (auth, account boundaries, header/user menu, global edition)

Read-only audit. No test was run. Credentials are referred to by file:line only.

##### File abbreviations

Cucumber (all under `dashboard/test/ui/`):
- F1 `features/platform/signing_in.feature`; F2 `features/platform/login_redirect.feature`; F3 `features/foundations/user_menu.feature`; F4 `features/foundations/create_dropdown.feature`; F5 `features/platform/header.feature`; F6 `features/platform/global_edition/fa/sign_in_page.feature`; F7 `.../fa/sign_up_page.feature`; F8 `.../fa/personal_project_gallery.feature`; F9 `.../fa/teacher_dashboard.feature`; F10 `features/platform/global_edition/region_select.feature`
- steps = `features/step_definitions/steps.rb`; acct = `.../account_steps.rb`; sect = `.../section_management_steps.rb`; ge = `.../global_edition_steps.rb`; eyes = `.../eyes_steps.rb`; bh = `features/support/browser_helpers.rb`; hooks = `features/support/hooks.rb`; runner = `runner.rb`; connect = `features/support/connect.rb`

Playwright (all under `frontend/packages/e2e-tests/`):
- S1 `tests/sign-in/signing-in.spec.ts`; S2 `tests/sign-in/login-redirect.spec.ts`; S3 `tests/foundations/user-menu.spec.ts`; S4 `tests/foundations/create-dropdown.spec.ts`; S5 `tests/platform/header.spec.ts`; S6 `tests/global-edition/fa/sign-in-page.spec.ts`; S7 `tests/global-edition/fa/sign-up-page.spec.ts`; S8 `tests/global-edition/fa/personal-project-gallery.spec.ts`; S9 `tests/global-edition/fa-teacher-dashboard.spec.ts`; S10 `tests/global-edition/region-select.spec.ts`
- auth = `tests/shared/auth.ts`; signin = `tests/pages/sign-in.ts`; signup = `tests/pages/sign-up.ts`; hdr = `tests/components/header.ts`; ftr = `tests/components/footer.ts`; base = `tests/pages/base-page.ts`; td = `tests/pages/teacher-dashboard/teacher-dashboard.ts`; ppg = `tests/pages/personal-project-gallery.ts`; lab = `tests/pages/legacy-blockly-lab.ts`; i18n = `tests/shared/i18n.ts`; sects = `tests/shared/sections.ts`; axe = `tests/shared/axe.ts`; fx = `tests/fixtures.ts`; cfg = `playwright.config.ts`; vis = `frontend/packages/playwright-support/src/visual/`

##### Resolved semantics of recurring Cucumber steps (cited once, used throughout)

- `I create a student/teacher named X [and go home]` (acct:153, acct:217) → `create_user` POSTs `/api/test/create_user` and asserts HTTP 200 (steps:1340); "and go home" navigates to the studio root and waits for `readyState == complete` (steps:91-105). Young student = age '10', no state (acct:154-161).
- `I sign out` (acct:278-285) → GET `/users/sign_out.json`, asserts 204, clears storage.
- `I am on URL` (steps:126-138 → steps:91-110) → navigate, wait for new document + readyState complete, `refute_bad_gateway_or_site_unreachable`. No URL assertion.
- `I wait to see "#x"/".x"` (steps:161-164) → element present in DOM (not visibility).
- `I see "#x"` (steps:275-279) → immediate `find_element` (presence).
- `I click X to load a new page` / `I press ID to load a new page` (steps:608-612, 449-454 → `page_load` steps:51-71) → old root goes stale + readyState complete. No URL assertion.
- `I wait until I am on URL` (steps:401-413) → poll `current_url == URL` (exact, host-replaced). `check that I am on` (steps:387-390) → immediate exact equality. `I wait until current URL contains` (steps:392-395). `check that the URL matches` (steps:397-399) → unanchored regex.
- `I wait until element X is (not) visible` (steps:326-329 → steps:314-316) → jQuery `:visible && visibility != hidden`; zero matches counts as not visible.
- `element X contains text T` (steps:855 → bh:61-64) → `$(X).text()` (joined over all matches) includes T; immediate. `contains text matching R` (steps:1602-1605) → regex on joined text. `I wait until element X contains text T` (steps:281-285) → polled.
- `element X has "L" text from key K` (steps:843 → bh:16-27) → normalized (nbsp→space, strip) exact equality with `/api/test/get_i18n_t`.
- `the href of selector X contains S` (steps:1597-1600). `the link reading T within P goes to U` (steps:441-447) → xpath `a[starts-with(normalize-space(text()),T)]`, resolved `href` == host-replaced U or U.
- `element X is checked` (steps:879). `I select "T" option in dropdown ID|named N to load a new page` (steps:538-548 → 566-572, page_load).
- `I get redirected away from "http://..."` (steps:1455-1457) → regex tested against `location.pathname`, which never contains a scheme/host, so every use in F10 is vacuously true.
- `I switch to the Global Edition region "fa"` (ge:4-12) → appends `ge_region=fa` to the current URL and navigates. No assertion that the region applied.
- `I reload the page` (steps:1152-1157) → page_load + jQuery wait.
- Eyes (eyes:14-33, 62-72, 35-45): `check_region` on selector; failure on mismatch unless `CDO.ignore_eyes_mismatches`. Cucumber runs @eyes scenarios only in the eyes lane (runner:787-797).
- Tags: `@no_mobile` skipped on mobile browsers (runner:800); `@chrome` skipped on non-Chrome unless local (runner:805); `@no_safari` (runner:807); `@no_firefox` (runner:808); `@skip` (runner:779); `@single_session` shares one browser session across the feature (connect:276-280). `@as_taught_student` (hooks:9-11) → sect:113-153: teacher created, POST `/dashboardapi/sections` (200), student created, POST `/join/<code>` (200).

Playwright environment facts used below: three functional projects chromium/firefox/webkit (cfg:53-68); `@visual` tests are excluded from those and run only under `visual-*` projects, which exist only when `VISUAL_PROVIDER` is set (cfg:13, vis/index.ts:56-59); with the Applitools provider and `APPLITOOLS_SHOULD_REPORT_FAILURE=false` a diff only warns (vis/applitools.ts:33-34, 120-129); the native provider throws under `CI=true` (vis/playwright.ts:20-25). `signInAsNewUser` fixture = clearCookies + goto('/') + `createUser` (fx:31-37); `createUser` throws unless create_user `ok` and sign_in `ok` (auth:97-99, 231-233); `signOut` throws unless 204 (auth:340-343); `resetSession` = `clearCookies()` only, no server call (auth:45-47). `expect` default timeout 15s (cfg:46).

---

##### F1 signing_in.feature → S1 signing-in.spec.ts

Feature tags: `@single_session @playwright` (F1:2-3); `@no_mobile` is commented out (F1:1). S1 carries no tags and no `Source:` comments (grep count 0); pairing is by identical test title → **UNVERIFIED PAIRING** for all four.

| Scenario (feature:line) | Playwright test (spec:line) | Verdict | Cucumber claims (terse, resolved) | Playwright assertions (terse) | Delta / notes |
|---|---|---|---|---|---|
| Student sign in from studio.code.org (F1:6) | S1:11 | EQUIVALENT | create_user 200; sign_out 204; `#signin` in DOM (F1:10); click `#signin-button` → page_load (F1:12); URL == `http://studio.code.org/home` exact (F1:13); `#header_user_menu` in DOM (F1:14); `.display_name` visible (F1:15); `.display_name` joined text includes "Alice" (F1:16) | createUser/signIn ok (auth:97,231); signOut 204 (auth:341); goto `/users/sign_in` + locale dropdown visible (signin:75, ftr:22); `#signin` visible (signin:80); submit waits URL pathname not ending `/sign_in` (signin:98); `pathname === '/home'` (auth:332); `#header_user_menu.first()` visible (S1:30, hdr:80); `.display_name.first()` visible + containsText(name) (S1:31-32, hdr:81) | URL check is pathname-only (ignores query/host) vs Cucumber exact full URL. `.first()` narrows to first match; Cucumber joined text over all matches. Presence checks upgraded to visibility. |
| Student sign in ... in the eu (F1:18) | S1:35 | EQUIVALENT | as above; EU student created with data_transfer_agreement fields (acct:207-215) | as above; `createEuStudent` sends the same fields (auth:109-123) | Same caveats as row 1. |
| Teacher sign in from studio.code.org (F1:30) | S1:55 | EQUIVALENT | as row 1 with URL == `.../teacher_dashboard/home` exact (F1:37); text "Casey" | `pathname === '/teacher_dashboard/home'` (auth:331-332); rest as row 1 | Same caveats as row 1. |
| Signed-out joining non-picture non-word section ... (F1:42-48, `@as_taught_student`) | S1:79 | EXPANDED | hook: teacher, section POST 200, student, join POST 200 (sect:113-153); sign_out 204; on `/users/sign_in/`; type code into `#section_code` (sect:200-204); click `#section_code_submit` → page_load only (F1:47); `a:contains(Create an account)` visible (F1:48) | `createTeacherAssociatedStudent` throws on any non-ok (auth:261-301); signOut; goto; fill `#section_code` (signin:107); click role button "Go" exact and wait URL pathname includes `/logged_out` (signin:114-121); link "Create an account" visible (S1:98, signin:60-62) | Added: destination pathname `/logged_out` asserted (Cucumber asserted no URL). Locator for submit changed from `#section_code_submit` to button name "Go". |

##### F2 login_redirect.feature → S2 login-redirect.spec.ts

Feature tags: `@playwright` only (F2:1). S2 has `Source:` comments (S2:20, S2:58). S2:105 is an additional a11y test with no Cucumber source.

| Scenario (feature:line) | Playwright test (spec:line) | Verdict | Cucumber claims | Playwright assertions | Delta / notes |
|---|---|---|---|---|---|
| Student navigates to provided cached level link with login_required (F2:12) | S2:23 | WEAKENED | create_user 200; sign_out 204 (acct:278); navigate level?login_required=true; URL == `http://studio.code.org/users/sign_in` exact (F2:16); `#signin` in DOM; click sign-in → page_load; URL == exact level URL, no query (F2:20) | createUser ok; `resetSession` = clearCookies (S2:35, auth:46) — no server sign-out, no 204 check; `toHaveURL(/\/users\/sign_in/)` unanchored (S2:39); `#signin` visible; submit; `pathname.endsWith(LEVEL_PATH) && !searchParams.has('login_required')` (S2:49-53) | Both URL claims loosened: sign-in URL accepts any prefix/query; final URL accepts a locale prefix and any other query params (S2:76 comment says the prefix varies per session). Sign-out mechanism changed (cookie clear vs server sign-out). |
| Student already logged in navigates ... (F2:22) | S2:61 | WEAKENED | student with sign_in_count 0 (acct:155) and go home (root); navigate level?login_required; URL == exact level URL (F2:25) | createUser signInCount 0 (S2:67-71); goto '/'; goto level; same pathname-suffix + no-param check (S2:78-82) | Same URL loosening as above. |
| — (no Cucumber source) | S2:105 "login page accessibility violations match documented baseline" | (extra) | — | axe on '/'; asserts no violation outside allowed set (S2:129) AND that every REQUIRED violation is still present (S2:133-135) | Not a migration. Phase-2 flag: the second assertion fails when an a11y defect is fixed (inverted regression by design, S2:87-103). |

##### F3 user_menu.feature → S3 user-menu.spec.ts

Feature tag `@no_mobile` (F3:1) → S3 tags only (`@no_mobile` informational, no skip). Runs on all three projects. `Source:` comments present (S3:25, 49, 85, 108).

| Scenario (feature:line) | Playwright test (spec:line) | Verdict | Cucumber claims | Playwright assertions | Delta / notes |
|---|---|---|---|---|---|
| Signed Out - create account button shows (F3:5) | S3:27 | EXPANDED | on `/catalog`; set `_language=en` after load, no reload (F3:7, steps:1203) — no effect on the rendered page; `#create_account_button` visible (F3:8); `.display_name` not visible (F3:9) | goto `/catalog`; setCookie same order (S3:33); role link "Create account" exact `.first()` visible (S3:35, hdr:86-88); `.display_name.first()` not visible (S3:36); axe(header, WCAG AA) `toEqual({})` (S3:38-43) | Locator changed from `#create_account_button` (exists: `apps/src/code-studio/header.js:137`) to accessible name; not verified in this audit to be the same node. Added a11y assertion. |
| Teacher Signed In - display name with correct links (F3:11) | S3:51 | EXPANDED | teacher and go home (root); `.display_name` visible; joined text includes "Ms_Frizzle" (F3:14); jQuery `.click()` on `.display_name` (steps:626-631); `#user-edit` visible (F3:16); `#user-signout` visible (F3:17) | signInAsNewUser; `hide_codeai_logo_transition` cookie (S3:58, logo-transition.ts:25-27) — extra setup; `dashboard.goto()` → `/teacher_dashboard/home` + `#teacher-home-header` visible (td:37-38); displayName visible + containsText (S3:62-63); real click (hdr:188-190); `#header_user_menu` link "Account settings" visible; link "Sign out" visible (S3:66-67, hdr:89-92); logo not `visibility:hidden` (S3:72); axe(header) `toEqual({'color-contrast':1,'nested-interactive':1})` (S3:74-79) | `#user-edit`/`#user-signout` replaced by accessible names scoped to `#header_user_menu`; not verified to be the same nodes. Navigates directly to teacher dashboard vs studio root. Phase-2 flag: a11y baseline hard-codes two existing defects; fixing either fails the test (S3:16-19 comment acknowledges). |
| Student Signed In - display name with correct links (F3:19) | S3:87 | EQUIVALENT | as above with student "Arnold", root | signInAsNewUser; goto `/home`; displayName visible + containsText; click; both links visible (S3:97-102) | Same locator substitution note. No axe scan here. |
| Unicode in display name (F3:27) | S3:110 | EXPANDED | student "Caoimhín" and go home; `.display_name` visible; text includes "Caoimhín" (F3:29-30) | goto `/home`; visible + containsText (S3:120-121); axe(header) `toEqual({})` (S3:123-128) | Added a11y assertion. |

##### F4 create_dropdown.feature → S4 create-dropdown.spec.ts

Feature tags `@no_mobile @no_safari @no_firefox @single_session` (F4:1-5). S4 skips webkit and firefox at describe level (S4:45-49) → chromium only, mirroring Cucumber. `Source:` comments present (S4:51, 70, 95, 114, 154). `getCreateProjectItem(id)` = `#create_dropdown_<id>` (hdr:174-176), same ids as F4.

| Scenario (feature:line) | Playwright test (spec:line) | Verdict | Cucumber claims | Playwright assertions | Delta / notes |
|---|---|---|---|---|---|
| Create Dropdown does NOT show on level pages (F4:10) | S4:52 | EXPANDED | student 16; navigate `.../lessons/18/levels/7?noautoplay=true`; `.create_menu` not visible immediately after readyState (F4:13; zero matches passes, so the original could pass on an unrendered header); sign_out 204 | createStudent; `gotoLevel({lesson:18, level:7})` → same URL (routes.ts:24-52); `#header_user_menu` visible first (S4:63, hdr:151-153); `.create_menu` not visible (S4:64); signOut 204 | Added signed-in-header guard so the absence check is not vacuous (S4:62 comment). |
| Teacher - Correct Create Links (F4:16) | S4:71 | EXPANDED | random-name teacher and go home (acct:40-43); `.create_menu` visible; jQuery click; 9 items visible, `#create_dropdown_minecraft` not visible, `#view_all_projects` visible (F4:20-30) | createUser teacher; `dashboard.goto()` + `#teacher-home-header` visible (td:38); `.create_menu` visible (S4:82); click + `#view_all_projects` visible (hdr:179-182); `expectFullCreateMenuItems` = same 10 visibility claims + minecraft not visible (S4:30-40); axe(.create_menu) equals baseline (S4:86-91) | All 11 claims preserved; header wait and a11y baseline added. Baseline hard-codes existing defects (S4:14-18). |
| Student, Age 13+ - Correct Create Links (F4:32) | S4:96 | EQUIVALENT | student 16 and go home; same 11 claims (F4:34-46) | createStudent; goto `/home`; createMenu visible; open; `expectFullCreateMenuItems` (S4:107-110) | Navigates to `/home` vs studio root. |
| Young Student, Not in Section (F4:48) | S4:115 | EXPANDED (precondition changed) | young student = age 10, no country/state (acct:154-161); createMenu visible; click; spritelab/artist/minecraft visible, applab/gamelab not visible, dance/music visible, view_all visible (F4:52-59) | createStudent age '10' **usState 'WA'** → sends `country_code: 'US', us_state: 'WA', user_provided_us_state: 'true'` (S4:124-128, auth:198-204); same 8 claims (S4:136-143); axe baseline (S4:145-150) | Subject deviates: the account under test now carries a US state (reason given at S4:121-123: a stateless US under-13 gets an interstitial). Cucumber's stateless young student path is no longer exercised. |
| Young Student, In Section (F4:61) | S4:155 | EXPANDED (precondition changed) | teacher; POST `/dashboardapi/sections` {email, student, grade Other} 200 (sect:3-9); young student (age 10, no state); join: navigate join URL, jQuery-click `.btn.btn-primary` once visible → page_load, no URL claim (sect:165-174); createMenu visible; click; 11 claims (F4:68-78) | createUser teacher; goto '/'; `createSection` same body (sects:24-29); createStudent age 10 **usState 'WA'**; `joinSection`: goto join URL, click role button "Join" exact, `waitForURL(pathname === '/home')` (sects:45-47); createMenu visible; open; `expectFullCreateMenuItems` (S4:176-179) | Added: landing on `/home` after join. Same usState deviation as previous row. No axe scan here. |

##### F5 header.feature → S5 header.spec.ts

Feature tag `@no_mobile` (F5:1). `Source:` comments present (S5:10, 33, 58, 109, 171). Header link locators: by exact accessible name inside `.headerlinks` (hdr:96-98) or by DOM id via `linkById` (hdr:105-107).

| Scenario (feature:line) | Playwright test (spec:line) | Verdict | Cucumber claims | Playwright assertions | Delta / notes |
|---|---|---|---|---|---|
| Student in English should see 4 header links (F5:4) | S5:11 | WEAKENED (minor) | student and go home (studio root); `.headerlinks` in DOM (F5:6); `#header-student-home` present AND joined text includes "My Dashboard" (F5:7-8); `#header-student-courses` ↔ "Course Catalog" (F5:9-10); `#header-student-projects` ↔ "Projects" (F5:11-12); `#header-incubator` ↔ "Incubator" (F5:13-14); sign_out 204 | createStudent; goto `/home?ge_region=us` (S5:19); `.headerlinks` visible (S5:22, hdr:111); role links named "My Dashboard", "Course Catalog", "Projects", "Incubator" exact, visible (S5:24-27); signOut | Dropped: the id↔label binding for each of the 4 slots (a link with the right label anywhere in `.headerlinks` satisfies it; Cucumber required the specific id to carry the text). Added: visibility instead of presence. Different entry URL (`/home?ge_region=us` vs root). |
| Teacher in English should see 5 header links (F5:17) | S5:34 | WEAKENED (minor) | as above with 5 teacher ids ↔ labels incl. "Professional Learning" (F5:20-29) | goto `/teacher_dashboard/home` (S5:43); `.headerlinks` visible; 5 labeled links visible (S5:48-52); signOut | Same id↔label binding drop. |
| Student in Spanish should see 2 header links (F5:32) | S5:59 | EXPANDED on chromium; skipped on firefox/webkit | student (no home); on `/home/lang/es`; URL == `http://studio.code.org/es/home?lang=es` exact (F5:35); `.headerlinks` present; `#header-student-home` present + text == i18n(es, nav.header.my_dashboard) (F5:37-38, bh:16-27); `#header-student-courses` + course_catalog (F5:39-40); `#header-student-projects` not visible (F5:41); `#header-incubator` not visible (F5:42); sign_out | `test.skip` unless chromium (S5:65-68); goto `/home/lang/es`; `pathname+search === '/es/home?lang=es'` (S5:78-80); `html[data-ge-region='es']` visible (S5:82); `.headerlinks` visible; `#header-student-home` visible + `expectElementHasI18nText` (normalized exact eq, polled; i18n:49-69); same for courses; projects/incubator not visible (S5:100-103); signOut | Added region attribute assertion. **Coverage reduction**: Cucumber scenario had no `@chrome` tag and ran on all desktop browsers; Playwright runs it on chromium only. |
| Teacher in Spanish should see 3 header links (F5:45) | S5:110 | EXPANDED on chromium; skipped on firefox/webkit | teacher; on `/teacher_dashboard/home/lang/es`; URL == `.../es/teacher_dashboard/home?lang=es` exact (F5:48); home + courses + professional-learning ids with es i18n text (F5:50-56); projects, incubator not visible (F5:54, 57); sign_out | skip unless chromium (S5:116-119); URL `pathname+search` exact (S5:128-131); `html[data-ge-region='es']` (S5:132); 3 ids visible + i18n exact; 2 ids not visible (S5:135-165); signOut | Same as previous row. |
| Teacher can click on the header links (F5:60, `@chrome`) | S5:172 | EQUIVALENT | teacher and go home; cookies `_language=en`, `_loc_notice=1`; `.headerlinks` present; press `#header-teacher-home` → page_load; URL == `.../teacher_dashboard/home` exact (F5:69); `#header-teacher-courses` → `/catalog` (F5:71); `#header-teacher-projects` → `/projects` (F5:73); `#header-teacher-professional-learning` → `/my-professional-learning` (F5:75); `#logo_home_link` → `/teacher_dashboard/home` (F5:78); sign_out | skip unless chromium (S5:176-179, mirrors `@chrome`); OneTrust cookies (S5:192, consent.ts:13-18) extra setup; same two cookies; goto `/teacher_dashboard/home`; `.headerlinks` visible; `clickLink` = click by name + `.headerlinks` visible (hdr:164-167); `pathname === '/teacher_dashboard/home'`, `/catalog`, `/projects`, `/my-professional-learning`, then `#logo_home_link` → `/teacher_dashboard/home` (S5:201-220); signOut | URL checks are pathname-only (Cucumber exact incl. query). Links clicked by label, not id (id→destination binding not verified). |
| Student can click on the header links (F5:81, `@skip @chrome`) | none (grep: no match in tests/) | UNMAPPED | (skipped in Cucumber too, runner:779) | — | No Playwright test; no loss relative to the running Cucumber suite. |

##### F6 fa/sign_in_page.feature → S6 fa/sign-in-page.spec.ts

Feature tags `@chrome @playwright`; scenario `@eyes` (F6:1-2, 9). Background (F6:5-7): on root, then `?ge_region=fa` navigation with no region assertion. S6 skips non-chromium at describe level (S6:6-9). `Source:` present (S6:12-14, 66-68). OAuth button ids `#<provider>-sign-in` are emitted by `dashboard/app/views/devise/shared/_oauth_links.haml:32`.

| Scenario (feature:line) | Playwright test (spec:line) | Verdict | Cucumber claims | Playwright assertions | Delta / notes |
|---|---|---|---|---|---|
| I see the Farsi MVP Sign In page (F6:10) — functional claims | S6:16 | WEAKENED (minor) | on `/fa/users/sign_in`; joined `h2` text contains Farsi heading (F6:15, polled); `form[action='/fa/join'] button` matches "Go" (F6:16); `form[action='/users/auth/google_oauth2'] button`, `.../microsoft_v2_auth`, `.../facebook`, `.../clever` match Farsi labels (F6:17-20); `form[action='/fa/users/sign_in'] button` matches "ورود" (F6:21); link "رمز عبور..." within `#signin` resolved href == host-replaced `http://studio.code.org/fa/users/password/new` (F6:22); `#signin a:contains(یک حساب...)` href contains `/fa/users/sign_up/account_type` (F6:23); `#code_without_signing_in` contains Farsi text (F6:26); 4 quick-start links (`#code_without_signing_in + .row a:contains(...)`) hrefs contain `/dance`, `/api/hour/begin/mc`, `/s/frozen/reset`, `/s/hourofcode/reset` (F6:27-30) | `goto({globalRegion:'fa'})`: goto '/', `?ge_region=fa`, `html[data-ge-region='fa']` visible, goto `/fa/users/sign_in`, attribute visible again (base:100-118); first `h2` by role containsText (S6:20, signin:63); role button "Go" exact containsText (S6:23); `#google_oauth2-sign-in`, `#microsoft_v2_auth-sign-in`, `#facebook-sign-in`, `#clever-sign-in` containsText (S6:24-34, signin:66-69); `#signin-button` containsText "ورود" (S6:35); `#signin` link by name `toHaveAttribute('href','/fa/users/password/new')` exact attribute (S6:37-39); create-account link href regex (S6:40-42); `#code_without_signing_in` containsText (S6:44); links inside `#code_without_signing_in + .row` filtered by text, href regexes (S6:47-62, signin:147-152) | Added: region attribute asserted twice. Dropped: the six `form[action=...]` bindings (that the Go button posts to `/fa/join`, each OAuth button to its `/users/auth/<provider>` path, the sign-in button to `/fa/users/sign_in`) — Playwright locates by id/name only. Password link: raw attribute vs Selenium-resolved absolute href; equivalent when the attribute is a relative path. |
| I see the Farsi MVP Sign In page (F6:10) — `@eyes` region check `#main_content` (F6:12, 32-33) | S6:70 `@visual` | EQUIVALENT (conditional in both suites) | `check_region(#main_content)`; fails on mismatch unless `CDO.ignore_eyes_mismatches` (eyes:39-44); runs only in eyes lane on Chrome | goto with region; heading visible; `waitForVisualStability(mainContent)`; `visualCheck` region `getByRole('main')` (S6:76-81, signin:64) | Runs only under `visual-*` projects (cfg:13, vis/index.ts:56-59); Applitools diff does not fail when `APPLITOOLS_SHOULD_REPORT_FAILURE=false` (vis/applitools.ts:33-34, 123-129). Region is `role=main` rather than `#main_content` (base:43 says they coincide on the layout; not verified here). |

##### F7 fa/sign_up_page.feature → S7 fa/sign-up-page.spec.ts

Feature tags `@chrome @playwright`; scenario `@eyes` (F7:1-2, 9). Same background pattern as F6. S7 skips non-chromium (S7:6-9). `Source:` present (S7:12-14, 44-46); the feature's scenario title says "Sign In page" (F7:10) and the spec quotes it verbatim.

| Scenario (feature:line) | Playwright test (spec:line) | Verdict | Cucumber claims | Playwright assertions | Delta / notes |
|---|---|---|---|---|---|
| I see the Farsi MVP Sign In page [sic] (F7:10) — functional | S7:16 | EQUIVALENT | on `/fa/users/sign_up/account_type`; joined `h1` text contains "حساب کاربری رایگان..." (F7:15, polled); `[data-testid='student-card'] h1` matches; student-card `button` matches; teacher-card `h1`; teacher-card `button` (F7:16-19); `.fa-book-open-cover + h2` contains "برنامه درسی رایگان. همیشه." (F7:22, polled); `.fa-book-open-cover + h2 + button` matches (F7:23) | goto with region (base:100-118, region asserted twice); first `h1` inside `#main_content` containsText (S7:20, signup:50); student/teacher card `h1` and `button` by role within `getByTestId` containsText (S7:24-33, signup:51-60); the `h2` inside `#main_content` (strict: fails if more than one) containsText (S7:35, signup:61-63); last button in `#main_content` containsText (S7:38, signup:64) | Structural anchors changed: Cucumber joined all `h1` text (would pass if the phrase were only in a card h1); Playwright pins the first h1 in main (narrower). The `.fa-book-open-cover` adjacency anchors are replaced by "the only h2 in main" and "the last button in main" (signup:32-46 explains). All text claims preserved. |
| same scenario — `@eyes` region `#main_content` (F7:12, 25-26) | S7:48 `@visual` | EQUIVALENT (conditional in both suites) | as F6 eyes row | goto; heading visible; stability; `visualCheck('Main content', {region: mainContent})` (S7:54-59) | Same conditionality as F6. |

##### F8 fa/personal_project_gallery.feature → S8 fa/personal-project-gallery.spec.ts

Feature tags `@chrome @no_mobile @single_session @playwright` (F8:1-4). S8 skips non-chromium (S8:5-8). `Source:` present (S8:10-13).

| Scenario (feature:line) | Playwright test (spec:line) | Verdict | Cucumber claims | Playwright assertions | Delta / notes |
|---|---|---|---|---|---|
| The student sees only the projects available in Farsi MVP (F8:10) | S8:15 | WEAKENED, with DROPPED claims | Background: teacher-associated student "Lillian" (F8:8 → sect:113-153: teacher + section 200 + student + `/join` 200). On `/projects`; select "فارسی" in `#locale` → page_load (F8:12); URL contains `http://studio.code.org/fa/projects` (F8:13); reload (F8:15); `html[lang='fa-IR'][data-ge-region='fa']` visible (F8:16); `h5.new-project-heading` visible (F8:18); `div a[href='/projects/{spritelab,artist,applab,gamelab}/new']` visible (F8:20-23); click `#uitest-view-full-list` once it exists (F8:25); `#full-list-projects` visible (F8:26); `a[href=...]` visible for the same 4 (F8:28-31); `a[href='/projects/{dance,playlab,weblab}/new']` not visible (F8:32-34) | `signInAsNewUser({type:'student'})` — plain student, no teacher/section (S8:19); goto `/projects` (ppg:86-88); `switchToGlobalEditionRegion('fa')` = navigate with `?ge_region=fa` + `html[data-ge-region='fa']` visible (base:92-97); `waitForReady` = heading with **English** accessible name "Create a new project" visible (ppg:54-56, 91-93); `div a[href=...] > div` visible ×4 (S8:32-35, ppg:61-62); click `#uitest-view-full-list` + `#full-list-projects` waitFor visible (ppg:96-99; a waitFor, failure still fails the test); `a[href=...] > div`.first() visible ×4 (S8:42-45); `a[href=...]` `toHaveCount(0)` ×3 (S8:48-50) | Mechanism changed: Cucumber switched region through the footer locale selector (the user-facing path) and asserted the locale took effect; Playwright uses the `?ge_region` override. DROPPED: URL contains `/fa/projects` (F8:13); `html[lang='fa-IR']` (F8:16); region persistence across reload (F8:15-16). The English heading name at ppg:55 can only match if the page renders in English, so the Farsi locale is not applied in S8 — the "lang=fa-IR" half of F8:16 is not just unasserted but absent from the run. Precondition changed: student is not enrolled in a section. S8:40-41 acknowledges the four `any*` full-list checks are satisfiable by the section tiles already asserted (Cucumber's `a[href=...]` had the same page-wide ambiguity). Added: `toHaveCount(0)` is stronger than not-visible. |

##### F9 fa/teacher_dashboard.feature → S9 fa-teacher-dashboard.spec.ts

Feature tags `@chrome @playwright @no_mobile` (F9:1-2). S9 skips non-chromium (S9:5-8). S9 has no `Source:` line; its header comment says "Ported from platform/global_edition/fa/teacher_dashboard.feature" (S9:11-12) — informal source reference, treat as **UNVERIFIED PAIRING (informal)**.

| Scenario (feature:line) | Playwright test (spec:line) | Verdict | Cucumber claims | Playwright assertions | Delta / notes |
|---|---|---|---|---|---|
| Teacher does not see Teacher Promotion right panel (F9:5) | S9:15 | DROPPED (1 claim) | teacher created (200); `I sign in as ... and go home` (acct:19-24): navigate `/reset_session`, POST `/users/sign_in` 200, navigate `/home`; on `/teacher_dashboard/home`; `#teacher-home-header` visible (F9:10); `#ui-test-teacher-promotions` visible (F9:11); `?ge_region=fa` navigation (ge:4-12); URL contains `http://studio.code.org/fa/teacher_dashboard/home` (F9:14); header visible (F9:15); promotions not visible (F9:16) | signInAsNewUser teacher (clearCookies + create + POST sign_in ok); `dashboard.goto()` → `/teacher_dashboard/home` + `#teacher-home-header` visible (td:37-38); `#ui-test-teacher-promotions` visible (S9:24); `switchToGlobalEditionRegion('fa')` + `html[data-ge-region='fa']` visible (base:92-97); header visible (S9:27); promotions not visible (S9:28) | DROPPED: URL contains `/fa/teacher_dashboard/home` (F9:14) — the URL-prefix rewrite is not asserted. Added instead: `data-ge-region='fa'` attribute. The explicit second sign-in (reset + POST) is collapsed into createUser's sign-in; end state is the same signed-in teacher. |

##### F10 region_select.feature → S10 region-select.spec.ts

Feature tags `@no_mobile @playwright` (F10:1). S10 uses `@playwright/test` directly (S10:1), tags `@no_mobile` only, runs on all three projects. `Source:` present (S10:7-10, 34-37).

| Scenario (feature:line) | Playwright test (spec:line) | Verdict | Cucumber claims | Playwright assertions | Delta / notes |
|---|---|---|---|---|---|
| Switch international ↔ regional via language selector on a Studio page (F10:4) | S10:11 | WEAKENED | on `/users/sign_in`; `#locale option:contains(English)` is checked (F10:6, steps:879); select فارسی → page_load (F10:8); redirected-away (F10:9, vacuous — see semantics); URL == `http://studio.code.org/fa/users/sign_in?lang=fa-IR` exact (F10:10); فارسی option checked (F10:11); on root; redirected-away (vacuous); URL == `http://studio.code.org/fa/users/sign_in` exact, **no query** (F10:15); select English → page_load; redirected-away (vacuous); URL == `.../users/sign_in?lang=en-US` exact (F10:19); English checked (F10:20) | goto + locale dropdown visible (signin:73-76); `combobox[name='Select language'] option:checked` containsText "English" (S10:18, ftr:16-17); `selectLocale` waits URL has `lang=` or leaves `/sign_in`, dropdown visible (signin:124-133); `toHaveURL(/\/fa\/users\/sign_in\?lang=fa-IR/)` (S10:21); checked option contains فارسی (S10:22); goto '/'; `toHaveURL(/\/fa\/users\/sign_in/)` (S10:26); `selectLocale('English')`; `toHaveURL(/\/users\/sign_in\?lang=en-US/)` (S10:29); checked option contains English (S10:30) | Three exact-URL claims became unanchored regexes. S10:26 accepts a `?lang=` query that F10:15 excluded (the S10:24 comment "no lang=" is not enforced). S10:29 also matches `/fa/users/sign_in?lang=en-US`, so a failure to leave the fa region on switching back to English would pass; F10:19's exact equality would catch it. Checked-option checks are equivalent (option:checked text vs option:contains(...):checked). |
| Switch to regional version via language selector on a Lab page (F10:22) | S10:38 | EQUIVALENT | on `/projects/artist/new`; lab fully loaded = `#runButton` and `.header_user` in DOM, overlay closed if present, `#header_middle_content` opacity 1 (steps:211-218, eyes:74-80); `.uitest-instructionsTab` contains "Instructions" (F10:25, polled); `#localeForm option:checked` contains "English" (F10:26); select فارسی in `select[name=locale]` → page_load; loaded; URL matches `/fa/projects/artist/.*/edit\?lang=fa-IR` (F10:30); tab contains "دستورالعمل" (F10:31); فارسی checked (F10:32); select English; loaded; URL matches `/projects/artist/.*/edit\?lang=en-US` (F10:36, unanchored in Cucumber too); "Instructions" (F10:37); English checked (F10:38) | `lab.new()` → goto + `waitForReady`: spinner hidden, `#runButton` visible, `.header_user` visible, intro video/overlay dismissed with retry, header opacity 1 (lab:159-200); `.uitest-instructionsTab` containsText "Instructions" (S10:45); checked option "English" (S10:46); `selectLabLocale`: URL changed and includes `lang=`, then `waitForReady` (lab:282-293); `toHaveURL(/\/fa\/projects\/artist\/.*\/edit\?lang=fa-IR/)` (S10:49-51); tab contains "دستورالعمل" (S10:53); فارسی checked (S10:54); English: `toHaveURL(/\/projects\/artist\/.*\/edit\?lang=en-US/)` (S10:57), "Instructions" (S10:58), English checked (S10:59) | All claims preserved with the same regexes. Both suites share the pre-existing weakness that the en-US regex (F10:36, S10:57) also matches a `/fa/`-prefixed URL. `waitForReady` is stronger than Cucumber's presence checks. Conditional overlay dismissal in lab:182-198 is setup, not an assertion. |

---

##### Group A summary

Scenarios audited: 27 (F1:4, F2:2, F3:4, F4:5, F5:6, F6:1, F7:1, F8:1, F9:1, F10:2). Eyes checkpoints in F6/F7 are counted with their scenario.

Counts per verdict:
- EQUIVALENT: 8 (F1 ×3, F3 Student Signed In, F4 Student 13+, F5 Teacher can click, F7, F10 Lab page)
- EXPANDED: 10 (F1 section-join, F3 ×3, F4 ×4 [two with changed preconditions], F5 Spanish ×2 [chromium only])
- WEAKENED: 7 (F2 ×2, F5 English ×2 [minor: id↔label binding], F6 [minor: form-action bindings], F8 [with dropped claims], F10 Studio page)
- DROPPED (a specific claim lost): 1 (F9 — URL `/fa/teacher_dashboard/home`); F8 additionally drops three claims, counted under WEAKENED above
- UNMAPPED: 1 (F5:81 "Student can click on the header links", `@skip` in Cucumber; not run there either)
- Extra Playwright tests with no Cucumber source: 1 (S2:105 a11y baseline)

Top 5 riskiest deltas:
1. S8 (`tests/global-edition/fa/personal-project-gallery.spec.ts:19-28`, `tests/pages/personal-project-gallery.ts:54-56`): the region is switched with `?ge_region=fa` instead of the footer locale selector, the Farsi locale is never applied (the readiness locator uses the English heading name), and the URL `/fa/projects`, `html[lang='fa-IR']` and reload-persistence claims of F8:13-16 are gone; the student is also no longer section-enrolled (F8:8).
2. S10:29 (`tests/global-edition/region-select.spec.ts:29`): `/\/users\/sign_in\?lang=en-US/` also matches `/fa/users/sign_in?lang=en-US`, so the test cannot detect a failure to leave the fa region that F10:19's exact-URL check would; S10:26 likewise accepts a `?lang=` query F10:15 forbade.
3. S5:65-68 and S5:116-119 (`tests/platform/header.spec.ts`): both Spanish header scenarios are chromium-only in Playwright although F5:32 and F5:45 carried no `@chrome` tag and ran on every desktop browser in Cucumber.
4. S4:124-128 and S4:167-171 (`tests/foundations/create-dropdown.spec.ts`): the "young student" now carries `country_code US / us_state WA`, so the stateless under-13 account that F4:48 and F4:61 tested (acct:154-161) is no longer exercised.
5. S9:26-28 (`tests/global-edition/fa-teacher-dashboard.spec.ts`) drops the F9:14 URL-prefix claim in favour of the `data-ge-region` attribute, and S2:39/S2:49-53 (`tests/sign-in/login-redirect.spec.ts`) loosen both exact-URL claims of F2:16/F2:20 to an unanchored regex and a pathname suffix, so a wrong locale prefix or extra query parameter on the post-login redirect passes.

Other Phase-2 style patterns observed:
- Hard-coded a11y baselines that fail when a defect is fixed: S2:133-135 (REQUIRED violations must remain), S3:19/S3:74-79, S4:22-23/S4:86-91/S4:145-150.
- S8:42-45 `any*.first()` visibility checks are satisfiable by tiles outside `#full-list-projects` (acknowledged at S8:40-41); Cucumber F8:28-31 had the same ambiguity.
- Locator substitutions from Cucumber ids to accessible names whose node identity was not verified in this audit: S3 `Create account` link (vs `#create_account_button`), `Account settings`/`Sign out` links (vs `#user-edit`/`#user-signout`), S1 `Go` button (vs `#section_code_submit`), S5 header links by label (vs `#header-*` ids).
- Visual checks (S6:70, S7:48) exist only under `visual-*` projects when `VISUAL_PROVIDER` is set and do not fail on diff when `APPLITOOLS_SHOULD_REPORT_FAILURE=false` (vis/applitools.ts:33-34, 120-129); this mirrors Cucumber's eyes-lane-only execution and `CDO.ignore_eyes_mismatches` (eyes:39).
- Chromium-only skips that mirror Cucumber tags (no coverage loss): S4:45-49 (`@no_safari @no_firefox`), S5:176-179 (`@chrome`), S6:6-9, S7:6-9, S8:5-8, S9:5-8 (`@chrome`).
- No Playwright test in this group consists solely of navigation plus a URL/title check; every body includes at least one content or state assertion.

Pairings inferred without a `Source:` comment:
- S1 all four tests (`tests/sign-in/signing-in.spec.ts:11, 35, 55, 79`) — UNVERIFIED PAIRING, matched by identical titles to F1:6, F1:18, F1:30, F1:43.
- S9 (`tests/global-edition/fa-teacher-dashboard.spec.ts:15`) — UNVERIFIED PAIRING (informal "Ported from ..." comment at S9:11-12 names the feature but not in the `Source:` format).

### A.B1

#### Group B1 audit: CAP / policy compliance / manage-students roster

Paths below are repo-relative. `F` = the Cucumber feature file for the table, `S` = the Playwright spec for the table. Step definitions: `steps.rb` = dashboard/test/ui/features/step_definitions/steps.rb, `account_steps.rb`, `cap_steps.rb`, `section_management_steps.rb` in the same directory; `browser_helpers.rb` = dashboard/test/ui/features/support/browser_helpers.rb. Playwright helpers under frontend/packages/e2e-tests/tests/: `auth.ts` = shared/auth.ts, `i18n.ts` = shared/i18n.ts, `AEP` = pages/account-edit-page.ts, `LP` = pages/lockout-page.ts, `nag` = components/parental-permission-nag-modal.ts, `SIM` = components/student-info-modal.ts, `MSP` = pages/teacher-dashboard/manage-students-page.ts, `TDP` = pages/teacher-dashboard/teacher-dashboard.ts.

##### Resolved semantics of the shared Cucumber steps (used by every row)

| Step | Definition | What it actually asserts |
|---|---|---|
| `Given I am on "<url>"` (also when written `Then I am on ...`) | steps.rb:126-138 -> navigate_to steps.rb:91-108 | Navigation only. Waits for root element to go stale and `readyState == complete`, `refute_bad_gateway_or_site_unreachable`. `check_window_for_js_errors` (browser_helpers.rb:129-146) only prints; never fails. **It is not a URL assertion.** |
| `Given CPA all user lockout phase` | cap_steps.rb:3-10 | No assertion. Mocks DCDO `cap_CO_start_date_override` (= lockout - 1 year) and `cap_CO_lockout_date_override` (= 2024-07-01T00:00 MDT). Only the lockout key has a consumer: dashboard/lib/policies/child_account/state_policies.rb:49-53 reads `cap_<state>_lockout_date_override`; no reader of `*start_date_override` exists outside tests (grep over dashboard/lib, dashboard/app, lib, shared, apps/src, frontend/packages). "Before/after CAP start" is decided by `user.created_at < lockout_date` (dashboard/lib/policies/child_account.rb:62-65). |
| `I create [as a parent] a [young] student [using clever/google] [in Colorado] [who has never signed in] named "X" [after/before CAP start] [and go home]` | account_steps.rb:153-189 -> create_user account_steps.rb:99-151 -> browser_request steps.rb:1313-1340 | Embedded assertion: POST /api/test/create_user returns exactly 200 (steps.rb:1339). Payload: age 10/16, sign_in_count 0/2, CO => country_code US + us_state CO + user_provided_us_state, created_at = lockout (after) or lockout-1y-1s (before), sso => uid + no password, parent-created => 5 parent_email_preference_* fields with the student's own email (account_steps.rb:111-119). `and go home` navigates to the site root (account_steps.rb:188), not /home. |
| `I create a teacher [who has never signed in] named ...` | account_steps.rb:217-239 | create_user 200; age '21+', email_preference_opt_in yes. |
| `I create a[n authorized] teacher-associated [under-13] [sponsored] student [in Colorado] named ... [after CAP start]` | section_management_steps.rb:113-150 | teacher create 200; if authorized POST /api/test/enroll_in_plc_course 200 (steps.rb:1215-1217); POST /dashboardapi/sections 200 (login_type email, participant_type student); student create 200 (sponsored => email/password removed, provider 'sponsored'); POST /join/<code> 200. |
| `My parent permits my parental request` | account_steps.rb:191-193 | POST /api/test/accept_parental_request returns 200 (server-side grant, dashboard/app/controllers/test_controller.rb:499-503). |
| `I wait to see "#id"` | steps.rb:161-164 | Polls until an element with that id exists in the DOM. Presence only, not visibility. |
| `element "<sel>" is disabled` / `is enabled` | steps.rb:1051-1053 / 1041-1043 -> disabled? steps.rb:1037-1039 | Immediate (no poll). `$(sel)[0]` has a `disabled` attribute OR class `disabled`. Uses the first DOM match. |
| `I wait until "<sel>" is [not] disabled` | steps.rb:1045-1049 | Same predicate, polled. |
| `element "<sel>" contains text "<t>"` | steps.rb:855-857 -> browser_helpers.rb:61-64 | Immediate. jQuery `.text()` of all matches includes `t`. |
| `I wait until element "<sel>" contains text "<t>"` | steps.rb:281-285 | Same predicate, polled. |
| `element "<sel>" has "en-US" text from key "<k>"` | steps.rb:843-845 -> browser_helpers.rb:16-28 | Immediate. jQuery text, nbsp->space, strip, must EQUAL the string from /api/test/get_i18n_t. |
| `element "<sel>" has value "<v>"` | steps.rb:867-869 -> browser_helpers.rb:72-75 | `$(sel).val().strip == v` (exact). |
| `element "<sel>" is visible` | steps.rb:951-953 -> steps.rb:939-941, 314-316 | Immediate. jQuery `:visible` and CSS visibility != hidden. |
| `I wait until element "<sel>" is [not] visible` | steps.rb:326-329 | Same, polled. |
| `element "<sel>" is checked` | steps.rb:879-882 | Immediate `$(sel).is(':checked')`. |
| `the href of selector "<sel>" contains "<s>"` | steps.rb:1597-1600 | `attr('href')` includes s. |
| `I press "<id>"` | steps.rb:449-454 | find_element(id), click. No page-load wait unless `to load a new page`. Fails only if the button is missing. |
| `I click "<css>" to load a new page` | steps.rb:608-612 -> page_load steps.rb:51-70 | Asserts a full document replacement happened (root stale + readyState complete). |
| `I press keys "<k>" for element "<css>"` / `I clear the text from element` | steps.rb:1411-1414 / 1428-1431 | find_element(css) then send_keys/clear. Fails only if element missing. |
| `I select the "<text>" option in dropdown "<id>"` | steps.rb:538-540 -> 566-572 | find_element(:id) (first DOM match), Select by visible text. |
| `I click selector "<jq>" once I see it` | steps.rb:640-647 | Polls jQuery-visible, then JS `.click()`. |
| `I reload the page` | steps.rb:1152-1157 | refresh with page_load wait. |
| `I sign in as "X" and go home` | account_steps.rb:19-24, 69-75 | reset_session (GET /reset_session), POST /users/sign_in expects 200, navigate /home. |

Shared Playwright setup facts:
- `createUser` throws unless the create_user response is `ok` (auth.ts:97-99); `signIn` throws unless ok (auth.ts:231-233); `acceptParentalRequest` throws unless ok (auth.ts:316-318); `createTeacherAssociatedStudent` throws on any failed enroll/section/join call (auth.ts:267-300). These are the equivalents of Cucumber's `code: 200` checks (2xx rather than exactly 200).
- Unless `signInAfterCreate:false`, `createUser` also POSTs /users/sign_in after creating a password user (auth.ts:101-103). Cucumber never did this; sign_in_count for the "sign_in_count: 2" students therefore ends at 3 in Playwright. Setup-only; no scenario asserts on sign_in_count.
- `createUser` sends `email_preference_*` for students too (auth.ts:88-91); Cucumber only sent them for teachers (account_steps.rb:223). Setup-only.
- lockout-phase.spec.ts, policy-compliance.spec.ts and parental-permission.spec.ts mock only `cap_CO_lockout_date_override` (S:31, S:93, S:42). Equivalent to Cucumber because the start-date key has no consumer (see row 2 above). manage-students-tab.spec.ts:26-27 mocks both.
- lockout-phase, policy-compliance and manage-students set `GeolocationOverride=US` (lockout-phase.spec.ts:30, policy-compliance.spec.ts:92, manage-students-tab.spec.ts:29; shared/geolocation.ts:9-19). Cucumber did not; it relied on the runner's real geolocation. `#user_us_state` on /users/edit renders only when `@is_usa` (dashboard/app/controllers/registrations_controller.rb:458). Consequence: under US geolocation the student-information interstitial (dashboard/app/views/layouts/_student_information_interstitial.html.haml:3-27, gated at :21 by `cap_user_info_required?`) can also be in the DOM on /users/edit with its own `#user_us_state` select (form_for as :user, haml:27), which is why AEP scopes to `#account-information` (AEP:5-13, 76-78). Cucumber's unscoped `$('#user_us_state')[0]` would, under the same condition, have read the interstitial's always-enabled select for the not-in-Colorado scenarios (AEP:9-13 documents this).
- `@no_mobile` tag on the Playwright tests has no effect: playwright.config.ts:53-68 defines only desktop chromium/firefox/webkit projects and `grepInvert` only excludes `@visual` (and `@no_ci` on Drone) (playwright.config.ts:13-16). No `test.skip`/`test.fixme` in any of the four specs.

##### 1. lockout_phase.feature -> tests/policy-compliance/lockout-phase.spec.ts

All ten scenarios have identical shape. Cucumber claims per scenario: (a) create_user 200 with the stated age/state/created_at/sso; (b) `#user_age` present in DOM (F:11 etc.); (c) `#user_us_state` present (F:12); (d) `$('#user_us_state')[0]` disabled-attr-or-class == expected (F:13); (e) same for `#user_age` (F:14). Playwright per test: createStudent (throws on failure) with matching age/usState/createdAt/sso; `ageSelect` toBeVisible; `usStateSelect` toBeVisible; `usStateSelect` toBeDisabled/toBeEnabled; `ageSelect` toBeDisabled/toBeEnabled (AEP:77-78 locators: `#account-information` combobox name /^Age/, /^State/). Playwright deltas common to all rows: presence -> visibility (stricter); attr-or-class -> native disabled (truer for a `<select>`); polling assertions vs Cucumber's immediate `is disabled/enabled`; scoped locator vs first-DOM-match (see setup facts). Setup deltas: sso 'google' -> 'google_oauth2' (auth.ts:194) matches account_steps.rb:107; BEFORE_CAP_START '2023-07-02T00:10:47Z' (S:21) vs Cucumber `lockout.ago(1.year) - 1s`; both are `< lockout_date`, which is the only comparison the policy makes (child_account.rb:62-65).

| Scenario (feature:line) | Playwright test (spec:line) | Verdict | Cucumber claims (terse, resolved) | Playwright assertions (terse) | Delta / notes |
|---|---|---|---|---|---|
| Under-13 in CO, before CAP start, cannot change (F:4-14) | S:39-58 | EQUIVALENT | create 200 (age 10, CO, created before); #user_age present; #user_us_state present; us_state disabled; age disabled | createStudent ok (S:44-49); ageSelect visible; usStateSelect visible; usStateSelect toBeDisabled; ageSelect toBeDisabled (S:53-56) | Common deltas only. |
| Under-13 not in CO, after CAP start, can change (F:16-26) | S:65-83 | EQUIVALENT | create 200 (age 10, no state, created at lockout); both present; both enabled | createStudent ok (S:70-74); both visible; both toBeEnabled (S:78-81) | Cucumber's `[0]` could have matched the interstitial's always-enabled select under US geolocation (AEP:9-13); Playwright scopes to `#account-information`, so this "enabled" claim is now non-vacuous. |
| Under-13 not in CO, before CAP start, can change (F:28-38) | S:90-108 | EQUIVALENT | as above, created before | createStudent ok (S:95-99); both visible; both enabled (S:103-106) | Same note as previous row. |
| Over-13 in CO, after CAP start, can change (F:40-50) | S:115-134 | EQUIVALENT | create 200 (age 16, CO, at lockout); both present; both enabled | createStudent ok (S:120-125); both visible; both enabled (S:129-132) | Common deltas only. |
| Over-13 in CO, before CAP start, can change (F:52-62) | S:141-160 | EQUIVALENT | create 200 (age 16, CO, before); both present; both enabled | createStudent ok (S:146-151); both visible; both enabled (S:155-158) | Common deltas only. |
| Under-13 in CO, after CAP start, clever only, cannot change (F:64-74) | S:167-187 | EQUIVALENT | create 200 (age 10, CO, at lockout, sso clever => no password); both present; both disabled | createStudent ok sso 'clever' (S:172-178); both visible; both disabled (S:182-185) | No post-create sign-in for sso users in either suite (auth.ts:101; account_steps.rb:105-109). |
| Under-13 in CO, before CAP start, clever only, cannot change (F:76-86) | S:194-214 | EQUIVALENT | as above, created before | createStudent ok (S:199-205); both visible; both disabled (S:209-212) | Common deltas only. |
| Under-13 in CO, before CAP start, google, cannot change (F:88-98) | S:221-241 | EQUIVALENT | create 200 (sso google -> google_oauth2, CO, before); both present; both disabled | createStudent ok sso 'google' (S:226-232); both visible; both disabled (S:236-239) | Exercises the google-specific branch at child_account.rb:60-62 in both suites. |
| Under-13 not in CO, after CAP start, clever, "cannot" (title) / enabled (body) (F:100-110) | S:248-267 | EQUIVALENT | create 200 (age 10, no state, at lockout, clever); both present; both **enabled** (F:109-110) | createStudent ok (S:253-258); both visible; both **toBeEnabled** (S:264-265) | Title says "cannot change" but both suites assert enabled; Playwright preserved the body, not the title. Interstitial-scoping note applies. |
| Under-13 not in CO, before CAP start, clever, "cannot" (title) / enabled (body) (F:112-122) | S:274-293 | EQUIVALENT | as above, created before; both enabled (F:121-122) | createStudent ok (S:279-283); both visible; both enabled (S:288-291) | Same as previous row. |
| (no Cucumber source) | S:305-327 `locked-out account-edit form matches its documented a11y baseline` | EXPANDED (extra test) | n/a | createStudent ok; axe scan of `#account-information` with WCAG AA tags `toEqual({})` (S:319-325) | New coverage. Exact-match baseline: fails on any new violation. Not a Phase-2 pattern (cannot pass vacuously). |

##### 2. policy_compliance.feature -> tests/policy-compliance/policy-compliance.spec.ts

| Scenario (feature:line) | Playwright test (spec:line) | Verdict | Cucumber claims (terse, resolved) | Playwright assertions (terse) | Delta / notes |
|---|---|---|---|---|---|
| New under-13 account can elect to sign out at the lockout (F:4-13) | S:101-125 | EXPANDED | create 200 (age 10, sign_in_count 0, CO, at lockout) (F:8); `and go home` = navigate root; `Then I am on .../lockout` (F:9) is a **navigation**, asserts nothing about redirect; `#lockout-panel-form` present (F:12); `#permission-status` text includes "Not Submitted" (F:13, immediate) | createStudent ok, signInAfterCreate false (S:106-110); goto /home; `toHaveURL(/\/lockout/)` (S:113); panelForm toBeVisible (S:115); permissionStatus toContainText 'Not Submitted' (S:116); axe `#lockout-panel-form` toEqual {} (S:118-123) | Playwright asserts the server redirect /home -> /lockout that Cucumber only assumed, plus an a11y baseline. Neither suite exercises sign-out (`#lockout-signout`, apps/src/templates/sessions/LockoutPanel.tsx:342, is never clicked) despite the title. Navigation path differs: Cucumber root then explicit /lockout; Playwright /home. |
| Existing under-13 account in CO not locked out (F:15-20) | S:132-146 | EXPANDED | create 200 (CO, sign_in_count 0, created before) (F:19); `Then I am on .../home` (F:20) is a navigation -> **the Cucumber scenario asserted nothing** beyond page load / no bad gateway | createStudent ok (S:136-141); goto /home; `toHaveURL(url => url.pathname === '/home')` (S:144) | This is the first time the "not redirected to /lockout" claim is actually asserted. Body is navigation + URL check only (Phase-2 shape), but here the URL is the whole claim, so it is legitimate. |
| Teacher can connect third-party account without a state (F:22-30) | S:153-170 | EQUIVALENT | teacher create 200 (age 21+, sign_in_count 0, at lockout) (F:25); `#manage-linked-accounts` present (F:29); `form[action='/users/auth/google_oauth2?action=connect'] button` not disabled-attr/class, polled (F:30) | createUser teacher ok, signInCount 0, no sign-in, created_at (S:158-164); manageLinkedAccountsSection toBeVisible (S:167); googleConnectButton toBeEnabled (S:168; AEP:82-84 same form-action selector) | Presence -> visibility; attr-or-class -> native enabled. |
| Student cannot connect third-party account until unlocked (F:32-58) | S:177-210 | EXPANDED | create 200 (CO, never signed in, created before) (F:35); `#manage-linked-accounts` present (F:39); google button disabled, polled (F:40); `#lockout-linked-accounts-form` present (F:43); `#permission-status` includes "Not Submitted" (F:44); keys into `#parent-email` (F:45, only fails if missing); `#lockout-submit` enabled (F:46); press submit (F:49); `#permission-status` includes "Pending", polled (F:50); accept_parental_request 200 (F:53, server-side grant); `#manage-linked-accounts` present (F:57); google button not disabled, polled (F:58) | createStudent ok (S:183-188); section visible; googleConnectButton toBeDisabled (S:191-192); axe `#manage-linked-accounts` toEqual {} (S:196-201); linkedAccountsForm toBeVisible (S:203); helper S:72-83: nag `dismissIfShown` (nag:46-57), permissionStatus 'Not Submitted', fill parent email (LP:72-74, textbox /Parent\/Guardian Email/), submitButton toBeEnabled, click, permissionStatus 'Pending', acceptParentalRequest throws if !ok; goto /users/edit; section visible; googleConnectButton toBeEnabled (S:206-208) | All Cucumber claims preserved; a11y scan added. `dismissIfShown` is a conditional *action* (waits up to 10s for `#parental-permission-modal`, swallows only TimeoutError, nag:46-57); no assertion is conditional on it. If the modal never mounts the test pays 10s. Server-side state verified the same way in both suites (accept via API, then re-navigate and read the enabled button). |
| Sponsored student cannot add personal email until providing a state (F:60-84) | S:217-254 | EXPANDED | authorized teacher-associated under-13 sponsored student, no state, at lockout: teacher 200, plc enroll 200, section 200, student 200 (no email/password, provider sponsored), join 200 (F:63); `#edit_user_create_personal_account` present (F:67); `...input[type='password']` (first match) disabled (F:68); `#..._description` text EQUALS i18n `user.create_personal_login_state_required` (F:71); select "Alabama" in `user_us_state` (first DOM match) (F:74); click `#submit-update` **to load a new page** (F:75, asserts a document replacement); `div#account-update-success` visible, polled (F:76); re-navigate; form present (F:83); password input enabled (F:84) | createTeacherAssociatedStudent authorized+sponsored, age 10, created_at (S:222-228; auth.ts:251-303 mirrors the Ruby step incl. no `grade` param); personalLoginForm toBeVisible; personalLoginPasswordInput (`input[name="user[password]"]`, AEP:86-88) toBeDisabled; expectElementHasI18nText state_required (i18n.ts:49-69: visible + polled normalized textContent toBe server string) (S:231-237); axe `#edit_user_create_personal_account` toEqual {'color-contrast': 1} (S:239-244); usStateSelect.selectOption Alabama (scoped, auto-wait) ; submitUpdateButton.click(); updateSuccessBanner toBeVisible (S:246-248); goto; form visible; password toBeEnabled (S:250-252) | The explicit "page reloaded" claim (F:75) is not asserted directly; covered indirectly because `#account-update-success` exists only after the post-PUT reload (AEP:37-41). Password locator narrowed from `type='password'` (matches both password and confirmation) to `name="user[password]"` — same element Cucumber's `[0]` hit. a11y baseline codifies one known color-contrast failure and also fails if that failure is fixed (S:17-35) — maintenance trap, not a coverage gap. |
| Sponsored student cannot add personal email when they supply a policy state (F:86-113) | S:261-296 | EQUIVALENT | same setup (F:89); form present; password disabled; description == state_required (F:93-97); select "Colorado"; click `#submit-update` (no load wait) (F:100-101); success banner visible (F:102); re-navigate; form present; password disabled (F:109-110); description == `user.create_personal_login_parental_permission_required` (F:113) | same setup (S:266-272); form visible; password toBeDisabled; i18n state_required (S:275-281); selectOption Colorado; click; banner visible (S:283-285); goto; form visible; password toBeDisabled; i18n parental_permission_required (S:287-294) | No a11y scan here. Otherwise one-to-one. |
| Sponsored student can add personal email on an unlocked account (F:115-142) | S:303-327 | EQUIVALENT | authorized teacher-associated under-13 sponsored student **in Colorado** at lockout (F:118); `#lockout-linked-accounts-form` present (F:124); `#permission-status` includes "Not Submitted" (F:125); keys parent email (F:126); `#lockout-submit` enabled (F:127); press (F:130); "Pending" polled (F:131); accept 200 (F:134); re-navigate; `#edit_user_create_personal_account` present (F:138); password enabled (F:139); `#permission-status` includes "Granted" (F:142) | createTeacherAssociatedStudent authorized+sponsored usState CO (S:309-316); linkedAccountsForm toBeVisible (S:319); helper S:72-83 (nag dismiss, Not Submitted, fill, enabled, submit, Pending, accept ok); goto; personalLoginForm visible; password toBeEnabled; permissionStatus 'Granted' (S:322-325) | Same conditional-dismiss note as row 4. `#permission-status` is page-wide in both suites (LP:68; apps/src/templates/policy_compliance/LockoutLinkedAccounts.jsx:215). |

##### 3. parental_permission.feature -> tests/policy-compliance/parental-permission.spec.ts

Source comments here read `policy_compliance/parental_permission.feature` (S:46, 77, 105, 130, 165, 188) without the `platform/` prefix; the file at dashboard/test/ui/features/platform/policy_compliance/parental_permission.feature is the only match, so the pairing is verified. This spec sets no GeolocationOverride (S:39-43), matching Cucumber. Every scenario shares: create 200 (age 10, sign_in_count 0, at lockout) via account_steps.rb:153-189; `and go home` = navigate root; `Then I am on .../lockout` (F:9, 60, 83, 114, 129) is a navigation, not a redirect assertion. Playwright equivalent in every test: createStudent ok with `LOCKED_STUDENT` (S:14-23), goto /home, `toHaveURL(/\/lockout/)` — the redirect assertion is new in each row and is why rows are EXPANDED rather than EQUIVALENT.

| Scenario (feature:line) | Playwright test (spec:line) | Verdict | Cucumber claims (terse, resolved) | Playwright assertions (terse) | Delta / notes |
|---|---|---|---|---|---|
| New under-13 account can send a parental request (F:4-27) | S:49-74 | EXPANDED (with one positional relaxation) | create 200 CO (F:8); `#lockout-panel-form` present (F:12); `#permission-status` includes "Not Submitted", polled (F:13); `.lockout-panel h2` includes "Just one more thing!" (F:14); `#lockout-panel-form > p:nth-child(1)` includes the full prompt (F:15); `> p:nth-child(2)` includes "Note: Your account will be deleted..." (F:16); keys parent email (F:19); `#lockout-submit` enabled (F:20); press (F:23); "Pending" polled (F:24); h2 includes "Thanks! We've contacted your parent/guardian." (F:25); p1 includes "We sent an email to [parent fixture address, F:19]. Didn't receive anything? ..." (F:26); p2 includes deletion note (F:27) | createStudent ok CO (S:54); URL /lockout (S:56); heading (`.lockout-panel` role heading, LP:60) toContainText 'Just one more thing!' (S:58); permissionStatus 'Not Submitted' (S:59); panel toContainText full prompt (S:60, S:27-30); panel toContainText deletion note (S:61, S:31-33); fill; submitButton toBeEnabled; submit (S:63-65); 'Pending' (S:67); heading Thanks (S:68-70); panel toContainText pending prompt with [parent fixture address, F:19] (S:71, S:34-36); panel toContainText deletion note (S:72) | Text claims preserved verbatim (strings match apps/i18n/common/en_us.json:2673-2678). **Relaxed**: Cucumber pinned prompt/note to the 1st/2nd `<p>` of the form; Playwright asserts containment anywhere in `.lockout-panel` (LP:57). `#lockout-panel-form` presence is not asserted separately, but `#permission-status` lives inside that form (LockoutPanel.tsx:235-279), so its containment check implies it. The pending `<p>` is `text + <strong>email</strong> + text` (LockoutPanel.tsx:243-247); both jQuery `.text()` and toContainText flatten it, so the substring check is sound in both. |
| New under-13 account can provide state and see lockout page (F:29-53) | S:80-102 | EXPANDED | create 200 no state (F:33); navigate `/home?forceStudentInterstitial=true` (F:34); `#student-information-modal` **present in DOM** (F:36) — the partial renders with `style: 'display: none'` (haml:3), so this passes even if the modal never opens; select "Colorado" in `user_us_state` (F:37); jQuery-click `#submit-btn` with no load wait (F:39); **navigate** to /lockout (F:41); form present; "Not Submitted" (F:44-45); keys; enabled; press; "Pending" (F:48-53) | createStudent ok no state (S:86); goto same URL; modal.heading (role heading /Finish creating your account/, SIM:16-18) toBeVisible (S:89); selectState Colorado (combobox name 'State', SIM:19, 23-25); submit = click `#submit-btn` then `waitForURL(/\/lockout/)` (SIM:28-31); panel toBeVisible; 'Not Submitted' (S:93-94); fill; enabled; submit; 'Pending' (S:96-100) | Two claims strengthened: modal actually visible (vs hidden-but-present), and the app's own redirect to /lockout after saving the state is asserted (Cucumber navigated there manually, so a broken redirect would have passed). The heading string is not cross-checked against i18n in this audit; a mismatch fails loudly, it cannot pass vacuously. |
| New under-13 account can resend the email (F:55-76) | S:108-127 | EXPANDED | shared claims through "Pending" (F:59-72); press `#lockout-resend` (F:75); `#lockout-panel-form` present (F:76) — **could not fail**: the form was already present | shared through 'Pending' (S:113-122); `resend()` = click 'Resend permission email' button (LP:65-67; label at en_us.json:2688) racing `waitForResponse` for POST /policy_compliance/child_account_consent, then `expect(response.ok()).toBeTruthy()` (LP:92-102, S:124-125) | Playwright replaces a vacuous presence check with a real server round-trip assertion. Playwright does not re-assert `#lockout-panel-form` presence before 'Not Submitted' (S:117); implied as in row 1. |
| New under-13 account can send a different email (F:78-107) | S:133-162 | EXPANDED | shared through "Pending" (F:82-95); clear `#parent-email` (F:98); keys parent2 (F:99); `#lockout-submit` enabled (F:100); press (F:103); `#lockout-submit` visible, polled (F:104) — near-vacuous, already visible; reload (F:105); form present (F:106); `#parent-email` `.val()` == "[second parent fixture address, F:99]" (F:107) | shared through 'Pending' (S:138-147); replaceParentEmail (clear+fill, LP:77-80); toBeEnabled; submit (S:149-151); panel toContainText 'We sent an email to [second parent fixture address, F:99]' (S:154-156); reload; panel toBeVisible; parentEmailInput toHaveValue '[second parent fixture address, F:99]' (S:158-160) | Adds the pending-prompt text check, which doubles as a commit barrier before reload (S:152-153). Persistence verified by reload in both suites. |
| Student cannot enter own email as parent's email (F:109-122) | S:168-185 | EXPANDED | create 200 CO (F:113); form present; "Not Submitted" (F:117-118); keys the student's own generated email (account_steps.rb:201-205) (F:121); `#lockout-submit` disabled-attr-or-class (F:122) | createStudent returns generated email (auth.ts:183, 105) (S:173-176); URL /lockout; 'Not Submitted' (S:178-180); fill(email); submitButton toBeDisabled (S:182-183) | Button is natively disabled (`disabled={disabled}`, LockoutPanel.tsx:365), so toBeDisabled is the same predicate here. Generated-email prefix differs (`student…` vs `user…`); irrelevant to the claim. |
| Student can enter parent's email if parent created the account (F:124-137) | S:191-209 | EXPANDED | `create as a parent` => parent_email_preference_{opt_in_required '1', opt_in 'no', email = student email, request_ip, source} (account_steps.rb:113-119, 183-185) then 200 (F:128); form present; "Not Submitted" (F:132-133); keys own email (F:136); `#lockout-submit` enabled (F:137) | createStudent parentCreated:true => the same five fields with the same student email (auth.ts:205-213) (S:196-200); URL /lockout; 'Not Submitted'; fill(email); submitButton toBeEnabled (S:201-207) | One-to-one on the claim; redirect assertion added. |

##### 4. manage_students_tab.feature -> tests/manage-students/manage-students-tab.spec.ts

| Scenario (feature:line) | Playwright test (spec:line) | Verdict | Cucumber claims (terse, resolved) | Playwright assertions (terse) | Delta / notes |
|---|---|---|---|---|---|
| Teacher bulk updates US state for all section students (F:4-34) | S:18-67 | EQUIVALENT | CPA mock (F:6); teacher-associated under-13 student in CO at lockout (not authorized, not sponsored): teacher 200, section 200, student 200 (age 10, CO, email+password), join 200 (F:8); sign in as teacher: POST /users/sign_in 200, navigate /home (F:9); click `#section-options-dropdown-dropdown-button` once visible, click `#ui-test-Roster` once visible (F:10-11); `th:contains(State) i` visible, polled (F:14); click it; click `button:contains(Set state for all students)` (F:15-16); `#us-state-column-bulk-set-modal` visible, polled (F:17); modal `h3` includes "Set state for all students" (F:18); `label:contains(State)` visible (F:19); `select#us-state option:checked` text includes "Choose a state" (F:20); modal text includes the consent sentence (F:21); `a:contains(Learn more about parental consent)` href includes the support URL (F:22); select "AL" in `us-state` (F:24); click Add (F:25); modal not visible, polled (F:26); `tbody tr:nth-child(1) select[name='usState'] option[value='AL']` `:checked` (F:27); click row-1 Save (F:29); row-1 `select[name='usState']` not visible, polled (F:31); reload (F:33); `tr:nth-child(1):contains(Student) td:contains(AL)` visible, polled (F:34) — server persistence via re-render | goto /; mock both DCDO keys (S:26-27); GeolocationOverride US (S:29); createTeacherAssociatedStudent age 10, CO, created_at (S:31-36; every API call throws on failure); signOut asserts 204 (auth.ts:339-343); signIn ok (S:38-40); `navigateToRoster`: goto /teacher_dashboard/home + `homeHeader` toBeVisible (TDP:30-39), 'Section options dropdown' button toBeVisible, click, click link 'Roster' (TDP:41-49); `waitForTable`: table toBeVisible (MSP:33-35); `openStateBulkSetModal`: State columnheader toBeVisible, click 'Actions' button, click 'Set state for all students', modal (dialog named 'Set state for all students') toBeVisible (MSP:37-47); heading (role heading, same name) toBeVisible (S:46); state label visible (S:47); `select#us-state` toHaveValue('') (S:48); modal toContainText consent sentence (S:49-51); consent link toHaveAttribute href == exact URL (S:52-55); `bulkSetState('AL')`: selectOption, click Add, modal not visible (MSP:49-53); `firstRowStateSelect()` (table combobox 'State') toHaveValue 'AL' (S:58); `saveFirstRow`: click table 'Save', state select not visible (MSP:60-63); reload; table visible; first `tbody tr` toContainText 'Student' and toContainText 'AL' (S:62-65) | "Choose a state" option text (F:20) -> value '' (S:48) is equivalent: the placeholder item is `{value: '', text: i18n.chooseUsState()}` (apps/src/templates/manageStudents/Table/UsStateColumn/BulkSetModal/index.tsx:54-57; en_us.json:599). href: Cucumber `include`, Playwright exact equality (stricter). Heading: Cucumber asserted an `h3`; Playwright asserts a heading of any level with that name (level dropped, text kept). Row locators: Cucumber pinned `tbody tr:nth-child(1)`; `firstRowStateSelect()` and `saveFirstRow()` are scoped to the whole table, not the first row (MSP:56-63) — only sound because the section has one student (strict mode would error with two). Final check: Cucumber required a `td` containing "AL" in the row containing "Student"; Playwright checks the row contains "Student" and, separately, "AL" anywhere in the row (S:64-65) — a substring match in both suites, slightly looser in Playwright. GeolocationOverride=US is a new precondition (S:28-29 comment: the State column needs country_code US on the teacher); Cucumber depended on the runner's geolocation for the same thing. Extra: Playwright asserts the teacher-dashboard header (TDP:38) and signOut 204. |

##### Group B1 summary

Counts (24 Cucumber scenarios across 4 features; 1 extra Playwright test with no Cucumber source):
- EQUIVALENT: 14 (lockout_phase 10; policy_compliance 3 — rows 3, 6, 7; manage_students 1)
- EXPANDED: 10 (policy_compliance 4 — rows 1, 2, 4, 5; parental_permission 6)
- WEAKENED: 0 as a whole-scenario verdict. Two sub-claim relaxations inside EXPANDED/EQUIVALENT rows: parental_permission row 1 paragraph positions (`> p:nth-child(n)` -> panel containment, S:60-61, 71-72); manage_students heading level h3 -> any heading (S:46) and row-scoped -> table-scoped select/Save locators (MSP:56-63).
- DROPPED: 0. Every Cucumber `Then`/embedded assertion has a Playwright counterpart or a strictly stronger replacement (F:76 presence-after-resend -> response.ok(); F:104 button-visible -> pending-prompt text).
- UNMAPPED: 0. All 24 scenarios have a `Source:` comment naming the feature and scenario.
- Extra Playwright coverage with no Cucumber source: lockout-phase.spec.ts:305-327 (a11y baseline), plus a11y scans folded into policy-compliance.spec.ts:118-123, 196-201, 239-244.

Top 5 riskiest deltas:
1. Geolocation pin changes the server condition: lockout-phase.spec.ts:30, policy-compliance.spec.ts:92 and manage-students-tab.spec.ts:29 force `GeolocationOverride=US`, which Cucumber never did; `#user_us_state` only renders when `@is_usa` (registrations_controller.rb:458) and under US the student-information interstitial's duplicate `#user_us_state` (haml:21-27) can be in the DOM on /users/edit, so the Playwright "enabled" results for the four not-in-Colorado lockout_phase scenarios (S:65-108, 248-293) are the first non-vacuous ones (AEP:5-13) and any failure there is a real finding, not a migration bug.
2. Conditional nag-modal dismissal in both /users/edit unlock flows: `dismissIfShown` (parental-permission-nag-modal.ts:46-57, called at policy-compliance.spec.ts:76) waits up to 10s and proceeds if the modal never mounts, so the two flows (S:177-210, S:303-327) pass by either path; no assertion depends on which path ran, but it hides whether the modal is being shown for these accounts.
3. parental-permission.spec.ts:60-61, 71-72 assert the prompt and deletion-note text anywhere in `.lockout-panel` where parental_permission.feature:15-16, 26-27 pinned them to the first and second `<p>` of `#lockout-panel-form`; a re-ordering or duplication of the copy would now pass.
4. manage-students-page.ts:56-63 locate the row state select and Save button across the whole table rather than `tbody tr:nth-child(1)` (manage_students_tab.feature:27-31), and manage-students-tab.spec.ts:64-65 accept "AL" anywhere in the row; correct only while the section has exactly one student.
5. policy-compliance.spec.ts:31-35, 239-244 lock a WCAG baseline of `{'color-contrast': 1}` on `#edit_user_create_personal_account` with `toEqual`; fixing that contrast bug will break this test until the baseline is edited (documented at S:17-30) — a maintenance trap rather than lost coverage, but it will look like a regression to whoever fixes the color.

Pairings inferred without a Source comment: none. (parental-permission.spec.ts's Source lines omit the `platform/` directory prefix but name the feature file and scenario title exactly; the file is unique in the tree, so the pairing is verified, not inferred.)

Cucumber-side notes surfaced while resolving steps (not migration defects): `Then I am on "<url>"` is the navigation step (steps.rb:126), so policy_compliance.feature:9, :20 and parental_permission.feature:9, :34, :41, :60, :83, :114, :129 never asserted a URL; policy_compliance.feature:15-20 therefore had no assertion at all. The `cap_CO_start_date_override` DCDO key set by cap_steps.rb:8 has no reader outside tests (state_policies.rb:49-53 only reads the lockout override); manage-students-tab.spec.ts:26 still mocks it harmlessly, the other three specs drop it correctly.

### A.B2

#### Group B2 audit: privacy consent, cookie/GDPR, feature-flag mocking

Paths: `F:` = dashboard/test/ui/features, `S:` = step_definitions under F, `P:` = frontend/packages/e2e-tests/tests.
All pairings below carry an explicit `Source:` JSDoc in the spec unless marked UNVERIFIED PAIRING.

##### Shared step resolutions (cited once, referenced by table rows)

| Cucumber step | Resolves to | What it actually asserts |
|---|---|---|
| `I am in Europe` | S/geolocation_steps.rb:7-15 -> :3-5 | Sets cookie `GeolocationOverride=ES`; navigates to studio first if not on code.org. No assertion. |
| `I am a teacher` | S/account_steps.rb:40-43 -> :217-240 -> `create_user` :99-150 | `reset_session` (:334-337 -> GET /reset_session, sessions_controller.rb:76-81: clears Rails session only), then XHR POST /api/test/create_user **must return 200** (`browser_request` S/steps.rb:1313 default `code: 200`). teacher, age 21+, sign_in_count 2. |
| `I create a student named` | S/account_steps.rb:152-190 -> `create_user` | Same 200 requirement; student, age 16, sign_in_count 2. |
| `I create a student in the eu named` | S/account_steps.rb:207-215 | `create_user` + data_transfer_agreement_* fields. |
| `I am on "<url>"` | S/steps.rb:126-140 | Navigates; `check_window_for_js_errors` (support/browser_helpers.rb:129-139) only prints. No assertion. |
| `element "X" is (not) visible` | S/steps.rb:951-953 -> :939-941 -> :314-316 | **Immediate** (no wait) jQuery `:visible && visibility!=hidden` == expectation. "not visible" is also true when X is absent. |
| `I wait until element "X" is (not) visible` | S/steps.rb:326-329 | Same predicate, polled up to 2 min (`DEFAULT_WAIT_TIMEOUT` :4). |
| `I wait to see "#id"/".class"` | S/steps.rb:161-164 | Polls `find_elements` non-empty: **presence, not visibility**. |
| `element "X" does (not) exist` | S/steps.rb:955-961 -> :931-933 -> :926-929 | Immediate `$(X).length > 0` == expectation, after `wait_for_jquery` (:1159-1168). |
| `element "X" contains text "T"` | S/steps.rb:855-857 -> support/browser_helpers.rb:61-64 | Immediate; `$(X).text()` (joined over all matches) includes T. |
| `element "X" does not contain text "T"` | S/steps.rb:859-861 -> browser_helpers.rb:66-70 | Immediate; joined text stripped excludes T. |
| `I wait until "X" contains text "T"` | S/steps.rb:281-285 | Polled joined-text includes T. |
| `I wait until element "X" is in the DOM` | S/steps.rb:360-363 | Polled `$(X).length > 0`. |
| `I click selector "X"` | S/steps.rb:626-632 | `$(X)[0].click()`; throws if no match (implicit existence). |
| `I press "id"` | S/steps.rb:449-454 | Polls `find_element(id)` 30 s, native click. |
| `I click "X" once it exists` | S/steps.rb:608-612 | Polls `find_element(:css)`, native click. |
| `I wait until current URL contains "U"` | S/steps.rb:392-395 | Polled `current_url.include?` (after `replace_hostname`). |
| `it is eventually observed that the "gdpr" script data field "k" is "v"` | S/script_data_steps.rb:1-5 | Polls `JSON.parse(script[data-gdpr].dataset.gdpr)[k].to_s == v`. Written by apps/src/templates/GDPRDialog.jsx:29-33 only after the accept POST resolves. |
| `the link reading "T" within element "P" goes to "U"` | S/steps.rb:441-447 | `find_element(P)`, xpath `a[starts-with(normalize-space(text()),T)]`; Selenium `attribute("href")` (resolved URL) `== replace_hostname(U) or == U`. |
| `I sign out` | S/account_steps.rb:278-285 | XHR GET /users/sign_out.json **must return 204**; clears storage. |
| `I sign in as "N" and go home` | S/account_steps.rb:20-25 -> `sign_in` :69-75 | `reset_session`; POST /users/sign_in **must return 200**; navigate /home. Does not re-set the ES cookie (survives reset: sessions_controller.rb:76-81 touches only Rails session/client_state). |
| `I use a cookie to mock the DCDO key "k" as "v"` | S/steps.rb:1197-1201 -> support/dashboard_helpers.rb:25-37 | JSON.parse(v) else raw string; merges into `DCDO` cookie on top-level domain. |
| `I delete the cookie named "N"` | S/steps.rb:1367-1371 | Deletes if present. |
| `response json key "k" has value "v"` | S/steps.rb:1638-1644 | Clicks `#rawdata-tab` if present (Firefox); `pre` text includes `"k":v`. |
| `element "X" is not categorized by OneTrust` | S/steps.rb:892-909 | `wait_for_jquery`; for every match of X, class must not include `optanon-category-`. **No existence check in the negated form (:896-898)**: passes vacuously when X matches nothing. |
| `I switch to the embedded view of current project with query "Q"` | S/steps.rb:1506-1510 | `current_url.sub('/edit','/embed') + '?Q'`; navigate. No check that URL contained /edit. |
| `I dismiss the language selector` | S/steps.rb:1258-1263 -> :650-657, :1106 | Click `.close` if visible within 5 s (else ignore); then wait until no `.close` visible. |
| `I reload the page` | S/steps.rb:1152-1157 | refresh + wait_for_jquery. |
| `I wait for jquery to load` | S/steps.rb:1170-1172 | Polls `typeof jQuery`. |
| `I open my eyes` / `I see no difference` / `I close my eyes` | S/eyes_steps.rb:14-33 / :48-60 / :35-45 | All `next if CDO.disable_all_eyes_running`. `check_window` full page unless "in the current viewport". `close(fail_on_mismatch)` **rescues `Applitools::TestFailedError` and only prints** (:42-44): an Eyes diff never fails the Cucumber scenario itself. |
| Tag `@as_student` | support/hooks.rb:1-3 | Before hook creates+signs in a student. |
| Tag `@no_mobile` | dashboard/test/ui/runner.rb:800 | Skipped on mobile browsers only. Playwright projects are desktop-only (P/../playwright.config.ts:53-67); the tag is inert there. |
| Tag `@single_session` | support/connect.rb:274-289, 326-339 | Shared browser; `I sign out` after each scenario. No claim. |
| Tag `@eyes` | (runner lane selection) | Scenario still runs its functional steps when Eyes is disabled (eyes steps are `next`). |

Playwright shared facts:
- `@visual`-tagged tests are `grepInvert`ed from chromium/firefox/webkit (playwright.config.ts:13, 57-67) and run **only** in `visualProjects()` lanes, which exist only when `VISUAL_PROVIDER` is set (:25, :72-74).
- `visualCheck` (frontend/packages/playwright-support/src/visual/applitools.ts): no-op without `APPLITOOLS_API_KEY` outside CI (:55-69); diff fails the test only when `APPLITOOLS_SHOULD_REPORT_FAILURE != 'false'` (:33-34, :118-129). Treated below as a visual-only claim.
- `createUser` (P/shared/auth.ts:54-106) throws on non-ok create (:97-99) and on non-ok `/users/sign_in` (:224-234), i.e. the same embedded 200 checks as Cucumber, plus one extra sign-in POST Cucumber's `create_user` does not make. `signOut` requires 204 (:339-348). `resetSession` = `clearCookies()` (:45-47) — **stronger** than Cucumber's `reset_session` (also wipes DCDO/Geolocation cookies), which is why specs re-set `setCountryOverride` after it.
- `expect` timeout 15 s (config:46); `page.goto` default waits for `load`.

---

##### 1. F/xteam/gdpr_dialog.feature -> P/gdpr/gdpr-dialog.spec.ts

| Scenario (feature:line) | Playwright test (spec:line) | Verdict | Cucumber claims (resolved) | Playwright assertions | Delta / notes |
|---|---|---|---|---|---|
| EU user sees the GDPR Dialog on dashboard, opt out (gdpr_dialog.feature:5-9) | gdpr-dialog.spec.ts:20-36 | EQUIVALENT | create teacher 200 (:7); `.ui-test-gdpr-dialog` jQuery-visible, immediate (:9) | createUser ok/sign-in ok (auth.ts:97-99,231); `expect(gdpr.dialog).toBeVisible()` (:35; locator gdpr-dialog.ts:22) | Playwright auto-waits 15 s where Cucumber checked immediately after load; same claim. |
| EU user sees the GDPR Dialog …, opt in, don't show again (:11-21) | :44-76 | EQUIVALENT | dialog visible (:15); click accept exists (:16); dialog not visible, immediate (:17); `data-gdpr.show_gdpr_dialog == "false"` polled (:18; set only after POST success, GDPRDialog.jsx:26-33); `.header_user` present (:20); dialog not visible (:21) | dialog visible (:60); `acceptDialog()` click (:68; gdpr-dialog.ts:31-33, auto-wait only); `not.toBeVisible` (:69); `waitForResponse(accept_data_transfer_agreement && ok)` (:65-67,70); `header.waitForSignedIn()` = `#header_user_menu` visible (:74; header.ts:151-153); `not.toBeVisible` (:75) | Script-data claim replaced by "POST returned ok". The client-side dataset write (GDPRDialog.jsx:29-33) is not itself observed; the end-to-end persistence claim (reload, no dialog) is kept. `.header_user` presence -> `#header_user_menu` visibility is stronger. |
| EU student who accepted on sign up doesn't see the GDPR Dialog (:23-27) | :84-98 | EXPANDED | create EU student 200 (:25; fields account_steps.rb:208-214); dialog not visible, immediate after load (:27) | createEuStudent (auth.ts:109-123, same fields); `waitForSignedIn()` (:96); `not.toBeVisible` (:97) | Adds the signed-in readiness check, which stops the negative assertion from passing against an unrendered page. |
| GDPR Dialog privacy link works from dashboard (:29-34) | :106-133 | EQUIVALENT | `#gdpr-dialog` jQuery-visible, immediate (:33); link starting "Visit CodeAI" inside `#gdpr-dialog` has resolved href `== http://code.org/privacy` or `== replace_hostname(...)` (:34) | `.ui-test-gdpr-dialog` visible (:125; justification :121-124); `getByRole('link',{name:/Visit CodeAI/})` scoped to `#gdpr-dialog` (gdpr-dialog.ts:24-27); raw `href` matches `/^(https?:)?\/\/code\.org\/privacy$/` (:131-132) | Selector substituted (`#gdpr-dialog` -> `.ui-test-gdpr-dialog`). Href check is a regex on the raw attribute accepting protocol-relative/http/https, vs Cucumber equality on the resolved URL; host+path pinned in both. Cucumber also accepted the test-domain rewrite; Playwright does not. |
| Accept, sign out, sign in again, no dialog (:36-47) | :141-174 | EQUIVALENT | dialog visible (:40); accept click (:41); not visible (:42); script-data false (:43); sign-out 204 (:44); reset_session + sign-in 200 + go home (:45); `.header_user` present (:46); dialog not visible (:47) | visible (:155); click (:160); not visible (:161); accept POST ok (:157-159,162); `signOut` 204 (:164; auth.ts:340-343); `resetSession` + `signIn` ok (:167-169); `setCountryOverride` re-applied (:170); `waitForSignedIn` (:172); `not.toBeVisible` (:173) | Same script-data substitution as row 2. Playwright re-sets the ES cookie because `clearCookies()` removes it; Cucumber's `reset_session` left it in place, so both runs make the final negative check meaningful. |

Phase-2 flags: none. Every test ends in a positive or guarded negative assertion.

##### 2. F/platform/one_trust.feature -> P/platform/one-trust.spec.ts

| Scenario (feature:line) | Playwright test (spec:line) | Verdict | Cucumber claims (resolved) | Playwright assertions | Delta / notes |
|---|---|---|---|---|---|
| User sees OneTrust cookie pop-up … (@eyes) (one_trust.feature:4-14) | one-trust.spec.ts:18-52 `{tag:'@visual'}` | EQUIVALENT (visual lane only) | student 200 (:6); URL contains `otreset=false` (:9); `#onetrust-banner-sdk` visible (:12); Eyes viewport check (:13; mismatch only printed, eyes_steps.rb:42-44) | `toHaveURL(/otreset=false/)` 15 s (:30-32); banner `toBeVisible` 30 s (:34-36); banner `toBeFocused` then blur, `not.toBeFocused` (:42-48); `visualCheck(...,{fully:false})` (:50) | Runs only under visual-* projects; its functional claims are duplicated by the next row in the functional lanes. Extra focus-state assertions (:42-48) are stabilisation, could fail if OneTrust stops moving focus. |
| OneTrust cookie pop-up shows … (:16-22) | :59-75 | EQUIVALENT | student 200; URL contains otreset=false (:20); banner visible (:22) | URL regex (:70-72); banner visible 30 s (:74) | `I wait for jquery to load` (:21) has no equivalent; it is a wait, not a claim. |
| The dashboard pages load the self hosted OneTrust libraries (:24-28) | :82-92 | EQUIVALENT | `script[src$='onetrust/cdo/scripttemplates/otSDKStub.js']` exists (:26); `977d/OtAutoBlock.js` exists (:27); `977d-test/OtAutoBlock.js` not exist (:28) | `selfHostedSdkStub.first()` attached (:89); `prodAutoBlock.first()` attached (:90); `testAutoBlock` count 0 (:91); locators one-trust.ts:43-54 | Identical selectors. |
| The dashboard pages load the Onetrust prod libraries (:30-37) | :103-120 | EQUIVALENT | after DCDO mock `onetrust_cookie_scripts=prod` (:32): `otSDKStub.js` exists (:34); `977d/` exists (:35); `977d-test/` not (:36); `onetrust/scripttemplates/otSDKStub.js` not (:37) | `dcdo.mock` (:110; dcdo.ts:41-61); `sdkStub.first()` attached (:113); `prodAutoBlock.first()` attached (:114); `testAutoBlock` 0 (:115); `prodCdnSdkStub` 0 (:119) | Identical selectors. Naming inconsistency only: `prodCdnSdkStub` (one-trust.ts:28-29,47-49) is documented as "OneTrust's prod CDN path" while spec:117-118 says it confirms the stub is *not* self-hosted; the asserted selector matches Cucumber :37 either way. |
| The dashboard pages load the test OneTrust libraries (:39-43) | :127-137 | EQUIVALENT | exists / not / exists (:41-43) | attached (:134) / count 0 (:135) / attached (:136) | — |
| The dashboard pages do not load the OneTrust libraries (:45-49) | :144-154 | EQUIVALENT | three not-exist (:47-49) | three count 0 (:151-153) | Negative-only test; both versions pass trivially if the page failed to render scripts at all. |
| Outline: Critical Javascript files are appropriately categorized … row `/users/sign_in` (:51-62) | :161-180 | EQUIVALENT | for 7 selectors (:53-59): every match lacks `optanon-category-`; **vacuous if selector matches nothing** (steps.rb:896-898) | `waitForSdkSettled()` (:167; one-trust.ts:68-77, waits for OT script tag 15 s); for the same 7 selectors `categorizedScript(sel)` count 0 (:169-179; one-trust.ts:63-65) | Same vacuity: neither asserts the critical scripts exist. Playwright adds a precondition that the OneTrust SDK tag is present (Cucumber only waited for jQuery). Both read once after load; a later categorisation pass is not caught by either. One example row, represented. |
| Outline: Embedded projects do not display the OneTrust banner (@as_student), 9 rows (:64-81) | :187-228, loop over 9 project types (:189-199) | EQUIVALENT per row; **one row lane-skipped** | hook creates student (hooks.rb:1-3); ES cookie; goto `/projects/<t>/new`; embed URL = current URL with `/edit`->`/embed` + query (:68); `otSDKStub.js` not exist (:69); `OtAutoBlock.js` not exist (:70) | `createStudent` ok (:213); `setCountryOverride` (:214); `waitForURL(/\/edit/)` (:220; explicit where Cucumber assumed); `sdkStub` count 0 (:225); `autoBlock` count 0 (:226) | All 9 rows present (music, spritelab, artist, gamelab, dance, applab, poetry, flappy, frozen). `test.fixme(LAB2_PROJECTS.has(type) && browserName==='webkit')` (:187, :207) removes the **music** row on webkit; `weblab2`/`pythonlab` in the set are not rows. Negative-only checks (see flags). |

Phase-2 flags:
- Rows 6-8 are negative-only (`toHaveCount(0)`); a page that renders nothing passes. Cucumber had the same shape. one-trust.spec.ts:151-153, :169-179, :225-226.
- `test.fixme` on webkit for lab2 rows (:207) is a browser-conditional coverage removal.

##### 3. F/xteam/cookie_banner.feature -> P/platform/cookie-banner.spec.ts

| Scenario (feature:line) | Playwright test (spec:line) | Verdict | Cucumber claims (resolved) | Playwright assertions | Delta / notes |
|---|---|---|---|---|---|
| Outline: Show cookie banner, dismiss it and confirm it's dismissed — row `allthethingscourse/units/1/lessons/3/levels/1` / "studio.code.org puzzle" (cookie_banner.feature:5-23) | functional: cookie-banner.spec.ts:35-55; visual: :57-79 `@visual`; a11y (net-new): :84-95 | EQUIVALENT (functional) + visual split + EXPANDED (a11y); one minor claim DROPPED | dismiss language selector: click `.close` if visible, then **wait until no `.close` visible** (:8; steps.rb:1258-1263); `#accept-cookies` present (:9); Eyes full-page "initial load with cookie banner" (:10); press `accept-cookies` (:12); `#accept-cookies` not visible, polled (:13); reload (:15); goto again (:16); `#accept-cookies` not visible (:17); close eyes (mismatch printed only) | functional: goto `domcontentloaded` (:46); `#cookie-banner #accept-cookies` **visible** (:47; cookie-banner.ts:11-23; markup shared/haml/cookie_banner.haml:28-34 confirms nesting); `accept()` click (:49); `not.toBeVisible` (:50); reload + goto (:52-53); `not.toBeVisible` (:54). visual: visible (:63); `waitForVisualStability` (:74); `visualCheck` full page with `.video-modal .video-player` masked (:73-77). a11y: axe on `#cookie-banner` must equal `{'color-contrast':1}` (:89-94) | URL built by `labLevelUrl({noautoplay:false})` to match the literal (spec:7-12). DROPPED: the "no `.close` visible" wait (steps.rb:1261 -> :1106); spec:20-22 justifies omission by saying the LocalizeJS widget is force-disabled — apps/src/localization/entrypoint.js:115-116 shows an experiment/query gate, not verified here as "can never render". Visual claim now masks the intro-video iframe (Cucumber masked nothing). Eyes diff is enforced only in visual lanes with `SHOULD_REPORT_FAILURE`; Cucumber never failed on Eyes diff at all (eyes_steps.rb:42-44). |

Phase-2 flags:
- a11y baseline locks in one `color-contrast` violation (spec:14-18, :89-94); a fix to the button contrast fails the test. Intentional per comment; noted as brittle-by-design.

##### 4. F/xteam/race_interstitial.feature -> P/race-interstitial/race-interstitial.spec.ts

| Scenario (feature:line) | Playwright test (spec:line) | Verdict | Cucumber claims (resolved) | Playwright assertions | Delta / notes |
|---|---|---|---|---|---|
| Race Interstitial Shown And Dismissed (@as_student, @eyes) (race_interstitial.feature:5-15) | race-interstitial.spec.ts:12-32 `{tag:['@visual']}` | **WEAKENED (lane-gated)** | hook: student 200 (hooks.rb:1-3); `#race-modal` present, polled (:9); Eyes full page "race interstitial" (:10); press `later-link` (:12); `#race-modal` not visible, polled (:13); Eyes "race interstitial closed" (:14); close eyes | `signInAsNewUser` student (:18; fixtures.ts:31-37, throws on non-ok); `#race-modal` `toBeVisible` (:24; race-interstitial-modal.ts:18); `waitForVisualStability(.modal-dialog)` (:25); `visualCheck` (:26); `decline()` click `#later-link` (:28; :20,:25); `not.toBeVisible` (:29); `visualCheck` (:30) | Assertion-for-assertion the functional claims are EQUIVALENT-or-stronger (visible vs present). But the whole test is `@visual`, so it is `grepInvert`ed from chromium/firefox/webkit (playwright.config.ts:13, 57-67) and executes only when a visual lane exists (:25, :72). Cucumber ran the modal-shown/dismissed claims in every run (Eyes steps `next` when disabled). No non-visual twin exists, unlike cookie-banner.spec.ts:35-55. `decline()` does not await the persistence POST (race-interstitial-modal.ts:23); Cucumber did not either. |

##### 5. F/dcdo_mocking.feature -> P/dcdo-mocking/dcdo-mocking.spec.ts

| Scenario (feature:line) | Playwright test (spec:line) | Verdict | Cucumber claims (resolved) | Playwright assertions | Delta / notes |
|---|---|---|---|---|---|
| Using a cookie to mock DCDO (dcdo_mocking.feature:3-24) | dcdo-mocking.spec.ts:28-47 | EQUIVALENT | 4 GETs of `/api/test/get_dcdo`; `pre` text includes `"stored":null` and `"fetched":null` (:5-6), `"fetched":"mocked"` (:12), `"fetched":{"dcdo":"re-mocked"}` (:18), back to null after deleting `DCDO` cookie (:21-24). Mock parsing: `"mocked"` -> string (JSON.parse fails, steps.rb:1199-1200); `{"dcdo":"re-mocked"}` -> object | `assertJsonKeyValue` (:11-21): click `#rawdata-tab` if visible, `expect(page.locator('pre')).toContainText('"k":v')`; 8 calls (:30-31,35-36,40-41,45-46); `dcdo.mock('…','mocked')` string (:33), object (:38; dcdo.ts:41-61 stores verbatim JSON); `dcdo.clear()` (:43; dcdo.ts:64-66 `clearCookies({name:'DCDO'})`) | Value encodings match (`"mocked"` -> `"fetched":"mocked"`; object -> `{"dcdo":"re-mocked"}`). Cookie domain derived from current URL in both (dashboard_helpers.rb:29-33; dcdo.ts:58), and the first goto precedes the mock in both. |

Phase-2 flags:
- Conditional branch `if (await rawDataTab.isVisible())` (spec:17-19) is navigation, not an assertion, and mirrors steps.rb:1640. `page.locator('pre')` unscoped: strict mode throws (fails loudly) if >1 `pre`; fine.

##### 6. F/teacher_tools/projects/public_project_gallery_signed_out.feature -> P/projects/public-project-gallery.spec.ts

| Scenario (feature:line) | Playwright test (spec:line) | Verdict | Cucumber claims (resolved) | Playwright assertions | Delta / notes |
|---|---|---|---|---|---|
| Public Gallery Shows Expected Elements (public_project_gallery_signed_out.feature:7-9; Background :4-5) | public-project-gallery.spec.ts:11-18 | EQUIVALENT | `$('h1').text()` includes "Projects", polled (:8); `#uitest-public-projects` visible, polled (:9) | `goto('/projects/public',{waitUntil:'domcontentloaded'})` (public-project-gallery.ts:24); `getByRole('heading',{level:1,name:'Projects'})` visible (:16; POM :14 — substring, case-insensitive, strict); `#uitest-public-projects` visible (:17) | Heading check is visibility of an h1 whose name contains "Projects" vs. joined h1 text containing "Projects"; strict mode fails if several h1s match. Where the h1 renders was not located in apps/src/templates/projects/* or dashboard/app/views/projects/*. |
| Public Gallery Shows Expected Project Types (:11-15) | :24-32 | EQUIVALENT | `#uitest-public-projects` visible (:12); `.ui-project-app-type-area` in DOM (:13); `$('.ui-project-app-type-area').length == 1`, immediate (:14; project_steps.rb:94-97); `.ui-featured` text includes "Featured Projects", immediate (:15) | section visible (:29); `.ui-project-app-type-area` `toHaveCount(1)` (:30; POM :16); `getByRole('heading',{level:2,name:'Featured Projects'})` visible (:31; POM :17-20) | `.ui-featured` is the runtime class `ui-${labKey}` with `labKey="featured"` (ProjectAppTypeArea.jsx:196; ProjectCardGrid.jsx:84-85); its heading is an `h2` (ProjectAppTypeArea.jsx:198-200). Playwright's heading locator is not scoped to `.ui-featured`, but `toHaveCount(1)` on the area plus strict mode make it the same element in practice. "in the DOM" wait subsumed by the count. |
| (net-new) public gallery has no WCAG AA violations | :34-45 | EXPANDED | — | axe on `#uitest-public-projects` == `{}` (:39-44) | No Cucumber source; adds coverage. |

Phase-2 flags: none.

##### 7. F/teacher_tools/teacher_dashboard/demo_section_card.feature -> P/teacher-tools/teacher-dashboard/demo-section-card.spec.ts

| Scenario (feature:line) | Playwright test (spec:line) | Verdict | Cucumber claims (resolved) | Playwright assertions | Delta / notes |
|---|---|---|---|---|---|
| Teacher with zero sections can create a practice section from the homepage (@no_mobile) (demo_section_card.feature:5-17) | demo-section-card.spec.ts:17-54 `{tag:['@no_mobile']}` | EXPANDED | DCDO mock `hide-teacher-dashboard-logo-animation=true` (:7; `true` parsed as JSON boolean); teacher 200 (:8; `reset_session` inside does not drop the DCDO cookie, sessions_controller.rb:76-81); `#ui-test-demo-section-card` visible, polled (:10); contains "High School Practice Section" (:11); contains "Demo" (:12); press `go-to-lesson-dropdown-button` by id (:13); `#go-to-lesson-dropdown li` visible, polled (:14); click `#ui-test-demo-section-action-progress` once it exists (:15); URL contains `/teacher_dashboard/sections/` (:16) and `/progress` (:17) | `dcdo.mock(...,true)` (:22); `createUser` teacher without `resetSession` (:25; rationale :23-24 — needed because `clearCookies()` would wipe the mock, unlike Cucumber's reset); `dashboard.goto({experiment:'demo-section'})` also asserts `#teacher-home-header` visible (teacher-dashboard.ts:30-39); card visible (:31); `toContainText` x2 (:32-33); axe card == `{}` (:34-39); `openLessonDropdown()` clicks `getByRole('button',{name:'go-to-lesson filter dropdown'})` scoped to card and asserts first `#go-to-lesson-dropdown` listitem visible (:41; demo-section-card.ts:23-38); axe dropdown == `{}` (:42-47); `progressAction.click()` auto-wait (:49); `toHaveURL(/\/teacher_dashboard\/sections\//)` and `/\/progress/` (:51-52) | Dropdown trigger addressed by accessible name (from `name="go-to-lesson"`, CourseContentDropdown.tsx:88) instead of id `go-to-lesson-dropdown-button` (reviewSyllabusOnboarding.ts:20); that these are the same element is inferred, not verified in this audit. Adds header-visible precondition and two axe gates. |

Phase-2 flags: none beyond the a11y baselines being `{}` (a regression fails loudly — correct direction).

##### 8. F/teacher_tools/unnumbered_lessons.feature -> P/teacher-tools/unnumbered-lessons.spec.ts

| Scenario (feature:line) | Playwright test (spec:line) | Verdict | Cucumber claims (resolved) | Playwright assertions | Delta / notes |
|---|---|---|---|---|---|
| Units with Unnumbered Lessons (unnumbered_lessons.feature:4-27) | unnumbered-lessons.spec.ts:56-94 | EXPANDED | teacher 200 (:5). Unit page: `.uitest-progress-lesson` visible (:8); joined text contains "Lesson One" (:9), not "Lesson 1" (:10), contains "Lesson Two" (:11), not "Lesson 2" (:12) — immediate. Lesson page: `.uitest-lesson-title` visible (:15); contains "Lesson One" (:16); not "Lesson 1" (:17). Level page: `button.header_popup_link` visible (:20); `.uitest-progress-lesson` **not visible**, immediate (true when absent) (:21); click it (:22); `.uitest-progress-lesson` visible (:23); same 4 text claims (:24-27) | `signInAsNewUser` teacher (:57). Unit: `progressLessons.first()` visible (:61; unit-overview-page.ts:32, selector lesson-level-page.ts:16); `expectUnnumberedLessonNames` — `joinedText` (ui.ts:22-24, matches jQuery `.text()` join) with 4 contain/not-contain checks under `toPass` (:39-49, :62); axe `.uitest-progress-lesson` == `{}` (:63-68). Lesson: `getByRole('heading',{level:1})` (lesson-overview-page.ts:21; h1 at LessonOverview.jsx:186 carries `.uitest-lesson-title`) visible (:72), `toContainText('Lesson One')` (:73), `not.toContainText('Lesson 1')` (:74); axe `#main_content` == `{'link-name':1}` (:75-77). Level: `button.header_popup_link` visible (:81; lesson-level-page.ts:62); `progressLessons` `toHaveCount(0)` (:84 — stronger than "not visible"); `openHeaderPopup()` click + first visible (:86; lesson-level-page.ts:83-86); 4 text claims (:87); axe `.header_popup` == `{}` (:88-93) | `.uitest-lesson-title` -> role heading level 1 (strict: fails if a second h1 appears). Absence asserted by count rather than jQuery-visibility (rationale :82-83). Three axe gates added. |

Phase-2 flags:
- Baseline `lessonOverview: {'link-name': 1}` (spec:27-31, :75-77) locks a known violation; fixing it fails the test. Documented, brittle-by-design.

##### 9. F/teacher_tools/documentation_landing_page.feature -> P/documentation/documentation-landing-page.spec.ts

| Scenario (feature:line) | Playwright test (spec:line) | Verdict | Cucumber claims (resolved) | Playwright assertions | Delta / notes |
|---|---|---|---|---|---|
| Documentation landing page displays (@no_mobile, @single_session) (documentation_landing_page.feature:6-10) | documentation-landing-page.spec.ts:29-48 `{tag:['@no_mobile']}` | EQUIVALENT + EXPANDED | `.container` visible, polled (:8); `$('.container').text()` includes "IDEs" (:9) and "Sprite Lab" (:10), polled | `gotoLandingPage()` -> `page.goto('/docs/')` (documentation-page.ts:25-27; base-page.ts:100-110); `#main_content` visible (:37; base-page.ts:43-44); `toContainText('IDEs')`, `('Sprite Lab')` (:38-39); axe `#main_content` == `{}` (:41-46) | Selector substitution `.container` -> `#main_content`: layout renders `.container.main` as a child of `%main#main_content` (application.html.haml:119, :128) when not full-width, and the docs index mounts inside it (programming_environments/index.html.haml:1-2 via docs_index -> render :index, programming_environments_controller.rb:10-13). `#main_content` text is a superset, so the contain checks are at least as strong; the visibility check moved to the parent. |
| Applab Documentation landing page displays (:12-18) | :54-72 | EQUIVALENT + EXPANDED | `.container` visible (:14); `$('h1:first').text()` includes "App Lab Documentation" (:15); `.page-content` includes "UI controls" (:16), "onEvent" (:17); `.nav-bar` includes "UI controls" (:18) — all polled | `gotoProgrammingEnvironmentDocs('applab')` -> `/docs/ide/applab/` (documentation-page.ts:30-32; routes.rb:187); `#main_content` visible (:62); `getByRole('heading',{level:1}).first()` `toContainText` (:63; POM :19); `.page-content` `toContainText` x2 (:64-65; POM :21); `.nav-bar` `toContainText` (:66; POM :20); axe `.nav-bar` == `{'color-contrast':11}` (:68-70) | `h1:first` -> first level-1 heading by role (also matches `role=heading aria-level=1`). `.page-content`/`.nav-bar` are shared classes (ReferenceGuideView.jsx:47, PageContainer.jsx:27, NavigationBar.jsx); Playwright `toContainText` on a multi-match locator would fail strict mode where jQuery joined text would pass — a stricter, not weaker, check. |

Phase-2 flags:
- `applabNavBar: {'color-contrast': 11}` baseline (spec:14-22, :68-70) locks 11 known violations; a fix fails the test. Documented. The `.page-content` body is deliberately not scanned (spec:11-13).

---

##### Group B2 summary

Scenarios audited: 22 (gdpr 5; one_trust 8 = 6 + outline 1 row + outline 9 rows counted as 1 scenario; cookie_banner 1; race 1; dcdo 1; gallery 2; demo card 1; unnumbered 1; docs 2). Counting outline rows individually: 30 Cucumber test instances -> 30 Playwright test instances plus 3 net-new a11y tests.

| Verdict | Count (scenario level) | Where |
|---|---|---|
| EQUIVALENT | 13 | gdpr rows 1,2,4,5; one_trust rows 2-7 (row 8 per-row equivalent); dcdo; gallery rows 1-2; docs rows 1-2 (also EXPANDED via axe) |
| EXPANDED | 5 | gdpr row 3; demo card; unnumbered; gallery net-new; docs (axe) — cookie-banner a11y is net-new inside an EQUIVALENT row |
| WEAKENED | 1 | race_interstitial (lane-gated: functional claims run only in visual-* projects) |
| DROPPED (specific claim) | 1 claim | cookie_banner: "wait until no `.close` visible" (steps.rb:1261 -> :1106); spec:20-22 documents the omission |
| UNMAPPED | 0 | — |
| Browser/lane-conditional removals | 2 | one-trust.spec.ts:207 (`test.fixme` music/webkit); race-interstitial.spec.ts:14 (`@visual` only) |

Top 5 riskiest deltas:
1. race-interstitial.spec.ts:12-14 — the only test for "Race Interstitial Shown And Dismissed" is `@visual`, so `#race-modal` shown/declined/hidden is never asserted in the chromium/firefox/webkit lanes (playwright.config.ts:13, 57-67); Cucumber asserted it on every run.
2. one-trust.spec.ts:207 — `test.fixme` drops the `music` embedded-project row on webkit, removing a browser from a row Cucumber ran unconditionally (one_trust.feature:73).
3. one-trust.spec.ts:169-179 (and one_trust.feature:53-59 / steps.rb:896-898) — the "not categorized" outline passes vacuously if the critical script tags are absent; the port preserves the vacuity rather than adding an existence check.
4. gdpr-dialog.spec.ts:65-70, :157-162 — the `data-gdpr.show_gdpr_dialog == "false"` claim (script_data_steps.rb:1-5, written by GDPRDialog.jsx:29-33) is replaced by "accept POST returned ok"; the client-side bookkeeping write is no longer observed, though the reload-no-dialog claim covers the persisted effect.
5. cookie-banner.spec.ts:20-22, :73-77 — the language-selector dismissal wait is dropped on an unverified premise, and the visual check now masks the intro-video iframe, narrowing the Eyes claim relative to cookie_banner.feature:10 (which masked nothing — and which never failed on diff anyway, eyes_steps.rb:42-44).

Pairings inferred without a `Source:` comment: none. Every audited spec test carries a `Source:` JSDoc naming its scenario (gdpr-dialog.spec.ts:16-17,40-41,80-81,102-103,137-138; one-trust.spec.ts:15-16,56-57,79-80,96-97,124-125,141-142,158-159,184-185; cookie-banner.spec.ts:26-27; race-interstitial.spec.ts:8-9; dcdo-mocking.spec.ts:26; public-project-gallery.spec.ts:9,22; demo-section-card.spec.ts:15; unnumbered-lessons.spec.ts:54; documentation-landing-page.spec.ts:27,52). The three a11y tests (cookie-banner.spec.ts:84, public-project-gallery.spec.ts:34, and the in-test axe gates) are declared net-new.

Two selector substitutions rest on inference, not a read of the rendered DOM: demo-section-card.ts:24-26 (accessible name for `go-to-lesson-dropdown-button`) and public-project-gallery.ts:14 (location of the gallery `h1`).

### A.C

#### Phase 3 audit, Group C: level types and labs

Paths below are repo-relative. `F` = `dashboard/test/ui/features`, `S` = `F/step_definitions`, `P` = `frontend/packages/e2e-tests/tests`.

##### Step-definition resolutions used throughout

Cucumber step -> what it actually asserts:

- `I am on "<url>"` (S/steps.rb:126): navigate; js-error check before nav; no post-nav assertion.
- `I wait to see "<.class or #id>"` (S/steps.rb:161): polls `find_elements` non-empty. Existence only, not visibility.
- `element "X" is visible` / `is not visible` (S/steps.rb:951 -> :939 -> :314): immediate jQuery `:visible && visibility!=hidden`.
- `I wait until element "X" is (not) visible` (S/steps.rb:326): same predicate, polled.
- `element "X" is hidden` (S/steps.rb:973): immediate `element_visible? == false`.
- `element "X" is disabled` / `is not disabled` (S/steps.rb:1051 / :1042 -> `disabled?` :1038): `disabled` attribute present OR class `disabled`.
- `element "X" has text "T"` (S/steps.rb:753 -> support/browser_helpers.rb:4): `$(X).text()` exactly equals T (concatenated over all matches).
- `element "X" contains text "T"` (S/steps.rb:855 -> browser_helpers.rb:61): `$(X).text()` includes T. Immediate, no poll.
- `element "X" has escaped text` (S/steps.rb:781): unescapes `\n`, then exact `has text`.
- `element "X" does not exist` / `exists` (S/steps.rb:959 / :955 -> :931): jQuery length check.
- `element "X" has class "C"` (S/steps.rb:1023): jQuery `hasClass`.
- `element "X" has "<lang>" text from key "K"` (S/steps.rb:843 -> browser_helpers.rb:16): `$(X).text()` with nbsp->space, stripped, must equal `/api/test/get_i18n_t?key=K&locale=lang` response stripped.
- `there is no horizontal scrollbar` (S/steps.rb:1524): `documentElement.scrollWidth <= clientWidth`.
- `I see jquery selector X` (S/steps.rb:1091): `$(X).length != 0`. Existence only.
- `there's an image "p"` (S/steps.rb:1063): `$('img[src*="p"]').length != 0`. Existence only.
- `"A" should be in front of "B"` (S/steps.rb:1133): `$(A).css('z-index').to_i > $(B).css('z-index').to_i` (`auto` -> 0).
- `I press "id"` (S/steps.rb:452): find by id (short wait), native click.
- `I press "X" using jQuery` (S/steps.rb:506): `$(X).click()`; no visibility/actionability requirement.
- `I click selector "X"` (S/steps.rb:626): `$(X)[0].click()`.
- `I click "X" to load a new page` (S/steps.rb:608 + `page_load` :51): css click, then wait root stale + `readyState == complete`.
- `I send click events to selector "X"` (S/steps.rb:667): `$(X).click()` on every match.
- `I wait until element "X" contains text "T"` (S/steps.rb:281): polled `$(X).text().include?(T)`.
- `element with ID "id" contains text "T"` (S/steps.rb:1472): `find_element(id).text` includes T. `I wait to see element with ID` (:1468): existence.
- `I wait until I am on "<url>"` (S/steps.rb:401): polls `current_url == url` (exact, query string included).
- `I reload the page` (S/steps.rb:1152): refresh via `page_load`.
- `I switch to the first iframe` (S/steps.rb:187): switches to the first `<iframe>` in document order. `I switch to the iframe "X"` (:197): by css.
- `I rotate to landscape` (S/steps.rb:424): no-op unless `ENV['BS_ROTATABLE'] == "true"`.
- `I wait for N seconds` (S/steps.rb:420): sleep.
- `I wait for the lab page to fully load` (S/steps.rb:211-218): `#runButton` exists; `.header_user` exists; click `#overlay` if it exists; `#header_middle_content` opacity == '1' (S/eyes_steps.rb:74).
- `I dismiss the login reminder` (S/steps.rb:1265): click `[aria-label='Close']` if seen within 5s; wait `.uitest-signincallout` not visible.
- `I verify progress in the header ... is "<state>" for level N` (S/progress.rb:109 -> `verify_progress` :35-75): selector `.header_level .react_stage a:eq(N-1) .progress-bubble`; waits visible; waits `$.active == 0`; polls <=5s until `background-color` and `border-top-color` are in the literal RGB lists at :14-28.
- `I verify progress for lesson L level N is "<state>"` (S/progress.rb:119): `.uitest-summary-progress-table .uitest-summary-progress-row:eq(L-1) .progress-bubble:eq(N-1)`; same `verify_progress`.
- `I complete the level on "<url>"` (S/solutions.rb:21-31): `I am on url+noautoplay`; lab fully loaded; `k1 maze blocks` (S/blockly_initialization_blocks.rb:85, JSON loaded via support/blockly_helpers.rb:196); `I press "runButton"`; wait `.congrats` visible.
- `I am a student` (S/account_steps.rb:40) -> `I create a student named` (:153) -> `create_user` (:99): `reset_session`, POST `/api/test/create_user`, sign in. `@as_student` (support/hooks.rb:1) does the same before the scenario. `I create a student named "X"` same path. `I sign in as "X"` (:19): `reset_session` + POST `/users/sign_in`.
- `I am not signed in` (S/account_steps.rb:287): asserts `.header_user:contains(Sign in)` is visible on the *current* page (no navigation precedes it in progress.feature:24).
- `I sign out` (S/account_steps.rb:278): GET `/users/sign_out.json` expecting 204; clears storage.
- `the hint lightbulb shows N hints available` (S/authoredHints.rb:1): `#lightbulb` visible; `#hintCount` visible; `#hintCount` text == N. `shows no hints` (:9): `#lightbulb` visible; `#hintCount` does not exist. `I view the next authored hint` (:21): click `#lightbulb`; wait `.csf-top-instructions button:contains(Yes)` visible; click it. `I wait for the hint image to load` (:16): `$('.csf-top-instructions img').prop('complete')`.
- `callout "N" has text: T` (S/callouts.rb:1 -> support/callout_helpers.rb:10): `$('.cdo-qtips').eq(N).text()` exactly equals T. `is visible` (:5 -> :2): polled <=5s `.is(':visible')` then asserted. `is hidden` (:10). `I close callout "N"` (:15): xpath `(//*[contains(@class,'cdo-qtips')])[N+1]/div[3]` clicked, then wait hidden. `exists` / `does not exist` (:26 / :22 -> callout_helpers.rb:6).
- `block "B" is near offset "x, y"` (S/blockly.rb:95 -> support/blockly_helpers.rb:112): first SVG transform translate of `.blocklySvg [data-id=B]`; each axis `be_within(3)`.
- `I've initialized the workspace with ...` (S/blockly_initialization_blocks.rb:13,17,21,85: `Blockly.serialization.workspaces.load(json)`; :110,117,124: `clear_main_block_space` (S/blockly.rb:425) then `__TestInterface.loadBlocks(__TestInterface.arrangeBlockPosition(xml, {}))`). Setup, no assertion.

Playwright helpers referenced:

- `MultiLevel.gotoLevel` (P/pages/multi-level.ts:44-52): goto then `expect(submitButton).toBeVisible()`. `clickAnswer` :55, `submit` :60, `dismissModal` :65 are plain clicks (auto-wait only).
- `LessonLevelPage.headerProgressBubble` (P/pages/lesson-level-page.ts:89-94) mirrors `header_bubble_selector`; `isProgressBubblePerfect/NotTried` (:97-110) -> `progressBubbleShows` (P/shared/progress.ts:33-48) -> `cssColorsMatchVars` (P/shared/colors.ts:17-39): compares computed `background-color` and `border-top-color` against the DSCO custom properties resolved in the element's own context (vs progress.rb's literal RGB lists). Same two properties, token-derived instead of hard-coded.
- `BasePage.rotateToLandscape` (P/pages/base-page.ts:65-73): no-op on landscape viewports (all configured projects are desktop). `hasHorizontalScrollbar` (:79-85): same expression as steps.rb:1524.
- `expectElementHasI18nText` (P/shared/i18n.ts:49-69): `toBeVisible`, fetch same `/api/test/get_i18n_t`, nbsp->space + trim on both sides, `expect.poll(...).toBe(expected)`.
- `analyze` (P/shared/axe.ts:37-56): axe WCAG AA scan returning rule -> node count; every spec compares with `toEqual(EXPECTED_VIOLATIONS)`, so a new or fixed violation fails. `target-size` disabled (:15).
- `LegacyBlocklyLab.waitForReady` (P/pages/legacy-blockly-lab.ts:159-200): `#codeApp .loading` hidden; `#runButton` visible; `.header_user` visible; intro-video modal dismissed if it appears within 2s (P/components/intro-video-modal.ts:35-46); `#overlay` dismissed if visible (conditional, :181-198); `#header_middle_content` opacity 1 (P/components/header.ts:124-129). Superset of `I wait for the lab page to fully load`.
- `dismissLoginReminder` (:147-153): conditional on `.uitest-signincallout` visible; mirrors S/steps.rb:1265.
- `loadBlocks` (:299-313): `Blockly.serialization.workspaces.load`. `loadArrangedBlocksXml` (:227-242): poll for `mainBlockSpace`, `clear()`, `loadBlocks(arrangeBlockPosition(xml,{}))`. `blockOffset` (:267-279): waits box stable then reads translate e/f.
- `AuthoredHintsComponent` (P/components/authored-hints.ts): `lightbulb` = `#lightbulb` :32; `lightbulbTrigger` = role button "lightbulb" :33 (the click target, differs from Cucumber's `#lightbulb`); `hintCount` = `#hintCount` :34; `yesButton` = role button "Yes" exact :35; `hintImage` = `.csf-top-instructions a img` :36; `viewNext` :40-48 asserts trigger visible and Yes visible; `waitForImageLoad` :58-61 asserts `complete` and `naturalWidth != 0`.
- `CalloutsComponent` (P/components/callouts.ts): `callout(n)` = `.cdo-qtips` nth :28; `closeButton(n)` = `.tooltip-x-close` inside :33; `qtip(n)` = `#qtip-n` :38; `close` :48-52 plain click.
- `computedZIndex` (P/shared/ui.ts:8-12): `parseInt(zIndex) || 0`.
- `UnitOverviewPage.summaryProgressBubble` (P/pages/unit-overview-page.ts:46-52) mirrors progress.rb:121; `lessonCell` :41 = role cell by name.
- `WebLab2.expectEditorLoaded` (P/pages/weblab2.ts:152-158): three `toContainText`. `waitForPreviewLoaded` (:164-169): `#preview` visible; `#codeprojects-preview-container` `waitFor({state:'attached'})`; `#inner-preview` visible; `#hello-world-message` visible (30s).
- `signInAsNewUser` (P/fixtures.ts:31-37) -> `resetSession` + `createUser` (P/shared/auth.ts:45, :54-107; signs in by default :100-102). `createStudent` (:168-222) same with student defaults. `signOut` (:339-348): GET `/users/sign_out.json` must be 204; clears storage.
- Tag handling (P/playwright.config.ts:13-16, 53-68): projects are desktop chromium/firefox/webkit only; `@no_ci` is grep-inverted on drone; `@no_mobile` has no effect (no mobile project exists), so it removes no coverage.

---

##### 1. multi.feature -> P/levels/multi.spec.ts

| Scenario (feature:line) | Playwright test (spec:line) | Verdict | Cucumber claims (terse, resolved) | Playwright assertions (terse) | Delta / notes |
|---|---|---|---|---|---|
| Loading the level (multi.feature:4) | Loading the level (multi.spec.ts:22) | EXPANDED | `.submitButton` exists then visible (:6-7); `.multi-question` text == "Which arrow gets the Flurb to the treasure?" (:8) | submit visible (:27, plus gotoLevel :25 -> multi-level.ts:51); question `toHaveText` exact (:28); axe scan on `.multi` == `{'image-alt':5}` (:32-34) | a11y baseline added. Source comment present. |
| Clicking an option enables submit and submitting the correct answer wins (multi.feature:10) | same title (multi.spec.ts:41) | EXPANDED | rotate (no-op, steps.rb:424); submit exists+visible (:13-14); `.submitButton:first` and `:last` disabled (:15-16); jQuery click answer 1 (:17); first/last not disabled (:18-19); jQuery click submit (:20); `.modal` exists (:21) | submit visible (:48); `toBeDisabled` (:49); click answer 1 (:52); `not.toBeDisabled` (:53); submit click (:55); `.modal` `toBeVisible` (:58); axe on `.modal` == `{'color-contrast':1}` (:61-63) | `dashboard/app/views/levels/_dialog.html.haml:17` renders one `.submitButton`, so `:first`/`:last` were the same node; Playwright's strict locator covers it (would error if two existed). `toBeDisabled` needs the native attribute; Cucumber also accepted class `disabled` (steps.rb:1038) — Playwright is stricter. `.modal` existence -> visibility (stronger). No `rotateToLandscape` call here, but the step was a no-op anyway. |
| Submitting an incorrect option (multi.feature:23) | same title (multi.spec.ts:70) | EXPANDED | as above with `lang/en-US` (:24); answer 0 (:30); submit `:last` (:33); `.modal` exists (:34); `.modal .dialog-title` contains "Incorrect answer" (:35); jQuery click `#ok-button` (:36); `#cross_0` visible polled (:37) | `lang:'en-US'` (:73); visible/disabled/not-disabled (:75-80); modal visible (:85); title `toContainText` (:86); dismiss (:88); `#cross_0` visible (:89); axe on `.multi` == `{'image-alt':5}` (:91-93) | a11y baseline added; otherwise one-to-one. |

##### 2. multi2.feature -> P/levels/multi2.spec.ts

Background (multi2.feature:4-7): navigate; sleep 3s; `.submitButton` visible (polled). Playwright `gotoLevel` (multi-level.ts:44-52) covers the visibility wait; the sleep is dropped (no assertion lost).

| Scenario (feature:line) | Playwright test (spec:line) | Verdict | Cucumber claims (terse, resolved) | Playwright assertions (terse) | Delta / notes |
|---|---|---|---|---|---|
| Loading the level (multi2.feature:9) | Loading the level (multi2.spec.ts:10) | EQUIVALENT | Background submit visible; `.multi-question` text == "Which lines of code should be removed so the program will work as intended? Select two answers" (:10) | submit visible via gotoLevel (:13); `toHaveText` exact (:15-17) | none |
| Clicking an option enables submit but submitting only one answer gets a warning (multi2.feature:12) | same title (multi2.spec.ts:24) | EQUIVALENT | first/last disabled (:13-14); click 0; not disabled (:16-17); submit; `.modal` exists (:19); `.dialog-title` contains "Too few answers." (:20); click ok (:21) | disabled (:32); click 0 (:34); not disabled (:37); submit (:39); modal visible (:42); title contains (:43); dismiss (:45, plain click) | `.modal` exists -> visible (slightly stronger). Final `#ok-button` click is a plain click in both; auto-wait failure would fail the test. |
| Clicking an option enables submit and submitting the correct answer (two checkboxes) wins (multi2.feature:23) | same title (multi2.spec.ts:52) | EQUIVALENT | disabled (:24-25); click 0; not disabled (:27-28); click 1; submit; `.modal` exists (:31) | disabled (:60); click 0; not disabled (:65); click 1 (:68); submit (:70); modal visible (:74) | Both stop at "a modal appeared"; neither asserts it is the *win* dialog (spec comment :72-73 says why). Thin, inherited from Cucumber. |

##### 3. multi3.feature -> P/levels/multi3.spec.ts

| Scenario (feature:line) | Playwright test (spec:line) | Verdict | Cucumber claims (terse, resolved) | Playwright assertions (terse) | Delta / notes |
|---|---|---|---|---|---|
| Rendering in another language (multi3.feature:4) | same title (multi3.spec.ts:10) | EQUIVALENT | URL without noautoplay, `lang/es-MX` (:5); submit exists+visible (:6-7); `.multi h1` text == i18n `data.dsls.K-1 Happy Maps Multi 1.title` for es-MX (:8) | `noautoplay:false, lang:'es-MX'` (:14-19); submit visible (:21); `expectElementHasI18nText` on `.multi h1` (:22-26; i18n.ts:49-69) | Playwright polls the text and also asserts the heading visible; same normalization (nbsp, trim) and same backend endpoint. |
| Does not scroll horizontally (multi3.feature:10) | same title (multi3.spec.ts:33) | EQUIVALENT | submit visible (:12); `scrollWidth <= clientWidth` (:13) | submit visible (:38); `hasHorizontalScrollbar() === false` (:39; base-page.ts:79-85) | identical predicate |
| Can render without a question (multi3.feature:15) | same title (multi3.spec.ts:46) | EQUIVALENT | submit visible (:17); `.multi-question` not visible (:18) | submit visible (:51); question `not.toBeVisible` (:52) | none |
| Standalone level without retries locks after answer is submitted (multi3.feature:20) | same title (multi3.spec.ts:59) | EXPANDED | create+sign in student (:21-22); rotate no-op (:24); submit visible + disabled (:25-26); jQuery click answer 0, submit (:27-28); `.dialog-title` contains "Incorrect answer" (immediate, :29); header bubble level 5 visible, ajax idle, colors == perfect (:30, progress.rb:35-75); click ok (:31); `.nextLevelButton` visible (:32); `#cross_0` visible (:33); answer 0 has class `lock-answers` (:34); reload (:35); nextLevel visible (:36); submit not visible (:37); answers 0-3 have `lock-answers` (:38-41) | `signInAsNewUser` (:64); `rotateToLandscape` no-op (:68); submit visible + disabled (:70-71); click answer 0; `Promise.all([waitForResponse('/milestone/'), submit()])` (:78-82); title contains "Incorrect answer" (:85); bubble 5 visible (:87) + `expect.poll(isProgressBubblePerfect(5))` (:88); dismiss (:90); nextLevel visible (:92); cross visible (:93); `toHaveClass(/lock-answers/)` (:94); `page.reload` (:97); nextLevel visible, submit not visible, four `toHaveClass` (:99-104) | Server persistence: Cucumber relied on reload reading server-rendered locked state (:35-41); Playwright does the same AND gates on the `/milestone/` POST response (:79-82), which fails the test if no milestone request is made. Color check is token-resolved (colors.ts) rather than literal RGB (progress.rb:20). |

##### 4. multi4.feature -> P/levels/multi4.spec.ts

Background (multi4.feature:4-7) as in multi2; same handling.

| Scenario (feature:line) | Playwright test (spec:line) | Verdict | Cucumber claims (terse, resolved) | Playwright assertions (terse) | Delta / notes |
|---|---|---|---|---|---|
| Submitting an incorrect option (multi4.feature:9) | same title (multi4.spec.ts:10) | EQUIVALENT | first/last disabled (:10-11); click 2; not disabled (:13-14); click 3; submit `:last`; `.modal` exists (:17); title contains "Incorrect answer" (:18); click ok (:19) | disabled (:16); click 2; not disabled (:19); click 3; submit; modal visible (:24); title contains (:25); dismiss (:27) | `.modal` exists -> visible |
| Pressing three options unselects the oldest (multi4.feature:21) | same title (multi4.spec.ts:34) | EQUIVALENT | disabled (:22-23); click 2; not disabled (:25-26); click 1, click 0; submit `:first`; `.modal` exists (:30) | disabled (:39); click 2; not disabled (:42); click 1, 0; submit; modal visible (:48) | Neither version asserts *which* answer was unselected or that the result is a win; the title's claim is verified only indirectly (a modal appears rather than a "too many answers" block). Thin, inherited. |
| Pressing an option again toggles it (multi4.feature:32) | same title (multi4.spec.ts:55) | EQUIVALENT | disabled (:33-34); click 0; not disabled (:36-37); `#checked_0` visible (:38); click 0; `#checked_0` hidden (:40) | disabled (:60); click 0; not disabled (:63); `checkedMark(0)` visible (:67); click 0; `toBeHidden` (:70) | none |

##### 5. map_level.feature -> P/levels/map-level.spec.ts

| Scenario (feature:line) | Playwright test (spec:line) | Verdict | Cucumber claims (terse, resolved) | Playwright assertions (terse) | Delta / notes |
|---|---|---|---|---|---|
| Map level displays content (map_level.feature:10; Background :8 creates student "Lillian"; feature tags `@no_mobile`) | Map level displays content, tag `@no_mobile` (map-level.spec.ts:23) | EXPANDED | `#curriculum-reference` exists (:12); switch to *first* iframe in document (:13); inside it `#body` text includes "Welcome to the Circuit Playground" (:14) and "The Light Emitting Diode (LED)" (:15), polled | `resetSession`, goto `/`, `createStudent({name:'Lillian'})` (:24-26; signs in, auth.ts:100-102, matching create_user :99); `gotoLevel` -> `#curriculum-reference` `toBeAttached` (map-level.ts:53-56); `frameLocator('#curriculum-reference') #body` `toContainText` x2 (:31-36); iframe `toBeVisible` (:42); axe on `#main_content` == `{'image-alt':1,'frame-title':1}` (:44-49) | Frame is addressed by id rather than "first iframe" (more precise; if any other iframe preceded it Cucumber would have inspected the wrong frame). Adds iframe visibility and a11y baseline. `@no_mobile` tag inert in Playwright (no mobile project); Cucumber excluded mobile runs. |

##### 6. standalone_video.feature -> P/levels/standalone-video.spec.ts

| Scenario (feature:line) | Playwright test (spec:line) | Verdict | Cucumber claims (terse, resolved) | Playwright assertions (terse) | Delta / notes |
|---|---|---|---|---|---|
| Progress is posted when continue is clicked, `@as_student` (standalone_video.feature:5) | same title (standalone-video.spec.ts:41) | EXPANDED | hook creates+signs in student (hooks.rb:1); `.submitButton` visible (:7); header bubble 1 colors == not_tried (:8); css click `.submitButton` then wait root stale + readyState complete (:9); navigate back to level (:10); submit visible (:11); bubble 1 == perfect (:12) | `signInAsNewUser` (:45); `gotoLevel` -> Continue button (role, inside `.standalone-video`) visible (standalone-video-level.ts:35-37, :48-50); `expect.poll(isProgressBubbleNotTried(1))` 30s (:50); axe on `.standalone-video` excluding `#video` == `{'color-contrast':1}` (:52-58); `continue()` = click + `waitForURL(url != before)` (standalone-video-level.ts:58-62); `gotoLevel` again (:62); `poll(isProgressBubblePerfect(1))` 30s (:64) | Server persistence verified the same way (fresh navigation, then bubble color). Locator changed from `.submitButton` class to role+name "Continue" (stronger identification). Page-load wait replaced by URL-change wait. a11y baseline added; `#video` iframe excluded from the scan by design (:13-25). Cucumber's `verify_progress` only polled 5s after ajax idle; Playwright polls 30s. |

##### 7. progress.feature -> P/activities/maze/progress.spec.ts

| Scenario (feature:line) | Playwright test (spec:line) | Verdict | Cucumber claims (terse, resolved) | Playwright assertions (terse) | Delta / notes |
|---|---|---|---|---|---|
| Progress is saved for signed-in student (progress.feature:6; feature `@no_mobile`) | same title, `@no_mobile` (progress.spec.ts:39) | EXPANDED | create+sign in student (:7); complete lesson 2 level 1: lab loaded, k1 maze JSON loaded, run, `.congrats` visible (:9, solutions.rb:21-31); header bubble 1 perfect, bubble 2 not_tried (:10-11); goto level 2, lab loaded (:13-14); bubbles 1 perfect / 2 not_tried (:15-16); goto unit overview; `td:contains(Maze)` visible (:18-19); summary bubble L2/1 perfect, L2/2 not_tried (:20-21) | `signInAsNewUser` (:46); `solveLevelOne` = gotoLevel (waitForReady) + `loadBlocks(K1_MAZE_BLOCKS)` (blocks.ts:7-24, identical to blockly_initialization_blocks.rb:86) + run (:28-32); `.congrats` visible 30s (:50); poll bubble 1 perfect, 2 not_tried (:52-55); axe on `.header_level .react_stage` == `{}` (:57-62); goto level 2 (:64); polls again (:66-69); `gotoOverview` (:72); role cell /Maze/ visible (:73); poll summary L2/1 perfect, L2/2 not_tried (:75-86); axe on `.uitest-summary-progress-table` == `{}` (:88-93) | All three persistence surfaces (level 1 header, level 2 header after navigation, unit overview table) are checked, matching Cucumber. Color predicate is token-resolved (colors.ts) vs literal RGB (progress.rb:14-28); same two CSS properties. Two a11y baselines added. `test.slow()` (:45) triples timeout; no coverage effect. |
| Progress is saved for signed-out student (progress.feature:23) | same title, `@no_mobile` (progress.spec.ts:101) | EQUIVALENT | `.header_user:contains(Sign in)` visible on the current page before any navigation (:24, account_steps.rb:287); then the same complete/verify sequence as above (:26-38) | `resetSession` (:105); `solveLevelOne` (:113); `.congrats` visible (:114); `header.waitForSignedOut()` = `#header_user_signin` visible (:115; header.ts:156-158) ; header polls (:117-120); level 2 polls (:124-127); overview cell + summary polls (:130-144) | Signed-out check moved from before the level to after solving it (spec comment :107-111 explains `/` redirects). Same claim (signed-out chrome visible), different locator (`#header_user_signin` vs text "Sign in"). No a11y scan in this variant. |

##### 8. artist.feature -> P/activities/artist/artist.spec.ts

Background (artist.feature:4-9): navigate lesson 3 level 2; lab fully loaded; dismiss login reminder; `#runButton` visible (immediate); `#resetButton` hidden (immediate). Playwright `beforeEach` (artist.spec.ts:26-32): `gotoLevel` (waitForReady superset), `dismissLoginReminder`, run visible, reset `toBeHidden`. Equivalent.

| Scenario (feature:line) | Playwright test (spec:line) | Verdict | Cucumber claims (terse, resolved) | Playwright assertions (terse) | Delta / notes |
|---|---|---|---|---|---|
| Loading the first level (artist.feature:11) | Loading the first level (artist.spec.ts:38) | EQUIVALENT | `img[src*="video_thumbnails/C2_artist_intro"]` exists (:12); `img[src*="artist/small_static_avatar"]` exists (:13) | same two selectors, `.first()` `toBeAttached` (:42-47) | Presence-only on a broad attribute-substring selector; inherited from Cucumber (steps.rb:1063). Flagged as Phase-2 pattern, not a regression. |
| Winning the first level (artist.feature:15) | Winning the first level (artist.spec.ts:54) | WEAKENED (minor) | load winning JSON (:16; blockly_initialization_blocks.rb:14 == blocks.ts:7-46); press run (:17); `#resetButton` visible (:18); `.congrats` visible polled (:19); press `continue-button` (:20); `current_url == ".../lessons/3/levels/3"` exact, query string included (:21) | `loadBlocks(WINNING_ARTIST_BLOCKS)` (:55); run (:56); reset visible (:58); congrats visible (:59); `continue()` (:61); `toHaveURL(url => url.pathname === '/courses/allthethingscourse/units/1/lessons/3/levels/3')` (:62-66) | URL check is pathname-only; Cucumber's exact-equality would fail on any query string or host difference. Same navigation claim, looser match. |
| Losing the first level (artist.feature:23) | Losing the first level (artist.spec.ts:73) | EQUIVALENT | load losing JSON (:24; rb:18 == blocks.ts:49-77); run; reset visible (:26); `.uitest-topInstructions-inline-feedback` visible polled then immediate (:27-28); its `text()` == "Not quite. Try using a block you aren’t using yet." exact (:29); press reset (:30); run visible; reset hidden (:31-32) | `loadBlocks(LOSING_ARTIST_BLOCKS)`; run; reset visible (:77); feedback visible (:78); `toHaveText` exact with U+2019 (:80-82); `reset()` (:84); run visible (:85); reset hidden (:86) | none |
| — | Artist lab has no unexpected accessibility violations, `@no_mobile` (artist.spec.ts:89) | net-new | — | axe on `#main_content` == `{'aria-required-children':1,'color-contrast':1}` (:95-97) | No Cucumber source (not a pairing). |

##### 9. bee.feature -> P/activities/bee/bee.spec.ts

| Scenario (feature:line) | Playwright test (spec:line) | Verdict | Cucumber claims (terse, resolved) | Playwright assertions (terse) | Delta / notes |
|---|---|---|---|---|---|
| Complete Bee Conditions 4-5 Level 3 (bee.feature:4) | winning solution completes the puzzle (bee.spec.ts:20; Source comment :18 names the scenario) | EQUIVALENT | navigate lesson 4 level 4; lab loaded; dismiss reminder (:5-7); load bee JSON (:9; rb:22 == blocks.ts:31-72 field for field); press run; `.congrats` exists then visible (:11-12); `.congrats` text == "Congratulations! You completed Puzzle 4." exact (:13) | beforeEach gotoLevel + dismissLoginReminder (:10-14); `loadBlocks`; run; congrats visible (:26); `toHaveText` exact (:27-29) | Title renamed; Source comment resolves it. |

##### 10. blocklayout.feature -> P/activities/block-layout.spec.ts

XML fixtures: `AUTO_POSITIONED_FLAPPY_XML` and `MANUALLY_POSITIONED_PLAYLAB_XML` (block-layout-blocks.ts:2-3, :9-10) are byte-identical to blockly_initialization_blocks.rb:112 and :126 (compared with a shell string equality). Loader path identical (`clear` -> `arrangeBlockPosition` -> `loadBlocks`; legacy-blockly-lab.ts:227-242 vs rb:111-114).

| Scenario (feature:line) | Playwright test (spec:line) | Verdict | Cucumber claims (terse, resolved) | Playwright assertions (terse) | Delta / notes |
|---|---|---|---|---|---|
| Auto-placing malformed start blocks (blocklayout.feature:7) | same title (block-layout.spec.ts:43) | WEAKENED | input XML prefixed with the six characters `\n\n    ` where `\n` is a literal backslash-n (Ruby single-quoted string, rb:119); `whenClick` translate within 3 of (16, 88) (:9); `whenCollideGround` within 3 of (16, 191) (:10) | input prefixed with two *real* newline characters plus spaces (template literal, block-layout-blocks.ts:6); block attached (:32); `whenClick` within 3 of (16, 88); `whenCollideGround` within 3 of (16, **189**) (:16-19, :34-35) | (a) The "malformed" input differs: Cucumber fed literal `\n` text, Playwright feeds newline bytes; the Cucumber input case is no longer exercised. (b) Expected y changed 191 -> 189; accepted window moves from [188,194] to [186,192]. Not derivable from the feature file. |
| Auto-placing blocks (blocklayout.feature:12) | same title (block-layout.spec.ts:63) | EQUIVALENT (constants changed) | `whenClick` ~ (16, 88); `whenCollideGround` ~ (16, 191) (:14-15) | same ids, `whenCollideGround` ~ (16, 189) (:69-74, :16-19) | Same y shift as above. Tolerance 3 in both (rb blockly.rb:97-98; spec:11). |
| Auto-placing blocks with XML positioning (blocklayout.feature:17) | same title (block-layout.spec.ts:81) | EQUIVALENT (constants changed) | `whenUp` ~ (20, 166); `whenDown` ~ (16, 239); `whenLeft` ~ (20, 22); `whenRight` ~ (16, 92) (:23-26) | `whenUp` ~ (20, **164**); `whenDown` ~ (16, **236**); `whenLeft` ~ (20, **20**); `whenRight` ~ (16, 92) (:20-25, :87-90) | Three of four expected coordinates changed by 2-3px. With tolerance 3 the accepted windows only partially overlap (e.g. whenDown: Cucumber [236,242], Playwright [233,239]). Playwright additionally waits for the block box to stop moving before reading (legacy-blockly-lab.ts:268). |

##### 11. weblab2_general.feature + weblab2_preview.feature -> P/labs/weblab2.spec.ts

Describe-level `test.skip(browserName === 'webkit')` (weblab2.spec.ts:10-13) mirrors `@no_safari` on both features (weblab2_general.feature:6, weblab2_preview.feature:6) but applies to all five tests in the file, including the three net-new ones.

| Scenario (feature:line) | Playwright test (spec:line) | Verdict | Cucumber claims (terse, resolved) | Playwright assertions (terse) | Delta / notes |
|---|---|---|---|---|---|
| Web Lab 2 Instructions and Editor load (weblab2_general.feature:11; tags `@no_safari @no_mobile`) | same title, tags `@no_safari @no_mobile` (weblab2.spec.ts:19) | EQUIVALENT | create student "Penelope" (:12); navigate lesson 51 level 11 `hideProductTours=true` (:13); `#instructions-panel` visible polled (:14); `#instructions-panel` text includes the fixed sentence (:15); `#uitest-files-list` text includes "index.html" (:16); `.codemirror-container` text includes "Hello world!" polled (:17) | `resetSession`, goto `/`, `createStudent({name:'Penelope'})` (:23-25); `gotoLevel()` default lesson 51 level 11 hideProductTours (weblab2.ts:19-23, :136-149 -> instructions visible); `expectEditorLoaded` = three `toContainText` (weblab2.ts:153-157) | identical strings and selectors |
| Web Lab 2 Preview loads (weblab2_preview.feature:12; tags `@no_safari @no_mobile @no_ci`) | same title, tags `@no_safari @no_mobile @no_ci` (weblab2.spec.ts:59) | WEAKENED | create student (:13); navigate (:14); `#preview` visible polled (:15); switch into `#preview` (:16); `#codeprojects-preview-container` **visible** polled (:17); `#inner-preview` visible polled (:18); switch into it (:19); `#hello-world-message` exists (:20); sleep 5s (:22); its text includes "Hello world!" (:23); switch back; sign out via 204 (:25-26) | same auth setup (:63-65); `gotoLevel`; `waitForPreviewLoaded`: `#preview` visible; `#codeprojects-preview-container` `waitFor({state:'attached'})` (weblab2.ts:166); `#inner-preview` visible; `#hello-world-message` visible 30s (weblab2.ts:164-169); `toContainText('Hello world!')` (:71); `signOut` requires 204 (:73; auth.ts:339-348) | `#codeprojects-preview-container` check downgraded from visible to attached. `#hello-world-message` check upgraded from exists to visible. `@no_ci` honored on drone via grepInvert (playwright.config.ts:13-16), matching Cucumber's `@no_ci`. |
| — | The lab workspace passes a WCAG AA scan (weblab2.spec.ts:38) | net-new | — | `expectEditorLoaded`; axe on `#lab-container` == `{}` (:50-52) | no Cucumber source |
| — | Web Lab 2 workspace visual checks, `@visual @no_mobile` (weblab2.spec.ts:77) | net-new | — | `visualCheck` x2 with masks (:98, :102); `openDebugPanel` asserts `#debug-panel-container` visible (weblab2.ts:130-133) | runs only under visual-* projects (config:10-16) |
| — | Web Lab 2 preview visual check, `@visual @no_mobile @no_ci` (weblab2.spec.ts:106) | net-new | — | `aria-pressed` checks (:126, :132-135, :143-146); `previewIframe` hidden in code view (:127); `visualCheck` x4 | as above |

##### 12. authored_hints.feature -> P/activities/authored-hints.spec.ts

| Scenario (feature:line) | Playwright test (spec:line) | Verdict | Cucumber claims (terse, resolved) | Playwright assertions (terse) | Delta / notes |
|---|---|---|---|---|---|
| View Authored Hints (authored_hints.feature:4) | View Authored Hints (authored-hints.spec.ts:10) | EQUIVALENT | navigate lesson 6 level 2 (:5); `#lightbulb` exists (:6); lightbulb visible, `#hintCount` visible, text == "3" (:9); click `#lightbulb`, Yes visible, click Yes (:12); `.csf-top-instructions` contains "This is the first hint." and "It has some basic markup" (:13-14); count == "2" (:15); view next (:18); contains "This is the second hint. It has a hint video." (:20); `.csf-top-instructions img` exists (:21); count == "1" (:22); `$('.csf-top-instructions img').prop('complete')` polled (:26); view next (:27); contains "This is the third and final hint. It doesn't have anything special." (:29); lightbulb visible and `#hintCount` does not exist (:30); click `#lightbulb` (:33); `.csf-top-instructions button:contains(Yes)` does not exist (:34) | `gotoLevel` (waitForReady) (:13); `#lightbulb` visible (:17); `#hintCount` visible + `toHaveText('3')` (:18-19); `viewNext` (asserts role-button "lightbulb" visible, clicks it, asserts Yes visible, clicks) (:22; authored-hints.ts:40-48); instructions panel `toContainText` x2 (:23-28); count visible + "2" (:29-30); `viewNext`; contains second-hint text (:34-36); `.csf-top-instructions a img` `toBeVisible` (:37); count "1" (:38-39); `waitForImageLoad` asserts `complete===true` and `naturalWidth!==0` (:42; authored-hints.ts:58-61); `viewNext`; contains third-hint text (:46-48); lightbulb visible (:49); `#hintCount` `toHaveCount(0)` (:50); `clickLightbulb` (role button) (:53); role-button "Yes" exact `toHaveCount(0)` (:54) | Image check narrowed to `a img` and strengthened to visible (Cucumber: any `img` exists). Click target changed from `#lightbulb` to the role button `.prompt-icon-cell button` (component comment :19). "Yes" absence checked by role+name rather than `:contains(Yes)` text. Image-load wait became an assertion (Cucumber's was a wait). All text claims preserved verbatim. |

##### 13. callouts.feature -> P/activities/callouts.spec.ts (+ callouts.cases.ts)

Feature is `@single_session` with Background `reset_session` (callouts.feature:1, :5-6); Playwright gets a fresh browser context per test, which provides the same isolation. Every example row is represented:

| Scenario (feature:line) | Playwright test (spec:line) | Verdict | Cucumber claims (terse, resolved) | Playwright assertions (terse) | Delta / notes |
|---|---|---|---|---|---|
| Outline "dismissable via the target element" row 1: lesson 2 level 7 show_callouts, callout 0, text 'After snapping all the blocks together, press "Run" to start your program.', close `#runButton` (callouts.feature:8, :17) | cases.ts:22-29 -> loop callouts.spec.ts:25-41 | EQUIVALENT | lab fully loaded (:10); callout 0 `:visible` polled 5s (:11); `.cdo-qtips.eq(0).text()` == text (:12); `$('#runButton').click()` (:13); callout 0 not visible polled (:14) | `gotoLevelUrl` (waitForReady) (:28); `.cdo-qtips` nth(0) `toBeVisible` (:29); `toHaveText` exact (:30-32); wait first target attached, `dispatchEvent('click')` on every match (:34-38); `toBeHidden` (:39) | URL built by `labLevelUrl({lesson:2, level:7, showCallouts:true})` -> `?noautoplay=true&show_callouts=1` (routes.ts:24-52); same as feature. |
| row 2: same URL, callout 1, "Click here to see the code for the program you're making", close `#show-code-header` (:18) | cases.ts:30-37 | EQUIVALENT | as row 1 | as row 1 | text matches |
| row 3: ui-test-maze L1/1, callout 1, 'Hit "Run" to try your program', `#runButton` (:19) | cases.ts:38-45 | EQUIVALENT | as row 1 | as row 1 | `labLevelUrl({course:'ui-test-maze', lesson:1, level:1})` -> `?noautoplay=true`, matching feature (no show_callouts). |
| row 4: ui-test-maze L1/1, callout 0, 'Drag a "move" block and snap it below the other block', `[data-id='moveForward']` (:20) | cases.ts:46-53 | EQUIVALENT | as row 1 | as row 1 | selector preserved verbatim (cases.ts:52) |
| row 5: ui-test-maze L1/4, callout 0, "Blocks that are grey can't be deleted. Can you solve the puzzle anyway?", close target `g` (:21) | cases.ts:54-61 | EQUIVALENT | jQuery click on every `g` element (:13) | `dispatchEvent('click')` on every `g` (:34-38) | Both blast every SVG group; same behavior. |
| Outline "dismissable via the x-button" row 1 (`@no_mobile`): ui-test-maze L1/3, callout 0, "Click here to watch the video again" (:25, :35) | cases.ts:65-71 -> loop callouts.spec.ts:48-60, tag `@no_mobile` | EQUIVALENT | lab loaded; dismiss reminder (:27-28); callout visible (:29); text exact (:30); click xpath `(//*[contains(@class,'cdo-qtips')])[1]/div[3]` then wait hidden (:31); hidden asserted (:32) | `gotoLevelUrl`; `dismissLoginReminder`; visible (:53); `toHaveText` (:54-56); `close(0)` clicks `.tooltip-x-close` inside nth(0) (:57; callouts.ts:33, :48-52); `toBeHidden` (:58) | Close target selector changed from positional `div[3]` to class `.tooltip-x-close`. The feature table's `close_target` column is unused by this outline in both suites. `@no_mobile` inert in Playwright. |
| row 2: lesson 3 level 7 show_callouts, callout 0, "You have all the same blocks but they've now been arranged in categories" (:36) | cases.ts:72-78 | EQUIVALENT | as row 1 | as row 1 | text matches |
| Modal ordering (callouts.feature:38) | Modal ordering (callouts.spec.ts:66) | EQUIVALENT | lab loaded; callout 0 visible (:40-41) | `gotoLevelUrl`; callout 0 `toBeVisible` (:69) | Phase-2 pattern: navigation plus one visibility check, and the title's "ordering" claim is not asserted in either suite. Inherited. |
| Closing using "x" button (callouts.feature:43) | same title (callouts.spec.ts:76) | EQUIVALENT | lab loaded; dismiss reminder; `.tooltip-x-close` visible (immediate, :47); callout 0 visible, 1 visible (:48-49); close 1 (:50); 0 visible, 1 hidden (:51-52); close 0; 0 hidden (:53-54) | `dismissLoginReminder`; `closeButton(0)` visible (:80); 0 and 1 visible (:81-82); `close(1)`; 0 visible, 1 hidden (:84-85); `close(0)`; 0 hidden (:87) | `.tooltip-x-close` check scoped to callout 0 (Cucumber: any). Otherwise one-to-one. |
| Only showing seen callouts once (callouts.feature:56) | same title (callouts.spec.ts:94) | EQUIVALENT | navigate (no show_callouts), lab loaded, callout 0 exists (:57-59); navigate again, lab loaded, callout 0 does not exist (:60-62) | `labLevelUrl({lesson:2, level:7})`; `toBeAttached` (:99); second `gotoLevelUrl`; `not.toBeAttached` (:102) | none |
| Opening the Show Code dialog, `@no_mobile` (callouts.feature:66) | same title, `@no_mobile` (callouts.spec.ts:109) | EXPANDED | lab loaded; dismiss reminder; press `show-code-header` by id (:70); `$('[class*=customDialogOverlay]').css('z-index').to_i > $('#qtip-0').css('z-index').to_i` (:71) | `dismissLoginReminder`; click `#show-code-header` (:117); `#showCodeModal [role="presentation"]` `toBeVisible` (:118); `computedZIndex(overlay) > computedZIndex('#qtip-0')` (:119-121; ui.ts:8-12, `auto`->0 like Ruby `to_i`) | Overlay selector changed to the DSCO Modal backdrop (legacy-blockly-lab.ts:91-93). Adds an overlay visibility assertion, which Cucumber lacked (its z-index read would have compared 0 > 0 and failed had the overlay been absent, so the claim was implicitly covered there too). |
| — | callout accessibility violations match documented baseline (callouts.spec.ts:130) | net-new | — | callout 0 visible; axe on `.cdo-qtips` == `{}` (:135-138) | no Cucumber source |

##### 14. contextual_hints.feature -> P/activities/contextual-hints.spec.ts

| Scenario (feature:line) | Playwright test (spec:line) | Verdict | Cucumber claims (terse, resolved) | Playwright assertions (terse) | Delta / notes |
|---|---|---|---|---|---|
| Blocks render in contextual hints (contextual_hints.feature:4) | same title (contextual-hints.spec.ts:10) | EQUIVALENT | lab loaded (:6); `#lightbulb` exists (:7); press run by id (:9); `.uitest-topInstructions-inline-feedback` exists (:10); it contains "Not quite. Try using a block you aren’t using yet." (:12); lightbulb visible, `#hintCount` visible and == "4" (:13); view next hint (:15); `.csf-top-instructions` contains "Try using a block like this to solve the puzzle." (:17); `.csf-top-instructions .block-space` exists (:18) | `gotoLevel`; lightbulb `toBeVisible` (:16); `runButton.click()` (:19); feedback visible (:20); `toContainText` (:24-26); lightbulb visible, count visible, "4" (:27-29); `viewNext` (:32); panel contains text (:35-37); `.csf-top-instructions .block-space` `.first()` `toBeVisible` (:38-40) | Existence checks (`#lightbulb`, feedback, `.block-space`) upgraded to visibility. Same strings. |
| Contextual hints in level without Authored Hints (contextual_hints.feature:20) | same title (contextual-hints.spec.ts:47) | EQUIVALENT | lab loaded (:22); `#lightbulb` does not exist (:24); press run (:26); feedback exists (:27); `#resetButton` exists (:28); `#lightbulb` exists (:30); lightbulb visible, count visible and == "1" (:31) | `gotoLevel`; lightbulb `toHaveCount(0)` (:53); run click (:56); feedback visible (:57); reset visible (:58); lightbulb visible (:61); count visible + "1" (:62-63) | Existence -> visibility upgrades; otherwise one-to-one. |

---

##### Group C summary

Scenario instances audited: 40 (Scenario Outline rows counted individually: 5 + 2 in callouts).

| Verdict | Count | Which |
|---|---|---|
| EQUIVALENT | 29 | multi2 x3; multi3 x3 (lang, scrollbar, no-question); multi4 x3; progress signed-out; artist loading, losing; bee; blocklayout auto-placing, XML positioning (constants changed, see below); weblab2 general; authored hints; callouts 5 target rows + 2 x-button rows + modal ordering + closing-x + seen-once; contextual hints x2 |
| EXPANDED | 8 | multi x3 (a11y); multi3 locked (milestone gate); map level (a11y, iframe visible); standalone video (a11y); progress signed-in (a11y x2); callouts show-code (overlay visible) |
| WEAKENED | 3 | artist winning (URL pathname-only); blocklayout malformed (input differs + constant changed); weblab2 preview (container visible -> attached) |
| DROPPED (whole claims) | 0 | Specific weakened claims are listed in the WEAKENED rows. |
| UNMAPPED | 0 | Every scenario and every example row has a Playwright test carrying a Source comment. |

Net-new Playwright tests with no Cucumber source (not pairings): artist.spec.ts:89 (a11y), callouts.spec.ts:130 (a11y), weblab2.spec.ts:38 (a11y), :77 and :106 (visual).

###### Top 5 riskiest deltas

1. `P/activities/block-layout.spec.ts:16-25` changes the expected block offsets from the feature's (16,191), (20,166), (16,239), (20,22) to (16,189), (20,164), (16,236), (20,20) with the same +/-3 tolerance, so the accepted windows only partly overlap `F/star_labs/blocklayout.feature:10,14-15,23-25` and the spec no longer verifies the feature's stated positions.
2. `P/activities/block-layout-blocks.ts:6` prefixes the "malformed" XML with real newline bytes, while `S/blockly_initialization_blocks.rb:119` (single-quoted Ruby) prefixed the literal characters backslash-n, so the specific input Cucumber exercised for "Auto-placing malformed start blocks" (`blocklayout.feature:7`) is not what Playwright feeds the arranger.
3. `P/pages/weblab2.ts:166` waits for `#codeprojects-preview-container` to be attached where `F/student_learning/weblab2/weblab2_preview.feature:17` required it visible; combined with the describe-level webkit skip at `P/labs/weblab2.spec.ts:10-13` (which also removes the three net-new tests on webkit), this is the only place in the group where a check got looser.
4. `P/activities/artist/artist.spec.ts:62-66` matches the post-continue URL by pathname only; `F/star_labs/artist.feature:21` (via `S/steps.rb:401`) required the full URL to equal `.../lessons/3/levels/3`, so a stray query string would now pass.
5. `P/components/callouts.ts:33` and `P/pages/legacy-blockly-lab.ts:91-93` replace Cucumber's element-addressing (`div[3]` xpath at `S/callouts.rb:16`; `[class*=customDialogOverlay]` at `F/teacher_tools/callouts.feature:71`) with `.tooltip-x-close` and `#showCodeModal [role="presentation"]`; the claims are preserved but the identity of the asserted element rests on these new selectors, and `P/components/authored-hints.ts:33,36` similarly re-targets the lightbulb click and narrows the hint-image check to `a img`.

###### Phase-2 style patterns observed

- Navigation + single presence/visibility check: `callouts.spec.ts:66-70` (Modal ordering; title claim never asserted) and `artist.spec.ts:42-47` (broad `img[src*=...]` `toBeAttached`). Both inherited one-to-one from `callouts.feature:38-41` and `artist.feature:12-13`.
- Modal-appeared-only endings without asserting the dialog kind: `multi2.spec.ts:74`, `multi4.spec.ts:48`, `multi.spec.ts:58` — matching `multi2.feature:31`, `multi4.feature:30`, `multi.feature:21`.
- Conditional steps (not assertions): `legacy-blockly-lab.ts:147-153` (login reminder) and `:181-198` (instructions overlay), `intro-video-modal.ts:35-46`; each mirrors a Cucumber "if it exists / if I see it" step (`steps.rb:208-209, :1265-1268`). No conditional *assertions* found.
- Browser skips: `weblab2.spec.ts:10-13` (whole describe on webkit, matching `@no_safari` but broader than the two source scenarios). `@no_mobile` tags (map-level, progress, callouts, artist a11y, weblab2) are inert because `playwright.config.ts:53-68` defines only desktop projects; no coverage removed relative to Cucumber, which excluded mobile for those.
- Nothing found that cannot fail: every `expect.poll(...).toBe(true)` throws on a missing bubble (locator.evaluate on zero matches), and every axe check uses `toEqual` against an explicit map.

###### Pairings inferred without a Source comment

None. Every spec test replacing a scenario carries a `Source:` JSDoc naming the feature and scenario; outline rows are covered by the loop-level Source comments at `callouts.spec.ts:20-24` and `:43-47` with row contents matched in `callouts.cases.ts`. The bee spec's renamed test (`bee.spec.ts:20`) is resolved by its Source comment at `:18`.

### A.D

#### Group D audit: visual/eyes and i18n

Paths are repo-relative. Aliases: `F` = `dashboard/test/ui/features`, `SD` = `F/step_definitions`,
`PW` = `frontend/packages/e2e-tests/tests`, `VS` = `frontend/packages/playwright-support/src/visual`.

##### How "I see no difference" and `visualCheck` are enforced (applies to every row below)

Cucumber:
- `I open my eyes to test` (SD/eyes_steps.rb:14-33), `I see no difference for` (:48-60) and `I close my eyes` (:35-45) all `next` (no-op) when `CDO.disable_all_eyes_running` is set; `config/test.yml.erb:159` sets it `true`. Under that flag an @eyes scenario asserts only its non-eyes steps.
- When eyes run, `I see no difference for` waits for fonts + header relayout (:54-56) then calls `@eyes.check_window` (:59). It never raises on a diff. The diff surfaces at `I close my eyes`: `@eyes.close(fail_on_mismatch)` raises `Applitools::TestFailedError`, which is rescued and printed with `EYES_ERROR_PREFIX` (:41-44). The scenario passes. `dashboard/test/ui/runner.rb:689-690` counts those prefixes into a separate `eyes_succeeded` flag (:354-364). So a visual diff never fails a Cucumber scenario.
- `The header is finished animating` (SD/eyes_steps.rb:74-80) is a `wait_until` (raises `TimeoutError` after `DEFAULT_WAIT_TIMEOUT` = 2 min, SD/steps.rb:4,8-20): an implicit assertion that `#header_middle_content` reaches opacity 1.
- Chrome eyes viewport is forced to 1024x690 (SD/eyes_steps.rb:26-28); Playwright uses `devices['Desktop Chrome']` (1280x720, VS/index.ts:38-42,61-63). Baselines are not shared.

Playwright:
- `visualCheck` is a fixture from `createVisualTest` (VS/index.ts:21-33). Provider is `VISUAL_PROVIDER` (`playwright` default, VS/index.ts:8-10). `@visual` tests run only under `visual-*` projects, which exist only when `VISUAL_PROVIDER` is set (VS/index.ts:56-71); the functional projects `grepInvert: /@visual/` (`frontend/packages/e2e-tests/playwright.config.ts:13,57,62,67`). Consequence: every `expect` inside a `@visual` test body, visual or not, runs only in the eyes lane.
- Applitools backend (VS/applitools.ts): no API key locally -> `noopCheck` (:55-70). With a key, `eyes.check` per call (:104-114); at teardown `eyes.close(true)` throws on diff only if `APPLITOOLS_SHOULD_REPORT_FAILURE !== 'false'` (:33-34,116-130), else warns. `.github/workflows/e2e-tests-ci.yml:165` sets it to `github.event_name != 'pull_request'`: PR eyes runs never fail on diffs. Drone leaves it unset (`.drone.yml:241-243`), so the eyes process fails on diffs, but `lib/rake/test.rake:133-141,615-656` runs it "warning only" and "Never stops a build"; `frontend/packages/e2e-tests/README.md:20-22`: "A failure stops nothing".
- Native backend (VS/playwright.ts:27-41) is `toHaveScreenshot`, local only (:20-24 throws in CI).
- Net: in both suites a visual diff is non-blocking. Playwright is marginally stronger on post-merge GitHub runs (eyes job fails). Anything asserted only inside a `@visual` test is non-blocking in Playwright; the a11y companion tests (functional lane) are what re-enforce navigation/readiness claims.

Resolved generic Cucumber steps used below:
- `element "X" is visible` / `is not visible` (SD/steps.rb:951-953 -> :314-316): immediate jQuery `:visible` check, no wait; hard assertion. `is not visible` is trivially true when the element is absent.
- `element "X" is hidden` (:973-975): same predicate negated.
- `I wait to see "#id"` / `".class"` (:161-164): `find_elements` non-empty; presence only, no visibility.
- `I wait until element "X" is visible` (:326-329): polled jQuery `:visible`.
- `I press "id"` (:449-454): `find_element(id:)` within 30 s then click; implicit presence.
- `I click selector "X"` (:626-632): jQuery `[0].click()`, no wait, no assertion (throws if absent).
- `I click selector "X" once I see it` (:640-648): polled visible then jQuery click.
- `I click selector "X" if it exists` (:634-638): no assertion.
- `I close the instructions overlay if it exists` (:207-209) -> `#overlay` if-exists click; no assertion.
- `I wait for the lab page to fully load` (:211-218): presence `#runButton`, presence `.header_user`, overlay if-exists, header finished animating.
- `I wait to see a dialog titled "T"` (:791-796): polled `include?` on visible `.dialog-title` or `[role=dialog] h3` text (substring, 30 s).
- `I close the dialog` (:220-235): polled find of a visible `#x-close` or `[role=dialog] button[aria-label=Close]`, click, sleep 0.75 s.
- `I wait for N seconds` (:420-422): sleep.
- `I set text compression dictionary to` (:718-720): `editor.setValue`, no assertion.
- `I dismiss the language selector` (:1258-1263): click `.close` if seen within 5 s (rescues timeout, :650-657), then `I wait until I don't see selector ".close"` (:1106).
- `element "X" is (not) open` (:977-979 -> :322-324): jQuery `attr('open') !== undefined`, immediate.
- `I am a student` (SD/account_steps.rb:40-43 -> :153-188 -> `create_user` :99-150): POST `/api/test/create_user` asserted 200 via `browser_request(code: 200)` (:142-149), retried 3x.
- `I sign out` (SD/account_steps.rb:278-285): GET `/users/sign_out.json` asserted 204; clears storage.
- `element "X" has "L" text from key "K"` / `RTL text` / `markdown` (SD/steps.rb:843-853 -> `F/support/browser_helpers.rb:16-56`): jQuery `.text()` of all matches (concatenated), nbsp->space, strip; expected = HTTP GET `/api/test/get_i18n_t?key=K&locale=L` (`dashboard/app/controllers/test_controller.rb:183-186`: `I18n.t(key, locale:)`), stripped. `eq` (exact); `include` when RTL. Markdown variant renders expected with Redcarpet (`filter_html: true`), takes Nokogiri text of both, strips all whitespace, `eq`. All immediate, no retry.
- `toolbox category N has ...` (SD/blockly.rb:305-309): same helper on `.blocklyToolbox:visible > .blocklyToolboxCategoryGroup > .blocklyToolboxCategoryContainer:nth-child(N) > .blocklyToolboxCategory .blocklyToolboxCategoryLabel`.

Playwright helper facts used below:
- `expectElementHasI18nText` (PW/shared/i18n.ts:49-69): `toBeVisible` first, expected fetched in-page from the same `/api/test/get_i18n_t` endpoint (:13-30), both sides nbsp->space + trim (:10), then `expect.poll(...).toBe(expected)` (or `.toContain` when `rtl`). Same source of truth and same strictness as Ruby; adds a visibility claim and retries up to the 15 s expect timeout (playwright.config.ts:46). `locator.textContent()` is strict-mode: >1 match throws where jQuery concatenated.
- `expectElementHasI18nMarkdown` (:97-111): `toBeVisible`, expected = 5 regexes (headers, bold, italic, `-`/`*` bullets, links; :84-91) then strip whitespace; actual = `textContent` stripped; single `toBe`, no poll. Not Redcarpet: ordered lists, code spans, images, blockquotes, entities, raw HTML are not normalized. Any divergence yields a false failure, not a false pass.
- `LegacyBlocklyLab.gotoLevel` -> `waitForReady` (PW/pages/legacy-blockly-lab.ts:126-129,159-200): expects `#codeApp .loading` hidden, `#runButton` visible (45 s), `.header_user` visible (PW/components/header.ts:119-121), intro-video modal dismissed if it appears within 2 s (PW/components/intro-video-modal.ts:35-46; absence tolerated), lab interstitials, `#overlay` dismissed via its OK button with `toBeHidden` retried, `#header_middle_content` opacity 1 (header.ts:124-129).
- `waitForLessonHeaderRendered` (PW/pages/lesson-level-page.ts:77-80): expects `.header_level .react_stage` visible and stable. Not in any Cucumber scenario here (extra claim).
- `waitForVisualStability` (PW/shared/stability.ts:37-43): fonts ready + 2 rAF (`settle`, :7-15); no assertion.
- `analyze` (PW/shared/axe.ts:37-55): axe WCAG AA violation map; tests assert `toEqual` an exact baseline map (fails if violations appear or disappear).
- `createStudent`/`signIn`/`signOut` (PW/shared/auth.ts:388-438,444-454,559-568): throw on non-ok / non-204. Equivalent to the Ruby `browser_request(code:)` claims.

---

##### 1. F/eyes.feature -> PW/activities/eyes.spec.ts

All 7 Cucumber scenarios are unnamed and reached only via `--eyes` (runner.rb:781-797). Every Playwright pair carries a `Source:` comment.

| Scenario (feature:line) | Playwright test (spec:line) | Verdict | Cucumber claims (terse, resolved) | Playwright assertions (terse) | Delta / notes |
|---|---|---|---|---|---|
| "multi" (eyes.feature:8-14) | `multi` @visual (eyes.spec.ts:40-49); `multi: no unexpected accessibility violations` (:51-59) | EXPANDED | header opacity 1 (implicit); `.submitButton` jQuery-visible (hard, :12); eyes check "level load" (non-failing). | `MultiLevel.gotoLevel`->`waitForReady` expects `.submitButton` visible (PW/pages/multi-level.ts:50-52); `header.waitForFadeIn` opacity 1 (:43); `expect(submitButton).toBeVisible()` (:44); lesson header visible+stable (:45); `visualCheck('multi')` (:48). a11y: `analyze(include '.multi')` `toEqual {'image-alt':5}` (:56-58). | Same claims plus lesson-header and axe baseline. Visual body's expects run only in the eyes lane; a11y test re-enforces load + submit visible in the blocking lane. No mask. |
| "match" (eyes.feature:16-25) | `match` @visual (:65-77); a11y (:79-89) | EXPANDED (visual region narrowed) | header opacity 1; `.submitButton` visible (hard, :20); dialog title includes "Instructions" within 30 s (implicit, :21); a visible close button exists (implicit, :22); sleep 3 s; eyes "level load". | `MatchLevel.waitForReady` expects `.match` role=button "Submit" `.first()` visible (PW/pages/match-level.ts:103-106,115-117) and again at :69; fade-in; lesson header; `dialog.waitForTitled('Instructions')` = `toHaveText` exact on `.dialog-title, h3` of first visible dialog (PW/components/level-dialog.ts:204-213); `dialog.close()` clicks role=button "Close" then `toBeHidden` (:215-219); `visualCheck('match', {mask: [.match_answers]})` (:76). a11y `toEqual {'image-alt':8}`. | Title check tightened (exact vs substring). Dialog-hidden claim added. `.match_answers` masked (shuffled order, match-level.ts:98) so the answer column is no longer visually compared; Cucumber compared it (and the sleep at :23 was the deflake). Locator differs (`.submitButton` class vs role/name "Submit"): Playwright's is locale-bound; level is en so equivalent here. |
| "text-only match" (eyes.feature:27-33) | `text-only match` @visual (:95-104); a11y (:106-116) | EXPANDED (visual region narrowed) | header opacity 1; `.submitButton` visible (hard); eyes "level load". | as "match" without the dialog steps; `visualCheck('text-only-match', {mask:[.match_answers]})` (:103); a11y `toEqual {}` (:113-115). | Answers masked. Otherwise equivalent plus a11y. |
| "text compression" (eyes.feature:35-42) | `text compression` @visual (:122-135); a11y (:137-159) | EXPANDED | header opacity 1 (implicit); eyes "level load"; `editor.setValue('pitter\npatter\n')` (no assertion, :40); eyes "simple substitution". No hard `Then` at all. | `gotoLevel` expects `#symbolEditorWrapper` visible (PW/pages/text-compression-level.ts:196-199); fade-in; lesson header; `visualCheck` x2 (:129,:134); `setDictionaryText` drives `window.editor.setValue` then expects editor `toContainText('pitter')` (text-compression-level.ts:202-211). a11y x2: `toEqual` baselines before/after (:144-158). | New functional claim: dictionary edit is reflected in the DOM. Note `pitter\npatter\n` is a JS string literal in TS (real newlines) and a Gherkin string in Ruby interpolated into `editor.setValue('...')` (SD/steps.rb:719) so the Ruby also produced real newlines; same input. |
| "pixelation with range" (eyes.feature:44-49) | `pixelation with range` @visual (:165-177); a11y (:179-192) | EXPANDED (visual subject changed) | header opacity 1 (implicit); eyes "level load". | `PixelationLevel.gotoLevel`: intro-video dismiss-if-shown; `toPass` loop that clicks `#below_viz_instructions` until `.markdown-instructions-container .instructions-markdown > div` visible (PW/pages/pixelation-level.ts:158-170); `#widthRange` `toBeEnabled` (:173); fade-in; lesson header; `visualCheck` (:175). a11y `toEqual {'color-contrast':1, label:4}` (:186-191). | Playwright forces the long-instructions dialog open before the screenshot (pixelation-level.ts:164-170); Cucumber took whatever the 'ready' event produced. The two checkpoints do not depict the same state. Adds widget-enabled and dialog-visible claims. |
| "maze" (eyes.feature:51-65) | `maze` @visual (:198-223); a11y LTR only (:226-238) | EXPANDED (visual region narrowed) | fully-load (presence `#runButton`, `.header_user`; header opacity 1); `#runButton` exists (implicit, :55); `.uitest-topInstructions-inline-feedback` polled visible (:56) then hard visible (:57); eyes "maze feedback with blocks"; navigate `/lang/ar-sa` (no noautoplay); fully-load; eyes "maze RTL"; reset_session/lang/en; sleep 2. | `waitForReady` (spinner hidden, run button visible, user chrome, overlay dismissed via OK w/ `toBeHidden`, fade-in); `run()`; `expect(inlineFeedback).toBeVisible()` (:202); lesson header; `visualCheck('maze-feedback-with-blocks', {mask:[#visualization svg]})` (:206-208); `gotoLevel({lang:'ar-sa', noautoplay:false})` -> `waitForReady`; lesson header; `visualCheck('maze-rtl', {mask:[visualization]})` (:220). a11y (LTR only) `toEqual {'aria-required-children':1}` (:232-237). | The maze playfield (`#visualization svg`) is masked in both checkpoints; Cucumber compared it. Neither suite asserts anything RTL-specific (no `dir`/layout check). Cucumber's trailing `reset_session` (:63) is moot (fresh context) as the spec notes (:222). Intro-video modal on the ar-sa load: Cucumber's fully-load never dismissed it; Playwright does. |
| "star wars RTL" (eyes.feature:67-80) | `star wars RTL` @visual (:244-261); no a11y companion | WEAKENED (one implicit claim dropped; nothing in blocking lane) | header opacity 1; presence `.header_user`, `#runButton` (:71-72); `I press "x-close"` requires `#x-close` to exist within 30 s (SD/steps.rb:449-454) i.e. the video dialog must appear (:75); overlay if-exists; eyes "star wars RTL"; `I press "show-code-header"` (implicit presence); eyes "text mode". | `gotoLevel({lesson:24, level:9, lang:'ar-sa'})` -> `waitForReady` (video modal dismissed only if it appears within 2 s; absence tolerated, intro-video-modal.ts:35-46); lesson header; `visualCheck` masked visualization (:251-253); `showCodeHeader.click()` (auto-wait = implicit presence, :255); `visualCheck` masked (:258-260). | Dropped: Cucumber failed if `#x-close` never appeared (a side-effect claim that the lang redirect drops `noautoplay`); Playwright passes either way. Both suites include `?noautoplay=true` in the URL (feature :69; PW/shared/routes.ts:29,36). Playwright body has no `expect` of its own; all non-visual claims are inside page-object readiness and run only in the eyes lane. Visualization masked in both checkpoints. Spec comment :225 gives the reason no a11y test exists (axe verdicts differ per engine on RTL). |

##### 2. F/initial_page_views.feature -> PW/activities/initial-page-views.spec.ts

Outline "Simple blockly level page view" (initial_page_views.feature:8-23), 5 example rows (:19-23). Playwright iterates `CASES` (initial-page-views.spec.ts:20-67) into 5 `@visual` tests (:82-101) and 5 a11y tests (:106-125). Source comment at :78-81. All 5 rows present: 3/6 "auto open function editor", 24/1 "star wars", 24/2 "star wars blocks", 25/1 "minecraft", 25/3 "minecraft house dialog".

| Scenario (feature:line) | Playwright test (spec:line) | Verdict | Cucumber claims (terse, resolved) | Playwright assertions (terse) | Delta / notes |
|---|---|---|---|---|---|
| row "auto open function editor" 3/6 (initial_page_views.feature:19) | `auto open function editor` (:82-101, CASES :21-31); a11y (:106-125) | EXPANDED (visual region narrowed) | `I am a student` = create_user 200 (:10); fully-load: presence `#runButton`, `.header_user`, overlay if-exists, header opacity 1 (:13); eyes "initial load"; sign out 204 (:16). | `resetSession`; `goto('/')`; `createStudent` throws on !ok (auth.ts:317-319,452); `LegacyBlocklyLab.gotoLevel` -> `waitForReady` (spinner hidden, `#runButton` visible, user chrome, overlay OK + hidden, fade-in); `visualCheck(testName, {mask:[.header_level, #visualization svg, [class*=modalFunctionEditorContainer]]})` (:90-98); `signOut` 204. a11y: `analyze(include #main_content, exclude .blocklyText)` `toEqual {'aria-valid-attr-value':2,'color-contrast':1}` (:116-122). | Masks the lesson header, the game canvas, and the whole function-editor modal (CASES :27) — the "auto open function editor" subject is itself masked. Cucumber compared the full page. |
| row "star wars" 24/1 (:20) | `star wars` (:82-101, CASES :33-41); a11y | EXPANDED (visual region narrowed) | as above | as above, masks `.header_level` + `#visualization svg`; a11y `toEqual {'color-contrast':1,'image-alt':1,label:3}`. | Header and canvas masked. |
| row "star wars blocks" 24/2 (:21) | `star wars blocks` (CASES :43-50); a11y | EXPANDED (visual region narrowed) | as above | as above; a11y `toEqual {'aria-required-children':1,'color-contrast':1}`. | Header and canvas masked. |
| row "minecraft" 25/1 (:22) | `minecraft` (CASES :52-58, `CraftLab`); a11y | EXPANDED (visual region narrowed) | as above | `CraftLab.waitForReady` additionally picks Steve to dismiss `#craft-popup-player-selection` and expects it hidden (PW/pages/craft-lab.ts:242-248); masks header + canvas; a11y `toEqual {'aria-required-children':1}`. | Cucumber's fully-load only clicked `#overlay` if present; it never dismissed the player-selection dialog, so its screenshot may have included it. Playwright removes it before the checkpoint. |
| row "minecraft house dialog" 25/3 (:23) | `minecraft house dialog` (CASES :60-66); a11y | EXPANDED (visual region narrowed) | as above | as "minecraft". | Same interstitial delta as "minecraft". Whether the "house dialog" the row name refers to survives `waitForReady`'s overlay/interstitial dismissal is not determinable from the files (UNVERIFIED). |

##### 3. F/initial_page_views2.feature -> PW/activities/initial-page-views-2.spec.ts

Outline "Logged in simple page view without instructions dialog" (initial_page_views2.feature:8-27), 7 rows (:21-27), all `user_type = student`. Playwright `SCENARIOS` (initial-page-views-2.spec.ts:38-132) -> 7 `@visual` tests (:140-151) + 7 a11y tests (:156-174). Source comment :136-139. All 7 rows present.

Common Cucumber claims per row: create_user 200 (:10); navigate (:12); `#overlay` if-exists click, no assertion (:13); `element ".uitest-attachment" is not visible` — hard, immediate, trivially true when absent (:15); eyes "initial load" (:16); sign out 204 (:18).
Common Playwright: `resetSession`; `goto('/')`; `createStudent` (throws on !ok); `scenario.goto`; `waitForVisualStability`; `visualCheck(name, {mask})`; `signOut` 204. a11y: `analyze(include rootSelector, exclude axeExclude)` `toEqual violations`.
Common delta: `.uitest-attachment` claim DROPPED in all 7 (spec comment :34-37 says the element never reaches the document; the Cucumber step could not fail under that condition). Lab-level URLs gain `?noautoplay=true` (routes.ts:29,36; spec comment :30-32), which the Cucumber rows lacked, so an autoplaying video could be in the Cucumber checkpoint and not Playwright's.

| Scenario (feature:line) | Playwright test (spec:line) | Verdict | Cucumber claims (terse, resolved) | Playwright assertions (terse) | Delta / notes |
|---|---|---|---|---|---|
| row "new applab project" `/projects/applab/new` (:21) | `new applab project` (:140-151; SCENARIOS :39-58); a11y | EXPANDED; `.uitest-attachment` claim dropped | common | `ApplabLab.gotoNewProject` -> `waitForReady` (spinner hidden, `#runButton` visible, user chrome, overlay OK+hidden, fade-in) (PW/pages/applab-lab.ts:417-422); `closeInstructionsOverlayIfShown` if-visible (:44); mask `.project_updated_at time`; a11y `toEqual {'color-contrast':1,label:3,'scrollable-region-focusable':1}`. | Only row that still closes the overlay (comment :36-37). Autosave time masked. |
| row "logged in student studio homepage" `/` (:22) | `logged in student studio homepage` (SCENARIOS :60-68); a11y | EXPANDED; claim dropped | common | `HomePage.goto` = `page.goto('/home')` (PW/pages/home-page.ts:123-125); `header.waitForSettled` poll (header.ts:136-148); no mask; a11y `toEqual {}`. | Playwright goes to `/home` directly, skipping the `/` -> `/home` redirect the Cucumber row exercised. No assertion that the user is signed in (neither suite). Visual body = navigation + `visualCheck` only. |
| row "logged in script progress" `/courses/allthethingscourse/units/1` (:23) | `logged in script progress` (SCENARIOS :70-78); a11y | EXPANDED; claim dropped | common | `UnitOverviewPage.gotoOverview` = `page.goto` (PW/pages/unit-overview-page.ts:162-164), `waitForSettled`; a11y `toEqual {}`. | No readiness/content assertion in either suite. Visual body = navigation + `visualCheck`. |
| row "unplugged video level" 34/1 (:24) | `unplugged video level` (SCENARIOS :80-94); a11y | EXPANDED; claim dropped | common | `StandaloneVideoLevel.gotoLevel` expects role=button "Continue" in `.standalone-video` visible (PW/pages/standalone-video-level.ts:237-245); `waitForSettled`; lesson header visible+stable; mask `#video` iframe; a11y exclude `#video`, `toEqual {'color-contrast':1}`. | Adds Continue-visible and lesson-header claims. Video iframe masked (Cucumber compared it). |
| row "no iframe in dsl" 18/14 (:25) | `no iframe in dsl` (SCENARIOS :96-108); a11y | EXPANDED; claim dropped | common | `LessonLevelPage.gotoLevel` = plain `goto` (lesson-level-page.ts:67-69); `waitForSettled`; lesson header; a11y `toEqual {'color-contrast':1}`. | Row name says "no iframe"; neither suite asserts iframe absence. |
| row "rich long assessment" 26/1 (:26) | `rich long assessment` (SCENARIOS :110-120); a11y | EXPANDED; claim dropped | common | as above; a11y `toEqual {'image-alt':10}`. | |
| row "free response" 27/1 (:27) | `free response` (SCENARIOS :122-131); a11y | EXPANDED; claim dropped | common | as above; a11y `toEqual {}`. | The `.uitest-attachment` step was added to deflake this row (feature :14); Playwright drops it. |

##### 4. F/initial_page_views3.feature -> PW/activities/initial-page-views-3.spec.ts

| Scenario (feature:line) | Playwright test (spec:line) | Verdict | Cucumber claims (terse, resolved) | Playwright assertions (terse) | Delta / notes |
|---|---|---|---|---|---|
| @no_ci outline "Temporarily circle disabled ..." row "embedded blocks" `https://.../lessons/13/levels/1?noautoplay=true` (initial_page_views3.feature:8-20) | `embedded blocks` @visual @no_ci (initial-page-views-3.spec.ts:22-43); `embedded blocks: no unexpected accessibility violations` @no_ci (:46-70) | EXPANDED | create_user 200 (:11); navigate (:13); overlay if-exists (:14, no assertion); eyes "initial load" (:15); sign out 204 (:17). No hard `Then`. | `resetSession`; `goto('/')`; `createStudent`; `LessonLevelPage.gotoLevel` (plain goto); `waitForSettled`; lesson header visible+stable (:36); `visualCheck('embedded blocks')` no mask (:39); `signOut` 204. a11y `toEqual {'color-contrast':1}` (:61-66). | Tag parity holds: Cucumber `@no_ci` (:8) is skipped by `runner.rb:804` when `is_ci`; Playwright `@no_ci` is `grepInvert` only when `PLAYWRIGHT_PROVIDER=drone` (playwright.config.ts:14-16,72-74), so the GitHub eyes lane still runs it. Spec comment :31-33: the level no longer embeds Blockly; both suites now screenshot a plain instructional level under the old name. Overlay-close step dropped (no `#overlay` per comment). |
| outline "Logged out simple page view without instructions dialog" row "logged out studio homepage" `/` (:22-33, row :32) | `logged out studio homepage` @visual (:120-131; LOGGED_OUT_SCENARIOS :85-102); a11y (:136-147) | EXPANDED (one trivially-true claim dropped) | navigate `/` (:23); open eyes; navigate `/` (:25); dismiss language selector: `.close` if seen in 5 s, then polled "no `.close` visible" (implicit; trivially true if never rendered) (:26); eyes "initial load" skipping the Font Awesome wait (:28). | `resetSession`; `goto('/')` x2 (`domcontentloaded`); no readiness or URL assertion (comment :88-89 says `/` 302s to sign-in); `visualCheck(name, {mask:[#user_login]})` (:130); a11y `analyze(include getByRole('main') selector)` `toEqual {'color-contrast':1}`. | Language-selector dismissal dropped (comment :79-83: widget no longer rendered). Nothing asserts the sign-in page actually rendered (no `waitForForm`). Visual body = navigation + `visualCheck` only. Login input masked (focus-ring anti-aliasing). Playwright never waits on Font Awesome anyway (`settle` awaits `document.fonts.ready` only, VS/stability.ts:7-15), so the "without waiting for Font Awesome" nuance has no analogue. |
| same outline, row "logged out script progress" `/courses/allthethingscourse/units/1` (row :33) | `logged out script progress` @visual (:120-131; :104-111); a11y (:136-147) | EXPANDED (one trivially-true claim dropped) | as above | `UnitOverviewPage.gotoOverview` (plain goto); `visualCheck` no mask; a11y `toEqual {}`. | Same drops as the row above. No content assertion in either suite. Visual body = navigation + `visualCheck`. |

##### 5. F/foundations/markdown_rendering.feature -> PW/foundations/markdown-rendering.spec.ts

| Scenario (feature:line) | Playwright test (spec:line) | Verdict | Cucumber claims (terse, resolved) | Playwright assertions (terse) | Delta / notes |
|---|---|---|---|---|---|
| "Visiting an external markdown level with details tag" (markdown_rendering.feature:4-9) | same name (markdown-rendering.spec.ts:11-26) | EQUIVALENT | presence of `#extra-details-tag` (:6, `find_elements` by id); `#cool-list` has no `open` attr (immediate, :7); `#summary-tag` exists and is clicked (:8); `#cool-list` has `open` attr (immediate, :9). | `ExternalLevel.gotoLevel` expects `#extra-details-tag` `toBeAttached` (PW/pages/external-level.ts:289-292) and again at :20; `expect(coolList).not.toHaveAttribute('open')` (:21); `toggleCoolList` clicks `#summary-tag` (external-level.ts:295-297); `toHaveAttribute('open','')` (:25). | Same four claims; Playwright retries where Cucumber was immediate. `toBeAttached` matches the Cucumber presence-only semantics (spec comment :18-19). |
| "Viewing a level with blockly embedded in instructions" (:11-23), two Eyes tests "Blockly in instructions" 21/2 and "Blockly in K1 instructions" 21/3 | same name, one `@visual` test with two checkpoints (:32-59) | EQUIVALENT (visual regions narrowed; conditional wait) | per level: fully-load (presence `#runButton`, `.header_user`; overlay if-exists; header opacity 1); eyes "basic embedded blockly" / "K1 embedded blockly". No hard `Then`. | per level: `gotoLevel` -> `waitForReady` (spinner hidden, `#runButton` visible, user chrome, overlay OK+hidden, fade-in); `waitForEmbeddedInstructionsStable` — for each `.readonly-block-space-container` present, expects width > 0 and stable (legacy-blockly-lab.ts:211-224); `visualCheck('basic embedded blockly', {mask:[.header_level]})` (:44-46); `visualCheck('K1 embedded blockly', {mask:[.header_level, #visualization svg]})` (:55-57). | Two Cucumber Eyes tests collapse into one Eyes test (one `eyes.open` per Playwright test, VS/applitools.ts:102) with two steps. `waitForEmbeddedInstructionsStable` is a no-op when the count is 0, so it cannot fail if the embedded blocks — the subject — are missing; neither suite asserts they exist. No a11y companion, so nothing from this scenario runs in a blocking lane. Lesson header masked in both checkpoints; maze canvas masked in the K1 one. |

##### 6. F/foundations/i18n.feature -> PW/foundations/i18n.spec.ts

All 16 scenarios have a `Source:` comment. Same endpoint (`/api/test/get_i18n_t`) and same keys on both sides; exactness preserved (`eq`/`toBe`; `include`/`toContain` for RTL). Playwright adds `toBeVisible` on the target and polls; Cucumber read once, immediately. `TOOLBOX_CATEGORY_KEYS` (i18n.spec.ts:11-19) matches feature order Events, Text, Variables, Effects, Sprites, Functions, Variables (:32-38, :77-83, :132-138).

| Scenario (feature:line) | Playwright test (spec:line) | Verdict | Cucumber claims (terse, resolved) | Playwright assertions (terse) | Delta / notes |
|---|---|---|---|---|---|
| Maze tutorial in Spanish (i18n.feature:5-11) | same (i18n.spec.ts:26-47) | EQUIVALENT | fully-load (implicit); `.csf-top-instructions p` text == es-MX `data.level.instructions.maze_2_14` (x2, :8,:11); `#runButton` visible (hard, :9); `#resetButton` not visible (hard, :10). | `gotoLevel(course ui-test-maze, 1/5, lang es-MX)` -> `waitForReady`; `expectElementHasI18nText` x2 (:35-39,:42-46); `runButton` `toBeVisible` (:40); `resetButton` `toBeHidden` (:41). | `toBeHidden` and jQuery `:visible`==false both pass when absent. `locator.textContent()` throws if `.csf-top-instructions p` matches >1 (strict), where jQuery concatenated; a loud failure, not a pass. |
| Frozen tutorial in Spanish (:13-19) | same (:53-69) | EQUIVALENT | as Maze with key `data.short_instructions.frozen square loop 3x`, level 3/10. | as Maze. | |
| Minecraft:Agent tutorial in Spanish (:21-27) | same (:75-89) | EQUIVALENT | fully-load; `#toggleButton` visible (hard, :24); jQuery click `#toggleButton` (:25); `.csf-top-instructions p` polled visible (:26); text == es-MX `data.short_instructions.MC_HOC_2017_01_RETRY` (:27). | `CraftLab.gotoLevel` -> `waitForReady` incl. player-selection dismissal (craft-lab.ts:242-248); `instructionsToggleButton` `toBeVisible` (:79); `.click()` (:80); `expectElementHasI18nText` (visible + poll toBe) (:84-88). | Cucumber never dismissed the player-selection dialog (jQuery click bypasses overlays); Playwright does before clicking. Same claims. |
| Toolbox Categories in Spanish (:29-38) | same (:95-106) | EQUIVALENT (locator semantics differ) | 7 x label text == es-MX `data.block_categories.<X>` via CSS `nth-child(N)` on the `:visible` toolbox (SD/blockly.rb:305). | 7 x `expectElementHasI18nText` on `mainContent.getByRole('tree').getByRole('treeitem').nth(N-1)` (legacy-blockly-lab.ts:256-261). | Index semantics differ: CSS `nth-child` over top-level category containers vs a flattened ARIA `treeitem` list (nested categories would shift indices; treeitem `textContent` may include more than the label). Equivalence for this level is UNVERIFIED from the files; the test passed in whatever run produced the spec, but the mapping is structural, not identical. |
| Translated function names in Spanish (:40-48) | same (:112-136) | EQUIVALENT | 3 selectors (`[data-id='toolboxCallBlock'] .blocklyText`, `[data-id='workspaceCallBlock'] .blocklyText`, `[data-id='definitionBlock'] > .blocklyNonEditableField > .blocklyText`) text == es-MX `data.function_definitions.2-3 Bee Functions 2.get 5.name`. | same 3 selectors verbatim (:120,:126,:131), `expectElementHasI18nText`. | Identical selectors and key. |
| Maze tutorial in Portuguese (:50-56) | same (:142-163) | EQUIVALENT | as Spanish Maze, URL `lang/pt-br`, locale `pt-BR`. | same. | |
| Frozen tutorial in Portuguese (:58-64) | same (:169-185) | EQUIVALENT | | | |
| Minecraft:Agent tutorial in Portuguese (:66-72) | same (:191-203) | EQUIVALENT | | | |
| Toolbox Categories in Portuguese (:74-83) | same (:209-220) | EQUIVALENT (locator semantics differ) | | | same UNVERIFIED note as Spanish toolbox. |
| Translated function names in Portuguese (:85-93) | same (:226-248) | EQUIVALENT | URL `lang/pt-BR` (:86). | `lang:'pt-BR'` (:228). | |
| Maze tutorial in Arabic (RTL) (:95-101) | same (:254-275) | EQUIVALENT | as Maze, `ar-sa`/`ar-SA`; non-RTL step variant (exact `eq`). | `expectElementHasI18nText` without `rtl` (exact `toBe`). | No RTL layout/direction claim in either suite; "RTL" is only in the name. |
| Frozen tutorial in Arabic (RTL) (:103-109) | same (:281-297) | EQUIVALENT | | | |
| Minecraft:Agent tutorial in Arabic (RTL) (:111-117) | same (:303-315) | EQUIVALENT | | | |
| Translated function names in Arabic (:119-127) | same (:321-346) | EQUIVALENT | 3 x `RTL text from key` = `include` (browser_helpers.rb:23-25). | 3 x `rtl:true` = `toContain` (i18n.ts:64-66). | Substring on both sides; same looseness (RLM-tolerant). |
| Toolbox Categories in Arabic (RTL) (:129-138) | same (:352-363) | EQUIVALENT (locator semantics differ) | | | same UNVERIFIED note. |
| Pixelation Widget long and short instructions in Spanish (:140-150) | same (:369-391), `test.fixme(browserName === 'webkit')` (:376) | EQUIVALENT on chromium/firefox; DROPPED on webkit | `#below_viz_instructions` polled visible then jQuery click (:147); presence `.markdown-instructions-container` (:148); markdown text of `.markdown-instructions-container .instructions-markdown > div` == Redcarpet-rendered es-MX `data.long_instructions.AllTheThings: Pixelation - Lesson 15 - Complete 3-bit color`, whitespace-stripped (:149); `#below_viz_instructions` text == es-MX short key (:150). | `PixelationLevel.gotoLevel`: intro-video dismiss-if-shown; click short instructions until dialog visible (pixelation-level.ts:164-170); `#widthRange` `toBeEnabled` (:173, extra); `expectElementHasI18nMarkdown` on the same dialog selector (:381-385) — regex markdown->text, whitespace-stripped, single `toBe`; `expectElementHasI18nText` on `#below_viz_instructions` (:386-390). | Renderer differs (Redcarpet+Nokogiri vs 5 regexes, i18n.ts:84-91): not the same transformation, but any divergence fails rather than passes. `fixme` on webkit removes the scenario from that browser (Cucumber had no browser exclusion; reason cited at :373-375). |

---

##### Group D summary

Counts (per Cucumber scenario / example row; 7 + 5 + 7 + 3 + 2 + 16 = 40):
- EQUIVALENT: 18 (markdown_rendering x2; i18n x16, of which 3 toolbox rows carry an UNVERIFIED locator-equivalence note and the Pixelation row is DROPPED on webkit only).
- EXPANDED: 21 (eyes.feature x6; initial_page_views x5; initial_page_views2 x7; initial_page_views3 x3). Expansion is the axe `toEqual` baseline plus lesson-header/readiness claims. 7 of these (initial_page_views2) and 2 (initial_page_views3 logged-out) each drop one Cucumber claim that was trivially true given the element was absent.
- WEAKENED: 1 (eyes.feature "star wars RTL": `#x-close` presence dropped; no blocking-lane companion).
- DROPPED: 0 whole scenarios. Partial drops listed per row above; plus webkit-only drop of i18n "Pixelation Widget".
- UNMAPPED: 0. Every example row has a Playwright test.

Top 5 riskiest deltas:
1. Every `@visual` test runs only in the non-blocking eyes lane (playwright.config.ts:13,57 grepInvert; README.md:20-22; lib/rake/test.rake:133-134,653), so the non-visual claims inside "star wars RTL" (PW/activities/eyes.spec.ts:244-261) and "Viewing a level with blockly embedded in instructions" (PW/foundations/markdown-rendering.spec.ts:32-59) — the two pairs with no a11y companion — are enforced nowhere that blocks a build; Cucumber's @eyes-only gating (runner.rb:795-797) had the same shape, so this is parity, not regression, but it is worth knowing.
2. Masks remove the scenario subject from visual comparison in several checkpoints: the whole function-editor modal in "auto open function editor" (PW/activities/initial-page-views.spec.ts:27,90-95), the maze playfield in both "maze" checkpoints (eyes.spec.ts:206-208,220) and "K1 embedded blockly" (markdown-rendering.spec.ts:55-57), and the answer column in both match checkpoints (eyes.spec.ts:76,103); Cucumber compared the full window (SD/eyes_steps.rb:58-59).
3. "pixelation with range" now screenshots with the long-instructions dialog forced open (PW/pages/pixelation-level.ts:164-170), and the Minecraft rows dismiss the player-selection interstitial before the checkpoint (PW/pages/craft-lab.ts:242-248); the Playwright baselines depict different states than the Cucumber ones (F/eyes.feature:44-49; F/initial_page_views.feature:22-23).
4. `expectElementHasI18nMarkdown` (PW/shared/i18n.ts:84-111) replaces Redcarpet+Nokogiri (F/support/browser_helpers.rb:33-56) with five regexes and no poll; and `test.fixme(browserName === 'webkit')` (PW/foundations/i18n.spec.ts:376) removes the only markdown-i18n scenario from webkit.
5. Toolbox-category i18n rows (PW/foundations/i18n.spec.ts:95-106,209-220,352-363) address categories via a flattened ARIA `treeitem` index (PW/pages/legacy-blockly-lab.ts:256-261) instead of the Cucumber `nth-child` CSS on the visible toolbox (SD/blockly.rb:305); the index-to-category mapping is structurally different and not verifiable from the files.

Other patterns flagged:
- Navigation + `visualCheck` only, no non-visual `expect` in the test body: initial-page-views-2.spec.ts:140-151 (home, script-progress rows have no readiness gate at all: :60-78), initial-page-views-3.spec.ts:120-131 (no assertion that `/` landed on sign-in), markdown-rendering.spec.ts:32-59. The a11y companions (`toEqual` on an exact violation map) are the only blocking assertions for those rows and will also fail when a listed violation is fixed.
- Conditional / cannot-fail: `waitForEmbeddedInstructionsStable` is a no-op at count 0 (legacy-blockly-lab.ts:211-224); `closeInstructionsOverlayIfShown` (legacy-blockly-lab.ts:114-119) and `introVideoModal.dismissIfShown` (intro-video-modal.ts:35-46) tolerate absence — the latter is what drops the `#x-close` claim in "star wars RTL".
- `@no_ci` parity: only F/initial_page_views3.feature:8 in Cucumber; only the two "embedded blocks" tests in Playwright (initial-page-views-3.spec.ts:24,48). Match. Note the Playwright skip applies only when `PLAYWRIGHT_PROVIDER=drone` (playwright.config.ts:14-16,72-74).
- Cucumber `disable_all_eyes_running: true` in `config/test.yml.erb:159` turns every eyes step into a no-op under that config; which runner environment read that flag is not determinable from these files.
- Pairings inferred without a Source comment: none. Every Playwright test in scope has a `Source:` comment naming its feature and scenario/eyes test name; the Cucumber eyes.feature scenarios are unnamed and were matched by the "I open my eyes to test" string the comments cite.

---

## Appendix B: PR-level evidence (Phase 4 sample)

#### Phase 4: PR-level evidence that ported Playwright tests were ever seen failing

Source: GitHub MCP only (`pull_request_read` get / get_commits / get_reviews / get_comments /
get_review_comments, first page each; `search_pull_requests`). Repo code-dot-org/code-dot-org.
All 31 sampled PRs are merged. Nothing was modified or commented.

Evidence key: (a) deliberate break; (b) red CI on an earlier commit then a fix commit;
(c) comment/review/body text stating the test failed then passed; (d) body "Testing story"
validation claim only. "fixme/skip" = commit message mentions fixme or skip.

##### 1. Per-PR table

| PR | Title (short) | Merged | Commits | Evidence found | Verbatim snippet (<=25 words) | Reviewer(s) approving |
|---|---|---|---|---|---|---|
| 74869 | port eyes.feature | yes | 1 | (c) weak, (d) | "fixes the shared instructions-overlay dismissal they exposed ... never matched under /lang/ar-sa and every dismissal fell through to a coordinate click" | carl-codeorg (approved 13df9aa, not the merged head) |
| 74811 | port initial_page_views3 | yes | 1 | (d) only | "45 of 45 runs pass, with --repeat-each=5 on chromium, firefox and webkit" | carl-codeorg |
| 74743 | port initial_page_views2 | yes | 2 | (b), (c), (d) | commit 4435cd1: "The unplugged-video-level accessibility test failed every retry in CI"; body: "found an empty lesson header in 1 run of 5" | carl-codeorg |
| 74557 | port initial_page_views | yes | 1 | (c) weak (environmental), (d) | "74/75. The one failure was a WebKit process crash ... the same test then passed 10/10 in isolation" | carl-codeorg (approved d56e968, not the merged head) |
| 74522 | port level_types/standalone_video | yes | 1 | (c) weak (baseline variance), (d) | "reproduced in 2 of 3 immediate scans, 0 of 3 delayed ones" | etaderhold |
| 74466 | port foundations/i18n | yes | 2 | (b), (c), (d); fixme | commit 72c57af: "fixme the Pixelation i18n test on WebKit ... crashed 3/3 attempts in Drone with 'page.goto: Page crashed'" | carl-codeorg (approved 82eba8a, before the fixme commit) |
| 74458 | port level_types/map_level | yes | 1 | (d) only | "15 passed, 51.5s, no flake" | cearachew |
| 74453 | port foundations/create_dropdown | yes | 1 | (d) only | "25 passed, 50 skipped, 1.5m, no flake" (firefox/webkit test.skip) | carl-codeorg |
| 74434 | port foundations/user_menu | yes | 1 | (c) weak, (d) | "One flake was diagnosed and fixed during the port ... correctly reported an extra link-name violation" | carl-codeorg (approved 1ccab26, not the merged head) |
| 74369 | port demo_section_card | yes | 1 | (d) only | "Stress gate 15/15 green: CI=1 --repeat-each=5 --retries=0 --workers=2" | lfryemason |
| 74255 | port xteam/race_interstitial | yes | 1 | (d) only | "45/45 passed across all nine @visual specs, with this spec clean on all five repeats" | carl-codeorg |
| 74249 | port video/fallback_player_caption_dialog_link | yes | 2 | (d) only | "Green under the project's 5x-run/all-browser stress gate" | etaderhold |
| 74199 | port teacher_tools/unnumbered_lessons | yes | 3 | (d) only | "Ran the new spec 5x per browser ... 15 runs total, --retries=0 ... zero flakes" | Nokondi |
| 74184 | port xteam/cookie_banner | yes | 1 | (c) weak (visual mask corrections), (d) | "still left a ~16px sliver of live video visible ... now targets the iframe ... verified clean across 5 repeats with zero diff" | carl-codeorg |
| 73954 | port policy_compliance | yes | 3 | (d) only | "ported spec under the 5x/all-browser stress gate: 105/105" | carl-codeorg |
| 73929 | port artist | yes | 3 | (c), (d) | commit 667595b: "a ~4-12% flake surfaced by the artist lab port, reproduced on both test-studio and staging-studio (failure screenshots: dialog still open" | molly-moen (approved 4d07a71, not in merged commit list) |
| 73928 | port documentation_landing_page | yes | 5 | (c) weak (baseline variance), (d) | "whose count flaps 224/225 between firefox and chromium/webkit and would flake the gate" | etaderhold |
| 73927 | port fa/sign_up_page | yes | 1 | (d) only | "--repeat-each=5 -- 5/5 chromium passed; firefox/webkit correctly skipped by the browser guard" | artem-vavilov |
| 73923 | port foundations/markdown_rendering | yes | 4 | (b) for OTHER specs only, (d) | commit 67ec788: "CI teardown screenshots differ across retries exactly there"; review: "didn't think the check the playwright test was still passing" | stephenliang, molly-moen |
| 73850 | port star_labs/blocklayout | yes | 1 | (d) only | "--repeat-each=5 across chromium/firefox/webkit -- 45/45 passed" | molly-moen |
| 73810 | port fa/sign_in_page | yes | 9 | (b), (d) | commit 3d58726: "the data-ge-region assertion fails (seen in the eyes CI job)" | nicklathe |
| 73724 | port platform/one_trust | yes | 3 | (b) implied, (d); skip | commit e0650d5: "skip lab2 embedded projects on webkit (frozen WPE crash)"; body: "[ ] CI green on this PR" unchecked | carl-codeorg |
| 73709 | port teacher_tools/progress | yes | 5 | (d) only | "30/30 passed (run both on the initial port and again after the review hardening)" | lfryemason (approved b2f4d81, not in merged commit list) |
| 73658 | port policy_compliance/lockout_phase | yes | 2 | (d) only | "150/150 clean for the ported scenarios; 165/165 with the a11y scan added" | artem-vavilov, carl-codeorg |
| 73614 | port public_project_gallery_signed_out | yes | 5 | (d) only | "30/30 runs passed (5 repeats x 3 browsers ... --retries=0)" | Nokondi |
| 73570 | port platform/header | yes | 1 | (d) only | "45 passed / 30 skipped, no failures" | carl-codeorg |
| 73562 | port teacher_tools/callouts | yes | 1 | (c) (locator change made it fail), (d) | review reply: "a .first() attempt regressed hoc/9 15/15" | etaderhold |
| 73546 | port policy_compliance/parental_permission | yes | 9 | (d) only | "6 scenarios x 5 repeats x 3 browsers ... --retries=0, --workers=2: 90 passed" | nicklathe |
| 73497 | port level_types/multi4 | yes | 1 | (d) only | "The migration tooling additionally verified the new spec green under a 5x/all-browser stress gate" | Nokondi |
| 73482 | port platform/signing_in | yes | 1 | (d) only | "Zero-flake stress gate: 60/60 passing -- --repeat-each=5 across chromium, firefox, and webkit with retries=0" | carl-codeorg |
| 74077 | Web Lab 2: playwright tests | yes | 8 | (b), (c); no 5x gate stated | body: "Only the WCAG tests are failing, which is expected"; commit 8c50fc7: "fix for blinking dot failure" | stephenliang (copilot bot commented) |

Notes on the table:
- No PR in the sample has a deliberate-break commit or any text describing intentionally
  breaking the app or a locator to confirm the test goes red. Evidence type (a): 0 of 31.
- Issue comments (get_comments) were empty on 30 of 31 PRs; the one exception (73928) is a
  Storybook bot. All human discussion, where any, is in review threads: 73923, 73709, 73658,
  73562, 74077. The other 26 PRs were approved with no review comment at all.
- Five PRs were approved on a commit that is not in the merged commit list (force-push or
  squash after approval): 74869, 74557, 74434, 73929, 73709. 74466 was approved before the
  fixme commit landed. Intermediate history for these is not recoverable from the API.
- Commit messages mentioning fixme/skip: 74466 ("fixme the Pixelation i18n test on WebKit"),
  73724 ("skip lab2 embedded projects on webkit"). 74453 and 73570 mention test.skip in the
  PR body only (browser guards carried from @no_firefox/@no_safari/@chrome tags).
- 74077 is the only PR whose new test was observed red in CI *because the application lacked
  the fix* (the a11y aria-label fix was not yet deployed to the test environment). That is the
  closest thing in the sample to a demonstration that a test detects the defect it guards.

##### 2. Counts

Of 31 merged PRs:
- Test itself observed failing (CI red, reproducible flake, or locator regression) then fixed
  -- (b) or (c), strong: 7
  74743, 74466, 73810, 73724, 73929, 73562, 74077
- Weak/incidental only (one-off environmental crash, baseline count variance, visual mask
  tuning, or red CI belonging to other specs in the same PR): 7
  74869, 74557, 74522, 74434, 74184, 73928, 73923
- No evidence of any observed failure; (d) claim only: 17
  74811, 74458, 74453, 74369, 74255, 74249, 74199, 73954, 73927, 73850, 73709, 73658,
  73614, 73570, 73546, 73497, 73482
- Deliberate break (a): 0

Read strictly (test was seen red, for any reason, before merge): 14 with, 17 without.
Read as "test was shown to detect an application defect": 1 (74077), 30 without.
Every observed failure in the 14 is a test-infrastructure failure (timing, crash, locator,
baseline drift), not a product regression the test caught; none was induced on purpose.

##### 3. Recurring validation phrases in PR bodies and commit messages

- Commit-message boilerplate on 20 of the 31 ports, verbatim:
  "Green under the 5x/all-browser stress gate; original Cucumber feature tagged @playwright
  so the Cucumber suite skips it."
- "zero-flake stress gate -- 5 repeats x {chromium, firefox, webkit}, retries=0" (73658,
  73709, 73614, 73546, 73570, 73482, 74458, 74453)
- "CI=1 yarn playwright test <spec> --repeat-each=5 --retries=0 --workers=2
  --project=chromium --project=firefox --project=webkit" (74522, 74466, 74434, 73562, 74369)
- "Automated -- this PR is the test. Verified independently of the porting tooling, on the
  committed spec" (74522, 74466, 74434)
- "Green under the project's 5x-run/all-browser stress gate (see `Migration status:
  COMPLETED` comments in the new spec)" (74249)
- "The migration tooling additionally verified the new spec green under a 5x/all-browser
  stress gate" (73497); "stress-tested by the port workflow's deflake gate" (73810);
  "the spec passed a 5x repeat run across all configured browsers before commit" (73923)
- Visual lane: "yarn test:visual:prove ... generates throwaway native-screenshot baselines,
  re-runs the visual projects 5x" (74255); "prove-visual ephemeral baselines" 5x or 10x
  (74557, 74743, 74811, 74184)
- a11y: "a11y baselines are measured, not guessed" (74557); "counts deterministic across
  chromium/firefox/webkit" (73954, 73929, 73928, 74557)
- Every claim is of a pass count; no body describes a red run that was induced to confirm
  the assertion bites.

##### 4. Merged port PRs found by search but not in the sample

Query `repo:code-dot-org/code-dot-org is:pr is:merged "test(e2e): port"` returned 44 results
(one page; page 2 empty). Not in the sample:

- 73220 test(e2e): port star_labs/bee to playwright
- 73414 test(e2e): port level_types/multi2 to playwright
- 73632 test(e2e): port CAP US-state bulk-set to Playwright
- 73287 test(e2e): port level_types/multi to playwright
- 73439 test(e2e): port xteam/gdpr_dialog.feature to Playwright
- 73416 test(e2e): port platform/login_redirect.feature to playwright
- 73363 test(e2e): port dcdo_mocking.feature to Playwright
- 73469 test(e2e): port teacher_tools/level_types/multi3.feature to playwright
- 73262 test(e2e): port contextual_hints to Playwright (stacked on #73200)
- 73200 test(e2e): port authored_hints to Playwright (pages/components layout)
- 73205 test(e2e): port platform/global_edition/region_select to playwright
- 73231 test(e2e): port platform/global_edition/fa/teacher_dashboard to playwright
- 73239 test(e2e): port platform/global_edition/fa/personal_project_gallery to playwright
- 72977 feat(e2e): agentic Cucumber->Playwright porting workflow (matched the phrase; it is
  the workflow, not a port)

74077 (Web Lab 2) does not carry the "test(e2e): port" title and was not returned by the
search; it was included from the sample list.
