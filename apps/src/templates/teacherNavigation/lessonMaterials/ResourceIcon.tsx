import classNames from 'classnames';
import React from 'react';

import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon/FontAwesomeV6Icon';

import {computeMaterialType} from './LessonMaterialTypes';
import {RESOURCE_ICONS} from './ResourceIconType';

import styles from './lesson-materials.module.scss';

type ResourceIconProps = {
  resourceType: string;
  resourceUrl: string;
};

const computeIconType = (resourceType: string, resourceUrl: string) => {
  const materialType = computeMaterialType(resourceType, resourceUrl);
  return RESOURCE_ICONS[materialType];
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
