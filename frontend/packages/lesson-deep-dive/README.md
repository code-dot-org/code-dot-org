# @code-dot-org/lesson-deep-dive

Post-lesson review flow for AI Tutor+ students.

The feature's source still lives at `apps/src/aiTutor/views/lessonDeepDive/`.
This package currently ships nothing; it hosts a dev shell that renders that
code in a browser without Rails and without webpack, ahead of moving the views
in.

## Dev shell

```bash
yarn dev            # http://localhost:5173/?enableExperiments=lesson-tutor
```

The container returns `null` unless the `lesson-tutor` experiment is on, so the
query parameter is required. Other knobs:

| Parameter                                     | Effect                                                                                                 |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `?enableExperiments=lesson-tutor`             | required — gates the whole flow                                                                        |
| `?enableExperiments=…,lesson-tutor-challenge` | adds the whiteboard/video challenge modality                                                           |
| `?displayName=Ada`                            | greeting name; absent renders the "friend" fallback Studio shows until `/api/v1/users/current` returns |

### Prerequisite

`@cdo/generated-scripts/sharedConstants` resolves to `apps/generated-scripts/`,
which is gitignored and produced by apps' Ruby codegen. Run a `yarn build` in
`apps/` (or any task that regenerates it) once before `yarn dev`, or the server
cannot resolve it.

### How it resolves apps code

`vite.config.ts` aliases `@cdo/apps/*`, `@cdo/static/*`,
`@cdo/generated-scripts/*` and `@codebridge/*` at their real locations, under
`command === 'serve'` only. Build mode is untouched, so `dist/` is byte for byte
what it was before the dev shell existed.

Three modules are stubbed in `src/dev/stubs/`, ahead of the broad alias:

| Module                                        | Why                                                                                                           |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `@cdo/apps/util/experiments`                  | `apps/src/util/experiments.js` is CJS-in-ESM (`require()` + `module.exports`) and throws outside webpack      |
| `@cdo/apps/metrics/AnalyticsReporter`         | same CJS failure through `StatsigReporter`, constructs a reporter at import time, and would send real traffic |
| `@cdo/apps/lab2/views/components/AiTutorChat` | wraps aichat's `ChatWorkspace`, which registers reducers into apps' global store at import time               |

Everything else — `util/HttpClient`, `util/reduxHooks`, `apps/utils`,
`templates/SafeMarkdown`, `aichat/aichatApi`, `jsonVideo/TutorVideo`,
`aiTutor/hooks/useAiTutorModelParameters`, the whole sketchlab
`ReactFlowCanvas` closure — loads the real apps file.

Two things the config has to get right or nothing renders:

- `resolve.dedupe` for React, Redux, MUI and Emotion. `apps/node_modules` and
  `frontend/node_modules` hold physically distinct copies of React 18.3.1.
- `css.preprocessorOptions.scss.loadPaths` pointing at `shared/css`. The
  sketchlab SCSS does bare `@import 'color'`, which webpack resolves through
  `sassOptions.includePaths`.

`src/dev/nodeShims.ts` restates the Node globals webpack's `ProvidePlugin`
gives apps' bundles; `@code-dot-org/redactable-markdown` needs `process`.
`index.html` carries the `csrf_meta_tags` the Rails layout emits, because
`AuthenticityTokenStore` reads that tag and otherwise falls back to
`GET /get_token`; without it every write the feature makes fails before it is
sent.

`src/dev/cdo-ambient.d.ts` declares the `@cdo/*` modules the shell imports, so
`yarn typecheck` never crawls apps' type graph.

### Backend

`src/dev/mocks.ts` registers the dashboard endpoints the feature calls with
`@code-dot-org/core`'s MSW registry, so the real `HttpClient` calls run
unmodified. `src/dev/fixtures.ts` holds a `lessonDeepDiveData` payload
harvested from a local Rails dashboard rather than an invented one.

The wire shape differs from `LessonDeepDiveData` in
`apps/src/aiTutor/views/lessonDeepDive/types.ts`: Rails never sends
`practiceProblems` or `nextLessonUrl`, sends `objectives[].id` and
`vocabulary[].id` as integers where the type says string, and adds
`question_text`, `student_response` and `aiReasoning` to each
`assessmentAnalysis` entry. `src/dev/fixtures.ts` types what is actually sent.

Regenerate the payload by loading the real page as a signed-in student and
reading `script[data-lessondeepdivedata]`. Rebuilding it from
`LessonsController#tutor` in `rails runner` is easy to get subtly wrong —
`unitLabel` comes from the unit-group context, not the lesson.

### Styling, and what it is not

The shell uses the same foundation as every other package dev host: MUI's
`CssBaseline`, the `codeai-next` MUI theme, and the `component-library-styles`
token sheets, with webfonts from `@code-dot-org/fonts`.

That is deliberately not what Studio loads. Studio renders these components
inside a Rails page carrying Bootstrap 3 and application.css, whose body
typography and global `button` skin this feature partly inherits rather than
declares. So the shell is a development tool, not a fidelity reference:
component behaviour, data flow and layout are faithful, appearance is close but
not authoritative.

Check anything appearance-critical in Studio. Two known gaps: text the feature
does not size itself picks up MUI's scale rather than Studio's 13px/18px, and
`AiTutorChat` is a stub that does not resemble the real component at all.
