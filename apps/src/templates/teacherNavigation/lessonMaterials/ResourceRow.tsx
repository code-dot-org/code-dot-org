import React from 'react';

import {BodyTwoText, StrongText} from '@cdo/apps/componentLibrary/typography';
import i18n from '@cdo/locale';

import {Resource} from './LessonMaterialTypes';
import ResourceIcon from './ResourceIcon';
import ResourceViewOptionsDropdown from './ResourceViewOptionsDropdown';

import styles from './lesson-materials.module.scss';

type ResourceRowProps = {
  lessonNumber?: number;
  unitNumber: number;
  resource: Resource;
};

const ResourceRow: React.FC<ResourceRowProps> = ({
  lessonNumber,
  unitNumber,
  resource,
}) => {
  const resourceDisplayText = () => {
    if (!resource.type) {
      return resource.name;
    } else if (resource.type === 'Standards') {
      return i18n.unitStandards({unitNumber: unitNumber});
    } else if (resource.type === 'Vocabulary') {
      return i18n.unitVocabulary({unitNumber: unitNumber});
    } else {
      return `${resource.type}: ${resource.name}`;
    }
  };

  const resourceNumberingText = lessonNumber ? (
    <StrongText>
      <strong>{`${unitNumber}.${lessonNumber} `}</strong>
    </StrongText>
  ) : null;

  return (
    <div className={styles.rowContainer} data-testid="resource-row">
      <div className={styles.iconAndName}>
        <ResourceIcon resourceType={resource.type} resourceUrl={resource.url} />
        <BodyTwoText className={styles.resourceLabel}>
          {resourceNumberingText}
          {resourceDisplayText()}
        </BodyTwoText>
      </div>
      <ResourceViewOptionsDropdown resource={resource} />
    </div>
  );
};

export default ResourceRow;
