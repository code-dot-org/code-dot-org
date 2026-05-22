import {execSync} from 'node:child_process';
import {mkdirSync, rmSync} from 'node:fs';
import {resolve} from 'node:path';

/**
 * Local-only visual-test stability gate. Generates ephemeral PW baselines,
 * re-runs the visual project 5x against them, cleans tmp dir on exit.
 * VISUAL_PROVIDER=playwright registers the visual project + selects the
 * native PW screenshot backend in fixtures/visual/index.ts.
 */
const baselineDir = resolve('e2e/tmp');
const env = {...process.env, VISUAL_PROVIDER: 'playwright'};

try {
  mkdirSync(baselineDir, {recursive: true});
  execSync('npx playwright test --project=visual --update-snapshots', {
    stdio: 'inherit',
    env,
  });
  execSync('npx playwright test --project=visual --repeat-each=5', {
    stdio: 'inherit',
    env,
  });
} finally {
  rmSync(baselineDir, {recursive: true, force: true});
}
