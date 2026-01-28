import {
  BodyTwoText,
  Heading6,
} from '@code-dot-org/component-library/typography';
import React from 'react';

import i18n from '@cdo/locale';

import {Resource} from './LessonMaterialTypes';
import ResourceRow from './ResourceRow';

import styles from './lesson-materials.module.scss';

type CustomResourcesProps = {
  //   unitNumber: number | null;
  //   lessonNumber: number;
  //   lessonPlanUrl?: string;
  //   lessonPlanPdfUrl?: string;
  //   standardsUrl?: string;
  //   vocabularyUrl?: string;
  //   lessonName?: string;
  //   resources: Resource[];
  //   hasLessonPlan?: boolean;
};

const renderNoResourcesRow = (
  <div className={styles.rowContainer}>
    <BodyTwoText className={styles.resourceLabel}>
      <em>
        {
          'You have not created any custom resources for this lesson. You can use AI TA to help you!'
        }
      </em>
    </BodyTwoText>
  </div>
);

const CustomLessonResources: React.FC<CustomResourcesProps> = ({}) => {
  const resources = [
    {
      key: 'customResource1',
      name: 'Custom Resource 1',
      url: 'https://example.com/resource1',
      audience: 'student',
      type: 'Custom',
    },
  ];
  return (
    <div className={styles.resourcesTable}>
      <div className={styles.topRowForResourcesTable}>
        <Heading6 className={styles.headerText}>{'Custom Resources'}</Heading6>
      </div>
      {resources.length === 0 && renderNoResourcesRow}
      {resources.map(resource => (
        <ResourceRow key={resource.key} unitNumber={null} resource={resource} />
      ))}
    </div>
  );
};

export default CustomLessonResources;
