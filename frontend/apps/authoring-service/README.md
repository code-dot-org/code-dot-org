# @code-dot-org/authoring-service

Local Node service for the Author Mode prototype: a file-backed draft store and
the HTTP/SSE API Studio's `/author` routes talk to. Prototype only — see
`frontend/docs/prototypes/author-mode.md` for the design it implements.

There is no Rails process. Curriculum comes from a read-only import of the
on-disk Levelbuilder serialization; edits accumulate as a `CurriculumChange`
log that a future Rails write adapter would consume.

## Running

```bash
yarn workspace @code-dot-org/authoring-service dev    # tsx watch
yarn workspace @code-dot-org/authoring-service start  # one shot
```

Listens on `http://localhost:3737`. Studio (port 3036) reaches it through a
Vite dev proxy at `/authoring-api`; CORS allows that origin directly too.

## Session state

Everything lives under `frontend/.authoring/sessions/default/` (gitignored) and
survives a restart:

```
curriculum.json          {version, courses, widgets, levelProperties}
changes.jsonl            append-only CurriculumChange log
chat.jsonl               append-only chat messages
widgets/<id>/widget.html widget source, written by the agent as normal code
widgets/<id>/meta.json   the WidgetDescriptor
publish-<timestamp>.json  artifacts from POST /api/publish
```

Single process, no locking. Every mutation writes through before it is reported
as applied.

## API

| Route                                         | Purpose                                          |
| --------------------------------------------- | ------------------------------------------------ |
| `GET /api/state`                              | `{version, courses, widgets}`                    |
| `GET /api/levels/:numericId/level_properties` | one-entry `LevelPropertiesMap` for LabHost       |
| `GET /api/levels/search?q=`                   | attachable existing levels, names only           |
| `GET /api/widgets/:id`                        | `{descriptor, html}`                             |
| `GET /api/events`                             | SSE `ServerEvent` stream, 25s heartbeat          |
| `POST /api/chat`                              | author message, starts an agent turn             |
| `GET /api/chat/log`                           | full chat history                                |
| `POST /api/changes`                           | direct manipulation; server stamps seq/at/actor  |
| `POST /api/tutor`                             | learner-time tutor turn, returns a `TutorAction` |
| `POST /api/publish`                           | build + persist the Levelbuilder change set      |

## Seams

The coding agent and the learner-time tutor are interfaces, not
implementations. `EchoAgentRunner` and `EchoTutorRunner` are placeholders; both
are constructed at one point at the top of `src/server.ts`.

`@code-dot-org/authoring` is resolved at boot rather than imported statically
(`src/authoring/bridge.ts`), so the service still serves state, widgets, chat
and the level catalog while that package is under construction. Curriculum
mutation, course import and level resolution report a clear error until it
builds. `src/authoring/model.ts` mirrors that package's types for the same
reason; both files carry the instructions for collapsing the seam.
