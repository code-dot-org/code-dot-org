import React from 'react';

import LessonResources from '@cdo/apps/templates/teacherNavigation/lessonMaterials/LessonResources';
import {Resource} from '@cdo/apps/templates/teacherNavigation/lessonMaterials/LessonMaterialTypes';

import styles from '../sectionPreview.module.scss';

const MOCK_TEACHER_RESOURCES: Resource[] = [
  {
    key: 'slides-1',
    name: 'Lesson Slides',
    url: '#',
    type: 'Slides',
    audience: 'Teacher',
  },
  {
    key: 'video-1',
    name: 'Teaching Tips Video',
    url: '#',
    type: 'Video',
    audience: 'Teacher',
  },
];

const MOCK_STUDENT_RESOURCES: Resource[] = [
  {
    key: 'activity-1',
    name: 'Activity Guide',
    url: '#',
    type: 'Link',
    audience: 'Student',
  },
  {
    key: 'worksheet-1',
    name: 'Worksheet',
    url: '#',
    type: 'Link',
    audience: 'Student',
  },
];

const LessonMaterialsPreview: React.FC = () => {
  return (
    <div className={styles.lessonMaterialsPreview}>
      <LessonResources
        unitNumber={1}
        lessonNumber={1}
        lessonPlanUrl="#"
        standardsUrl="#"
        vocabularyUrl="#"
        lessonName="Introduction to Computer Science"
        resources={MOCK_TEACHER_RESOURCES}
        hasLessonPlan={true}
      />
      <LessonResources
        unitNumber={1}
        lessonNumber={1}
        resources={MOCK_STUDENT_RESOURCES}
      />
    </div>
  );
};

export default LessonMaterialsPreview;
