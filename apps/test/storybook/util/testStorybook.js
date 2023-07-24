import {mount} from 'enzyme';
import experiments from '@cdo/apps/util/experiments';
import {withReduxStore} from '../../util/withReduxStore';

/**
 * Generate and run a suite of simple tests that make sure all of provided
 * stories render without errors and without generating console errors or
 * warnings.
 * @param {function(Storybook)|Object} storyFile
 * The deprecated `storiesOf` format exports stories as a single function.
 * The new CSF format exports stories as an object.
 * Both formats are supported in unit tests while we refactor away the deprecated format.
 */
export default function testStorybook(storyFile) {
  if (typeof storyFile === 'function') {
    const testBook = new FakeStorybook_DEPRECATED();
    storyFile(testBook);
    testBook.test(storyFile);
  } else {
    testStorybookFile(storyFile);
  }
}

function testStorybookFile(file) {
  const {default: defaultExport, ...stories} = file;

  describe(`${defaultExport.title} stories`, () => {
    Object.keys(stories).forEach(storyName => {
      it(storyName, () => {
        const Story = stories[storyName];
        mount(Story(Story.args));
      });
    });
  });
}

// This class supports the deprecated `storiesOf` format for Storybook.
// This allows us to continue unit testing stories in that format while
// we convert everything to the new format (CSF).
class FakeStorybook_DEPRECATED {
  constructor() {
    this.withReduxStore = withReduxStore;
  }

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
    return this.groups[this.groups.length - 1];
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

  withExperiments(...experimentList) {
    this.experiments = experimentList;
    return this;
  }

  test() {
    this.groups.forEach(group => {
      describe(group.name, () => {
        // Make sure that the only experiments enabled are those that we explicitly
        // added via withExperiments
        localStorage.removeItem('experimentsList');
        if (this.experiments) {
          this.experiments.forEach(key => experiments.setEnabled(key, true));
        }

        group.stories.forEach(story => {
          it(story.name, () => {
            mount(group.decorate(story.story));
          });
        });
      });
    });
  }
}
