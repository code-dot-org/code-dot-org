// Load all .story.jsx files and render them with enzyme, checking for
// render errors and other problems.
import {
  throwOnConsoleErrorsEverywhere,
  throwOnConsoleWarningsEverywhere,
  clearTimeoutsBetweenTests,
} from '../util/testUtils';
import testStorybook from './util/testStorybook';

// Add story files here to exclude them from the storybook render tests.
const BLACKLIST = [
  // 'templates/progress/ProgressLessonTeacherInfo.story.jsx',
];

describe('react-storybook stories render without errors or warnings', function () {
  throwOnConsoleErrorsEverywhere();
  throwOnConsoleWarningsEverywhere();
  clearTimeoutsBetweenTests();

  // Test all the *.story.jsx files that aren't blacklisted
  const context = require.context('../../src/', true, /.*\.story\.jsx?$/);
  context.keys()
      .filter(storyFile => !BLACKLIST.some(taboo => storyFile.includes(taboo)))
      .forEach(storyFile => {
        describe(storyFile, () => {
          testStorybook(context(storyFile));
        });
      });
});
