import React from 'react';

import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import AiChatToolsInfoAlert from './AiChatToolsInfoAlert';

/**
 * Warns that the assigned course or unit needs AI chat tools enabled.
 * Used when a teacher assigns a section to AI-dependent curriculum.
 *
 * Currently, all non-essential AI Chat Tools (i.e. ai tutor on non weblab2 levels) are gated behind
 * the ai tutor pilot. This alert and the accompanying auto-enablement of AI Chat Tools only applies
 * when the user is in the pilot.
 */
const AssigningAvailableAiChatToolsAlert: React.FC = () => {
  const aiTutorEnabledForPilot = useAppSelector(
    state => state.currentUser?.aiTutorEnabledForPilot
  );

  if (!aiTutorEnabledForPilot) {
    return null;
  }

  return (
    <AiChatToolsInfoAlert text="This course has AI chat tools available for students. By assigning this course, you consent to enabling access to AI chat tools for this class section. You can disable access on the AI Settings page at any time." />
  );
};

export default AssigningAvailableAiChatToolsAlert;
