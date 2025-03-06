import React from 'react';

import {SectionMap} from '@cdo/apps/templates/teacherDashboard/types/teacherSectionTypes';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {SectionCard} from './SectionCard';

import styles from './teacherHomepage.module.scss';

interface SectionListProps {
  showHiddenOnly: boolean;
}

export const SectionList: React.FC<SectionListProps> = ({showHiddenOnly}) => {
  const sections: SectionMap = useAppSelector(
    state => state.teacherSections.sections
  );

  const filteredSectionList = React.useMemo(() => {
    const sectionElementList: JSX.Element[] = [];
    for (const [k, section] of Object.entries(sections)) {
      if (showHiddenOnly === section.hidden) {
        sectionElementList.push(<SectionCard key={k} section={section} />);
      }
    }
    return sectionElementList;
  }, [sections, showHiddenOnly]);

  return <div className={styles.sectionList}>{filteredSectionList}</div>;
};
