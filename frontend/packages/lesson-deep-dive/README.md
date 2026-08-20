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
   `localhost`. Public DNS resolves that hostname to 127.0.0.1. Cookies ignore
   the port but not the hostname, so the browser attaches the dashboard
   session cookie to the shell's proxied requests.
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

`index.html` has no `csrf-token` meta tag, unlike the Rails layout. Both modes
therefore get the token from `AuthenticityTokenStore`'s `GET /get_token`
fallback: a fixture answers it in msw mode, and the proxied,
session-authenticated Rails answers it in dashboard mode. A tag with an invented token
would be worse than none. `AuthenticityTokenStore` caches the first token it
reads, and real Rails answers an invented token with a 422 on every write.

`src/dev/cdo-ambient.d.ts` declares the `@cdo/*` modules the shell imports, so
`yarn typecheck` never crawls apps' type graph.

### Backend

In dashboard mode, `vite.config.ts` proxies the route prefixes that the
feature calls to `localhost-studio.code.org:3000`; `dashboardProxyPrefixes`
lists them. The proxy does not set `changeOrigin`, and that is deliberate.
Rails compares the `Origin` header with `request.base_url`, which it derives
from `Host`. A rewritten `Host` fails that check, and every write returns a 422.

The endpoints are user-scoped. Some also require the AI-Tutor experiments for
the signed-in student. Read the controller's authorization before you debug a 403.

In msw mode, `src/dev/mocks.ts` registers the same endpoints with
`@code-dot-org/core`'s MSW registry, so the real `HttpClient` calls run
unmodified in either mode. The podcast loop is the most heavily faked surface:
for `generate_podcast` and `retrieve_podcast_from_s3`, the mocks return a
one-second silent WAV in place of synthesized audio. In this mode
`localhost:5173` works; no cookies are involved.

The proxy is registered under `command === 'serve'` in both modes. In msw
mode, the service worker answers in the page before the network, so the proxy
only sees requests that the fixtures do not cover.

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
