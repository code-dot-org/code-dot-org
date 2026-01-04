import React, {PropsWithChildren} from 'react';

import {CourseRoles} from '@code-dot-org/user';

import {useAppSelector} from '../../redux/store';

const InstructorsOnly: React.FunctionComponent<PropsWithChildren> = ({children}) => {
  const isInstructor: boolean = useAppSelector(state => state.currentUser.userRoleInCourse === CourseRoles.Instructor);

  return isInstructor ? children : null;
};

export default InstructorsOnly;
