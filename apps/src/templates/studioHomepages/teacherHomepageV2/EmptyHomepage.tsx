import React from 'react';

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
      headline="It's a bit empty here"
      descriptionText={
        showHiddenOnly
          ? 'You haven’t archived any class sections yet.'
          : 'You haven’t created any class sections yet.'
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
