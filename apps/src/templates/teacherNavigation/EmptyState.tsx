import React from 'react';

import {Heading3, BodyTwoText} from '@cdo/apps/componentLibrary/typography';

import styles from './teacher-navigation.module.scss';
import dashboardStyles from '@cdo/apps/templates/teacherDashboard/teacher-dashboard.module.scss';

export interface EmptyStateProps {
  headline: string;
  descriptionText: string | null;
  imageComponent: JSX.Element;
  button: JSX.Element | null;
}
export const EmptyState: React.FC<EmptyStateProps> = ({
  imageComponent,
  headline,
  descriptionText,
  button,
}) => {
  return (
    <div className={dashboardStyles.emptyClassroomDiv}>
      <div className={dashboardStyles.emptyClassroomImage}>
        {imageComponent}
      </div>
      <Heading3 className={styles.topPadding}>{headline}</Heading3>
      <BodyTwoText>{descriptionText}</BodyTwoText>
      {button}
    </div>
  );
};
