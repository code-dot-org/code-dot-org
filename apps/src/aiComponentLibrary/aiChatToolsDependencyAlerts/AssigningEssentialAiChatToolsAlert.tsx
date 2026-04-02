import Alert, {alertTypes} from '@code-dot-org/component-library/alert';
import React from 'react';

import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import {AiChatAccessLevels} from '@cdo/generated-scripts/sharedConstants';

import AiChatToolsInfoAlert from './AiChatToolsInfoAlert';

/**
 * Warns that the assigned course or unit needs AI chat tools enabled.
 * Used when a teacher assigns a section to AI-dependent curriculum.
 */
const AssigningEssentialAiChatToolsAlert: React.FC = () => {
  const aiChatAccessLevel = useAppSelector(
    state => state.currentUser.aiChatAccessLevel
  );

  return (
    <>
      <AiChatToolsInfoAlert text="This course requires the use of AI chat tools to complete. By assigning this course, you consent to students in these class sections accessing and using AI chat tools." />
      {aiChatAccessLevel === AiChatAccessLevels.DISABLED && (
        <Alert
          type={alertTypes.warning}
          text="Yo, you need to get verified or this stuff is gonna be hella broken!"
        />
      )}
    </>
  );
};

export default AssigningEssentialAiChatToolsAlert;
