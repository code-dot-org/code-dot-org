import React from 'react';

import {BodyTwoText, StrongText} from '@cdo/apps/componentLibrary/typography';
import i18n from '@cdo/locale';

import {Resource} from './LessonMaterialTypes';
import ResourceIcon from './ResourceIcon';
import ResourceViewOptionsDropdown from './ResourceViewOptionsDropdown';

import styles from './lesson-materials.module.scss';

type ResourceRowProps = {
  lessonNumber?: number;
  unitNumber: number | null;
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
      if (unitNumber) {
        return i18n.unitXStandards({unitNumber: unitNumber});
      } else {
        return i18n.unitStandards();
      }
    } else if (resource.type === 'Vocabulary') {
      if (unitNumber) {
        return i18n.unitXVocabulary({unitNumber: unitNumber});
      } else {
        return i18n.unitVocabulary();
      }
    } else {
      return `${resource.type}: ${resource.name}`;
    }
  };

  const resourceNumberingText =
    lessonNumber && unitNumber ? (
      <StrongText>
        <strong>{`${unitNumber}.${lessonNumber} `}</strong>
      </StrongText>
    ) : null;

  return (
    // eslint-disable-next-line react/forbid-dom-props
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
