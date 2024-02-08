import React, {useState} from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import LevelTypesBox from './LevelTypesBox';
import TeacherActionsBox from './TeacherActionsBox';
import AssignmentCompletionStatesBox from './AssignmentCompletionStatesBox';
import styles from './progress-table-legend.module.scss';
import {Heading6} from '@cdo/apps/componentLibrary/typography';
import FontAwesome from '../FontAwesome';

export default function IconKey({isViewingLevelProgress, hasLevelValidation}) {
  const [isOpen, setIsOpen] = useState(false);

  const caret = isOpenA => (isOpenA ? 'caret-down' : 'caret-right');

  // TO-DO (TEACH-800): Make content responsive to view on page
  // TO-DO (TEACH-801): Fix spacing between boxes once width of the page is expanded
  const sectionContent = () => (
    <div>
      <AssignmentCompletionStatesBox
        isViewingLevelProgress={isViewingLevelProgress}
        hasValidatedLevels={hasLevelValidation}
      />
      <TeacherActionsBox isViewingLevelProgress={true} />
      <LevelTypesBox />
    </div>
  );

  const clickListener = () => setIsOpen(!isOpen);

  return (
    <div
      className={styles.iconKey}
      aria-expanded={isOpen}
      aria-label={i18n.iconKey()}
    >
      <div onClick={clickListener} className={styles.iconKeyTitle}>
        <Heading6>
          <FontAwesome className={styles.iconKeyCaret} icon={caret(isOpen)} />
          {i18n.iconKey()}
        </Heading6>
      </div>
      {isOpen && sectionContent()}
    </div>
  );
}

IconKey.propTypes = {
  isViewingLevelProgress: PropTypes.bool,
  hasLevelValidation: PropTypes.bool,
};
