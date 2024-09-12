import classNames from 'classnames';
import React from 'react';

import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon/FontAwesomeV6Icon';
import {isGDocsUrl} from '@cdo/apps/templates/lessonOverview/googleDocsUtils';

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
        return 'presentation-screen';
      } else {
        return 'files';
      }
    } else if (resourceType === 'Video') {
      return 'video';
    } else if (resourceType === 'Lesson Plan') {
      return 'file-lines';
    } else {
      return 'link-simple';
    }
  };

  const getIconClass = () => {
    switch (iconType()) {
      case 'presentation-screen':
        return styles.slides;
      case 'video':
        return styles.video;
      case 'file-lines':
        return styles.lessonPlan;
      case 'files':
        return styles.files;
      default:
        return styles.link;
    }
  };
  return (
    <div className={classNames(styles.resourceIconContainer, getIconClass())}>
      <FontAwesomeV6Icon iconName={iconType()} className={styles.icon} />
    </div>
  );
};

export default ResourceIcon;
