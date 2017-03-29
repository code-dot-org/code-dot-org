import React from 'react';
import {mount} from 'enzyme';
import {throwOnConsoleErrors, throwOnConsoleWarnings} from './testUtils';

/**
 * Generate and run a suite of simple tests that make sure all of provided
 * stories render without errors and without generating console errors or
 * warnings.
 * @param {function(Storybook)} storiesFn
 */
export default function testStorybook(storiesFn) {
  const testBook = new StorybookTester();
  storiesFn(testBook);
  testBook.test();
}

class StorybookTester {
  componentName = 'Anonymous component';
  stories = [];

  storiesOf(name) {
    this.componentName = name;
    return this;
  }

  addWithInfo(name, _, storyFn) {
    this.stories.push({name, storyFn});
    return this;
  }

  test() {
    describe(`Stories of ${this.componentName}`, () => {
      throwOnConsoleErrors();
      throwOnConsoleWarnings();
      this.stories.forEach(story => {
        it(story.name, () => mount(story.storyFn()));
      });
    });
  }
}
