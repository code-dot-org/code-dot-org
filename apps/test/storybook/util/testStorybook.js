import React from 'react';
import {mount} from 'enzyme';
import {throwOnConsoleErrors, throwOnConsoleWarnings} from '../../util/testUtils';

/**
 * Generate and run a suite of simple tests that make sure all of provided
 * stories render without errors and without generating console errors or
 * warnings.
 * @param {function(Storybook)} storiesFn
 */
export default function testStorybook(storiesFn) {
  const testBook = new FakeStorybook();
  storiesFn(testBook);
  testBook.test();
}

class FakeStorybook {
  componentName = 'Anonymous component';
  stories = [];

  storiesOf(name) {
    this.componentName = name;
    return this;
  }

  addWithInfo(name, _, story) {
    this.stories.push({name, story});
    return this;
  }

  addStoryTable(tableStories) {
    Array.prototype.push.apply(this.stories, tableStories);
    return this;
  }

  action(_) {
    // Intentional no-op
    return function () {};
  }

  test() {
    describe(`Stories of ${this.componentName}`, () => {
      throwOnConsoleErrors();
      throwOnConsoleWarnings();
      this.stories.forEach(story => {
        if (!story.name) {
          console.log(story);
          console.log(this.componentName);
          return;
        }
        it(story.name, () => mount(story.story()));
      });
    });
  }
}
