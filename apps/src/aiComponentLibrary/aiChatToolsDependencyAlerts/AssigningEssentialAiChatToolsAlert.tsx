import React from 'react';

import AiChatToolsInfoAlert from './AiChatToolsInfoAlert';

/**
 * Warns that the assigned course or unit needs AI chat tools enabled.
 * Used when a teacher assigns a section to AI-dependent curriculum.
 */
const AssigningEssentialAiChatToolsAlert: React.FC = () => {
  return (
    <AiChatToolsInfoAlert text="This course requires the use of AI chat tools to complete. By assigning this course, you consent to students in these class sections accessing and using AI chat tools." />
  );
};

export default AssigningEssentialAiChatToolsAlert;
