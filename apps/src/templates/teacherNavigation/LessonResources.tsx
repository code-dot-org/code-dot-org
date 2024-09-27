import React from 'react';

import {Heading6} from '@cdo/apps/componentLibrary/typography';
import i18n from '@cdo/locale';

import ResourceRow from './ResourceRow';

import styles from './lesson-materials.module.scss';

type LessonResourcesProps = {
  unitNumber: number;
  lessonNumber: number;
  lessonPlanUrl: string | null;
  lessonName: string | null;
  resources: {
    key: string;
    name: string;
    url: string;
    downloadUrl: string | null;
    audience: string;
    type: string;
  }[];
};

const LessonResources: React.FC<LessonResourcesProps> = ({
  unitNumber,
  resources,
  lessonNumber,
  lessonPlanUrl,
  lessonName,
}) => {
  // Note that lessonPlanUrl is not needed for student resources
  // and should be null for student resoruces section
  const sectionHeaderText = lessonPlanUrl
    ? i18n.teacherResourcesforLessonMaterials()
    : i18n.studentResources();

  const renderLessonPlanRow = () => {
    if (!lessonPlanUrl) return null;

    return (
      <ResourceRow
        key={`lessonPlan-${lessonNumber}`}
        unitNumber={unitNumber}
        lessonNumber={lessonNumber}
        resource={{
          key: 'lessonPlanKey',
          name: lessonName || '',
          url: lessonPlanUrl,
          downloadUrl: null,
          audience: 'Teacher',
          type: 'Lesson Plan',
        }}
      />
    );
  };

  return (
    <div className={styles.resourcesTable}>
      <div className={styles.topRowForResourcesTable}>
        <Heading6 className={styles.headerText}>{sectionHeaderText}</Heading6>
      </div>
      {renderLessonPlanRow()}
      {resources.map(resource => (
        <ResourceRow
          key={resource.key}
          unitNumber={unitNumber}
          lessonNumber={lessonNumber}
          resource={resource}
        />
      ))}
    </div>
  );
};

export default LessonResources;
