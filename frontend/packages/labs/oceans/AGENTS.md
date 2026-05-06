# oceans-lab agent notes

## Non-obvious constraints

### TFJS model co-location

`model.json` and `group1-shard1of1.bin` must stay together in `dist/assets/models/`.
The custom `emitModelAssets` Rollup plugin in `vite.config.ts` emits them explicitly
with fixed, hash-free filenames. Do not replace this plugin with `?url` imports —
Vite library mode inlines `?url` assets as `data:` URIs, and TFJS cannot resolve a
relative `.bin` path from a `data:` URI.

### React version compatibility

The component and `initAll` use `createRoot` (React 18+). `peerDependencies` still
declares `^16 || ^17 || ^18 || ^19` for backwards compat with `apps/`, which ships
React 16. Narrowing to `^18 || ^19` is deferred until `apps/` upgrades.

### Cross-workspace linking

`apps/package.json` references this package as `link:../frontend/packages/labs/oceans`
(not `portal:`). The `link:` protocol creates a plain symlink without resolving
transitive deps. `@code-dot-org/core` must stay in `devDependencies` (not
`dependencies`) because `apps/` cannot resolve `workspace:*` transitive deps.

### allowJs / checkJs

`tsconfig.app.json` has `allowJs: true` and `checkJs: false` while Phase 7.18 JS→TS
migration is in progress. Only the files already converted to `.ts`/`.tsx` are
type-checked. Do not flip `allowJs: false` until all JS files are converted (task 7.6).

### ESLint suppressions (deferred)

`eslint.config.mjs` suppresses several rules with `TODO` comments:

- `import-x/default`, `import-x/no-named-as-default-member` — re-enable after Phase 7.18
- `jsx-a11y/*` rules — fix in dedicated a11y pass (task 7.16)
- `import-x/no-cycle` — fix by breaking circular deps (task 7.17)

### Vite dev server host

`vite.config.ts` sets `server.allowedHosts: ['localhost-studio.code.org']` so the
standalone dev server can be accessed via the studio hostname alias.

## Commands

```bash
# dev server
yarn turbo run dev --filter=@code-dot-org/oceans-lab

# build (outputs dist/ for consumers)
yarn turbo run build --filter=@code-dot-org/oceans-lab

# tests
yarn turbo run test --filter=@code-dot-org/oceans-lab

# typecheck
yarn turbo run typecheck --filter=@code-dot-org/oceans-lab

# lint
yarn turbo run lint --filter=@code-dot-org/oceans-lab
```
