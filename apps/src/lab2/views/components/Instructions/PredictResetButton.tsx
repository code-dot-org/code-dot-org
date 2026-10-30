import Alert from '@code-dot-org/component-library/alert';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton} from '@mui/material';
import React from 'react';

import {resetPredictProgress} from '@cdo/apps/lab2/redux/predictLevelRedux';
import HelpTip from '@cdo/apps/sharedComponents/HelpTip';
import {CourseRoles} from '@cdo/apps/templates/currentUserRedux';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import i18n from '@cdo/locale';

import moduleStyles from './predict.module.scss';

// Modernized version of src/templates/instructions/ContainedLevelResetButton.
// This component handles showing the predict reset button for instructors.
const PredictResetButton: React.FunctionComponent = () => {
  const userRoleInCourse = useAppSelector(
    state => state.currentUser.userRoleInCourse
  );
  const teacherViewingStudentWork = useAppSelector(
    state => state.progress.viewAsUserId !== null
  );
  const scriptId = useAppSelector(state => state.progress.scriptId);
  const currentLevelId = useAppSelector(state => state.progress.currentLevelId);
  const userId = useAppSelector(state => state.currentUser.userId);
  const hasSubmitted = useAppSelector(
    state => state.predictLevel.hasSubmittedResponse
  );
  const resetFailed = useAppSelector(state => state.predictLevel.resetFailed);
  const dispatch = useAppDispatch();

  if (
    userRoleInCourse !== CourseRoles.Instructor ||
    teacherViewingStudentWork
  ) {
    return null;
  }

  function handleResetClick() {
    dispatch(resetPredictProgress({scriptId, currentLevelId, userId}));
  }

  return (
    <>
      <div className={moduleStyles.resetButtonRow}>
        <MuiButton
          variant="outlined"
          color="error"
          size="small"
          loadingPosition="start"
          disabled={!hasSubmitted}
          className={moduleStyles.resetButton}
          onClick={handleResetClick}
          type="button"
          startIcon={<FontAwesomeV6Icon iconStyle="solid" iconName="trash" />}
        >
          {i18n.deleteAnswer()}
        </MuiButton>
        <span className={moduleStyles.resetButtonRowSpace}>
          <HelpTip>{i18n.deleteAnswerHelpTip()}</HelpTip>
        </span>
      </div>
      {resetFailed && (
        <Alert
          type="danger"
          text={i18n.errorResettingAnswer()}
          className={moduleStyles.resetError}
        />
      )}
    </>
  );
};

export default PredictResetButton;
