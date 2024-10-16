import React from 'react';

import Alert from '@cdo/apps/componentLibrary/alert/Alert';
import {Button, buttonColors} from '@cdo/apps/componentLibrary/button';
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
    <div>
      <Button
        text={i18n.deleteAnswer()}
        onClick={handleResetClick}
        size={'s'}
        disabled={!hasSubmitted}
        iconLeft={{iconStyle: 'solid', iconName: 'trash'}}
        type={'secondary'}
        color={buttonColors.destructive}
        className={moduleStyles.resetButton}
      />
      <HelpTip>{i18n.deleteAnswerHelpTip()}</HelpTip>
      {resetFailed && (
        <Alert
          type="danger"
          text={i18n.errorResettingAnswer()}
          className={moduleStyles.resetError}
        />
      )}
    </div>
  );
};

export default PredictResetButton;
