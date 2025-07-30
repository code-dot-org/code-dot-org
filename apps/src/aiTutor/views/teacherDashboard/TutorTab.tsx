import React from 'react';

import AccessControls from './AccessControls';

/**
 * Renders table of student chat messages and toggles to control student access to AI Tutor.
 */
interface TutorTabProps {
  sectionId: number;
}

const TutorTab: React.FC<TutorTabProps> = ({sectionId}) => {
  return <AccessControls sectionId={sectionId} />;
};

export default TutorTab;
