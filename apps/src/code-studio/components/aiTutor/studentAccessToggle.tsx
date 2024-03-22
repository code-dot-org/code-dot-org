import React, {useState} from 'react';
import style from './chat-messages-table.module.scss';
import Toggle from '@cdo/apps/componentLibrary/toggle/Toggle';
import {StudentAccessData} from '@cdo/apps/aiTutor/types';

interface StudentAccesToggleProps {
  student: StudentAccessData;
}

const StudentAccessToggle: React.FunctionComponent<StudentAccesToggleProps> = ({
  student,
}) => {
  const [hasAITutorAccess, setHasAITutorAccess] = useState(
    !student.aiTutorAccessDenied
  );

  // TODO: Implement this functionality
  const handleToggle = () => {
    setHasAITutorAccess(!hasAITutorAccess);
    console.log('hasAITutorAccess', hasAITutorAccess);
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
