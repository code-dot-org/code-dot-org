import React from 'react';
import {Provider, connect} from 'react-redux';
import PropTypes from 'prop-types';
import ProgressTableView from '@cdo/apps/templates/sectionProgress/progressTables/ProgressTableView';
import SectionProgressToggle from '@cdo/apps/templates/sectionProgress/SectionProgressToggle';
import {ViewType} from '@cdo/apps/templates/sectionProgress/sectionProgressConstants';
import {createStore} from '../sectionProgressTestHelpers';

/**
 * The variety of stories here can be useful during development, but add
 * unnecessary work to our unit tests and have proven to be potentially flaky
 * due to timeout while processing so much data. Set this value to `true` to
 * enable all the stories.
 */
const INCLUDE_LARGE_STORIES = false;

class _TableWrapper extends React.Component {
  static propTypes = {
    currentView: PropTypes.oneOf(Object.values(ViewType))
  };
  render() {
    return (
      <div
        className="main"
        style={{
          marginLeft: 80,
          width: 970,
          display: 'block',
          backgroundColor: '#ffffff'
        }}
      >
        <SectionProgressToggle />
        <ProgressTableView currentView={this.props.currentView} />
      </div>
    );
  }
}

const TableWrapper = connect(state => ({
  currentView: state.sectionProgress.currentView
}))(_TableWrapper);

function buildSmallStories() {
  return [
    {
      name: `Small section, small script`,
      story: () => {
        const store = createStore(3, 10);
        return (
          <Provider store={store}>
            <TableWrapper />
          </Provider>
        );
      }
    },
    {
      name: `Small section, large script`,
      story: () => {
        const store = createStore(3, 30);
        return (
          <Provider store={store}>
            <TableWrapper />
          </Provider>
        );
      }
    }
  ];
}

function buildLargeStories() {
  return [
    {
      name: `Medium section, small script`,
      story: () => {
        const store = createStore(30, 10);
        return (
          <Provider store={store}>
            <TableWrapper />
          </Provider>
        );
      }
    },
    {
      name: `Medium section, large script`,
      story: () => {
        const store = createStore(30, 30);
        return (
          <Provider store={store}>
            <TableWrapper />
          </Provider>
        );
      }
    },
    {
      name: `Large section, small script`,
      story: () => {
        const store = createStore(200, 10);
        return (
          <Provider store={store}>
            <TableWrapper />
          </Provider>
        );
      }
    },
    {
      name: `Large section, large script`,
      story: () => {
        const store = createStore(200, 30);
        return (
          <Provider store={store}>
            <TableWrapper />
          </Provider>
        );
      }
    }
  ];
}

let stories = buildSmallStories();

if (INCLUDE_LARGE_STORIES) {
  stories = stories.concat(buildLargeStories());
}

export default storybook => {
  storybook
    .storiesOf('SectionProgress/ProgressTableView', module)
    .addStoryTable(stories);
};
