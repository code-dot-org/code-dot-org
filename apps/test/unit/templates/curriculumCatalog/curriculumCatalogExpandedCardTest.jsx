import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react';
import {pull} from 'lodash';
import {expect} from '../../../util/reconfiguredChai';
import CurriculumCatalogCard from '@cdo/apps/templates/curriculumCatalog/CurriculumCatalogCard';
import {
  subjectsAndTopicsOrder,
  translatedCourseOfferingCsTopics,
  translatedLabels,
} from '@cdo/apps/templates/teacherDashboard/CourseOfferingHelpers';
import {sections} from '../studioHomepages/fakeSectionUtils';
import {Provider} from 'react-redux';
import {
  getStore,
  registerReducers,
  restoreRedux,
  stubRedux,
} from '@cdo/apps/redux';
import teacherSections, {
  setSections,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';

describe('CurriculumCatalogExpandedCard', () => {
  const translationIconTitle = 'Curriculum is available in your language';

  const firstSubjectIndexInList = 0;
  const firstSubjectIndexUsed = firstSubjectIndexInList + 1;
  const subjects = [
    // mix up the order to check consistent order prioritization
    subjectsAndTopicsOrder[firstSubjectIndexUsed + 1],
    subjectsAndTopicsOrder[firstSubjectIndexUsed],
  ];

  const firstTopicIndexInList = 4;
  const firstTopicIndexUsed = firstTopicIndexInList + 4;
  const topics = [
    // mix up the order to check consistent order prioritization
    subjectsAndTopicsOrder[firstTopicIndexUsed + 3],
    subjectsAndTopicsOrder[firstTopicIndexUsed],
    subjectsAndTopicsOrder[firstTopicIndexUsed + 4],
  ];

  let defaultProps;
  let store;
  const renderCurriculumExpandedCard = (props = defaultProps) =>
    render(
      <Provider store={store}>
        <ExpandedCurriculumCatalogCard {...props} />
      </Provider>
    );

  beforeEach(() => {
    stubRedux();
    registerReducers({teacherSections});
    store = getStore();
    defaultProps = {
      courseDisplayName: 'AI for Oceans',
      courseDisplayNameWithLatestYear: 'AI for Oceans (2022)',
      duration: 'quarter',
      gradesArray: ['4', '5', '6', '7', '8'],
      isEnglish: true,
      pathToCourse: '/s/course',
      scriptId: 1,
      isSignedOut: true,
    };
  });

  afterEach(() => {
    restoreRedux();
  });

  it('renders course name', () => {
    renderCurriculumExpandedCard();

    screen.getByRole('heading', {name: defaultProps.courseName});
  });
});
