import PropTypes from 'prop-types';
import React from 'react';
import TutorialExplorer from '../../tutorialExplorer/tutorialExplorer';
import {assignmentCourseOfferingShape} from '../teacherDashboard/shapes';
import {TutorialsSortByOptions} from '../../tutorialExplorer/util';
import i18n from '@cdo/locale';

export default function CourseCatalog(props) {
  let {filters, initialFilters, hideFilters} = getFilters();

  return (
    <div>
      <TutorialExplorer
        tutorials={Object.values(props.courseOfferings)}
        filterGroups={filters}
        initialFilters={initialFilters}
        hideFilters={hideFilters}
        locale={'en-us'}
        backButton={false}
        showSortDropdown={true}
        disabledTutorials={[]}
        defaultSortBy={TutorialsSortByOptions.popularityrank}
      />
    </div>
  );
}

CourseCatalog.propTypes = {
  courseOfferings: PropTypes.objectOf(assignmentCourseOfferingShape).isRequired
};

function getFilters() {
  const filters = [
    {
      name: 'grade',
      text: i18n.filterGrades(),
      headerOnDesktop: true,
      singleEntry: true,
      entries: [
        {name: 'all', text: i18n.filterGradesAll()},
        {name: 'pre', text: i18n.filterGradesPre()},
        {name: '2-5', text: i18n.filterGrades25()},
        {name: '6-8', text: i18n.filterGrades68()},
        {name: '9+', text: i18n.filterGrades9()}
      ]
    },
    {
      name: 'subject',
      text: i18n.filterTopics(),
      entries: [
        {name: 'science', text: i18n.filterTopicsScience()},
        {name: 'math', text: i18n.filterTopicsMath()},
        {name: 'history', text: i18n.filterTopicsHistory()},
        {name: 'la', text: i18n.filterTopicsLa()},
        {name: 'art', text: i18n.filterTopicsArt()},
        {name: 'cs-only', text: i18n.filterTopicsCsOnly()}
      ]
    },
    {
      name: 'activity_type',
      text: i18n.filterActivityType(),
      entries: [
        {
          name: 'online-tutorial',
          text: i18n.filterActivityTypeOnlineTutorial()
        },
        {name: 'lesson-plan', text: i18n.filterActivityTypeLessonPlan()}
      ]
    },
    {
      name: 'length',
      text: i18n.filterLength(),
      entries: [
        {name: '1hour', text: i18n.filterLength1Hour()},
        {name: '1hour-follow', text: i18n.filterLength1HourFollow()},
        {name: 'few-hours', text: i18n.filterLengthFewHours()}
      ]
    },
    {
      name: 'programming_language',
      text: i18n.filterProgrammingLanguage(),
      entries: [
        {name: 'blocks', text: i18n.filterProgrammingLanguageBlocks()},
        {name: 'typing', text: i18n.filterProgrammingLanguageTyping()},
        {name: 'other', text: i18n.filterProgrammingLanguageOther()}
      ]
    }
  ];

  const initialFilters = {
    student_experience: ['beginner'],
    grade: ['all']
  };

  const hideFilters = {
    activity_type: ['robotics']
  };

  return {filters, initialFilters, hideFilters};
}
