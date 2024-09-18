import React from 'react';

import {Heading6} from '@cdo/apps/componentLibrary/typography';
import i18n from '@cdo/locale';

import ResourceRow from './ResourceRow';

import styles from './lesson-materials.module.scss';

type TeacherResourcesProps = {
  unitNumber: number;
  lessonNumber: number;
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
}) => {
  return (
    <div className={styles.resourcesTable}>
      <div className={styles.topRowForResourcesTable}>
        <Heading6 className={styles.headerText}>
          {i18n.teacherResourcesforLessonMaterials()}
        </Heading6>
      </div>
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
