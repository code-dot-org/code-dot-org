# turbo/generators/

Turborepo code generators for scaffolding new packages and labs in the
`frontend/` workspace.

## Usage

Run from `frontend/`:

```bash
yarn turbo gen package   # scaffold a new TypeScript library under packages/<name>/
yarn turbo gen lab       # scaffold a new React lab under packages/labs/<name>/
```

Both generators prompt for a package name and description, then create all
scaffold files. The `lab` generator also registers the lab in Studio
(`labs.ts`, `getLabEntrypoint.ts`, `apps/studio/package.json`).

After generation, both generators automatically run:

1. `yarn install` — links the new workspace package
2. `yarn lint:fix` — formats generated files
3. `yarn release:dryrun` — verifies the scaffold builds, lints, and passes
   type-checking

## Convention coupling

`config.ts` and `templates/` are tightly coupled with
`docs/conventions/packages.md`. See `AGENTS.md` in this directory for the
rule.
