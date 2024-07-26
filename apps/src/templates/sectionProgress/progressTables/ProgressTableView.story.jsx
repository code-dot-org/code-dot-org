import PropTypes from 'prop-types';
import React from 'react';
import {Provider, connect} from 'react-redux';

import locales from '@cdo/apps/redux/localesRedux';
import unitSelection from '@cdo/apps/redux/unitSelectionRedux';
import currentUser from '@cdo/apps/templates/currentUserRedux';
import ProgressTableView from '@cdo/apps/templates/sectionProgress/progressTables/ProgressTableView';
import {ViewType} from '@cdo/apps/templates/sectionProgress/sectionProgressConstants';
import sectionProgress from '@cdo/apps/templates/sectionProgress/sectionProgressRedux';
import SectionProgressToggle from '@cdo/apps/templates/sectionProgress/SectionProgressToggle';
import {fakeCoursesWithProgress} from '@cdo/apps/templates/teacherDashboard/teacherDashboardTestHelpers';
import teacherSections from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {reduxStore} from '@cdo/storybook/decorators';

import {allowConsoleWarnings} from '../../../../test/util/testUtils';
import {
  getScriptData,
  buildSectionProgress,
} from '../sectionProgressTestHelpers';

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

if (IN_UNIT_TEST) {
  allowConsoleWarnings();
}

export const SmallSectionSmallScript = Template.bind({});
SmallSectionSmallScript.args = {
  store: createStore(3, 10),
};

export const SmallSectionLargeScript = Template.bind({});
SmallSectionLargeScript.args = {
  store: createStore(3, 30),
};

/**
 * The variety of stories here can be useful during development, but add
 * unnecessary work to our unit tests and have proven to be potentially flaky
 * due to timeout while processing so much data. Uncomment the following
 * enable all the stories.
 */

/**
export const MediumSectionSmallScript = Template.bind({});
MediumSectionSmallScript.args = {
  store: createStore(30, 10),
};

export const MediumSectionLargeScript = Template.bind({});
MediumSectionLargeScript.args = {
  store: createStore(30, 30),
};

export const LargeSectionSmallScript = Template.bind({});
LargeSectionSmallScript.args = {
  store: createStore(200, 19),
};

export const LargeSectionLargeScript = Template.bind({});
LargeSectionLargeScript.args = {
  store: createStore(200, 30),
};
*/

export default {
  component: ProgressTableView,
};
