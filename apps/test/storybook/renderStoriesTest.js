// Load all .story.jsx files and render them with enzyme, checking for
// render errors and other problems.
import {
  throwOnConsoleErrorsEverywhere,
  throwOnConsoleWarningsEverywhere,
  clearTimeoutsBetweenTests
} from '../util/testUtils';
import testStorybook from './util/testStorybook';
import $ from 'jquery';
import Adapter from 'enzyme-adapter-react-15.4';
import enzyme from 'enzyme';
enzyme.configure({adapter: new Adapter()});

// Add story files here to exclude them from the storybook render tests.
const DENYLIST = [
  // 'templates/progress/ProgressLessonTeacherInfo.story.jsx',
];

describe('react-storybook stories render without errors or warnings', function() {
  throwOnConsoleErrorsEverywhere();
  throwOnConsoleWarningsEverywhere();
  clearTimeoutsBetweenTests();

  // Stub jquery fileupload library function and window.Audio class.
  let fileupload, windowAudio;
  before(() => {
    fileupload = $.fn.fileupload;
    $.fn.fileupload = () => {};

    windowAudio = window.Audio;
    window.Audio = FakeAudio;
  });
  after(() => {
    $.fn.fileupload = fileupload;
    window.Audio = windowAudio;
  });

  // Test all the *.story.jsx files that aren't denylisted
  const context = require.context('../../src/', true, /.*\.story\.jsx?$/);
  context
    .keys()
    .filter(storyFile => !DENYLIST.some(taboo => storyFile.includes(taboo)))
    .forEach(storyFile => {
      describe(storyFile, () => {
        testStorybook(context(storyFile));
      });
    });
});

class FakeAudio {
  play() {}
  pause() {}
  load() {}
  // EventTarget interface
  addEventListener() {}
  removeEventListener() {}
  dispatchEvent() {}
  removeAttribute() {}
}
