# Documentation evidence

Agent-maintained verification records for docs pages. Disposable.

Each file mirrors a page path: `.docs-evidence/guide/getting-started/sign-in.json`
corresponds to `docs/guide/getting-started/sign-in.md`. Validated against
`schema.json` by `yarn evidence:check` in `frontend/apps/docs/`.

Fields: sources, tests, routes, flags, journey, verification, screenshots,
unresolved. See `schema.json` for the full contract.

Do not edit by hand. Agents regenerate these during investigation.
