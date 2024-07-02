import {useAppSelector} from '@cdo/apps/util/reduxHooks';

interface PredictResetButtonProps {
  teacherViewingStudentWork: boolean;
  scriptId: number | null;
  currentLevelId: string | null;
}

const PredictResetButton: React.FunctionComponent = ({
  teacherViewingStudentWork,
  scriptId,
  currentLevelId,
}) => {
  const userRoleInCourse = useAppSelector(
    state => state.currentUser.userRoleInCourse
  );

};
