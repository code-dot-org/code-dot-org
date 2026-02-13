import Alert, {alertTypes} from '@code-dot-org/component-library/alert';
import Button from '@code-dot-org/component-library/button';
import Link from '@code-dot-org/component-library/link';
import NotificationBanner from '@code-dot-org/component-library/notification-banner';
import React from 'react';

import {AI_SETTINGS_SUPPORT_LINK} from '@cdo/apps/aichat/constants';
import {AiChatAccessLevel} from '@cdo/apps/aichat/types/accessControls';
import {selectedSectionSelector} from '@cdo/apps/templates/teacherDashboard/teacherSectionsReduxSelectors';
import {TEACHER_NAVIGATION_PATHS} from '@cdo/apps/templates/teacherNavigation/TeacherNavigationPaths';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import {navigateToHref} from '@cdo/apps/utils';
import {AiChatAccessLevels} from '@cdo/generated-scripts/sharedConstants';

import styles from './ai-chat-tools-dependency-alerts.module.scss';

const RequiresAiChatToolsAlert: React.FC = () => {
  const selectedSection = useAppSelector(selectedSectionSelector);
  const handleReviewAiSettings = React.useCallback(() => {
    navigateToHref(
      `/teacher_dashboard/sections/${selectedSection.id}/${TEACHER_NAVIGATION_PATHS.aiChatSettings}`
    );
  }, [selectedSection]);

  const aiChatAccessLevel = selectedSection?.aiChatAccessLevel as
    | AiChatAccessLevel
    | undefined;

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
        <NotificationBanner
          variant="error"
          style="filled"
          className={styles.chatToolsAlert}
          title=""
          description={
            <>
              This course requires the use of AI tools to complete. AI tools are
              currently disabled in this class section, so students won't be
              able to complete some lessons in this course.&nbsp;&nbsp;
              <Link
                href={AI_SETTINGS_SUPPORT_LINK}
                text="Learn more"
                type="secondary"
                size="s"
                openInNewTab
              />
            </>
          }
          icon={{iconName: 'triangle-exclamation', iconStyle: 'solid'}}
          actions={
            selectedSection?.id && (
              <Button
                type="secondary"
                color="black"
                onClick={handleReviewAiSettings}
                text="Review AI Settings"
              />
            )
          }
        />
      )}
    </>
  );
};
export default RequiresAiChatToolsAlert;
