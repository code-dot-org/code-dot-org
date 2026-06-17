#!/usr/bin/env node
import {execSync} from 'node:child_process';
import {mkdirSync, rmSync} from 'node:fs';
import {resolve} from 'node:path';

/**
 * Local-only visual-test stability gate. Generates ephemeral Playwright
 * baselines, re-runs the visual projects 5x against them, then removes the
 * tmp dir on exit. VISUAL_PROVIDER=playwright registers the visual-* projects
 * (see visualProjects) and routes visualCheck to the native screenshot
 * backend.
 *
 * Invoked from a package that consumes @code-dot-org/playwright-support/visual,
 * via its `test:visual:prove` script — `npx playwright test` resolves the
 * package's own playwright.config.ts from the current working directory.
 */
const baselineDir = resolve('e2e/tmp');
const env = {...process.env, VISUAL_PROVIDER: 'playwright'};

try {
  mkdirSync(baselineDir, {recursive: true});
  execSync('npx playwright test --grep @visual --update-snapshots', {
    stdio: 'inherit',
    env,
  });
  execSync('npx playwright test --grep @visual --repeat-each=5', {
    stdio: 'inherit',
    env,
  });
} finally {
  rmSync(baselineDir, {recursive: true, force: true});
}
