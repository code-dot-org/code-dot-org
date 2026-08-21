# @code-dot-org/aitutor

The AI Tutor chat panel, as a package: the tab a lab mounts in its resource
panel, which sees the student's project, answers questions about it, and can
hand back a set of file edits the student accepts or rejects.

Ported from the legacy bundle — `apps/src/aiTutor`, `apps/src/aichat` and
`apps/src/lab2/views/components/AiTutorChat.tsx` — with the studio couplings
turned into interfaces the host implements, so the panel also runs with **no
server**: against recorded fixtures, or against a developer's own API key
through a dev-only local proxy.

**Nothing is ported yet.** See [`specs/PLAN.md`](specs/PLAN.md) for the design,
the scope boundary, and the milestones.

## Where it plugs in

`frontend/packages/labs/base/src/resourcePanel/components/ResourcePanel.tsx`
already carries an `AiTutor` tab and a commented-out block naming the legacy
component. This package fills that hole; the call site is therefore already
fixed. See `specs/PLAN.md` §1.

## Transports

| Transport            | Needs                                 | Use                                 |
| -------------------- | ------------------------------------- | ----------------------------------- |
| `FixtureTransport`   | nothing                               | tests, and the standalone demo page |
| `DirectTransport`    | a key in the dev server's environment | trying real answers locally         |
| `DashboardTransport` | studio                                | production                          |

The dev proxy holds the key in the Vite dev server's node process; the browser
only ever talks to localhost. It does not mount in production builds, and it
runs **none** of the moderation the dashboard path runs. See `specs/PLAN.md` §7.
