import Alert, {alertTypes} from '@code-dot-org/component-library/alert';
import React from 'react';

import {AI_SETTINGS_SUPPORT_LINK} from '@cdo/apps/aichat/constants';

/**
 * Warns that the assigned course or unit needs AI chat tools enabled.
 * Used when a teacher assigns a section to AI-dependent curriculum.
 */
const AiChatToolsAvailableAlert: React.FC = () => {
  return (
    <Alert
      type={alertTypes.aqua}
      text="This course has AI chat tools available for students. By assigning this course, you consent to enabling access to AI chat tools for this class section. You can disable access on the AI Settings page at any time."
      link={{
        href: AI_SETTINGS_SUPPORT_LINK,
        text: 'Learn more',
        openInNewTab: true,
      }}
      icon={{iconName: 'ai-bot-solid', iconFamily: 'kit'}}
      showIcon={true}
    />
  );
};

export default AiChatToolsAvailableAlert;
