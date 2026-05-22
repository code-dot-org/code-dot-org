# Feature Specification: K-12 Notebook Lab

**Feature Branch**: `1192025-k12-notebook-lab`
**Created**: 2026-05-21
**Status**: Draft — panel-reviewed 2026-05-21
**Input**: User description: "Port the jupyter-k12 notebook experience (https://jupyter-k12.org, MIT, https://github.com/simonguest/jupyter-k12) into the code.org Studio React app and its Capacitor mobile shell as a new lazy-loaded lab, preserving offline/PWA, the full cell-type surface (code, markdown, video, chat), Colab-style `#@param` form fields, notebook metadata extensions (title, folder, globals, i18n, hide_code/video/chat tags), IndexedDB persistence with debounced auto-save, GitHub URL import, locale + RTL support, and shipping 18 bundled sample notebooks seeded on first launch."

## User Scenarios & Testing *(mandatory)*

<!--
  Stories are prioritized by learner value and ordered so each can stand on its
  own. P1 establishes the floor (an offline learner can do *something* with a
  notebook); P2/P3 layer on the rest of the jupyter-k12 surface.
-->

### User Story 1 — First-success in under 60 seconds (Priority: P1)

A learner installs the Code.org app on a school tablet, taps the Notebook Lab, and inside three taps and 60 seconds has run their first line of Python and seen a result they recognize. They never have to pick from a list of files, decipher a folder hierarchy, or read a paragraph before something works.

**Why this priority**: The biggest risk to this product is not "the learner has no notebook to open" — it is "the learner closes the app before they understand why it exists." The first-success moment is the only acceptance gate that protects against silent abandonment. Folder navigation, multiple cell types, and the full sample library are second-session surfaces.

**Independent Test**: On a fresh install with no prior state, open the lab, count the taps and elapsed seconds until a Python cell runs and shows output. Verify the same flow holds offline after a single online launch.

**Acceptance Scenarios**:

1. **Given** a fresh install and the device online, **When** the learner taps the Notebook Lab tile, **Then** they land directly inside a short welcome notebook (not an index of files), the first runnable cell is focused, and a single primary "Try it" affordance is visible without scrolling.
2. **Given** the welcome notebook is open with its first cell focused, **When** the learner taps Try it, **Then** Python runs and a result is rendered under the cell within ten seconds end-to-end on a mid-range device (including any one-time runtime warm-up).
3. **Given** the welcome run succeeded, **When** the learner force-quits and relaunches offline, **Then** the welcome notebook re-opens with the prior output preserved and the index remains one tap away via bottom navigation.
4. **Given** the device has bundled samples on disk, **When** the learner navigates to the index from the bottom nav, **Then** the index shows a "Continue" entry (their welcome notebook plus any other recently-opened notebook) above the sample library.

---

### User Story 1b — Offline floor for the whole library (Priority: P1)

After completing one online launch, a learner can open any bundled sample, run its Python cells, edit, auto-save, and resume after a force-quit with the device fully offline. This is the durable promise behind User Story 1 — the welcome flow must not be an island.

**Why this priority**: Offline-first is the load-bearing assumption for school devices on patchy networks. It is split from User Story 1 because the first-success flow is a UX commitment; the offline floor is a system commitment, and either can regress without the other.

**Independent Test**: Online once. Airplane mode. Force-quit. Relaunch. Open three samples. Edit one. Force-quit. Relaunch offline. Confirm the edited cell text and prior outputs persist.

**Acceptance Scenarios**:

1. **Given** the app has completed one online launch, **When** the device goes offline, **Then** every bundled sample opens, accepts edits, runs Python, and auto-saves with no network access.
2. **Given** the learner has edited a code cell and waited the auto-save interval, **When** they force-quit and relaunch offline, **Then** the notebook reopens with the edit and any cell outputs intact.
3. **Given** the sample seeding has already run once, **When** a later launch occurs, **Then** the lab does not re-seed (no duplicates) and does not delete learner-modified copies of samples.

---

### User Story 2 — Curriculum delivery by shareable URL (Priority: P1)

A teacher publishes a notebook to a public Git repository and shares a single link with the class. Each learner opens the link; the app fetches the notebook, validates it, saves it locally, and opens it ready to run — without an account, without a sign-in step, and without exposing the learner to a URL bar full of query parameters after the import completes.

**Why this priority**: This is how authored curriculum reaches learners. Without a frictionless import path, the lab is just a sandbox; with it, the lab becomes a delivery surface for code.org and partner curriculum.

**Independent Test**: Host a valid Jupyter notebook in a public Git repo, build a Code.org app URL that points at that notebook via the `github=` parameter, open it on a fresh install, and confirm the notebook is imported into the local index, opened immediately, and survives a restart offline.

**Acceptance Scenarios**:

1. **Given** the learner taps a link of the form `…/projects/notebook/edit?github=<owner>/<repo>/blob/<ref>/<path>.ipynb`, **When** the app loads, **Then** the notebook is fetched, validated as a Jupyter v4 notebook, assigned a unique id, saved to local storage, and opened to the first cell.
2. **Given** the learner is browsing inside a folder when they activate the import, **When** the import completes, **Then** the imported notebook is stamped with that folder path and appears in the folder when they navigate back.
3. **Given** the import fails (URL invalid, content not a notebook, or network unavailable), **When** the error is detected, **Then** a clear, localized error message names the problem and the URL parameter is stripped so refreshing does not loop the failure.
4. **Given** an "Import from URL" or "Import from File" action is used instead of the `github=` shortcut, **When** the file or URL points at a valid notebook, **Then** the same validation, id assignment, folder stamping, and open behavior applies.

---

### User Story 3 — Try-it cells with empathetic error recovery (Priority: P1)

A learner reads a markdown explanation, taps a single primary action under a code cell, and either sees a result with a small completion beat, or sees an empathetic error card that names the problem in one line, highlights the offending line in the editor, and offers a clear next step. They never see a raw Python traceback as the first thing.

**Why this priority**: The error path is the learning path. A learner who hits a `NameError` and gets a wall of red text screenshots it and pastes it into ChatGPT — or quits. The product either owns the error moment or loses the learner there. This is promoted to P1 because the error UX is what separates a "tool you tolerate for the grade" from "a tool you trust."

**Independent Test**: Open a code cell with `print(x)` where `x` is undefined, tap Try it, confirm the lab shows an empathy card (plain-English summary, highlighted line, optional traceback disclosure, single retry action) — not a raw traceback. Then fix the bug and run again; confirm success is acknowledged with a brief visual beat.

**Acceptance Scenarios**:

1. **Given** any code cell, **When** it renders, **Then** the cell shows one primary "Try it" action; Stop appears only while the cell is running; Clear is reachable via a secondary affordance but is not part of the default chrome.
2. **Given** a successful run, **When** output is rendered, **Then** the result appears under the cell, standard output collapses under a disclosure when present, and a small visual beat (a checkmark / brief animation) marks the success without blocking the next interaction.
3. **Given** a run that raises a Python exception, **When** the error is detected, **Then** the output region is replaced by an empathy card containing a one-line plain-English summary, the editor highlights the offending line, the raw traceback is available under a "Show details" disclosure, and a single "Try again" action re-runs the cell after edits.
4. **Given** the empathy card is showing, **When** the learner edits the cell and re-runs, **Then** the empathy card is replaced by the new result or new error without piling up history.
5. **Given** the host learner has requested reduced motion, **When** a success beat would have animated, **Then** the beat is rendered as a static state change with no animation.

---

### User Story 3b — Live form widgets as questions, not controls (Priority: P2)

A learner reading a curriculum notebook sees a slider, dropdown, or toggle rendered directly above a Python code cell, framed as a prompt the curriculum author wrote ("Try a temperature — what happens at 1.7?"). Adjusting the control rewrites the source line in place; running the cell uses the new value; the change persists across restarts; the change is visibly tied to the line of code it edits, so the learner is never surprised to find their code rewritten.

**Why this priority**: Form fields are the single most "demoable" mechanic in the source product — the live source rewrite is the screenshot a learner would actually send a friend. They turn passive reading into participation. P2 because the cell loop in User Story 3 must work first.

