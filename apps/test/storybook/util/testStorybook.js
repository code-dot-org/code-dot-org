import React from 'react';
import {mount} from 'enzyme';
import experiments from '@cdo/apps/util/experiments';
import {createStore, combineReducers} from 'redux';
import isRtl from '@cdo/apps/code-studio/isRtlRedux';
import responsive from '@cdo/apps/code-studio/responsiveRedux';
import {Provider} from 'react-redux';

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

  withExperiments(...experimentList) {
    this.experiments = experimentList;
    return this;
  }

  withReduxStore(reducers = {}) {
    this.addDecorator(story => {
      this.store = createStore(combineReducers({
        isRtl,
        responsive,
        ...reducers,
      }));
      return (
        <Provider store={this.store}>
          {story()}
        </Provider>
      );
    });
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
