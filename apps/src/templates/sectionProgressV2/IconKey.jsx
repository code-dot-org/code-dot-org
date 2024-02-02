import React, {useState} from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import Button from '@cdo/apps/templates/Button';
import color from '@cdo/apps/util/color';
import LevelTypesBox from './LevelTypesBox';
import TeacherActionsBox from './TeacherActionsBox';
import AssignmentCompletionStatesBox from './AssignmentCompletionStatesBox';

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
    <div>
      <Button
        id="icon-key"
        style={styles.label}
        styleAsText
        icon={caret(isOpen)}
        onClick={clickListener}
      >
        {i18n.iconKey()}
      </Button>
      {isOpen && sectionContent()}
    </div>
  );
}

IconKey.propTypes = {
  isViewingLevelProgress: PropTypes.bool,
  hasLevelValidation: PropTypes.bool,
};

const styles = {
  label: {
    fontFamily: 'Metropolis',
    color: color.light_gray_900,
    fontSize: '16px',
    fontWeight: '600',
    lineHeight: '148%',
  },
};