**Independent Test**: Open `kitchen_sink.ipynb` (bundled), confirm each `#@param` annotation renders a matching widget with an author-supplied or sensibly-defaulted prompt, change each widget, observe the source line briefly highlight as it rewrites, run the cell, and verify the new value drives the output.

**Acceptance Scenarios**:

1. **Given** a code cell whose source contains `TEMPERATURE = 1 #@param {type:"slider", min:0, max:2, step:0.1}`, **When** the cell renders, **Then** a slider appears above the editor labelled with an author-supplied prompt (when present in the annotation) or a friendly fallback derived from the identifier name, and the slider reflects the current value.
2. **Given** the learner drags the slider, **When** the change settles, **Then** the source line in the editor briefly highlights to show what was rewritten, the trailing comment and newline are preserved, and auto-save persists the change.
3. **Given** a dropdown annotation `MODEL = "small" #@param ["small", "medium", "large"]`, **When** the learner selects a different option, **Then** the source updates with the quoted value and the next run uses the new choice.
4. **Given** a boolean annotation `#@param {type:"boolean"}`, **When** the learner toggles it, **Then** the source records `True` or `False` and the run honors it.
5. **Given** an annotation includes an author prompt `#@param {type:"slider", min:0, max:2, step:0.1, prompt:"How creative should the model be?"}`, **When** the widget renders, **Then** the author prompt is shown verbatim above the control (with locale overrides honored when present).

---

### User Story 4 — Multi-language learners, including right-to-left (Priority: P2)

A learner whose first language is Hindi, Japanese, or Farsi opens the Notebook Lab, switches the interface language, and sees the chrome and the curriculum text update without losing their place. Right-to-left languages flip the chrome direction so navigation and breadcrumbs feel native.

**Why this priority**: Code.org serves learners worldwide. Localization is a launch-quality gate, not a follow-up. jupyter-k12 already ships per-cell and per-global localization metadata that the spec preserves so existing authored content can be reused directly.

**Independent Test**: Open a notebook whose markdown cells declare `metadata.i18n` overrides for Hindi and Japanese, switch the language in Settings, and confirm the chrome strings, markdown content, and global substitutions all update without reloading the route.

**Acceptance Scenarios**:

1. **Given** an installed app in the default language, **When** the learner picks Hindi in Settings, **Then** all navigation, button, and dialog text changes to Hindi within one second and the chosen locale is remembered across launches.
2. **Given** a markdown cell with `metadata.i18n["hi-IN"]` content, **When** the active locale is Hindi, **Then** the rendered cell uses the Hindi source instead of the default.
3. **Given** notebook metadata defines a `globals.NAME` with a `hi-IN` value, **When** a markdown or code cell references `{{NAME}}` and the locale is Hindi, **Then** the Hindi value is substituted at render and at run time.
4. **Given** the learner switches to Farsi, **When** the chrome updates, **Then** the page direction becomes right-to-left, breadcrumb chevrons and back arrows flip, and bottom-navigation order reverses; switching back to English restores left-to-right chrome.

---

### User Story 5 — Continue, Assigned, Library — not folders (Priority: P2)

