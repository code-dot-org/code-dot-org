import {execSync} from 'node:child_process';

/**
 * E2E stability gate: runs the full Playwright suite 5 times in sequence.
 * Each pass runs with retries=0 so a single flake fails the run immediately.
 * Sequential execution avoids the parallel-tab focus-stealing that
 * --repeat-each=5 causes in Firefox headless.
 *
 * On failure, prints `Pass N/5 failed` to stderr before rethrowing — so the
 * CI log lands a single, scannable line right next to the Playwright output
 * instead of forcing readers to count `=== Pass N/5 ===` headers.
 */
const env = {...process.env, CI: 'true'};

for (let pass = 1; pass <= 5; pass++) {
  process.stdout.write(`=== Pass ${pass}/5 ===\n`);
  try {
    execSync('npx playwright test --retries=0', {stdio: 'inherit', env});
  } catch (err) {
    process.stderr.write(`Pass ${pass}/5 failed\n`);
    throw err;
  }
}
