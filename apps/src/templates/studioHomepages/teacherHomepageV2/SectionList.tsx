import {Heading4} from '@code-dot-org/component-library/typography';
import React from 'react';

import {SectionMap} from '@cdo/apps/templates/teacherDashboard/types/teacherSectionTypes';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import i18n from '@cdo/locale';

import {SectionCard} from './SectionCard';

import styles from './teacherHomepage.module.scss';

export const SectionList: React.FC = () => {
  const sections: SectionMap = useAppSelector(
    state => state.teacherSections.sections
  );

  const getSectionList = (sections: SectionMap) => {
    const sectionElementList: JSX.Element[] = [];
    for (const [k, v] of Object.entries(sections)) {
      sectionElementList.push(<SectionCard key={k} section={v} />);
    }
    return sectionElementList;
  };

  return (
    <div className={styles.sectionList}>
      <Heading4>{i18n.classSections()}</Heading4>
      {getSectionList(sections)}
    </div>
  );
};
