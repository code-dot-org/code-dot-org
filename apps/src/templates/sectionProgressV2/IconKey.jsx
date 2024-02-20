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
  const [isVewingDetails, setIsViewingDetails] = useState(true);

  const toggleIsViewingDetails = () => setIsViewingDetails(true);

  const isViewingLevelProgress = expandedLessonIds.length > 0;

  const caret = isOpenA => (isOpenA ? 'caret-down' : 'caret-right');

  const sectionContent = () => (
    <div>
      <AssignmentCompletionStatesBox
        hasValidatedLevels={isViewingValidatedLevel}
      />
      <TeacherActionsBox isViewingLevelProgress={isViewingLevelProgress} />
      {isViewingLevelProgress && <LevelTypesBox />}
    </div>
  );

  const clickListener = () => setIsOpen(!isOpen);

  return (
    <div
      className={styles.iconKey}
      aria-expanded={isOpen}
      aria-label={i18n.iconKey()}
    >
      <div
        onClick={clickListener}
        className={styles.iconKeyTitle}
        data-testid="expandable-container"
      >
        <Heading6>
          <FontAwesome className={styles.iconKeyCaret} icon={caret(isOpen)} />
          {i18n.iconKey()}
        </Heading6>
        <Link type="primary" size="s" onClick={toggleIsViewingDetails}>
          More Details
        </Link>
      </div>
      {isOpen && sectionContent()}
      {isVewingDetails && (
        <MoreDetailsDialog onClose={() => setIsViewingDetails(false)} />
      )}
    </div>
  );
}

IconKey.propTypes = {
  isViewingValidatedLevel: PropTypes.bool,
  expandedLessonIds: PropTypes.array,
};
