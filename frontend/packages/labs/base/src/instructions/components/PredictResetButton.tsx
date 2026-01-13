import type {FunctionComponent} from 'react';

import Alert from '@code-dot-org/component-library/alert';
import {Button} from '@code-dot-org/component-library/button';
import {CourseRoles} from '@code-dot-org/user';

import {resetPredictProgress} from '../../redux/predictLevelSlice';
import {useAppDispatch, useAppSelector} from '../../redux/store';

import HelpTip from './HelpTip';

import moduleStyles from './predict.module.scss';

// Modernized version of the old src/templates/instructions/ContainedLevelResetButton.
// This component handles showing the predict reset button for instructors.
const PredictResetButton: FunctionComponent = () => {
  const userRoleInCourse = useAppSelector(
    state => state.currentUser.userRoleInCourse,
  );
  const teacherViewingStudentWork = useAppSelector(
    state => state.progress.viewAsUserId !== null,
  );
  const scriptId = useAppSelector(state => state.progress.scriptId);
  const currentLevelId = useAppSelector(state => state.progress.currentLevelId);
  const userId = useAppSelector(state => state.currentUser.userId);
  const hasSubmitted = useAppSelector(
    state => state.predictLevel.hasSubmittedResponse,
  );
  const resetFailed = useAppSelector(state => state.predictLevel.resetFailed);
  const dispatch = useAppDispatch();

  if (
    userRoleInCourse !== CourseRoles.Instructor ||
    teacherViewingStudentWork
  ) {
    return;
  }

  function handleResetClick() {
    if (userId !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      dispatch<any>(resetPredictProgress({scriptId, currentLevelId, userId}));
    }
  }

  return (
    <>
      <div className={moduleStyles.resetButtonRow}>
        <Button
          text="Delete Answer"
          onClick={handleResetClick}
          size={'s'}
          disabled={!hasSubmitted}
          iconLeft={{iconStyle: 'solid', iconName: 'trash'}}
          type={'secondary'}
          color={'destructive'}
          className={moduleStyles.resetButton}
        />
        <span className={moduleStyles.resetButtonRowSpace}>
          <HelpTip>
            Clear your answer and reset the lesson. This is an instructor-only
            feature.
          </HelpTip>
        </span>
      </div>
      {resetFailed && (
        <Alert
          type="danger"
          text="There was an error deleting your answer. You may not have permissions to delete this answer."
          className={moduleStyles.resetError}
        />
      )}
    </>
  );
};

export default PredictResetButton;
