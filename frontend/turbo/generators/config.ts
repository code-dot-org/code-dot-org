/**
 * Turborepo code generators for frontend/ packages.
 *
 * CONVENTION COUPLING: This file and its templates/ directory are tightly
 * coupled with docs/conventions/packages.md. When you update a template,
 * update docs/conventions/packages.md too, and vice versa.
 * See frontend/AGENTS.md for the enforcement rule.
 *
 *   yarn turbo gen package  — new TypeScript library under packages/<name>/
 *   yarn turbo gen lab      — new React lab under packages/labs/<name>/
 */
import {execSync} from 'node:child_process';
import type {PlopTypes} from '@turbo/gen';

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  // turbo sets getDestBasePath() to the workspace root (directory with turbo.json)
  const workspace = plop.getDestBasePath();

  // Post-generation tasks: install new package, format, then verify.
  const postGenerationActions: PlopTypes.ActionType[] = [
    () => {
      execSync('yarn install', {cwd: workspace, stdio: 'inherit'});
      return 'yarn install complete';
    },
    () => {
      execSync('yarn lint:fix', {cwd: workspace, stdio: 'inherit'});
      return 'yarn lint:fix complete';
    },
    () => {
      execSync('yarn release:dryrun', {cwd: workspace, stdio: 'inherit'});
      return 'yarn release:dryrun complete';
    },
  ];

  // ─── package generator ───────────────────────────────────────────────────
  plop.setGenerator('package', {
    description:
      'Scaffold a new TypeScript library package under packages/<name>/',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message:
          'Package name (kebab-case, e.g. my-utils — no @code-dot-org/ prefix):',
        validate: (value: string) => {
          if (!/^[a-z][a-z0-9-]*$/.test(value))
            return 'Must be kebab-case (lowercase, hyphens, start with a letter).';
          if (value.startsWith('@'))
            return 'Omit the @code-dot-org/ prefix — it is added automatically.';
          return true;
        },
      },
      {
        type: 'input',
        name: 'description',
        message: 'Short description:',
        validate: (v: string) =>
          v.trim().length > 0 || 'Description is required.',
      },
    ],
    actions: [
      {
        type: 'add',
        path: '{{turbo.paths.workspace}}/packages/{{name}}/package.json',
        templateFile: 'templates/package/package.json.hbs',
      },
      {
        type: 'add',
        path: '{{turbo.paths.workspace}}/packages/{{name}}/vite.config.ts',
        templateFile: 'templates/package/vite.config.ts.hbs',
      },
      {
        type: 'add',
        path: '{{turbo.paths.workspace}}/packages/{{name}}/tsconfig.json',
        templateFile: 'templates/package/tsconfig.json.hbs',
      },
      {
        type: 'add',
        path: '{{turbo.paths.workspace}}/packages/{{name}}/eslint.config.mjs',
        templateFile: 'templates/package/eslint.config.mjs.hbs',
      },
      {
        type: 'add',
        path: '{{turbo.paths.workspace}}/packages/{{name}}/.lintstagedrc.mjs',
        templateFile: 'templates/package/.lintstagedrc.mjs.hbs',
      },
      {
        type: 'add',
        path: '{{turbo.paths.workspace}}/packages/{{name}}/vitest.config.ts',
        templateFile: 'templates/package/vitest.config.ts.hbs',
      },
      {
        type: 'add',
        path: '{{turbo.paths.workspace}}/packages/{{name}}/src/index.ts',
        templateFile: 'templates/package/src/index.ts.hbs',
      },
      {
        type: 'add',
        path: '{{turbo.paths.workspace}}/packages/{{name}}/src/__tests__/index.test.ts',
        templateFile: 'templates/package/src/__tests__/index.test.ts.hbs',
      },
      {
        type: 'add',
        path: '{{turbo.paths.workspace}}/packages/{{name}}/.gitignore',
        templateFile: 'templates/package/.gitignore.hbs',
      },
      {
        type: 'add',
        path: '{{turbo.paths.workspace}}/packages/{{name}}/README.md',
        templateFile: 'templates/package/README.md.hbs',
      },
      // Studio integration — studio/package.json: add workspace dep after the
      // last @code-dot-org workspace:* entry (before non-@code-dot-org deps)
      {
        type: 'modify',
        path: '{{turbo.paths.workspace}}/apps/studio/package.json',
        pattern:
          /("@code-dot-org\/[^"]+": "workspace:\*"),(\n\s+")(?!@code-dot-org)/,
        template: '$1,\n    "@code-dot-org/{{name}}": "workspace:*",$2',
      },
      ...postGenerationActions,
    ],
  });

  // ─── lab generator ───────────────────────────────────────────────────────
  plop.setGenerator('lab', {
    description:
      'Scaffold a new React lab under packages/labs/<name>/ and register it in Studio',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message:
          'Lab name (kebab-case, e.g. dance — no -lab suffix; it is added automatically):',
        validate: (value: string) => {
          if (!/^[a-z][a-z0-9-]*$/.test(value))
            return 'Must be kebab-case (lowercase, hyphens, start with a letter).';
          if (value.endsWith('-lab'))
            return 'Omit the -lab suffix — it is added automatically.';
          return true;
        },
      },
      {
        type: 'input',
        name: 'description',
        message: 'Short description:',
        validate: (v: string) =>
          v.trim().length > 0 || 'Description is required.',
      },
    ],
    actions: [
      // Lab scaffold files
      {
        type: 'add',
        path: '{{turbo.paths.workspace}}/packages/labs/{{name}}/package.json',
        templateFile: 'templates/lab/package.json.hbs',
      },
      {
        type: 'add',
        path: '{{turbo.paths.workspace}}/packages/labs/{{name}}/vite.config.ts',
        templateFile: 'templates/lab/vite.config.ts.hbs',
      },
      {
        type: 'add',
        path: '{{turbo.paths.workspace}}/packages/labs/{{name}}/tsconfig.json',
        templateFile: 'templates/lab/tsconfig.json.hbs',
      },
      {
        type: 'add',
        path: '{{turbo.paths.workspace}}/packages/labs/{{name}}/tsconfig.app.json',
        templateFile: 'templates/lab/tsconfig.app.json.hbs',
      },
      {
        type: 'add',
        path: '{{turbo.paths.workspace}}/packages/labs/{{name}}/tsconfig.node.json',
        templateFile: 'templates/lab/tsconfig.node.json.hbs',
      },
      {
        type: 'add',
        path: '{{turbo.paths.workspace}}/packages/labs/{{name}}/eslint.config.mjs',
        templateFile: 'templates/lab/eslint.config.mjs.hbs',
      },
      {
        type: 'add',
        path: '{{turbo.paths.workspace}}/packages/labs/{{name}}/.lintstagedrc.mjs',
        templateFile: 'templates/lab/.lintstagedrc.mjs.hbs',
      },
      {
        type: 'add',
        path: '{{turbo.paths.workspace}}/packages/labs/{{name}}/src/App.tsx',
        templateFile: 'templates/lab/src/App.tsx.hbs',
      },
      {
        type: 'add',
        path: '{{turbo.paths.workspace}}/packages/labs/{{name}}/src/index.ts',
        templateFile: 'templates/lab/src/index.ts.hbs',
      },
      {
        type: 'add',
        path: '{{turbo.paths.workspace}}/packages/labs/{{name}}/src/main.tsx',
        templateFile: 'templates/lab/src/main.tsx.hbs',
      },
      {
        type: 'add',
        path: '{{turbo.paths.workspace}}/packages/labs/{{name}}/index.html',
        templateFile: 'templates/lab/index.html.hbs',
      },
      {
        type: 'add',
        path: '{{turbo.paths.workspace}}/packages/labs/{{name}}/.gitignore',
        templateFile: 'templates/lab/.gitignore.hbs',
      },
      {
        type: 'add',
        path: '{{turbo.paths.workspace}}/packages/labs/{{name}}/README.md',
        templateFile: 'templates/lab/README.md.hbs',
      },
      {
        type: 'add',
        path: '{{turbo.paths.workspace}}/packages/labs/{{name}}/vitest.config.ts',
        templateFile: 'templates/lab/vitest.config.ts.hbs',
      },
      {
        type: 'add',
        path: '{{turbo.paths.workspace}}/packages/labs/{{name}}/src/__tests__/App.test.tsx',
        templateFile: 'templates/lab/src/__tests__/App.test.tsx.hbs',
      },
      // Studio integration — labs.ts: append name to AVAILABLE_LABS array
      {
        type: 'modify',
        path: '{{turbo.paths.workspace}}/apps/studio/src/modules/labs/config/labs.ts',
        pattern: /(export const AVAILABLE_LABS = \[[^\]]*?)(\] as const;)/,
        template: "$1, '{{name}}'$2",
      },
      // Studio integration — getLabEntrypoint.ts: append lazy import entry
      {
        type: 'modify',
        path: '{{turbo.paths.workspace}}/apps/studio/src/modules/labs/router/getLabEntrypoint.ts',
        pattern: /(const LabEntrypoints: LabEntrypointMap = \{[\s\S]*?)(\};)/,
        template:
          "$1  ['{{name}}']: lazy(() => import('@code-dot-org/{{name}}-lab')),\n$2",
      },
      // Studio integration — studio/package.json: add workspace dep after the
      // last @code-dot-org workspace:* entry (before non-@code-dot-org deps)
      {
        type: 'modify',
        path: '{{turbo.paths.workspace}}/apps/studio/package.json',
        pattern:
          /("@code-dot-org\/[^"]+": "workspace:\*"),(\n\s+")(?!@code-dot-org)/,
        template: '$1,\n    "@code-dot-org/{{name}}-lab": "workspace:*",$2',
      },
      ...postGenerationActions,
    ],
  });
}
