import React from 'react';

import AiChatToolsInfoAlert from './AiChatToolsInfoAlert';

/**
 * Warns that the assigned course or unit needs AI chat tools enabled.
 * Used when a teacher assigns a section to AI-dependent curriculum.
 */
const AssigningAvailableAiChatToolsAlert: React.FC = () => {
  return (
    <AiChatToolsInfoAlert text="This course has AI chat tools available for students. By assigning this course, you consent to enabling access to AI chat tools for this class section. You can disable access on the AI Settings page at any time." />
  );
};

export default AssigningAvailableAiChatToolsAlert;
