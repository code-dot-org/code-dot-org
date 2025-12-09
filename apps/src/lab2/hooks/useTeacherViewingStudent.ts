import {isReadOnlyWorkspace} from '@cdo/apps/lab2/redux/lab2ReduxSelectors';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

// Determine if a teacher is viewing a student's project in read-only mode.
// Returns the viewAsUserId and a boolean indicating if the teacher is viewing a student's work.
export function useTeacherViewingStudent() {
  const viewAsUserId = useAppSelector(state => state.progress.viewAsUserId);
  const isReadOnly = useAppSelector(isReadOnlyWorkspace);

  const teacherViewingStudent = Boolean(viewAsUserId && isReadOnly);

  return {viewAsUserId, teacherViewingStudent};
}
