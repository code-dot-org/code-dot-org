import React, {useState} from 'react';

import {handleUpdateAITutorAccess} from '@cdo/apps/aiTutor/accessControlsApi';
import {StudentAccessData} from '@cdo/apps/aiTutor/types';
import Toggle from '@cdo/apps/componentLibrary/toggle/Toggle';

import style from './chat-messages-table.module.scss';

interface StudentAccessToggleProps {
  student: StudentAccessData;
  displayGlobalError: (error: string) => void;
}

const StudentAccessToggle: React.FunctionComponent<
  StudentAccessToggleProps
> = ({student, displayGlobalError}) => {
  const [hasAITutorAccess, setHasAITutorAccess] = useState(
    !student.aiTutorAccessDenied
  );

  const handleToggle = () => {
    const originalValue = hasAITutorAccess;
    const newValue = !hasAITutorAccess;

    setHasAITutorAccess(newValue);
    handleUpdateAITutorAccess(student.id, newValue).catch(() => {
      setHasAITutorAccess(originalValue);
      displayGlobalError('Failed to update student access. Please try again.');
    });
  };

  return (
    <tr className={style.row}>
      <td className={style.cell}>{student.id}</td>
      <td className={style.cell}>{student.name}</td>
      <td>
        <Toggle
          checked={hasAITutorAccess}
          onChange={handleToggle}
          name="aiTutorAccessToggle"
          position={'right'}
          size={'s'}
        />
      </td>
    </tr>
  );
};

export default StudentAccessToggle;
