import type {FunctionComponent, PropsWithChildren} from 'react';

import {CourseRoles} from '@code-dot-org/platform/user';

import {useAppSelector} from '../../redux/store';

const InstructorsOnly: FunctionComponent<PropsWithChildren> = ({children}) => {
  const isInstructor: boolean = useAppSelector(
    state => state.currentUser.userRoleInCourse === CourseRoles.Instructor,
  );

  return isInstructor ? children : null;
};

export default InstructorsOnly;
