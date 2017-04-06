// Load all .story.jsx files and render them with enzyme, checking for
// render errors and other problems.
import {throwOnConsoleErrors, throwOnConsoleWarnings} from '../util/testUtils';
import testStorybook from './util/testStorybook';

const BLACKLIST = [
  'templates/progress/ProgressLessonTeacherInfo.story.jsx',
  'templates/MultiCheckboxSelector.story.jsx',
  'templates/GameButtons.story.jsx',
  'templates/SpeedSlider.story.jsx',
];

describe('Rendering stories', () => {
  throwOnConsoleErrors();
  throwOnConsoleWarnings();

  // Test all the *.story.jsx files that aren't blacklisted
  const context = require.context('../../src/', true, /.*\.story\.jsx$/);
  context.keys()
      .filter(storyFile => !BLACKLIST.some(taboo => storyFile.includes(taboo)))
      .forEach(storyFile => {
        describe(storyFile, () => {
          testStorybook(context(storyFile));
        });
      });
});
