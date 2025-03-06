import React from 'react';

import {Section} from '@cdo/apps/templates/teacherDashboard/types/teacherSectionTypes';

import styles from './teacherHomepage.module.scss';

interface SectionCardBodyProps {
  section: Section;
}

export const SectionCardBody: React.FC<SectionCardBodyProps> = ({section}) => {
  return <div className={styles.sectionCardBody}>{section.name}</div>;
};
