import React, {useState} from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import LevelTypesBox from './LevelTypesBox';
import TeacherActionsBox from './TeacherActionsBox';
import AssignmentCompletionStatesBox from './AssignmentCompletionStatesBox';
import styles from './progress-table-legend.module.scss';
import {Heading6} from '@cdo/apps/componentLibrary/typography';
import FontAwesome from '../FontAwesome';
import Link from '@cdo/apps/componentLibrary/link';
import MoreDetailsDialog from './MoreDetailsDialog.jsx';

export default function IconKey({isViewingValidatedLevel, expandedLessonIds}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isIconDetailsOpen, setIconDetailsOpen] = useState(false);

  const toggleIsViewingDetails = event => {
    event.preventDefault();
    setIconDetailsOpen(true);
  };

  const isViewingLevelProgress = expandedLessonIds.length > 0;

  const caret = isOpenA => (isOpenA ? 'caret-down' : 'caret-right');

  const sectionContent = () => (
    <>
      <AssignmentCompletionStatesBox
        hasValidatedLevels={isViewingValidatedLevel}
      />
      <TeacherActionsBox isViewingLevelProgress={isViewingLevelProgress} />
      {isViewingLevelProgress && <LevelTypesBox />}
    </>
  );

  const clickListener = () => setIsOpen(!isOpen);

  return (
    <div
      className={styles.iconKey}
      aria-expanded={isOpen}
      aria-label={i18n.iconKey()}
    >
      <div className={styles.iconKeyHeader}>
        <div
          onClick={clickListener}
          className={styles.iconKeyTitle}
          data-testid="expandable-container"
        >
          <Heading6>
            <FontAwesome className={styles.iconKeyCaret} icon={caret(isOpen)} />
            {i18n.iconKey()}
          </Heading6>
        </div>
        <Link
          type="primary"
          size="s"
          onClick={toggleIsViewingDetails}
          className={styles.iconKeyMoreDetailsLink}
        >
          {i18n.moreDetails()}
        </Link>
      </div>
      {isOpen && sectionContent()}
      {isIconDetailsOpen && (
        <MoreDetailsDialog
          onClose={() => setIconDetailsOpen(false)}
          hasValidation={isViewingValidatedLevel}
        />
      )}
    </div>
  );
}

IconKey.propTypes = {
  isViewingValidatedLevel: PropTypes.bool,
  expandedLessonIds: PropTypes.array,
};
