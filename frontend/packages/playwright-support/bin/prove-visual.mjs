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
 * Baselines land in .visual-baselines/ (matching the snapshotPathTemplate in
 * visualProjects), so this works identically regardless of each package's
 * testDir setting.
 */
const baselineDir = resolve('.visual-baselines');
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
