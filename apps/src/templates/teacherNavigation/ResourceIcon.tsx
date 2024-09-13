import classNames from 'classnames';
import React from 'react';

import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon/FontAwesomeV6Icon';
import {isGDocsUrl} from '@cdo/apps/templates/lessonOverview/googleDocsUtils';

import {RESOURCE_TYPE} from './ResourceIconType';

import styles from './lesson-materials.module.scss';

type ResourceIconProps = {
  // the resourceType is connected to how curriculum writers designate a resource
  // when building a lesson. The Lesson Plan is unique in that a curriculum writer
  // doesn't add this resource in the same way as the others in this list.  However
  // we are displaying the lesson plans in the Lesson Materials page.
  // resourceType:
  //   | 'Slides'
  //   | 'Video'
  //   | 'Lesson Plan'
  //   | 'Resource'
  //   | 'Rubric'
  //   | 'Handout'
  //   | 'Activity Guide'
  //   | 'Exemplar'
  //   | 'Answer Key';
  resourceType: string | null | undefined;
  resourceUrl: string | null | undefined;
};

const ResourceIcon: React.FC<ResourceIconProps> = ({
  resourceType,
  resourceUrl,
}) => {
  const iconType = () => {
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

  return (
    <div className={classNames(styles.resourceIconContainer, iconType().class)}>
      <FontAwesomeV6Icon iconName={iconType().icon} className={styles.icon} />
    </div>
  );
};

export default ResourceIcon;
