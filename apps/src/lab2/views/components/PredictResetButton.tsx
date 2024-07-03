import {Button} from '@cdo/apps/componentLibrary/button';
import {CourseRoles} from '@cdo/apps/templates/currentUserRedux';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import i18n from '@cdo/locale';
import {resetPredictProgress} from '@cdo/apps/lab2/redux/predictLevelRedux';
import moduleStyles from './predict.module.scss';
import React from 'react';
import HelpTip from '@cdo/apps/lib/ui/HelpTip';

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
        className={moduleStyles.predictResetButton}
        disabled={!hasSubmitted}
      />
      <HelpTip>{i18n.deleteAnswerHelpTip()}</HelpTip>
      {resetFailed && (
        <span className={moduleStyles.resetError}>
          {i18n.errorResettingAnswer()}
        </span>
      )}
    </div>
  );
};

export default PredictResetButton;
