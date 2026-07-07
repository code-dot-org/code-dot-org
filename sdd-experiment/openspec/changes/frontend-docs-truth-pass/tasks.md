# Tasks: frontend-docs-truth-pass

## 1. Rulings (non-blocking — apply the stated default and proceed)

- [ ] 1.1 Note in the PR description that `docs/conventions/tech.md` was
      written per the default; an owner may rule to repoint instead
- [ ] 1.2 Label `ailab` current state in AGENTS (vendored, 0.0.52,
      unregistered); note that a register-vs-park ruling may supersede

## 2. Workspace-level docs

- [ ] 2.1 Reconcile `frontend/README.md` (studio status, apps list,
      package list) and `frontend/AGENTS.md` (structure block) against
      `ls`; make the two agree
- [ ] 2.2 Write `docs/conventions/tech.md` with the three required
      sections named in the proposal (meta-tag contract, entrypoint
      hookup, basepath lockstep) plus a pointer to
      `packages/core/docs/architecture.md` for SiteConfig internals
- [ ] 2.3 Scope the `"type": "module"` rule and qualify the peer-deps rule
      in `docs/conventions/packages.md` + `AGENTS.md`
- [ ] 2.4 Fix route paths in `packages.md`, studio README, music README

## 3. Package docs

- [ ] 3.1 Rewrite core README API example against the shipped client;
      remove phantom transport/mode references from both api READMEs
- [ ] 3.2 Fix MUI augmentation paths in
      `frontend/packages/component-library/MIGRATION_STATUS.md:76`,
      `.agents/skills/design-system/SKILL.md:39`, and
      `frontend/apps/studio/src/types/mui.d.ts` header (real source:
      `src/themes/code.org/muiAugmentation.ts`); delete the manual-sync
      workflow text in all three
- [ ] 3.3 component-library README/CONTRIBUTING: Jest→Vitest, component
      dir layout, stories location + storybook app pointer; add `footer`
      row to MIGRATION_STATUS
- [ ] 3.4 users README: move unshipped surface under a "Planned" heading
- [ ] 3.5 studio `docs/architecture.md`: rewrite the React-alias
      paragraph to describe the actual `vite.config.ts` (dedupe-only;
      singleton via hoisting); do not add an alias

## 4. Validation

- [ ] 4.1 Grep-verify no forbidden strings remain (`/app/projects`,
      `httpTransport`, `types.d.ts` augmentation path, `Jest` in
      component-library docs; add `tech.md` to the list only if an
      owner overrode 1.1 to repoint)
- [ ] 4.2 Diff structure listings against `ls` output; attach to PR
