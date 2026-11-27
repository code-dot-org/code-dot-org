# Codemods

This directory contains automated code transformation scripts (codemods) for migrating code to use updated component APIs.

## Available Codemods

A component's codemod is deleted with its DSCO source, once no import
is left for it to rewrite.

### `chips-to-mui-chips.ts`

Moves `Chips` imports from `@code-dot-org/component-library/chips` to `MuiChips`. The props are unchanged, so only imports and `jest.mock` factories change. See `src/chips/CHIPS_MIGRATION_TO_MUI.md`.

**What it does:**

- Rewrites the default import (also as `{default as X}`) and the named `Chips` / `ChipsProps` imports to `MuiChips` / `MuiChipsProps`, keeping local names
- Adds a `MuiChips` key to `jest.mock`, `jest.doMock`, `vi.mock` and `vi.doMock` factories that return one object literal, copying the `default` or `Chips` value when it is a name or a function; any other value (`jest.fn()` would become a second, separate mock), a factory with both `default` and `Chips`, or a return inside a branch is reported instead
- Reports Enzyme string selectors that name `Chips` (`find('Chips')`, `find('.x Chips')`, `w?.find('Chips[name="x"]')`), namespace imports, re-exports and `require()` / `import()` of the entry point, for hand work
- Idempotent; parses `.ts` files with the `ts` parser

Build the package first with `yarn build`, then run it as shown under Usage.

## Usage

Codemods are one-off migration scripts. Run `jscodeshift` from the `component-library` package directory.

```bash
cd frontend/packages/component-library
TS_NODE_TRANSPILE_ONLY=true yarn jscodeshift \
  -t ./codemods/<codemod>.ts \
  --parser=tsx --extensions=js,jsx,ts,tsx --require ts-node/register \
  <path-to-files-or-directory>...
```

### Path Notes

- Paths are relative to the `component-library` package directory
- Use `../../../` to go up to the repo root, then navigate to your target files
- `--extensions=js,jsx,ts,tsx` processes all four file types
- Directories are processed recursively; several files, directories and
  globs may be given at once

## Dry Run

Add `--dry --print` before the paths to print the rewritten source without
writing any file.

## Output

The codemod will show:

- Number of files processed
- Number of files modified
- Number of files unmodified (nothing to rewrite)
- Number of errors (if any)
- Processing time

Example output:

```
Processing 6 files...
All done.
Results:
0 errors
4 unmodified
0 skipped
2 ok
Time elapsed: 0.971seconds
```

## Important Notes

1. **Always review changes**: The codemod makes automated transformations. Review the diff before committing.

2. **Backup your work**: Commit or stash your changes before running codemods on large codebases.

3. **Run tests**: After running a codemod, run your test suite to ensure everything still works.

4. **Manual fixes may be needed**: Some edge cases or complex prop expressions might require manual adjustment.

5. **Git workflow**: Consider running the codemod on a feature branch and creating a separate commit for the automated changes.
