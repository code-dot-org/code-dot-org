import Alert, {alertTypes} from '@code-dot-org/component-library/alert';
import Button from '@code-dot-org/component-library/button';
import Link from '@code-dot-org/component-library/link';
import NotificationBanner from '@code-dot-org/component-library/notification-banner';
import React from 'react';

import {AI_SETTINGS_SUPPORT_LINK} from '@cdo/apps/aichat/constants';
import {AiChatAccessLevel} from '@cdo/apps/aichat/types/accessControls';
import {AiChatAccessLevels} from '@cdo/generated-scripts/sharedConstants';

import styles from './course-overview.module.scss';

const RequiresAiChatToolsAlert: React.FC<{
  aiChatAccessLevel?: AiChatAccessLevel;
}> = ({aiChatAccessLevel}) => {
  return (
    <>
      {aiChatAccessLevel !== AiChatAccessLevels.DISABLED && (
        <Alert
          text="This course requires the use of AI chat tools to complete."
          type={alertTypes.aqua}
          link={{
            href: AI_SETTINGS_SUPPORT_LINK,
            text: 'Learn more',
          }}
          icon={{iconName: 'ai-bot-solid', iconFamily: 'kit'}}
          showIcon={true}
          className={styles.chatToolsInfo}
        />
      )}
      {aiChatAccessLevel === AiChatAccessLevels.DISABLED && (
        // todo: change this to use the notification component with the button in it.
        <>
          <Alert
            text="This course requires the use of AI tools to complete. AI tools are currently disabled in this class section, so students won't be able to complete some lessons in this course."
            type={alertTypes.danger}
            icon={{iconName: 'triangle-exclamation', iconStyle: 'solid'}}
            link={{
              href: AI_SETTINGS_SUPPORT_LINK,
              text: 'Learn more',
            }}
            className={styles.chatToolsAlert}
          />
          <NotificationBanner
            variant="error"
            style="filled"
            title="AI chat tools are disabled for this class section"
            description={
              <>
                "This course requires the use of AI tools to complete. AI tools
                are currently disabled in this class section, so students won't
                be able to complete some lessons in this course."
                <Link href={AI_SETTINGS_SUPPORT_LINK}>Learn more</Link>
              </>
            }
            icon={{iconName: 'triangle-exclamation', iconStyle: 'solid'}}
            actions={
              <>
                <Button type="secondary">Review AI Settings</Button>
              </>
            }
          />
        </>
      )}
    </>
  );
};
export default RequiresAiChatToolsAlert;
