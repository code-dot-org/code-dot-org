import {mount} from 'enzyme';

/**
 * Generate and run a suite of simple tests that make sure all of provided
 * stories render without errors and without generating console errors or
 * warnings.
 * @param {Object} storyFile
 */
export default function testStorybook(storyFile) {
  const {default: defaultExport, ...stories} = storyFile;

  describe(`${defaultExport.title} stories`, () => {
    Object.keys(stories).forEach(storyName => {
      it(storyName, () => {
        const Story = stories[storyName];
        mount(Story(Story.args));
      });
    });
  });
}
