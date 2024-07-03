import {Button} from '@cdo/apps/componentLibrary/button';
import {CourseRoles} from '@cdo/apps/templates/currentUserRedux';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import i18n from '@cdo/locale';
import {resetPredictProgress} from '../../redux/predictLevelRedux';
import React from 'react';

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
      />
    </div>
  );
};

export default PredictResetButton;
