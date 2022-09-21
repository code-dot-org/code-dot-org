import React, {useMemo, useState} from 'react';
import PropTypes from 'prop-types';
import Button from '@cdo/apps/templates/Button';
import HelpTip from '@cdo/apps/lib/ui/HelpTip';
import {CourseRoles} from '@cdo/apps/templates/currentUserRedux';
import {resetContainedLevel} from '@cdo/apps/code-studio/levels/codeStudioLevels';
import {connect} from 'react-redux';
import {queryUserProgress} from '@cdo/apps/code-studio/progressRedux';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';
import experiments from '@cdo/apps/util/experiments';

export const UnconnectedContainedLevelResetButton = ({
  userId,
  queryUserProgress,
  hasLevelResults,
  userRoleInCourse,
  codeIsRunning
}) => {
  const isEnabled = useMemo(
    () => experiments.isEnabled('instructorPredictLevelReset'),
    []
  );
  const [resetFailed, setResetFailed] = useState(false);
  if (userRoleInCourse !== CourseRoles.Instructor || !isEnabled) {
    return null;
  }
  return (
    <div>
      <Button
        text={i18n.deleteAnswer()}
        onClick={() => {
          resetContainedLevel().then(
            () => {
              queryUserProgress(userId);
              setResetFailed(false);
            },
            () => setResetFailed(true)
          );
        }}
        color={Button.ButtonColor.red}
        disabled={!hasLevelResults || !!codeIsRunning}
      />
      <HelpTip>{i18n.deleteAnswerHelpTip()}</HelpTip>
      {resetFailed && (
        <span style={styles.error}>{i18n.errorResettingAnswer()}</span>
      )}
    </div>
  );
};

UnconnectedContainedLevelResetButton.propTypes = {
  userId: PropTypes.number,
  queryUserProgress: PropTypes.func.isRequired,
  hasLevelResults: PropTypes.bool,
  userRoleInCourse: PropTypes.string,
  codeIsRunning: PropTypes.bool
};

export default connect(
  state => ({
    hasLevelResults: !!state.progress.levelResults[
      parseInt(state.progress.currentLevelId)
    ],
    userId: state.pageConstants.userId,
    userRoleInCourse: state.currentUser.userRoleInCourse,
    codeIsRunning: state.runState.isRunning
  }),
  dispatch => ({
    queryUserProgress(userId) {
      dispatch(queryUserProgress(userId));
    }
  })
)(UnconnectedContainedLevelResetButton);

const styles = {
  error: {
    color: color.red,
    fontStyle: 'italic'
  }
};
