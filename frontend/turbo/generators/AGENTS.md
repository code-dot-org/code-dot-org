# turbo/generators/

Turborepo code generators for the `frontend/` monorepo.

## Convention coupling

`config.ts` (and all files in `templates/`) are tightly coupled with
`docs/conventions/packages.md`. They must always describe the same scaffold
structure.

**Rule:** When you change a template or `config.ts`, update
`docs/conventions/packages.md` too, and vice versa.
