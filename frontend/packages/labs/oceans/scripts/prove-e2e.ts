import {execSync} from 'node:child_process';

/**
 * E2E stability gate: runs the full Playwright suite 5 times in sequence.
 * Each pass runs with retries=0 so a single flake fails the run immediately.
 * Sequential execution avoids the parallel-tab focus-stealing that
 * --repeat-each=5 causes in Firefox headless.
 */
const env = {...process.env, CI: 'true'};

for (let pass = 1; pass <= 5; pass++) {
  process.stdout.write(`=== Pass ${pass}/5 ===\n`);
  execSync('npx playwright test --retries=0', {stdio: 'inherit', env});
}
