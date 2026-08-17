# Footer

## What this is

This is the design system footer. It uses React and MUI. It is part of
the frontend component library.

## Relation to `dashboard` and `apps`

The `dashboard` and `apps` directories do not use this footer today.
This footer has no production use in `dashboard` or `apps`. Teams that
work in `dashboard` or `apps` can ignore this footer for now.

`dashboard` and `apps` use a different footer. That footer comes from
the legacy HAML and Rails codebase. See the [header README](../header/README.md)
for the reasons behind this gap. The same reasons apply to this
footer.

## Current usage

This footer already runs in other places. The marketing site uses this
footer. Some experimental apps use this footer.

## Next steps

The team will run a parity analysis on this footer before `dashboard`
or `apps` adopt it.

Keep this footer and the legacy footer in sync where possible. If a
change is easy to make in both footers, make it in both. Do not let
this footer lag behind by default.
