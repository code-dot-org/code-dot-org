import {execSync} from 'node:child_process';

/**
 * E2E stability gate: runs every test 5 times in a single Playwright session
 * using --repeat-each=5.  Workers run in parallel, so the wall-clock cost is
 * roughly one normal run rather than five sequential ones.
 *
 * CI=true activates the playwright.config.ts CI branch (github reporter,
 * retries=2, workers=100%).  Retries are left at their config value so
 * unexpected flakes surface in the output rather than being silently swallowed.
 */
const env = {...process.env, CI: 'true'};

execSync('npx playwright test --repeat-each=5', {stdio: 'inherit', env});
