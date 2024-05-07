import React, {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';

import {fetchStudents} from '@cdo/apps/aiTutor/accessControlsApi';
import {StudentAccessData} from '@cdo/apps/aiTutor/types';
import Spinner from '@cdo/apps/code-studio/pd/components/spinner';

import style from './interactions-table.module.scss';
import StudentAccessToggle from './StudentAccessToggle';
import SectionAccessToggle from './SectionAccessToggle';

/**
 * Renders toggles to control student access to AI Tutor.
 */

interface AccessControlsProps {
  sectionId: number;
}

interface SectionsData {
  [index: number]: {
    aiTutorEnabled: boolean;
  };
}

const AccessControls: React.FC<AccessControlsProps> = ({sectionId}) => {
  const [students, setStudents] = useState<StudentAccessData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [globalErrorMessage, setGlobalErrorMessage] = useState<string | null>(
    null
  );

  const aiTutorEnabledForSection = useSelector(
    (state: {teacherSections: {sections: SectionsData}}) =>
      state.teacherSections.sections[sectionId].aiTutorEnabled
  );

  const displayGlobalError = (error: string) => {
    setGlobalErrorMessage(error);
    setTimeout(() => setGlobalErrorMessage(null), 5000);
  };

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const students = await fetchStudents(sectionId);
        setStudents(students);
      } catch (error) {
        displayGlobalError('Failed to fetch students. Please try again.');
      }
      setIsLoading(false);
    })();
  }, [sectionId]);

  return (
    <div>
      {globalErrorMessage && (
        <div className={style.alert}>{globalErrorMessage}</div>
      )}
      <SectionAccessToggle sectionId={sectionId} />
      {aiTutorEnabledForSection ? (
        isLoading ? (
          <Spinner />
        ) : (
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
        )
      ) : null}
    </div>
  );
};

export default AccessControls;
