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
      name: `Stories of ${name}`,
      stories: [],
      decorate: story => story(),
      deprecated: false,
    });
    return this;
  }

  deprecatedStoriesOf(name) {
    this.storiesOf(`${name} (deprecated)`);
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
    const latestGroup = this.latestGroup();
    const oldDecorator = latestGroup.decorate;
    latestGroup.decorate = story => decoratorFn(oldDecorator.bind(null, story));
    return this;
  }

  action() {
    // Intentional no-op
    return function () {};
  }

  test() {
    this.groups.forEach(group => {
      describe(group.name, () => {
        group.stories.forEach(story => {
          it(story.name, () => {
            mount(group.decorate(story.story));
          });
        });
      });
    });
  }
}
