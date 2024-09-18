import React from 'react';

import {LinkButton} from '@cdo/apps/componentLibrary/button';
import {Heading3, BodyTwoText} from '@cdo/apps/componentLibrary/typography';
import TeacherDashboardEmptyState from '@cdo/apps/templates/teacherNavigation/images/TeacherDashboardEmptyState.svg';
import i18n from '@cdo/locale';

import styles from './lesson-materials.module.scss';

type NoUnitAssignedViewProps = {
  courseName: string;
};

const NoUnitAssignedView: React.FC<NoUnitAssignedViewProps> = ({
  courseName,
}) => {
  return (
    <div className={styles.noUnitContainer}>
      <img
        src={TeacherDashboardEmptyState}
        alt={i18n.almostThere()}
        className={styles.noUnitImage}
      />
      <Heading3>{i18n.almostThere()}</Heading3>
      <BodyTwoText>
        {' '}
        {i18n.noUnitAssigned({courseName: courseName})}
      </BodyTwoText>
      <LinkButton href="/courses" text={i18n.assignAUnit()} />
    </div>
  );
};

export default NoUnitAssignedView;
