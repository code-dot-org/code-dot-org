# Header

## What this is

This is the design system header. It uses React and MUI. It is part of
the frontend component library.

## Relation to `dashboard` and `apps`

The `dashboard` and `apps` directories do not use this header today.
This header has no production use in `dashboard` or `apps`. Teams that
work in `dashboard` or `apps` can ignore this header for now.

`dashboard` and `apps` use a different header today. That header is the
legacy header. The legacy header comes from HAML and Rails. A level
file injects global JavaScript for the legacy header. Many labs call
functions from that global JavaScript. These functions change buttons
and move page elements. A move to this header must port these
functions first. Porting these functions carries risk. This is why the
legacy header still runs in `dashboard` and `apps`.

## Current usage

This header already runs in other places. Some experimental apps use
this header. Teams can A/B test this header on a Vite route on
staging today. A production rollout on that route is coming soon.

## Next steps

The team will run a parity analysis on this header. The analysis will
compare this header to the legacy header. The team will do this
analysis before `dashboard` or `apps` adopt this header.

Keep this header and the legacy header in sync where possible. If a
change is easy to make in both headers, make it in both. Do not let
this header lag behind by default.
