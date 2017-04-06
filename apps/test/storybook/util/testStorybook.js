import React from 'react';
import {mount} from 'enzyme';

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
  groups = [];

  storiesOf(name) {
    this.groups.push({
      name,
      stories: [],
      decorators: [],
    });
    return this;
  }

  latestGroup() {
    return this.groups[this.groups.length-1];
  }

  add(name, story) {
    this.latestGroup().stories.push({name, story});
    return this;
  }

  addWithInfo(name, _, story) {
    return this.add(name, story);
  }

  addStoryTable(tableStories) {
    Array.prototype.push.apply(this.latestGroup().stories, tableStories);
    return this;
  }

  addDecorator(decoratorFn) {
    this.latestGroup().decorators.push(decoratorFn);
    return this;
  }

  action() {
    // Intentional no-op
    return function () {};
  }

  test() {
    this.groups.forEach(group => {
      describe(`Stories of ${group.name}`, () => {
        group.stories.forEach(story => {
          it(story.name, () => {
            const decoratedStory = group.decorators.reduce(
                (wrappedStory, nextDecorator) => nextDecorator.bind(null, wrappedStory),
                story.story);
            mount(decoratedStory());
          });
        });
      });
    });
  }
}
