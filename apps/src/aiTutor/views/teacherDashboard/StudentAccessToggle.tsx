import React, {useState} from 'react';

import {handleUpdateAITutorAccess} from '@cdo/apps/aiTutor/accessControlsApi';
import Toggle from '@cdo/apps/componentLibrary/toggle/Toggle';

interface StudentAccessToggleProps {
  studentId: number;
  aiTutorAccessDenied: boolean;
  displayGlobalError: (error: string) => void;
}

const StudentAccessToggle: React.FunctionComponent<
  StudentAccessToggleProps
> = ({studentId, aiTutorAccessDenied, displayGlobalError}) => {
  const [hasAITutorAccess, setHasAITutorAccess] = useState(
    !aiTutorAccessDenied
  );

  const handleToggle = () => {
    const originalValue = hasAITutorAccess;
    const newValue = !hasAITutorAccess;

    setHasAITutorAccess(newValue);
    handleUpdateAITutorAccess(studentId, newValue).catch(() => {
      setHasAITutorAccess(originalValue);
      displayGlobalError('Failed to update student access. Please try again.');
    });
  };

  return (
    <Toggle
      checked={hasAITutorAccess}
      onChange={handleToggle}
      name="aiTutorStudentAccessToggle"
      position={'right'}
      size={'s'}
    />
  );
};

export default StudentAccessToggle;
