import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react';
import {pull} from 'lodash';
import {expect} from '../../../util/reconfiguredChai';
import ExpandedCurriculumCatalogCard from '@cdo/apps/templates/curriculumCatalog/ExpandedCurriculumCatalogCard';
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
  const assignButtonOnClick = jest.fn();
  const onClose = jest.fn();
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
      duration: 'quarter',
      gradeRange: 'Grades: 3-12',
      subjectsAndTopics: ['Artificial Intelligence', 'Data'],
      deviceCompatibility:
        '{"computer":"ideal","chromebook":"ideal","tablet":"ideal","mobile":"ideal","no_device":"incompatible"}',
      description:
        'In this fun introduction to artificial intelligence, you train a real machine learning model to identify sea creatures and trash in the ocean. ',
      professionalLearningProgram: null,
      video:
        'https://www.youtube-nocookie.com/embed/KHbwOetbmbs/?autoplay=1&enablejsapi=1&iv_load_policy=3&modestbranding=1&rel=0&showinfo=1&v=KHbwOetbmbs&wmode=transparent',
      publishedDate: '2019-12-01T13:00:00.000Z',
      selfPacedPlCourseOfferingPath: null,
      pathToCourse: '/s/course',
      assignButtonOnClick: assignButtonOnClick,
      assignButtonDescription: 'Assign AI for Oceans to your classroom',
      onClose: onClose,
      isInUS: true,
      imageSrc:
        'https://images.code.org/58cc5271d85e017cf5030ea510ae2715-AI for Oceans.png',
      imageAltText: '',
      availableResources: {'Lesson Plan': '/s/oceans/lessons/1'},
    };
  });

  afterEach(() => {
    restoreRedux();
  });

  it('renders course name', () => {
    renderCurriculumExpandedCard();

    screen.getByRole('heading', {name: defaultProps.courseDisplayName});
  });
});
