import {mergeTests} from '@playwright/test';
import {test as eyesTest} from '@applitools/eyes-playwright/fixture';

export const test = mergeTests(eyesTest);

// eslint-disable-next-line no-empty-pattern
test.beforeEach(({}, testInfo) => {
  if (testInfo.tags.includes('@eyes') || testInfo.title === 'eyes') {
    // Eyes tests will differ from the baseline when run locally due to operating system rendering differences
    // Instead, run eyes on Github Actions to ensure a consistent render
    test.skip(
      process.env.STAGE === 'localhost',
      'Eyes tests do not run on localhost, run them on Github Actions instead.',
    );
  }
});
