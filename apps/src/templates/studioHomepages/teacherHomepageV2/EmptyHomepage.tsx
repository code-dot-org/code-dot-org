import React from 'react';

import i18n from '@cdo/locale';

import {EmptyState} from '../../teacherNavigation/EmptyState';

import noArchivedSections from './images/no_archived_sections.png';
import noSections from './images/no_sections.png';

import styles from './teacherHomepage.module.scss';
interface EmptyHomepageProps {
  showHiddenOnly: boolean;
}

export const EmptyHomepage: React.FC<EmptyHomepageProps> = ({
  showHiddenOnly,
}) => {
  return (
    <EmptyState
      headline={i18n.emptySectionHeadline()}
      descriptionText={
        showHiddenOnly
          ? i18n.emptyArchivedClassSections()
          : i18n.emptyClassSections()
      }
      imageComponent={
        <img
          className={styles.emptyImage}
          src={showHiddenOnly ? noArchivedSections : noSections}
          alt=""
        />
      }
      button={null}
    />
  );
};
