import React from 'react';

import {BodyTwoText, StrongText} from '@cdo/apps/componentLibrary/typography';

import styles from './lesson-materials.module.scss';

export type Lesson = {
  name: string;
  id: number;
};

type ResourceRowProps = {
  lessonNumber: number | null;
  unitNumber: number | null;
  resource: {
    key: string;
    name: string;
    url: string;
    downloadUrl: string | null;
    audience: string;
    type: string;
  } | null;
};

const ResourceRow: React.FC<ResourceRowProps> = ({
  lessonNumber,
  unitNumber,
  resource,
}) => {
  const resourcePositionLabel = (
    <strong>{unitNumber + '.' + lessonNumber + ' '}</strong>
  );
  return (
    <div className={styles.rowContainer}>
      <BodyTwoText>
        <StrongText>{resourcePositionLabel}</StrongText>
        {resource?.name}
      </BodyTwoText>
    </div>
  );
};

export default ResourceRow;
