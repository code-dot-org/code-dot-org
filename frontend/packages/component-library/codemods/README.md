# Codemods

This directory contains automated code transformation scripts (codemods) for migrating code to use updated component APIs.

## Available Codemods

### `dialog-to-mui-dialog.ts`

Moves `Dialog` and `CustomDialog` imports from `@code-dot-org/component-library/dialog` to `MuiDialog` and `MuiCustomDialog`. The props are unchanged, so only imports and `jest.mock` factories change. See `src/dialog/DIALOG_MIGRATION_TO_MUI.md`.

**What it does:**

- Rewrites default and named imports, including the `*Props` types, keeping local names
- Adds the `Mui` keys to `jest.mock` factories
- Reports Enzyme string selectors and import shapes it cannot rewrite
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
