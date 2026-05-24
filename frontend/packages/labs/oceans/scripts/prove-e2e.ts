import {execSync} from 'node:child_process';

/**
 * E2E stability gate: 5 sequential Playwright passes, retries=0, so any
 * flake fails fast. Sequential avoids Firefox-headless focus-stealing.
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
