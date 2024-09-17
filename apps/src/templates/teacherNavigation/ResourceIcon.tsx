import classNames from 'classnames';
import React from 'react';

import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon/FontAwesomeV6Icon';
import {isGDocsUrl} from '@cdo/apps/templates/lessonOverview/googleDocsUtils';

import {RESOURCE_TYPE} from './ResourceIconType';

import styles from './lesson-materials.module.scss';

type ResourceIconProps = {
  resourceType: string;
  resourceUrl: string;
};

const ResourceIcon: React.FC<ResourceIconProps> = ({
  resourceType,
  resourceUrl,
}) => {
  const computeIconType = () => {
    if (isGDocsUrl(resourceUrl)) {
      if (resourceType === 'Slides') {
        return RESOURCE_TYPE.SLIDES;
      } else {
        return RESOURCE_TYPE.GOOGLE_DOC;
      }
    } else if (resourceType === 'Video') {
      return RESOURCE_TYPE.VIDEO;
    } else if (resourceType === 'Lesson Plan') {
      return RESOURCE_TYPE.LESSON_PLAN;
    } else {
      return RESOURCE_TYPE.LINK;
    }
  };

  const iconType = computeIconType();

  return (
    <div
      data-testid={'resource-icon-' + iconType.icon}
      className={classNames(styles.resourceIconContainer, iconType.class)}
    >
      <FontAwesomeV6Icon iconName={iconType.icon} className={styles.icon} />
    </div>
  );
};

export default ResourceIcon;
