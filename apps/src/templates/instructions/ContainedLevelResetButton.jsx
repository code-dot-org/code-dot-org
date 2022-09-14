import React from 'react';
import PropTypes from 'prop-types';
import Button from '@cdo/apps/templates/Button';
import HelpTip from '@cdo/apps/lib/ui/HelpTip';
import {CourseRoles} from '@cdo/apps/templates/currentUserRedux';
import {resetContainedLevel} from '@cdo/apps/code-studio/levels/codeStudioLevels';
import {connect} from 'react-redux';
import {queryUserProgress} from '@cdo/apps/code-studio/progressRedux';
import i18n from '@cdo/locale';

const ContainedLevelResetButton = ({
  userId,
  queryUserProgress,
  hasLevelResults,
  userRoleInCourse
}) => {
  if (userRoleInCourse !== CourseRoles.Instructor) {
    return null;
  }
  return (
    <div>
      <Button
        text={i18n.deleteAnswer()}
        onClick={() => {
          resetContainedLevel().then(() => {
            queryUserProgress(userId);
          });
        }}
        color={Button.ButtonColor.red}
        disabled={!hasLevelResults}
      />
      <HelpTip>{i18n.deleteAnswerHelpTip()}</HelpTip>
    </div>
  );
};

ContainedLevelResetButton.propTypes = {
  userId: PropTypes.number,
  queryUserProgress: PropTypes.func.isRequired,
  hasLevelResults: PropTypes.bool,
  userRoleInCourse: PropTypes.string
};

export default connect(
  state => ({
    hasLevelResults: !!state.progress.levelResults[
      parseInt(state.progress.currentLevelId)
    ],
    userId: state.pageConstants.userId,
    userRoleInCourse: state.currentUser.userRoleInCourse
  }),
  dispatch => ({
    queryUserProgress(userId) {
      dispatch(queryUserProgress(userId));
    }
  })
)(ContainedLevelResetButton);
