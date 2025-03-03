import {Heading2} from '@code-dot-org/component-library/typography';
import React from 'react';

import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import i18n from '@cdo/locale';

import {SectionList} from './SectionList';

import styles from './teacherHomepage.module.scss';

export const TeacherHomepage: React.FC = () => {
  const teacherName = useAppSelector(state => state.currentUser.displayName);

  return (
    <div className={styles.teacherHomepageBody}>
      <Heading2>{i18n.welcome({teacherName: teacherName})}</Heading2>
      <SectionList />
    </div>
  );
};
