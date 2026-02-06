import {AI_SETTINGS_SUPPORT_LINK} from '@cdo/apps/aichat/constants';
import Alert, {alertTypes} from '@code-dot-org/component-library/alert';
import React from 'react';

/**
 * Warns that the assigned course or unit needs AI chat tools enabled.
 * Used when a teacher assigns a section to AI-dependent curriculum.
 */
const AiChatToolsRequiredAlert: React.FC = () => {
  return (
    <Alert
      type={alertTypes.aqua}
      text="This course requires the use of AI chat tools to complete. By assigning this course, you consent to students in these class sections accessing and using AI chat tools."
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

export default AiChatToolsRequiredAlert;
