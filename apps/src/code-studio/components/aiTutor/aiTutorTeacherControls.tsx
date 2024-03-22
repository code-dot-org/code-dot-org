import React, {useEffect, useState} from 'react';
import {fetchStudents} from '@cdo/apps/aiTutor/accessControlsApi';
import StudentAccessToggle from './studentAccessToggle';
import style from './chat-messages-table.module.scss';
import {StudentAccessData} from '@cdo/apps/aiTutor/types';

/**
 * Renders toggles to control student access to AI Tutor.
 */

interface AITutorTeacherControlsProps {
  sectionId: number;
}

const AITutorTeacherControls: React.FunctionComponent<
  AITutorTeacherControlsProps
> = ({sectionId}) => {
  const [students, setStudents] = useState<StudentAccessData[]>([]);
  const [globalErrorMessage, setGlobalErrorMessage] = useState<string | null>(
    null
  );

  const displayGlobalError = (error: string) => {
    setGlobalErrorMessage(error);
    setTimeout(() => setGlobalErrorMessage(null), 5000);
  };

  useEffect(() => {
    (async () => {
      try {
        const students = await fetchStudents(sectionId);
        setStudents(students);
      } catch (error) {
        displayGlobalError('Failed to fetch students. Please try again.');
      }
    })();
  }, [sectionId]);

  return (
    <div>
      {globalErrorMessage && (
        <div className={style.alert}>{globalErrorMessage}</div>
      )}
      <table>
        <thead>
          <tr>
            <td>
              <div className={style.header}>Id</div>
            </td>
            <td>
              <div className={style.header}>Student</div>
            </td>
            <td>
              <div className={style.header}>Allow Access to AI Tutor</div>
            </td>
          </tr>
        </thead>
        <tbody>
          {students.map(student => (
            <StudentAccessToggle
              key={student.id}
              student={student}
              displayGlobalError={error => {
                setGlobalErrorMessage(error);
                setTimeout(() => setGlobalErrorMessage(null), 3000);
              }}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AITutorTeacherControls;
