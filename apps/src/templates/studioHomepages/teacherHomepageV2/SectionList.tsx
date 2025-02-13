import React from 'react';

import {Heading4} from '@cdo/apps/componentLibrary/typography';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import i18n from '@cdo/locale';

import styles from './teacherHomepage.module.scss';

export const SectionList: React.FC = () => {
  const sections = useAppSelector(state => state.teacherSections.sections);
  console.log(sections);

  return (
    <div className={styles.sectionList}>
      <Heading4>{i18n.classSections()}</Heading4>
    </div>
  );
};