A learner opens the index and sees three sections in order: **Continue** (the notebook they were just in, plus recently-opened), **Assigned** (notebooks imported via a teacher-shared link or join code, with the author's name when present), and **Library** (the bundled samples and any other notebooks, grouped into author-declared units rendered as a vertical path). The learner never sees the word "folder," a Unix-style path, or a breadcrumb in the chrome.

**Why this priority**: A folder tree mirrors how curriculum authors *organize* content. It is not how learners *consume* it. The pattern learners recognize from Khan Academy, Duolingo, and Schoology is Continue / Assigned / Browse. `metadata.folder` is preserved as the underlying organization mechanism (no churn for authors) and is presented to learners as a guided path.

**Independent Test**: Open the index with at least one recently-opened notebook, one teacher-imported notebook, and the bundled samples present. Confirm the three sections render in order, that no breadcrumb or Unix-style path is visible in chrome anywhere, and that tapping a unit reveals its lessons as a vertical path.

**Acceptance Scenarios**:

1. **Given** the learner has opened at least one notebook in a prior session, **When** they open the index, **Then** a "Continue" section appears at the top with up to three recently-touched notebooks, most recent first.
2. **Given** the learner has imported at least one notebook via a shareable link or join code, **When** the index renders, **Then** those notebooks appear in an "Assigned" section labelled with the curriculum author or teacher when that information is present in the notebook metadata.
3. **Given** bundled samples and other notebooks share an author-declared unit (via `metadata.folder`), **When** the Library section renders, **Then** the unit is shown as an expandable band with a short friendly title derived from the last folder segment, and lessons inside it render as a vertical path of nodes (completed, current, future).
4. **Given** a notebook declares no folder, **When** the Library section renders, **Then** the notebook appears in a "More notebooks" group at the bottom of Library, not visually at the root.
5. **Given** the learner is inside a notebook, **When** they tap the back control, **Then** they return to the unit they came from with the next lesson node visibly indicated; from a notebook outside any unit they return to the index's Continue section.
6. **Given** the learner imports a notebook while viewing a unit, **When** the import succeeds, **Then** the imported notebook is stamped with that unit and appears inside the unit on the index.
7. **Given** any view of the index, **When** the learner needs to navigate up, **Then** unit bands collapse with a single tap on the band header; no Unix-style path string is shown in chrome at any point.

---

### User Story 6 — Long-running cell interruption and globals reset (Priority: P2)

A learner runs a cell with an infinite loop. The Stop control returns the lab to an interactive state within half a second. A separate Reset action clears Python globals between exercises without throwing the whole session away.

**Why this priority**: Beginners write infinite loops. Without responsive interruption and a clean-globals affordance, a single mistake can wedge the lab and force learners to restart the app — a brutal experience offline.

**Independent Test**: Open any code cell, run `while True: pass`, tap Stop, confirm the lab returns to idle within half a second, then tap Reset Globals, confirm previously defined variables are gone but the runtime is still warm.

**Acceptance Scenarios**:

1. **Given** a cell is running an infinite loop on a device with full interrupt support, **When** the learner taps Stop, **Then** the runtime raises a Python interrupt, the cell exits with an error output, and the next cell can be run immediately.
2. **Given** a cell is running on a device without interrupt support, **When** the learner taps Stop, **Then** the runtime is terminated and re-spawned, a banner explains that globals were lost, and subsequent cells start with a fresh Python state.
3. **Given** previously executed cells defined globals, **When** the learner taps Reset Globals, **Then** user-defined globals are cleared while the runtime stays warm and the next cell starts in a fresh user namespace.

---

### User Story 7 — Video cells for multimodal lessons (Priority: P3)

Curriculum authors embed video cells so a lesson can mix code with instruction. Learners play the video inline; when the host environment blocks embedding, a clear fallback opens the video in the system browser.

**Why this priority**: Video extends the lesson but is not on the offline floor — it requires a network or an embedded asset. Cutting it does not break the product.

**Independent Test**: Open `video_test.ipynb` online and confirm a YouTube cell plays inline, a direct-MP4 cell plays via the file player, and that a blocked embed shows a "Watch on YouTube" fallback.

**Acceptance Scenarios**:

1. **Given** a raw cell tagged `["video"]` with a YouTube URL, **When** the cell renders online, **Then** an inline player loads the video, exposes the requested controls, and supports the playback rates 0.5×–2.0×.
2. **Given** a raw cell tagged `["video"]` with a direct media URL, **When** the cell renders, **Then** an inline player loads the media with the controls flag honored from the JSON payload.
3. **Given** the embed fails to load within two seconds (CORS, sandbox, or native shell restrictions), **When** the failure is detected, **Then** a fallback button labelled "Watch on YouTube" or "Watch on Vimeo" opens the URL in the system browser.

**Note on chat cells**: AI chat cells were considered for this priority but are deferred to v2 — see "Out of scope" and the Panel review notes. Raw cells tagged `["chat"]` MUST still parse without crashing the renderer; in v1 they render a localized "AI features are not available in this version" placeholder so notebooks authored against jupyter-k12 still open.

---

### User Story 9 — Shared classroom device with a lightweight session boundary (Priority: P1)

Brian (period 1), Alex (period 3), and Maria (period 6) all use the same Chromebook. When Maria opens the Notebook Lab she does not see Brian's edited notebooks, his dark theme, or his Farsi locale. She picks a session label (a friendly first name or a four-character seat code), her edits live in a session-scoped store, and at the end of the period the lab returns to the session picker. No account, no PII collected, no network call — just a namespace.

**Why this priority**: Shared devices are the dominant K-12 form factor. The default "one device, one learner" assumption silently overwrites student work. This is promoted to P1 because the failure mode is silent data loss in a graded context.

**Independent Test**: Open the lab on a device, pick a session label "Maya," edit a notebook, force-quit. Reopen, pick a different label "Alex," confirm Alex sees the bundled samples in pristine state and none of Maya's edits. Switch back to "Maya," confirm Maya's edits are intact.

**Acceptance Scenarios**:

1. **Given** the lab is opened on a device with no active session, **When** the learner reaches the index, **Then** they are first asked to pick or create a session label (free-text first name or four-character code), with the picker localized.
2. **Given** a session is active, **When** the learner edits, runs, or imports a notebook, **Then** the data is stored under a key scoped to the session label and is not visible to other session labels on the same device.
3. **Given** the lab has been idle past a configurable timeout (default 20 minutes) or the learner explicitly chooses "Sign out of this session," **When** the next interaction occurs, **Then** the session picker is shown again.
4. **Given** the learner picks an existing session label, **When** they return to the index, **Then** their Continue, Assigned, theme, and locale are restored.
5. **Given** a session label is created, **When** the learner uses the lab, **Then** no telemetry includes the label or any data the learner typed into it; the label is treated as PII for telemetry purposes.

---

### User Story 10 — Lesson goal and lesson-complete moment (Priority: P2)

Every notebook can declare a one-line learning goal in its metadata. The renderer surfaces this goal under the title; when the learner runs every runnable cell at least once, a lesson-complete screen briefly celebrates and offers a clear "Next lesson" call to action drawn from the same unit.

**Why this priority**: This is the cheapest possible progress model. It costs nothing if curriculum authors do not adopt it (the lab degrades gracefully), and it converts the lab from "a notebook tool" into "a lesson surface" the day they do. No streaks, hearts, or XP — those mechanics are inappropriate for graded K-12 code learning, where mistakes are the point.

**Independent Test**: Open a bundled notebook that declares `metadata.goal`, confirm the goal renders under the title in the active locale. Run every runnable cell. Confirm the lesson-complete screen appears with the goal echoed and a "Next lesson" CTA when another notebook exists in the same unit.

**Acceptance Scenarios**:

1. **Given** a notebook declares `metadata.goal` (locale-aware, like globals), **When** the notebook renders, **Then** the goal is displayed under the title in the active locale, falling back to the default value when no override exists.
2. **Given** a notebook with N runnable code cells, **When** the learner has run every runnable cell at least once in the current session, **Then** a non-blocking "Lesson complete" surface appears with the goal echoed and a single primary "Next lesson" action.
3. **Given** the unit contains a next lesson after the current one, **When** the learner taps "Next lesson," **Then** the next lesson opens. When no next lesson exists, the CTA reads "Back to your path."
4. **Given** the learner edits a previously-completed cell, **When** they run it again, **Then** completion is re-recognized without resetting any other cells' state.
5. **Given** a notebook declares no `metadata.goal`, **When** the notebook renders, **Then** no goal line is shown and the lesson-complete surface still appears when all runnable cells have been run, omitting the goal echo.

---

### User Story 11 — Teacher-visible completion artifact, no accounts (Priority: P2)

A teacher walks the room. They need a low-friction way to see who has finished and who is stuck — without the lab introducing accounts, rosters, or sign-in. The learner can produce a single-tap completion artifact (a printable summary or a teacher-side QR handshake) that captures their session label, notebook title, per-cell completion state, and last output. The teacher collects these the way they collect any other classwork.

**Why this priority**: Account-less v1 (Assumptions) eliminates the most-asked classroom feature. Without an artifact, this product is invisible to the teacher who is responsible for it. P2 because the lab is still useful without it but is unlikely to be adopted as graded coursework.

**Independent Test**: From an open notebook, tap "Share with teacher." Confirm a single-page printable summary is produced containing the session label, notebook title, per-cell completion state, and last result. Separately, confirm a "Show me your screen" affordance produces a short-lived QR code the teacher can scan with their device to view the same summary in a browser.

**Acceptance Scenarios**:

1. **Given** a learner has been working in a notebook, **When** they tap "Share with teacher," **Then** the lab produces a one-page summary that names the session label, the notebook title, the unit, the per-cell run state, and the last result or error for each cell.
2. **Given** the summary is produced, **When** the learner taps the share affordance, **Then** the lab offers (a) print to PDF on web platforms, (b) save to device on native platforms, and (c) a "Show me your screen" QR code that encodes the same summary as a URL fragment so a teacher with a phone can scan and view the summary in a browser without any server round-trip.
3. **Given** the summary is shared, **When** the teacher reads it, **Then** no API keys, no full notebook source, and no learner-typed content beyond cell *outputs* is included; the summary is a completion artifact, not a code dump.

---

### User Story 8 — Per-notebook authoring of globals and metadata (Priority: P3)

A curriculum author opens a notebook and edits the globals dialog to add or change a variable, including per-locale values, without leaving the lab.

**Why this priority**: A learner does not need this, but an author does. It is the minimum authoring affordance that keeps the spec coherent with jupyter-k12, where the globals dialog is the only metadata editor exposed in-app. Cell-level authoring beyond JSON is out of scope for v1.

**Independent Test**: Open any notebook, open the globals dialog, add a new variable with default + Hindi values, confirm the new variable is referenced in a markdown cell via `{{NAME}}` and substitutes correctly when the locale changes.

**Acceptance Scenarios**:

1. **Given** the globals dialog is open, **When** the author adds a variable whose name matches the identifier pattern (starts with a letter or underscore; alphanumeric and underscores thereafter), **Then** the variable is saved into the notebook metadata.
2. **Given** the author tries to add a variable whose name fails the identifier pattern, **When** they attempt to save, **Then** the dialog rejects the name and shows a localized validation message.
3. **Given** the author adds a per-locale value, **When** they save and switch the locale, **Then** the substituted text in markdown and code cells uses the locale-specific value (or falls back to the default when no override exists).

---

### Edge Cases

- A notebook is imported whose `cells` array is missing or malformed: the import is rejected with a clear, localized error; nothing is written to local storage.
- A notebook has cells without ids: the loader assigns fresh ids during import and persists them so future runs are stable.
- An imported notebook declares a `folder` value that conflicts with the current folder context: the imported value wins (curriculum-author intent is authoritative).
- A learner imports the same GitHub URL twice: the second import creates a second notebook with a new id; deduplication is not promised in v1.
- A code cell's `#@param` annotation cannot be parsed: the widget is not rendered, the source line is left untouched, and a console-only diagnostic is emitted; the cell still runs.
- A `{{VARIABLE}}` reference names a missing global: the literal `{{VARIABLE}}` is preserved in the rendered output rather than being replaced with an empty string.
- A long output stream from a runaway `print` loop: stdout buffering must not crash the lab; the lab caps a single cell's stdout at a sensible upper bound and indicates truncation if exceeded.
- The device storage is full when auto-save tries to write: the save-status indicator shows error, the in-memory notebook is not lost, and the learner is offered an export-to-file action so work can be recovered.
- The active locale lacks a translation for a chrome string: the string falls back to English; the locale picker still works.
- Right-to-left locales: bottom-nav order, breadcrumb chevrons, and back arrows all reverse; markdown content direction is honored per-cell when the cell content itself marks direction.
- The service worker is updated between sessions: the update is applied silently on next launch; the learner is never blocked by a forced reload during a session.
- The native shell is launched on a device whose system browser lacks the cryptographic features used for runtime interrupt: interrupt gracefully degrades to runtime restart with a banner; no crash.
- Two browser tabs open the same notebook: the last write wins; the spec does not promise multi-tab consistency in v1.

## Requirements *(mandatory)*

### Functional Requirements

#### Notebook content model

- **FR-001**: The system MUST accept notebooks that conform to the Jupyter `nbformat 4.x` JSON schema and reject inputs that do not.
- **FR-002**: The system MUST support three cell types: code, markdown, and raw, and dispatch raw cells to a video renderer when tagged `video`, to a chat renderer when tagged `chat`, and to an "unsupported cell" placeholder otherwise.
- **FR-003**: The system MUST assign a fresh unique cell id to any cell that arrives without one and persist the assignment so future loads are stable.
- **FR-004**: The system MUST support these notebook metadata extensions, faithfully matching the jupyter-k12 docs and adding two for lesson framing:
  - a friendly `title` used in the index and the renderer header, falling back to the filename when absent;
  - a `folder` Unix-style path that is normalized to a leading slash and treated as empty when absent (preserved as data; never shown as a path string in chrome);
  - a `globals` map of identifier-keyed entries each with a default value and any number of locale-keyed overrides;
  - a per-cell `i18n` map whose locale-keyed entries replace the cell source when the active locale matches;
  - an optional `goal` string (locale-aware) used as the lesson goal under the title and echoed on lesson-complete;
  - an optional `author` string used in the Assigned section of the index to attribute a teacher-imported notebook.
- **FR-005**: The system MUST recognize the cell-level tags `video`, `chat`, and `hide_code`, where `hide_code` hides the editor on a code cell while keeping the controls and outputs visible.

#### Cell rendering and editing

- **FR-006**: The system MUST render markdown cells with GitHub-flavored markdown and explicit line-break handling, sanitize embedded HTML against script injection, and substitute global variables and locale overrides before rendering.
- **FR-007**: The system MUST render code cells with a Python-aware code editor that supports both a light and a dark theme matching the app theme, basic auto-indent, bracket matching, and identifier autocomplete drawn from the cell's own source and the current Python globals; on touch input the editor MUST adapt to a phone-keyboard-friendly mode (visible primary-action bar, suppressed selection handles when not needed).
- **FR-008**: The system MUST detect Colab-compatible `#@param` annotations in code cell source and render a matching control above the editor for each, supporting plain values (string and number), sliders with minimum/maximum/step, dropdowns from an inline array of options, and booleans rendered as toggles. Each widget MUST display a learner-facing prompt: the author-supplied `prompt:` field from the annotation when present, with locale overrides honored; otherwise a friendly default derived from the identifier name.
- **FR-009**: When a parameter control changes, the system MUST rewrite the corresponding source line in place — preserving any trailing comment and the terminating newline — visibly highlight the rewritten line in the editor for at least 500 ms so the change is not invisible to the learner, and persist the change through auto-save.
- **FR-010**: The system MUST present a single primary "Try it" action under each code cell as the default chrome; Stop MUST appear only while the cell is running; Clear MUST be reachable via a secondary affordance (long-press, overflow menu, or cell options) but MUST NOT be present in the default chrome.
- **FR-010a**: The system MUST render code-cell outputs in a single region under the cell. On success, a result is shown first; any standard-output stream is collapsed under a labelled disclosure. On error, the output region is replaced by an empathy card containing a one-line plain-English summary of the exception, an in-editor highlight on the offending line, a "Show details" disclosure that reveals the raw traceback, and a single "Try again" action. Renderable MIME types MUST include at least `text/plain`, `text/html`, `image/png`, and `image/svg+xml`.
- **FR-010b**: The system MUST acknowledge a successful run with a brief, non-blocking visual beat (a checkmark or comparable cue) on the cell, suppressed when the learner has requested reduced motion. The lab MUST NOT introduce streaks, hearts, energy, XP, or any other punitive or attendance-driven progression mechanic.
- **FR-011**: The system MUST render raw video cells whose source is a JSON payload containing a `url` and a `controls` flag, recognize YouTube and Vimeo URLs and embed them via the appropriate provider, render direct media URLs via an in-page media player supporting playback rates from 0.5× to 2.0×, and fall back to a "Watch on …" system-browser button when embedding fails within a short timeout (around two seconds) or when the host environment is known to block embeds.
- **FR-012**: AI chat cells are deferred to v2 (see "Out of scope" and Panel review notes). For backward compatibility with jupyter-k12-authored content, the system MUST parse raw cells tagged `["chat"]` without crashing the renderer and MUST render a localized "AI features are not available in this version" placeholder. No chat network request MAY be issued by v1.
- **FR-013**: The system MUST NOT accept any API key from a URL parameter in v1. (Reserved: when chat is reintroduced in v2, key handling will be specified through district-admin allow-lists and curriculum-author-provided endpoints, not learner-supplied URL keys.)

#### Code execution

- **FR-014**: The system MUST run Python entirely on the learner's device, with no server kernel. The Python runtime MAY be pre-bundled into the native mobile shell so that no network fetch occurs on first launch; on web platforms the runtime MAY be downloaded on first online use and cached for offline reuse. The lab MUST support an institutional pre-cache path (a documented URL an IT admin can hit via MDM, or an offline asset pack, that warms the cache for a managed device fleet) so that a class of thirty Chromebooks does not need to download the runtime simultaneously from school wifi.
- **FR-014a**: The system MUST offer a "lightweight first lesson" mode in which the welcome notebook's first runnable cell uses only the Python standard library, deferring any heavy package load (pandas, numpy, matplotlib, etc.) until a later cell triggers it. This protects the User Story 1 first-success time on cold caches.
- **FR-015**: The system MUST run Python off the user-interface thread so that interactive controls remain responsive while code is executing.
- **FR-016**: The system MUST provide a Stop control that interrupts a running cell and returns the lab to an interactive state within half a second on devices that support runtime interrupt, and that terminates and restarts the runtime on devices that do not — with a banner explaining the loss of in-memory globals.
- **FR-017**: The system MUST provide a Reset Globals control that clears user-defined Python globals without terminating the runtime.
- **FR-018**: The system MUST translate `{{VARIABLE}}` references inside code cell source into the resolved global value (locale-aware) before sending the source to the Python runtime, so the runtime never has to know about the templating syntax.
- **FR-019**: The system MUST transform `input()` calls so that prompting the learner does not block the runtime, and MUST present an in-app input dialog whose response is delivered back to Python asynchronously.
- **FR-020**: The system MUST automatically install Python packages that the cell imports and any additional packages declared via a project allow-list, drawing from the standard Pyodide package set.
- **FR-021**: The system MUST capture standard output, standard error, and result expressions, attaching them to the cell record so they survive a save/restore round-trip and a force-quit.

#### Persistence and offline behavior

- **FR-022**: The system MUST persist notebooks on the learner's device under a key scoped by (device, active session label) so that notebooks created or edited in one session are not visible to other sessions on the same device. Each record carries a unique id, a last-modified timestamp, and a creation timestamp.
- **FR-022a**: The system MUST present a session picker on lab open when no active session is selected, allow the learner to create a new session label (free text or a four-character code), restore an existing session by tapping its label, and time the session out after a configurable idle interval (default 20 minutes) at which point the picker returns. Session labels MUST be treated as PII for telemetry purposes (FR-043). No network call MAY be issued during session selection.
- **FR-023**: The system MUST auto-save the active notebook on a debounce no longer than two seconds after the last change AND on every navigation away from the cell (whether by focus change, cell change, or app backgrounding), expose the save state as idle, saving, saved, or error visibly only when it is non-idle, and hold the "saved" indicator visible for about two seconds before reverting to idle. The lab MUST also persist immediately before any destructive action (sign out of session, app exit signal, hard-reload).
- **FR-024**: The system MUST ship the eighteen reference notebooks listed in the user description with the app and seed them under the active session on the first launch where storage is empty for this session, including any unit (folder) assignments declared in their metadata; subsequent launches MUST NOT re-seed unless a seed version stamp has been incremented.
- **FR-024a**: The bundled samples MUST ship with `metadata.goal` populated for every notebook — one short learner-facing one-liner derived from each notebook's existing markdown — and MUST carry locale overrides for every locale the notebook already carries cell-level `i18n` for. This is content work, owned by curriculum and tracked outside engineering, but the v1 release artifact MUST NOT ship samples missing goals.
- **FR-025**: The system MUST function fully offline once installed: opening the lab, navigating the index, opening a sample, editing, running Python (using the cached runtime), and saving must all succeed without network access.
- **FR-026**: The system MUST install a service worker that caches the application shell and the Python runtime assets on web platforms, and MUST NOT install or register a service worker when running inside the native mobile shell.
- **FR-027**: The system MUST never put notebook content in storage that the host environment is known to evict aggressively (such as plain `localStorage` inside an iOS-style WebView).
- **FR-028**: The system MUST keep theme and locale preferences scoped to the active session, restored on session resume and reset to defaults on a new session. The underlying preference store MAY be the device's preference store on native and `localStorage` on web, but the key MUST be session-scoped.

#### Import and navigation

- **FR-029**: The system MUST accept a URL parameter named `github` whose value identifies a notebook in a public Git repository, rewrite known `github.com/{owner}/{repo}/{blob,raw}/…` paths to the raw-content host, fetch the notebook, validate it, save it under the active session, strip the parameter from the address bar, and open the notebook automatically.
- **FR-029a**: The system MUST surface a short alphanumeric **join code** as the learner-facing entry point for teacher-shared content. The lab MUST present a "Enter a code" affordance on the index that accepts a code in the format documented for the project (for example, a four-to-six character code), resolve the code to a notebook source via the project's existing redirector or short-link service, and import using the same path as `?github=`. A QR-code render of the same code MUST be supported so a teacher can project it. Teachers MUST NOT need to share raw GitHub URLs to learners.
- **FR-030**: The system MUST accept notebook imports from an in-app "Import from URL" dialog (any HTTP/HTTPS URL pointing at notebook JSON), from an in-app "Import from File" picker (`.ipynb` files), and from a join code (FR-029a), applying the same validation, id assignment, session scoping, and unit stamping.
- **FR-031**: The system MUST surface a localized error and stop the import when fetched content is not a valid notebook, when the URL is malformed, when the network is unreachable, or when local storage rejects the write; the in-progress save MUST NOT corrupt other notebooks on failure.
- **FR-032**: The system MUST organize the index into three sections in order — Continue, Assigned, Library — as described in User Story 5. The chrome MUST NOT show Unix-style path strings or breadcrumbs to the learner. Under the hood, units are derived from each notebook's `metadata.folder`; units render as expandable bands containing lesson nodes in a vertical path. Author-declared unit names are derived from the last segment of the folder path with simple formatting (hyphens to spaces, title case) unless a friendlier label is available.
- **FR-033**: The back control inside an opened notebook MUST return the learner to the unit they came from with the next lesson node visibly indicated; from a notebook outside any unit it MUST return to the index's Continue section.

#### Localization and accessibility

- **FR-034**: The system MUST ship localized chrome strings for the locales English (United States), Hindi (India), Japanese (Japan), and Farsi (Iran) at launch, and MUST allow new locales to be added by dropping translated string bundles into the lab package without code changes elsewhere.
- **FR-035**: The system MUST honor the per-cell `i18n` overrides and per-global locale overrides at render and run time, with a documented preference: the active locale wins if present, else English (United States), else the default value.
- **FR-036**: The system MUST flip page direction, bottom-navigation order, breadcrumb chevrons, and back-arrow icons when the active locale is right-to-left.
- **FR-037**: All interactive controls MUST be reachable by keyboard with a visible focus indicator in both themes; icon-only controls MUST expose accessible names; modal dialogs MUST trap focus.
- **FR-038**: Color contrast MUST meet WCAG AA in both themes; learners who request reduced motion MUST not see the autosave indicator, the success beat, or the lesson-complete surface animate.
- **FR-038a**: The lab MUST offer pedagogical-accessibility settings appropriate for IEP-supported learners: read-aloud of markdown cells and empathy-card error summaries via the platform's on-device speech synthesis (no network call); a dyslexia-friendly font option (such as OpenDyslexic); a line-spacing control (1.0, 1.5, 2.0); and a focus mode that dims all but the active cell. These settings live in Settings and are scoped to the active session.

#### Lab integration and chrome

- **FR-039**: The Notebook Lab MUST integrate into the existing studio lab registry as a lazy-loaded lab and MUST register a single entry route of the form `/app/projects/notebook/<channel-id>/edit`, where the channel id identifies the active notebook.
- **FR-040**: The Notebook Lab's index and settings views MUST live inside the lab itself, reached via a bottom navigation pattern on mobile and a tab/rail pattern on larger viewports, without adding top-level studio routes.
- **FR-041**: The renderer header MUST display the active save status, the active language, and the Python runtime version once the runtime is ready.
- **FR-042**: All user-facing UI MUST be built from the existing code.org design system components first, and from the project's Material UI components for the small set of components the design system has retired in favor of Material UI; no parallel theme MAY be introduced.

#### Privacy and observability

- **FR-043**: The system MUST never record notebook content, cell source the learner typed, session labels, learner-supplied URLs, or API keys in telemetry or remote logs.
- **FR-044**: The system MUST route telemetry through the project's existing observability layer rather than rolling its own.
- **FR-045**: The lab MUST not collect any personally identifying information from learners. Session labels are device-local; the lab MUST NOT prompt for last names, email addresses, dates of birth, or any other identifier. The session-picker copy MUST make clear (in plain language localized for the target locales) that the label is just a name on this device.

#### Teacher-visible artifacts

- **FR-046**: The lab MUST provide a "Share with teacher" action from an open notebook that produces a single-page summary containing the active session label, the notebook title, the unit, per-cell completion state, and the last result or error per cell. The summary MUST NOT include cell source the learner typed, MUST NOT include API keys (none are accepted in v1), and MUST be printable to PDF on web and saveable to device on native.
- **FR-047**: The lab MUST optionally produce a short-lived QR code that encodes the same summary as a URL fragment so that a teacher with a personal device can view the summary in a browser without a network round-trip. The QR-encoded URL MUST be openable locally (no server dependency).

### Key Entities

- **Notebook** — a Jupyter v4 document on the learner's device. Carries an id, the cell list, the metadata extensions (`title`, `folder`, `goal`, `author`, `globals`, `i18n` at the cell level), last-modified and creation timestamps. Scoped to a session label.
- **Cell** — one of code, markdown, or raw; carries an id, type, optional source, optional outputs (code only), and per-cell metadata including tags and locale overrides.
- **Output** — a unit attached to a code cell; carries a type (stream, execute_result, error), an optional name (stdout/stderr), and either text, MIME-keyed data, or a traceback.
- **Global** — a named substitution defined in notebook metadata; carries a default value and any number of locale-keyed overrides.
- **Unit** — a derived grouping of notebooks that share a `metadata.folder` value; presented as a path of lessons in the Library section. Not stored as an independent entity.
- **Lesson Goal** — an optional one-line learner-facing summary of what the notebook teaches; locale-aware; rendered under the notebook title and echoed in the lesson-complete surface.
- **Lesson Completion** — derived state, computed from per-cell run history: a notebook is "complete" when every runnable code cell with non-empty source has been run at least once in the active session.
- **Parameter Widget** — a Colab-style annotation attached to a Python source line; carries a name, a value, a kind (value, slider, dropdown, boolean), kind-specific configuration (range, step, options), and an optional author-supplied prompt with locale overrides.
- **Video Configuration** — a JSON document stored as a raw cell's source; carries a URL, control and autoplay flags, playback-rate bounds, and an optional poster image.
- **Session** — a device-local namespace identified by a learner-chosen label or seat code. All notebook content, preferences, and per-cell state are scoped to the session. The session record carries the label, a created-at, a last-active-at, and the preferences (theme, locale, accessibility settings) scoped to it. No PII collected.
- **Join Code** — a short alphanumeric string that resolves (through the project's existing redirector or short-link service) to a remote notebook source, used as the learner-facing entry point for teacher-shared content; never the raw GitHub URL.
- **Completion Artifact** — a single-page summary produced by the "Share with teacher" action containing the session label, notebook title, unit, per-cell completion state, and last per-cell result or error. Printable to PDF on web, saveable on native, encodable as a short-lived QR code for in-room teacher review.
- **Sample Manifest** — a file shipped with the lab that lists the bundled sample notebooks and the unit they should be seeded into on first launch under each new session.
- **Seed Version** — a persistent marker per session that records which build seeded the bundled samples for that session, so an updated build can refresh seeds without duplicating learner-modified copies.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: First-success time. On a fresh install, a learner reaches a successful first Python result within sixty seconds and within three taps from app launch on a mid-range mobile device with the runtime pre-bundled or warm-cached.
- **SC-002**: Offline floor. Every bundled sample notebook opens, accepts an edit, auto-saves, and survives a force-quit + relaunch on an offline device after a single online install.
- **SC-003**: Per-device cold-cache import. A learner who imports a teacher-shared notebook via join code or shared URL on a single device with a cold cache and a typical school-grade network sees the notebook open within thirty seconds; on a warm cache the same flow completes within five seconds. (Per-classroom worst-case is governed by SC-010, not by this criterion.)
- **SC-004**: Recoverable interruption. Ninety-five percent of learners who run an infinite-loop cell on a device with full interrupt support can recover to an interactive state within one second by tapping Stop.
- **SC-005**: Live localization. Switching the active language updates all chrome text within one second without leaving the current notebook view.
- **SC-006**: PWA quality. The lab passes an automated PWA-quality audit at or above the project's standard threshold on a desktop browser run.
- **SC-007**: Index first-paint. First meaningful paint of the notebook index is under two seconds on a mid-range Android device starting from a cold launch with the app pre-installed.
- **SC-008**: Telemetry hygiene. No notebook content, no cell source the learner typed, no session label, no learner-supplied URL, and no API key appears in telemetry across a representative one-hour usage trace.
- **SC-009**: Accessibility coverage. Color-contrast and keyboard-focus checks pass for one hundred percent of interactive controls in both themes; the read-aloud, font, line-spacing, and focus-mode settings are reachable from Settings without scrolling on a phone form factor.
- **SC-010**: Classroom-scale runtime acquisition. A class of thirty managed devices on a shared Title-I-grade network can be brought from cold cache to runnable lab in under one class period when the IT pre-cache path (FR-014) has been used; without the pre-cache path the lab MUST surface a clear, localized progress and queueing state rather than appearing to hang.
- **SC-011**: Lesson completion. On a representative bundled notebook with N runnable cells, ninety-five percent of learners reach the lesson-complete state within their first session.
- **SC-012**: Error recovery. Ninety percent of learners who encounter a Python exception on a cell run a corrected cell to success within three minutes, using only what the empathy card surfaces (no external tools).
- **SC-013**: Shared-device isolation. With at least three session labels in use on the same device, no learner can read or overwrite another learner's notebook content through the lab UI; the session picker is reachable from any screen the learner can reach.
- **SC-014**: Teacher-artifact usefulness. From an open notebook a teacher can collect a completion artifact in under fifteen seconds on either platform; the artifact contains everything specified in FR-046 and nothing more.

## Assumptions

- Learners are K-12 students using a school-managed mobile device, tablet, or low-spec Chromebook; intermittent and slow networks are common.
- Curriculum authors deliver content as Jupyter notebooks with the documented metadata extensions; an authoring console beyond JSON editing is out of scope for this version.
- The hosting environment can serve the application with the cross-origin headers required by browser-based Python interrupts; on environments where those headers cannot be set, the lab gracefully degrades runtime interrupt to runtime restart.
- The Code.org design system is the canonical UI source; Material UI is used only where the design system has retired components in favor of it.
- Notebooks are device-local in this version; accounts, cloud sync, and multi-user collaboration are out of scope.
- The mobile shell continues to gate service-worker registration as documented in its own conventions; the spec inherits that gate rather than overriding it.
- The bundled sample set is the eighteen notebooks named in the user description; future additions and removals are normal content work and do not require a spec change. For v1, every bundled sample ships with a curriculum-authored `metadata.goal` (FR-024a); samples without a goal MUST NOT be included in the v1 release artifact.
- The chat feature ships as experimental, with a learner-supplied endpoint and a URL-parameter API key; productizing chat (managed endpoints, account-bound keys) is a separate, later spec.
- Python execution targets the current Pyodide release line and its associated package set; non-Python kernels are out of scope.
- The lab coexists with the existing Python sandbox; the spec does not promise replacement or migration.

## Dependencies and constraints

- A browser-based Python runtime that ships a useful default package set and supports asynchronous user input and a runtime interrupt facility.
- A code-editor component with Python tokenization and theming that can render inline form widgets above the editor.
- A markdown renderer that supports GitHub-flavored markdown with safe HTML handling.
- A media player capable of YouTube and Vimeo embedding plus direct-file playback with adjustable playback rate.
- An OpenAI-compatible chat endpoint, supplied by the learner or curriculum author at use time.
- The studio app's existing lab-registry, route generation, localization, observability, theming, and design-system facilities.
- The mobile shell's preference store and system-browser plugin for native-only behaviors.

## Out of scope

- **AI chat cells are deferred to v2.** The jupyter-k12 chat cell shape is preserved as a parsed-but-non-functional placeholder (FR-012) so authored content does not break, but no chat network request is made in v1. v2 will reintroduce chat with district-admin allow-listing, curriculum-author-provided endpoints, and an explicit CTO-reviewable governance posture; learner-supplied URL keys are not a path forward and will not return.
- Authoring UI for markdown or video cells beyond editing notebook JSON; the in-app globals dialog is the only cell-metadata editor exposed in this version.
- Cloud sync, multi-device share, and account-bound notebooks.
- Multi-user, real-time collaboration on a notebook.
- Roster integrations (Clever, Google Classroom, Schoology) — the completion artifact (FR-046) is the v1 substitute, with integrations as a v2 candidate.
- Non-Python kernels and language servers.
- A desktop (Tauri or similar) build.
- Empty-folder UI, folder rename UI, drag-and-drop reorganization.
- Exporting a notebook to non-Jupyter formats (PDF, HTML, slides) — except the constrained Completion Artifact described in FR-046.
- Replacing or deprecating the existing Python sandbox.
- Streaks, hearts, energy, XP, daily-attendance gamification, or any mechanic that punishes mistakes or rewards attendance. The lesson-complete moment (User Story 10) is the only progression mechanic.

## Panel review notes (2026-05-21)

This spec was reviewed by a three-person panel — a designer with Duolingo student-led-learning experience, an EdTech designer with K-12 classroom deployment experience, and a recent high-school graduate giving learner-facing feedback. The following changes were made as a direct result of that review.

### Adopted

- **Cold open dropped into a welcome notebook, not the index.** Folder browsing was the cold open in jupyter-k12 and the panel was unanimous that it kills first-success time. User Story 1 was rewritten; SC-001 was rewritten as a three-tap-and-sixty-second target.
- **Folders renamed to a Continue / Assigned / Library structure in the chrome.** `metadata.folder` is preserved as the data shape (no churn for authors). User Story 5, FR-032, and FR-033 were rewritten. The student panelist's specific feedback ("I never navigated folders in any app, Schoology had them and I hated them") and the Duolingo panelist's vertical-path framing both pointed the same way.
- **Empathy error card promoted to P1, raw traceback demoted to a disclosure.** All three panelists flagged the original FR-010 "tabbed views including error" as the single most likely abandonment point. User Story 3 was promoted to P1 and rewritten around the error path; FR-010 was split into FR-010, FR-010a, FR-010b.
- **Single-action Try it, no default Run/Stop/Clear/tabs strip.** Duolingo panel framing, supported by the phone-keyboard reality the student panel raised.
- **Parameter widgets reframed as questions with author prompts.** A new optional `prompt:` key on `#@param` annotations carries the framing. The live-source-rewrite remains but is now visibly highlighted so it does not surprise the learner (the student panel's "horror movie" feedback).
- **Lesson goal metadata and a lesson-complete moment.** New User Story 10, new entities, new SC-011. No streaks, no hearts, no XP — the panel was explicit that those mechanics are hostile to debugging.
- **Shared-device session model.** New User Story 9, new FR-022/022a/028, new SC-013. The EdTech panel correctly identified this as the highest-impact silent failure in the original spec.
- **Teacher-visible completion artifact.** New User Story 11, FR-046/047, SC-014. Closes the account-less-v1 gap without re-introducing accounts.
- **AI chat cell deferred to v2.** All three panelists, for three different reasons (Duolingo: experimental banners do not ship to children; EdTech: URL-borne API keys are a procurement non-starter; student: it will be off for 99% of users so it is dead weight). FR-012/013 were rewritten as a parsed-but-disabled placeholder; chat moved into Out of Scope with a clear v2 framing.
- **Pre-staged Python runtime.** FR-014 softened to permit native bundling and IT pre-cache; new FR-014a "lightweight first lesson" mode protects SC-001 on cold caches; new SC-010 makes the classroom-scale runtime acquisition explicit. SC-003 was reframed as a per-device guarantee.
- **Pedagogical accessibility for IEPs.** FR-038a adds read-aloud, OpenDyslexic, line-spacing, and focus mode. These are not WCAG items; they are real classroom asks.
- **Join codes / QR replace raw GitHub URLs as the primary teacher-share surface.** FR-029a added; FR-029 retained as the underlying mechanism.
- **No PII collected from learners; session labels treated as PII for telemetry.** FR-043 broadened; FR-045 added.
- **Editor identifier autocomplete and phone-keyboard-friendly mode.** FR-007 broadened from "Python-aware editor" — the student panel's "war crime" feedback on phone typing without autocomplete was specific and correct.

### Declined, with reason

- **Hard lesson-tree locking (lock future lessons until prerequisites complete).** The Duolingo panel suggested no hard gates for K-12 to avoid frustration; we explicitly forbid locking. Future lessons remain tappable. The "current node pulses" affordance is permitted but not required in this spec.
- **Streaks, hearts, energy.** Declined for the reasons the Duolingo panel itself flagged: K-12 device access is a school decision, not a motivational one; hearts punish debugging, which is the learning activity.
- **Sub-teacher "I need help" mDNS network broadcast.** The EdTech panel suggested it as nice-to-have; it introduces a network surface the v1 lab does not otherwise need, and "Share with teacher" QR is sufficient for the substitute-teacher case. Revisit in v2.
- **`metadata.requires` capability gating.** EdTech panel suggestion; deferred because v1 chat is not present, video is the only network-required cell, and a single bool per notebook is sufficient until chat returns.
- **Renaming the "kitchen_sink.ipynb" sample.** The student panel's "a developer wrote this" feedback is correct, but the sample filenames are content not specification.

### Resolved: bundled samples will be backfilled with goals in v1

The earlier-open question on `metadata.goal` for the bundled samples is resolved in favor of **backfill in v1**. Reasoning: the eighteen samples are the cold-open content that every learner sees on day one; the lesson-complete moment (User Story 10) is one of the highest-leverage panel-driven additions; shipping the moment without its goal echo on the exact content the panel was redesigning around defeats the point. The backfill is content work, not engineering — short author-derived one-liners, with locale overrides where the cell-level `i18n` already exists for that locale. It parallelizes with the build and does not block any engineering path. See the new FR-024a and Assumption.

## Round 3 — Journey-picker home + seat consolidation (2026-05-21, append-only)

A curriculum-developer + K-12-teacher panel (K-6, 6-9, 9-12) reviewed the spec after the original UX panel. The product direction shifted in one structural way that warrants new requirements without rewriting in-flight work: **the Notebook journey is no longer the cold-open**. The mobile shell's existing seat picker (`/m/seats`) now flows into a **journey-picker home** that lists multiple journeys — at v1 launch, *How AI Makes Decisions* (the existing K-5 prototype, unchanged) and *Python Notebook* (new). The Notebook journey is reached **from** the picker, not in place of it.

The lab-internal session model already shipped via T011-T029 (`sessionStore`, `sessionRepo`, `SessionPicker`, IndexedDB composite-key). Rather than rip those out, the picker work **consumes the mobile shell's seat as the session identity** and the lab's session module becomes a thin adapter that exposes the same hooks (`useSession()`) backed by `useActiveSeat()` from `frontend/apps/studio/src/modules/ai-decisions-mobile/seats/`. No re-architecture; one adapter file replaces the picker UI and the session-creation path.

The following requirements and success criteria are additive. Numbering picks up after the existing FR-047 and SC-014.

### Additional user stories

#### User Story 12 — Journey-picker home (Priority: P1)

A seated learner lands on a home screen that lets them pick today's journey from a list of registered tiles. At v1 there are two tiles: AI Decisions and Notebook. The picker is the post-seat-selection landing for the mobile shell; deep links can bypass it.

**Independent Test**: With an active seat, navigate to `/m/home`, confirm both tiles render synchronously from local config (no network call), tap Notebook, confirm the Notebook journey opens.

**Acceptance scenarios**:

1. **Given** an active seat and a fresh cold launch, **When** the picker renders, **Then** all tiles are visible without a network round-trip; if the network is unreachable, the picker is fully functional.
2. **Given** the seat has an in-progress journey, **When** the picker renders, **Then** that journey's tile carries a `Continue · <progress>` chip and floats to the top of the list (single resume-hoist); other tiles render in author-declared order from the manifest.
3. **Given** the seat has completed a journey, **When** the picker renders, **Then** that tile carries a `Done · open <destination>` chip describing where tapping it will land (Library for Notebook; replay-at-final-node for AI Decisions).
4. **Given** the learner taps a tile, **When** the tile has an `entryRoute`, **Then** the picker navigates there directly without any intermediate confirmation step.
5. **Given** a deep link `/m/journey/notebook` (or `/m/journey/ai-decisions`), **When** the URL is opened cold, **Then** the seat picker still gates entry (if no seat) but the journey route is sticky across the seat-pick redirect and the learner lands on the journey, not on the picker.
6. **Given** the deep link includes `?lock=1`, **When** the journey is open, **Then** the bottom-back / system-back gesture does NOT return to the picker for the duration of the session — used by teachers pinning a journey for one class period.

#### User Story 13 — Notebook journey (Priority: P1)

Tapping the Notebook tile starts a four-node vertical-path journey that teaches the lab UX (Run, output, change a value, save) in ≤ 2 minutes. On completion, the existing mobile `UnitCompleteCelebration` (`frontend/apps/studio/src/modules/ai-decisions-mobile/celebration/`) plays with Notebook-flavored copy and the single CTA opens the lab Library.

**Independent Test**: With an active seat, tap the Notebook tile, traverse all four nodes, confirm celebration fires, confirm CTA opens the lab Library at `/app/projects/notebook/<channel-id>/edit`. Wall-clock budget ≤ 2 minutes on a mid-range device.

**Acceptance scenarios**:

1. **Given** the journey opens cold, **When** the first node renders, **Then** it pulses, the remaining three are dimmed below it on a vertical path, and a single primary action is visible without scrolling.
2. **Given** the learner runs a node's runnable cell, **When** the run succeeds, **Then** the node fills, a brief visual beat fires (reduced-motion respecting), and the next node pulses.
3. **Given** the four nodes are complete, **When** the celebration fires, **Then** the existing mobile `UnitCompleteCelebration` is reused with the copy *"You know how to use notebooks. Open the Library."* and the single CTA navigates to the lab Library, not to another notebook.
4. **Given** the learner re-taps the Notebook tile after completing the journey, **When** the picker resolves the tile state, **Then** it routes the learner straight into the lab Library; a *Replay tutorial* affordance is reachable from the lab Library's *Continue* row.

### Additional functional requirements

#### Picker contract

- **FR-040a**: The mobile shell MUST present a journey picker at `/m/home` as the post-seat-selection landing. Journeys MUST register via a manifest in `frontend/apps/studio/src/modules/mobile-home/journeys/<id>.journey.ts`; the picker MUST NOT hard-code journey identifiers. Adding a journey MUST NOT require code changes outside that directory and the seat-progress union type.
- **FR-040b**: Each journey manifest declares `{ id, title (i18n key), description (i18n key), icon (React component), entryRoute, progressSelector(seat), available?(seat), gradeBand?: 'K-5' | '6-9' | '9-12' | 'all' }`. The picker renders an explicit `(Grades K-5)` / `(Grades 6-9)` / `(Grades 9-12)` chip when `gradeBand` is set; the chip is factual metadata, not a gate (per 9-12 panel rejection of hard gating).
- **FR-040c**: A deep link of the form `/m/journey/<id>[?lock=1]` MUST open the named journey directly, bypassing the picker. The `lock=1` modifier prevents the bottom-back / system-back gesture from returning to the picker for the active session — used for teacher-pinned classroom flows.
- **FR-040d**: The picker MUST render synchronously from local config on cold open; no network call MAY be issued during picker render (parity with FR-022a's session-picker rule). Loading spinners on the picker home are explicitly forbidden in v1.
- **FR-040e**: The picker MUST support a teacher-locked single-tile mode where exactly one tile is visible (the pinned one) for the duration of a class. The mode is engaged via the `?lock=1` deep-link param (above) and/or a managed-device build flag from the IT pre-cache path (FR-014). No per-learner account is involved.
- **FR-040f**: The picker MUST support a per-deployment build flag that filters tiles by `gradeBand`. A K-2 deployment hides tiles whose `gradeBand` is `'6-9'` or `'9-12'`; a 6-9 deployment hides `'K-5'`. The default deployment shows all tiles with chips. The flag lives in the studio config (`SiteConfig`), not in learner state.

#### Seat consolidation (additive; supersedes the lab's session impl)

- **FR-022b**: The lab's existing `sessionStore` (T015) MUST be refactored into an adapter that exposes its current public hooks (`useSession()`, `useRequireSession()`) backed by the mobile shell's `useActiveSeat()` hook from `frontend/apps/studio/src/modules/ai-decisions-mobile/seats/useActiveSeat.ts`. The lab's `SessionPicker` (T072) MUST be removed in favor of the mobile shell's seat picker at `/m/seats`. No data migration is required because the lab is pre-launch.
- **FR-022c**: The mobile shell's `Seat` type in `frontend/apps/studio/src/modules/ai-decisions-mobile/seats/types.ts` MUST gain a `journeys: Record<JourneyId, JourneyProgress>` map. `JourneyProgress` becomes a discriminated union (kind: `'ai-decisions' | 'notebook'`). The existing top-level `JourneyProgress` is migrated to `journeys['ai-decisions']` by a one-shot pass in `seats/reconcile.ts`.
- **FR-022d**: IndexedDB notebook records (existing composite key `<sessionId>::<notebookId>`) become `<seatId>::<notebookId>`. The change is a rename inside the existing `sessionKey.ts` helpers; no schema migration ships pre-launch.
- **FR-045a**: The `seats/` module SHOULD be hoisted out of `ai-decisions-mobile/` into a shared module (suggested: `frontend/apps/studio/src/modules/seats/`) so it can be consumed by both the AI Decisions journey and the notebook lab without a cross-module reach. This is a refactor task, not a behavior change.

#### Empathy-card NameError suggestion (6-9 panel)

- **FR-010c**: The empathy card from FR-010a MUST surface a *"Did you mean `<symbol>`?"* hint when the raised exception is a `NameError` or `AttributeError` and a Levenshtein-1 match exists against Python builtins, current notebook globals, or imported names. Fallback to the plain summary when no match exists.

#### Teacher-artifact code inclusion (9-12 panel)

- **FR-046a**: The completion artifact (FR-046) MUST include cell source for code cells by default, because a teacher cannot grade Python work from output alone. The artifact's exclusion list narrows to: API keys (none in v1; defensive), the human-visible session label (the artifact uses the seat's color/avatar identifier, not the chosen label), and the `cdo` namespace. The earlier rule "MUST NOT include cell source" from `contracts/completion-artifact.md` is superseded.

#### Manual save and rolling artifact backup (9-12 panel)

- **FR-023a**: The lab MUST support a manual save keyboard shortcut (Ctrl-S / Cmd-S) that flushes immediately and surfaces a timestamped "saved 9:47:03" indicator. The shortcut is available wherever a cell is focused.
- **FR-046b**: The lab MUST generate a rolling-backup completion artifact on every autosave, stored in IndexedDB under a `lastBackup` key per notebook. The learner can recover it via a destructive "Show last backup" affordance in Settings.

### Additional entities

- **Journey** — a registered learning experience selectable from the picker. Carries `id`, i18n keys for title and description, an icon component, an entry route, an optional `gradeBand`, a progress-selector function, and an optional availability predicate.
- **JourneyManifest** — the static export of a `.journey.ts` file; the picker assembles its tile list by reading the manifest barrel.
- **JourneyProgress (union)** — discriminated by `kind`; `ai-decisions` variant matches the existing `JourneyProgress` shape in `seats/types.ts`; `notebook` variant tracks the four node-completion booleans and a `graduated` flag.

### Additional success criteria

- **SC-015**: The journey picker home renders all tiles in under one second on a mid-range Android cold start, with no network call.
- **SC-016**: The Notebook journey, from Notebook-tile tap to final-node celebration, completes in under two minutes on a mid-range device with the Pyodide runtime warm-cached.
- **SC-017**: A deep link `/m/journey/notebook` opened with no active seat completes the seat-pick flow and lands the learner on the journey (not the picker), preserving the deep-link target across the redirect.
- **SC-018**: A `?lock=1` magic URL pins the picker to a single tile for the duration of the session; back-navigation from the journey does not return to the picker.
- **SC-019**: With the K-2 deployment flag set, only `gradeBand: 'K-5'` and `gradeBand: 'all'` tiles render; with no deployment flag set, every registered tile renders with its grade-band chip.

### Out of scope (round 3)

- An in-app teacher dashboard for cart-aggregate progress (K-6 panel ask). v2 — the completion artifact (FR-046, FR-046a) and per-cart device-mode flag (FR-040f) are the v1 substitutes.
- Removing or hiding the K-5 AI Decisions tile by default for non-K-5 deployments — the grade-band chip and per-deployment filter are the levers; product chooses which to set per release.
- "Save image to camera roll" on PNG outputs (6-9 panel). Deferred to v2.
- A third "My notebooks" picker tile (9-12 panel split decision). The lab Library handles it; the picker stays small (two tiles plus optional Continue-floated entry).
- Hidden-Python K-2 mode where a code cell renders as just a slider and a picture (K-6 panel). Deferred to a follow-up curriculum spec.

### Round 3 panel notes

- **Adopted**: journey-picker home (US12), Notebook journey (US13), seat consolidation as additive adapter (FR-022b..022d), NameError "did-you-mean" (FR-010c), code-in-artifact (FR-046a), manual save shortcut (FR-023a), rolling artifact backup (FR-046b), gradeBand metadata + per-deployment filter (FR-040b, FR-040f), `?lock=1` magic URL (FR-040c, FR-040e), no-network on picker render (FR-040d).
- **Declined**: hard grade-band gating (chips not gates), third-tile "My notebooks" (Library handles it), in-app teacher dashboard (deferred), hidden-Python K-2 mode (deferred), "save to camera roll" (deferred), exclamation-mark celebration copy (kept declarative tone).
- **In-flight reconciliation**: T011-T029 already shipped the lab's session model. Rather than revert, FR-022b refactors it to an adapter on top of mobile seats. The lab's `SessionPicker` (T072) is removed in the new Phase 19 (see `tasks.md`); the lab keeps `useSession()` as the API but it's now an alias for `useActiveSeat()`.

#### Notebook journey content (4 nodes, std-lib only)

Author-supplied draft per the curriculum panel; lives under `frontend/apps/studio/src/modules/mobile-home/journeys/notebook/nodes/`. Goal text follows FR-024a and is locale-aware.

1. **`welcome-01-hello.ipynb`** — *"Run your first line of code."* One markdown ("Hi! Tap **Try it** to say hello.") + one code cell `print("Hello!")`. (Per curriculum panel round 2, drop the `{{NAME}}` substitution — the learner already named the seat.)
2. **`welcome-02-words-and-code.ipynb`** — *"See how words and code work together."* `print(2 + 2)` with a nudge to "try changing 2 to 5."
3. **`welcome-03-the-dial.ipynb`** — *"Use a dial to change your code."* A `#@param` slider rewriting `COUNT = 3` over a `print("*" * COUNT)` line, with the `prompt:` field "How many stars?"
4. **`welcome-04-saved.ipynb`** — *"Find your way back to your notebooks."* `print` of the current time, with markdown calling out the save chip and the Library tab; node-complete fires `UnitCompleteCelebration` and the CTA reads *"Open the Library"*.
