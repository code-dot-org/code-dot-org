# @code-dot-org/e2e-tests

Playwright end-to-end test suite for studio.code.org

## Agent skill setup

The Cucumber→Playwright porting agents read the `playwright-best-practices`
skill. It is not vendored: it is pinned in `skills-lock.json` at the repo root
and restored on demand. Once per checkout, from the repo root:

    npx skills experimental_install

This materializes `.agents/skills/playwright-best-practices/` (gitignored). Bump
the pinned version with `npx skills update playwright-best-practices`.
