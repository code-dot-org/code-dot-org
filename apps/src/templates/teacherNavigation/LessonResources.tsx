import React from 'react';

import {Heading6} from '@cdo/apps/componentLibrary/typography';
import i18n from '@cdo/locale';

import ResourceRow from './ResourceRow';

import styles from './lesson-materials.module.scss';

type LessonResourcesProps = {
  unitNumber: number;
  lessonNumber: number;
  lessonPlanUrl: string | null;
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
}) => {
  const renderLessonPlanRow = () => {
    if (!lessonPlanUrl) return null;

    return (
      <ResourceRow
        key={`lessonPlan-${lessonNumber}`}
        unitNumber={unitNumber}
        lessonNumber={lessonNumber}
        resource={{
          key: 'lessonPlanKey',
          name: i18n.lessonPlan(),
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
        <Heading6 className={styles.headerText}>
          {i18n.teacherResourcesforLessonMaterials()}
        </Heading6>
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
