// Load all .story.jsx files and render them with enzyme, checking for
// render errors and other problems.
import {throwOnConsoleErrors, throwOnConsoleWarnings} from '../util/testUtils';
import testStorybook from './util/testStorybook';

const BLACKLIST = [
  'publicKeyCryptography/NumberedSteps.story.jsx',
  'publicKeyCryptography/PublicKeyCryptographyWidget.story.jsx',
  'storage/dataBrowser/ConfirmDeleteButton.story.jsx',
  'templates/projects/ProjectsList.story.jsx',
  'templates/projects/SectionProjectsList.story.jsx',
  'templates/DialogButtons.story.jsx',
  'templates/Dialog.story.jsx',
  'templates/BaseDialog.story.jsx',
  'templates/Lightbulb.story.jsx',
  'templates/watchers/AutocompleteSelector.story.jsx',
  'templates/watchers/Watchers.story.jsx',
  'templates/VersionHistory.jsx',
  'templates/PaginationWrapper.story.jsx',
  'templates/Button.story.jsx',
  'templates/HrefButton.story.jsx',
  'templates/progress/ProgressButton.story.jsx',
  'templates/progress/ProgressLessonTeacherInfo.story.jsx',
  'templates/progress/ProgressGroup.story.jsx',
  'templates/progress/SummaryProgressTable.story.jsx',
  'templates/progress/ProgressDetailToggle.story.jsx',
  'templates/progress/ProgressLessonContent.story.jsx',
  'templates/progress/ProgressLevelSet.story.jsx',
  'templates/progress/ProgressLesson.story.jsx',
  'templates/progress/ProgressPill.story.jsx',
  'templates/progress/ProgressBubbleSet.story.jsx',
  'templates/progress/DetailProgressTable.story.jsx',
  'templates/progress/ProgressBubble.story.jsx',
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
