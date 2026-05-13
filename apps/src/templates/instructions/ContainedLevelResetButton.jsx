import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton} from '@mui/material';
import PropTypes from 'prop-types';
import React, {useState} from 'react';
import {connect} from 'react-redux';

import {resetContainedLevel} from '@cdo/apps/code-studio/levels/codeStudioLevels';
import {queryUserProgress} from '@cdo/apps/code-studio/progressRedux';
import HelpTip from '@cdo/apps/sharedComponents/HelpTip';
import {CourseRoles} from '@cdo/apps/templates/currentUserRedux';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';

export const UnconnectedContainedLevelResetButton = ({
  teacherViewingStudentWork,
  userId,
  queryUserProgress,
  hasLevelResults,
  userRoleInCourse,
  codeIsRunning,
  serverScriptId,
  serverLevelId,
}) => {
  const [resetFailed, setResetFailed] = useState(false);

  if (
    userRoleInCourse !== CourseRoles.Instructor ||
    teacherViewingStudentWork
  ) {
    return null;
  }
  return (
    <div>
      <MuiButton
        variant="outlined"
        color="error"
        size="small"
        name="containedLevelResetButton"
        onClick={() => {
          resetContainedLevel().then(
            () => {
              queryUserProgress(userId);
              setResetFailed(false);
            },
            () => setResetFailed(true)
          );
        }}
        disabled={!hasLevelResults || !!codeIsRunning}
        type="button"
        startIcon={<FontAwesomeV6Icon iconStyle="solid" iconName="trash" />}
      >
        {i18n.deleteAnswer()}
      </MuiButton>
      <HelpTip>{i18n.deleteAnswerHelpTip()}</HelpTip>
      {resetFailed && (
        <span style={styles.error}>{i18n.errorResettingAnswer()}</span>
      )}
    </div>
  );
};

UnconnectedContainedLevelResetButton.propTypes = {
  teacherViewingStudentWork: PropTypes.bool,
  userId: PropTypes.number,
  queryUserProgress: PropTypes.func.isRequired,
  hasLevelResults: PropTypes.bool,
  userRoleInCourse: PropTypes.string,
  codeIsRunning: PropTypes.bool,
  // used for reporting
  serverScriptId: PropTypes.number,
  serverLevelId: PropTypes.number,
};

export default connect(
  state => ({
    hasLevelResults:
      !!state.progress.levelResults[parseInt(state.progress.currentLevelId)],
    userId: state.pageConstants.userId,
    userRoleInCourse: state.currentUser.userRoleInCourse,
    codeIsRunning: state.runState.isRunning,
    serverScriptId: state.pageConstants.serverScriptId,
    serverLevelId: state.pageConstants.serverLevelId,
  }),
  dispatch => ({
    queryUserProgress(userId) {
      dispatch(queryUserProgress(userId));
    },
  })
)(UnconnectedContainedLevelResetButton);

const styles = {
  error: {
    color: color.red,
    fontStyle: 'italic',
  },
};
