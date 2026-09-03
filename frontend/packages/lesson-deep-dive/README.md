# @code-dot-org/lesson-deep-dive

Post-lesson review flow for AI Tutor+ students.

The feature's source still lives at `apps/src/aiTutor/views/lessonDeepDive/`.
This package currently ships nothing; it hosts a dev shell that renders that
code in a browser without Rails and without webpack, ahead of moving the views
in.

## Dev shell

The shell has two modes. The default mode talks to a local Rails dashboard
through the Vite proxy. `VITE_API_MODE=msw` serves fixtures and needs no
backend.

```bash
yarn dev                        # dashboard mode; needs Rails, see below
VITE_API_MODE=msw yarn dev      # mocked mode; http://localhost:5173/
```

Dashboard mode has three prerequisites:

1. Start Rails: run `bin/dashboard-server` from the repo root.
2. Browse the shell at `http://localhost-studio.code.org:5173`, not
   `localhost`. That hostname is public DNS for 127.0.0.1, and cookies ignore
   the port but not the hostname, so the Rails session cookie rides the
   proxied requests.
3. Sign in as a student at `http://localhost-studio.code.org:3000` first. The
   shell has no sign-in flow of its own; it borrows that session.

In Studio the flow is gated behind the `lesson-tutor` and
`lesson-tutor-challenge` experiments. The shell turns both on by default —
running it is already the decision to look at the feature. Knobs:

| Parameter                    | Effect                                                                                                 |
| ---------------------------- | ------------------------------------------------------------------------------------------------------ |
| `?enableExperiments=foo,bar` | turns on further experiments, on top of the two the feature needs                                      |
| `?displayName=Ada`           | greeting name; absent renders the "friend" fallback Studio shows until `/api/v1/users/current` returns |

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

`index.html` has no `csrf-token` meta tag, so both modes take
`AuthenticityTokenStore`'s `GET /get_token` fallback: a fixture in msw mode,
the proxied Rails in dashboard mode. An invented token in a tag would be worse
than none — the store caches the first token it reads, and Rails answers it
with a 422.

`src/dev/cdo-ambient.d.ts` declares the `@cdo/*` modules the shell imports, so
`yarn typecheck` never crawls apps' type graph.

### Backend

In dashboard mode, `vite.config.ts` proxies the route prefixes the feature
calls (`dashboardProxyPrefixes`) to `localhost-studio.code.org:3000`. No
`changeOrigin`: Rails checks `Origin` against `Host`, and a rewritten `Host`
makes every write a 422.

The endpoints are user-scoped, and some require the AI-Tutor experiments for
the signed-in student. Read the controller's authorization before you debug a 403.

In msw mode, `src/dev/mocks.ts` registers the same endpoints with
`@code-dot-org/core`'s MSW registry, so the real `HttpClient` calls run
unmodified in either mode. The podcast loop is the most heavily faked surface:
the mocks return a one-second silent WAV in place of synthesized audio. Plain
`localhost:5173` works here; no cookies are involved.

The page payload is a fixture in both modes. Studio embeds
`lessonDeepDiveData` server-side in the HTML
(`script[data-lessondeepdivedata]`, from `LessonsController#tutor`), and no
JSON endpoint exists to proxy. `src/dev/fixtures.ts` holds a payload harvested
from a local Rails dashboard rather than an invented one.

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

### Teacher gallery

`gallery.html` is a second dev entry, alongside the student flow at
`index.html`. It renders the Tutor+ project gallery — the teacher-facing
view of submitted challenge work — by mounting `TutorGalleryPage`, the same
page component the Rails page's webpack entry mounts
(`apps/src/sites/studio/pages/lessons/tutor_gallery.js`). Both modes work
the same way as above:

```bash
yarn dev                        # http://localhost-studio.code.org:5173/gallery.html
VITE_API_MODE=msw yarn dev      # http://localhost:5173/gallery.html
```

`?viewerRole=teacher|owner|peer` (default `teacher`) picks the project
page's layout when msw mode serves `GET /challenge_responses/:id`: teacher
gets the AI assessment panel, owner gets just their feedback, peer gets
neither. In dashboard mode this is decided server-side from who is signed
in, not by the query string.

Unlike the student flow's page payload, the gallery's bootstrap comes from a
real JSON endpoint: `TutorGalleryPage` fetches
`GET <lesson path>/tutor/gallery_data` before mounting `ChallengeGallery`,
in both modes — msw mode serves `TUTOR_GALLERY_DATA`, dashboard mode proxies
the request to Rails. `?script=` (default `aif1-2025`) and
`?lessonPosition=` (default `1`) pick the lesson path; msw mode ignores
both and always serves the fixture regardless of the lesson path it was
asked for.

Dashboard mode has one prerequisite beyond the student flow's: sign in as a
**teacher** whose section has students with final challenge submissions. If
the endpoint fails for any reason — the local Rails checkout predates it,
the script/lesson doesn't resolve, or the session is signed out — there is
no fixture fallback any more: `TutorGalleryPage` shows the same "We
couldn't load the gallery" line `ChallengeGallery` shows for a failed
`/challenge_responses` fetch. The msw fixture's unit and section ids are
invented, not harvested, and almost certainly do not match a real
teacher's — `GET /challenge_responses?section_id=` authorizes against
`Section.find(params[:section_id])`, so a mismatched id 403s in dashboard
mode.

`evaluation_result` only exists on a response once the async AI evaluation
job has run (`EvaluateChallengeResponseJob`), which nothing in the dev shell
or a fresh dashboard seed triggers on its own. The msw teacher fixture is
the reliable way to see the scored AI Assessment panel; hitting it in
dashboard mode means finding or waiting on a response the job has already
evaluated.

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
