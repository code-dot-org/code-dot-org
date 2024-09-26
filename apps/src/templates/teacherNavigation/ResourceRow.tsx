import React from 'react';

import {BodyTwoText, StrongText} from '@cdo/apps/componentLibrary/typography';

import ResourceIcon from './ResourceIcon';
import ResourceViewOptionsDropdown from './ResourceViewOptionsDropdown';

import styles from './lesson-materials.module.scss';

type ResourceRowProps = {
  lessonNumber: number;
  unitNumber: number;
  resource: {
    key: string;
    name: string;
    url: string;
    downloadUrl: string | null;
    audience: string;
    type: string;
  };
};

const ResourceRow: React.FC<ResourceRowProps> = ({
  lessonNumber,
  unitNumber,
  resource,
}) => {
  const resourcePositionLabel = (
    <strong>{unitNumber + '.' + lessonNumber + ' '}</strong>
  );

  const resourceDisplayText = () =>
    resource.type ? `${resource.type}: ${resource.name}` : resource.name;

  return (
    <div className={styles.rowContainer}>
      <div className={styles.iconAndName}>
        <ResourceIcon resourceType={resource.type} resourceUrl={resource.url} />
        <BodyTwoText className={styles.resourceLabel}>
          <StrongText>{resourcePositionLabel}</StrongText>
          {resourceDisplayText()}
        </BodyTwoText>
      </div>
      <ResourceViewOptionsDropdown resource={resource} />
    </div>
  );
};

export default ResourceRow;
