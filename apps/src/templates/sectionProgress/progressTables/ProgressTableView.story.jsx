import React from 'react';
import {reduxStore} from '@cdo/storybook/decorators';
import {Provider, connect} from 'react-redux';
import PropTypes from 'prop-types';
import ProgressTableView from '@cdo/apps/templates/sectionProgress/progressTables/ProgressTableView';
import SectionProgressToggle from '@cdo/apps/templates/sectionProgress/SectionProgressToggle';
import {ViewType} from '@cdo/apps/templates/sectionProgress/sectionProgressConstants';
import {
  getScriptData,
  buildSectionProgress,
} from '../sectionProgressTestHelpers';
import {allowConsoleWarnings} from '../../../../test/util/testUtils';
import {fakeCoursesWithProgress} from '@cdo/apps/templates/teacherDashboard/teacherDashboardTestHelpers';
import sectionProgress from '@cdo/apps/templates/sectionProgress/sectionProgressRedux';
import unitSelection from '@cdo/apps/redux/unitSelectionRedux';
import teacherSections from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import locales from '@cdo/apps/redux/localesRedux';
import currentUser from '@cdo/apps/templates/currentUserRedux';

/**
 * The variety of stories here can be useful during development, but add
 * unnecessary work to our unit tests and have proven to be potentially flaky
 * due to timeout while processing so much data. Set this value to `true` to
 * enable all the stories.
 */
const INCLUDE_LARGE_STORIES = false;

const defaultExport = {
  title: 'ProgressTableView',
  component: ProgressTableView,
};

class _TableWrapper extends React.Component {
  static propTypes = {
    currentView: PropTypes.oneOf(Object.values(ViewType)),
  };
  render() {
    return (
      <div
        className="main"
        style={{
          marginLeft: 80,
          width: 970,
          display: 'block',
          backgroundColor: '#ffffff',
        }}
      >
        <SectionProgressToggle />
        <ProgressTableView currentView={this.props.currentView} />
      </div>
    );
  }
}

const TableWrapper = connect(state => ({
  currentView: state.sectionProgress.currentView,
}))(_TableWrapper);

const Template = args => {
  const {store} = args;
  return (
    <Provider store={store}>
      <TableWrapper />
    </Provider>
  );
};

function createStore(numStudents, numLessons) {
  const scriptData = getScriptData(numLessons);
  const section = {
    id: 11,
    script: scriptData,
    students: [],
    lessonExtras: false,
  };
  for (let i = 0; i < numStudents; i++) {
    section.students.push({id: i, name: 'Student' + i + ' Long Lastname'});
  }

  const initialState = {
    currentUser: {
      isSortedByFamilyName: true,
    },
    sectionProgress: {
      ...buildSectionProgress(section.students, scriptData),
      lessonOfInterest: 0,
      currentView: ViewType.SUMMARY,
    },
    teacherSections: {
      selectedSectionId: section.id,
      sections: [section],
      selectedStudents: section.students,
    },
    unitSelection: {
      scriptId: scriptData.id,
      coursesWithProgress: fakeCoursesWithProgress,
    },
  };

  return reduxStore(
    {
      currentUser,
      sectionProgress,
      unitSelection,
      teacherSections,
      locales,
    },
    initialState
  );
}

function buildSmallStories() {
  if (IN_UNIT_TEST) {
    allowConsoleWarnings();
  }

  const stories = {};

  const SmallSectionSmallScript = Template.bind({});
  SmallSectionSmallScript.args = {
    store: createStore(3, 10),
  };
  stories['SmallSectionSmallScript'] = SmallSectionSmallScript;

  const SmallSectionLargeScript = Template.bind({});
  SmallSectionLargeScript.args = {
    store: createStore(3, 30),
  };
  stories['SmallSectionLargeScript'] = SmallSectionLargeScript;

  return stories;
}

function buildLargeStories() {
  const stories = {};

  const MediumSectionSmallScript = Template.bind({});
  MediumSectionSmallScript.args = {
    store: createStore(30, 10),
  };
  stories['MediumSectionSmallScript'] = MediumSectionSmallScript;

  const MediumSectionLargeScript = Template.bind({});
  MediumSectionLargeScript.args = {
    store: createStore(30, 30),
  };
  stories['MediumSectionLargeScript'] = MediumSectionLargeScript;

  const LargeSectionSmallScript = Template.bind({});
  LargeSectionSmallScript.args = {
    store: createStore(200, 19),
  };
  stories['LargeSectionSmallScript'] = LargeSectionSmallScript;

  const LargeSectionLargeScript = Template.bind({});
  LargeSectionLargeScript.args = {
    store: createStore(200, 30),
  };
  stories['LargeSectionLargeScript'] = LargeSectionLargeScript;

  return stories;
}

let stories = buildSmallStories();

if (INCLUDE_LARGE_STORIES) {
  stories = {
    ...stories,
    ...buildLargeStories(),
  };
}

export default {
  ...stories,
  default: defaultExport,
};
