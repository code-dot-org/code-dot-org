import React from 'react';

import {Heading6} from '@cdo/apps/componentLibrary/typography';
import i18n from '@cdo/locale';

import ResourceRow from './ResourceRow';

import styles from './lesson-materials.module.scss';

type TeacherResourcesProps = {
  unitNumber: number;
  lessonNumber: number;
  lessonPlanUrl: string;
  resources: {
    key: string;
    name: string;
    url: string;
    downloadUrl: string | null;
    audience: string;
    type: string;
  }[];
};

const TeacherResources: React.FC<TeacherResourcesProps> = ({
  unitNumber,
  resources,
  lessonNumber,
  lessonPlanUrl,
}) => {
  const renderLessonPlanRow = (
    <ResourceRow
      key={'lessonPlan' + lessonNumber}
      unitNumber={unitNumber}
      lessonNumber={lessonNumber}
      resource={{
        key: 'lessonPlanKey',
        name: 'Lesson Plan',
        url: lessonPlanUrl,
        downloadUrl: null,
        audience: 'Teacher',
        type: 'Lesson Plan',
      }}
    />
  );

  return (
    <div className={styles.resourcesTable}>
      <div className={styles.topRowForResourcesTable}>
        <Heading6 className={styles.headerText}>
          {i18n.teacherResourcesforLessonMaterials()}
        </Heading6>
      </div>
      {renderLessonPlanRow}
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

export default TeacherResources;
