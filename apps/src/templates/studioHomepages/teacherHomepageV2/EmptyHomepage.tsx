import React from 'react';

import i18n from '@cdo/locale';

import {EmptyState} from '../../teacherNavigation/EmptyState';

import noArchivedSections from './images/no_archived_sections.png';
import SectionPreview from './SectionPreview';

import styles from './teacherHomepage.module.scss';
interface EmptyHomepageProps {
  showHiddenOnly: boolean;
}

export const EmptyHomepage: React.FC<EmptyHomepageProps> = ({
  showHiddenOnly,
}) => {
  if (!showHiddenOnly) {
    return <SectionPreview />;
  }

  return (
    <EmptyState
      headline={i18n.emptySectionHeadline()}
      descriptionText={i18n.emptyArchivedClassSections()}
      imageComponent={
        <img className={styles.emptyImage} src={noArchivedSections} alt="" />
      }
      button={null}
    />
  );
};
