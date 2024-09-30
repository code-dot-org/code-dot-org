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

type MaterialType =
  | 'SLIDES'
  | 'GOOGLE_DOC'
  | 'VIDEO'
  | 'LESSON_PLAN'
  | 'STANDARDS'
  | 'VOCABULARY'
  | 'LINK';

const computeIconType = (resourceType: string, resourceUrl: string) => {
  const materialType = computeMaterialType(resourceType, resourceUrl);
  return RESOURCE_TYPE[materialType];
};

const computeMaterialType = (
  resourceType: string,
  resourceUrl: string
): MaterialType => {
  if (isGDocsUrl(resourceUrl)) {
    if (resourceType === 'Slides') {
      return 'SLIDES';
    } else {
      return 'GOOGLE_DOC';
    }
  } else if (resourceType === 'Video') {
    return 'VIDEO';
  } else if (resourceType === 'Lesson Plan') {
    return 'LESSON_PLAN';
  } else if (resourceType === 'Standards') {
    return 'STANDARDS';
  } else if (resourceType === 'Vocabulary') {
    return 'VOCABULARY';
  } else {
    return 'LINK';
  }
};

const ResourceIcon: React.FC<ResourceIconProps> = ({
  resourceType,
  resourceUrl,
}) => {
  const iconType = computeIconType(resourceType, resourceUrl);

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
