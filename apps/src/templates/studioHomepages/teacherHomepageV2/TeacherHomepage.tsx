import React from 'react';

import {Heading2} from '@cdo/apps/componentLibrary/typography';
import i18n from '@cdo/locale';

import {SectionList} from './SectionList';

import styles from './teacherHomepage.module.scss';

export const TeacherHomepage: React.FC = () => {
  return (
    <div className={styles.teacherHomepageBody}>
      <Heading2>{i18n.welcome()}</Heading2>
      <SectionList />
    </div>
  );
};
