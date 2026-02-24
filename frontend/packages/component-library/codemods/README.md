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

## Usage

### Prerequisites

Run codemods from the `component-library` package directory:

```bash
cd frontend/packages/component-library
```

### Running the Button Codemod

Use the yarn script (run from `frontend/packages/component-library` directory):

```bash
yarn codemod:buttons ../../../apps/src/templates/courseOfferings
```

**Examples:**

1. **Transform a single file:**

   ```bash
   cd frontend/packages/component-library
   yarn codemod:buttons ../../../apps/src/templates/courseOfferings/courseCard/CourseOfferingCard.tsx
   ```

2. **Transform all files in a directory:**

   ```bash
   cd frontend/packages/component-library
   yarn codemod:buttons ../../../apps/src/templates/courseOfferings
   ```

3. **Transform multiple specific files:**
   ```bash
   cd frontend/packages/component-library
   yarn codemod:buttons ../../../apps/src/templates/courseOfferings/courseCard/*.tsx ../../../apps/src/templates/courseOfferings/filters/*.tsx
   ```

### Path Notes

- Paths are relative to the `component-library` package directory
- Use `../../../` to go up to the repo root, then navigate to your target files
- The codemod automatically processes `.js`, `.jsx`, `.ts`, and `.tsx` files
- Directories are processed recursively

### Direct Command (Alternative)

You can also run the codemod directly without the yarn script:

```bash
cd frontend/packages/component-library
TS_NODE_TRANSPILE_ONLY=true npx jscodeshift \
  -t ./codemods/button-to-mui-button.ts \
  --parser=tsx \
  --extensions=js,jsx,ts,tsx \
  --require ts-node/register \
  <path-to-files-or-directory>
```

## Dry Run

To see what changes would be made without actually modifying files, use the `--dry` flag:

```bash
cd frontend/packages/component-library
yarn codemod:buttons --dry ../../../apps/src/templates/courseOfferings
```

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
