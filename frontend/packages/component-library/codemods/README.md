# Codemods

This directory contains automated code transformation scripts (codemods) for migrating code to use updated component APIs.

## Available Codemods

### `button-to-mui-button.ts`

Transforms `Button` and `LinkButton` components from `@code-dot-org/component-library/button` to MUI's `Button` and `IconButton` components.

**What it does:**

- Replaces `<Button>` and `<LinkButton>` with `<MuiButton>` and `<MuiIconButton>`
- Transforms props to MUI-compatible props (e.g., `buttonStyle` → `variant`, `buttonColor` → `color`)
- Handles icon props (`iconLeft`, `iconRight`, `icon`) and converts them to MUI's `startIcon`/`endIcon` or children
- Preserves pending state, analytics callbacks, and other custom props
- Updates imports automatically
- Handles both regular buttons and icon-only buttons

### `dialog-to-mui-dialog.ts`

Moves `Dialog` and `CustomDialog` imports from `@code-dot-org/component-library/dialog` to `MuiDialog` and `MuiCustomDialog`. The props are unchanged, so only imports and `jest.mock` factories change. See `src/dialog/DIALOG_MIGRATION_TO_MUI.md`.

**What it does:**

- Rewrites default and named imports, including the `*Props` types, keeping local names
- Adds the `Mui` keys to `jest.mock` factories
- Reports Enzyme string selectors and import shapes it cannot rewrite
- Idempotent; parses `.ts` files with the `ts` parser

Build the package first via `yarn build`

```bash
TS_NODE_TRANSPILE_ONLY=true yarn jscodeshift -t ./codemods/dialog-to-mui-dialog.ts \
  --parser=tsx --extensions=js,jsx,ts,tsx --require ts-node/register [--dry --print] <path>
```

## Usage

Codemods are one-off migration tools, so they have no `package.json`
scripts. Run `jscodeshift` from the `component-library` package directory,
which has it and `ts-node` as dev dependencies:

```bash
cd frontend/packages/component-library
TS_NODE_TRANSPILE_ONLY=true yarn jscodeshift \
  -t ./codemods/button-to-mui-button.ts \
  --parser=tsx --extensions=js,jsx,ts,tsx --require ts-node/register \
  <path-to-files-or-directory>...
```

Point `-t` at the codemod to run. `TS_NODE_TRANSPILE_ONLY=true` skips type
checking the codemod itself; `--require ts-node/register` lets `jscodeshift`
load a `.ts` transform.

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
- Number of files unmodified (no Button/LinkButton found)
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

## How It Works

The codemod uses:

- **jscodeshift**: For parsing and transforming JavaScript/TypeScript code
- **ts-node**: For running TypeScript codemod files
- **Shared logic**: The codemod imports `transformButtonPropsCore` from `src/button/buttonPropsToMuiCore.ts` to ensure consistent prop transformation logic between runtime and codemod

The transformation process:

1. Parses the source file into an AST (Abstract Syntax Tree)
2. Finds all `Button` and `LinkButton` imports and usages
3. Extracts props from JSX attributes
4. Transforms props using the shared core logic
5. Reconstructs JSX with `MuiButton`/`MuiIconButton` and transformed props
6. Updates imports to use MUI components
7. Writes the transformed code back to the file
