# Tasks: frontend-docs-truth-pass

## 1. Rulings

- [ ] 1.1 Record owner ruling: write `docs/conventions/tech.md` vs repoint
      the AGENTS row (default: write it)
- [ ] 1.2 Record owning-team ruling on `ailab` (register vs park; default:
      label current state in AGENTS)

## 2. Workspace-level docs

- [ ] 2.1 Reconcile `frontend/README.md` (studio status, apps list,
      package list) and `frontend/AGENTS.md` (structure block) against
      `ls`; make the two agree
- [ ] 2.2 Write `docs/conventions/tech.md` per ruling 1.1 (meta tag,
      basepath lockstep, `vite_typescript_tag`, SiteConfig pointer)
- [ ] 2.3 Scope the `"type": "module"` rule and qualify the peer-deps rule
      in `docs/conventions/packages.md` + `AGENTS.md`
- [ ] 2.4 Fix route paths in `packages.md`, studio README, music README

## 3. Package docs

- [ ] 3.1 Rewrite core README API example against the shipped client;
      remove phantom transport/mode references from both api READMEs
- [ ] 3.2 Fix MUI augmentation paths in MIGRATION_STATUS, the
      design-system skill, and studio's `mui.d.ts` header; delete the
      manual-sync workflow text
- [ ] 3.3 component-library README/CONTRIBUTING: Jest→Vitest, component
      dir layout, stories location + storybook app pointer; add `footer`
      row to MIGRATION_STATUS
- [ ] 3.4 users README: move unshipped surface under a "Planned" heading
- [ ] 3.5 studio `docs/architecture.md`: align the React-alias paragraph
      with the actual `vite.config.ts`

## 4. Validation

- [ ] 4.1 Grep-verify no forbidden strings remain (`/app/projects`,
      `httpTransport`, `types.d.ts` augmentation path, `Jest` in
      component-library docs, `tech.md` if ruling 1.1 chose repoint)
- [ ] 4.2 Diff structure listings against `ls` output; attach to PR
