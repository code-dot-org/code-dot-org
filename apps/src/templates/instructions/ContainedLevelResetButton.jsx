import React, {useState} from 'react';
import PropTypes from 'prop-types';
import Button from '@cdo/apps/templates/Button';
import HelpTip from '@cdo/apps/lib/ui/HelpTip';
import {CourseRoles} from '@cdo/apps/templates/currentUserRedux';
import {resetContainedLevel} from '@cdo/apps/code-studio/levels/codeStudioLevels';
import {connect} from 'react-redux';
import {queryUserProgress} from '@cdo/apps/code-studio/progressRedux';
import firehoseClient from '@cdo/apps/lib/util/firehose';
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

  const logButtonClick = () => {
    firehoseClient.putRecord({
      study: 'reset-predict-level',
      event: 'level-reset',
      user_id: userId,
      script_id: serverScriptId,
      level_id: serverLevelId,
    });
  };

  if (
    userRoleInCourse !== CourseRoles.Instructor ||
    teacherViewingStudentWork
  ) {
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
          logButtonClick();
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
