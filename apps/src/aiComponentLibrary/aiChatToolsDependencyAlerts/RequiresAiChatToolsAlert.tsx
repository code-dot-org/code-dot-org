import Link from '@code-dot-org/component-library/link';
import NotificationBanner from '@code-dot-org/component-library/notification-banner';
import {Button as MuiButton} from '@mui/material';
import React from 'react';

import {
  AI_COUNTRY_AVAILABILITY_SUPPORT_LINK,
  AI_SETTINGS_SUPPORT_LINK,
  usOnlyModelsEssentialMessage,
  UsOnlyModelsSubject,
} from '@cdo/apps/aichat/constants';
import {AiChatAccessLevel} from '@cdo/apps/aichat/types/accessControls';
import {selectedSectionSelector} from '@cdo/apps/templates/teacherDashboard/teacherSectionsReduxSelectors';
import {TEACHER_NAVIGATION_PATHS} from '@cdo/apps/templates/teacherNavigation/TeacherNavigationPaths';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import {navigateToHref} from '@cdo/apps/utils';
import {AiChatAccessLevels} from '@cdo/generated-scripts/sharedConstants';

import AiChatToolsInfoAlert from './AiChatToolsInfoAlert';

import styles from './ai-chat-tools-dependency-alerts.module.scss';

interface RequiresAiChatToolsAlertProps {
  /** What this page is about, which is the noun the warning uses for it. */
  subject: UsOnlyModelsSubject;
  /** Whether that subject needs AI models the teacher's region blocks. */
  requiresInaccessibleAiModels?: boolean;
}

/**
 * Alerts the teacher that a course or unit requires AI Chat tools, or
 * warns them loudly if they have it turned off.
 *
 * Callers render this only where AI Chat tools are essential to the assigned
 * curriculum, so nothing here re-checks that.
 */
const RequiresAiChatToolsAlert: React.FC<RequiresAiChatToolsAlertProps> = ({
  subject,
  requiresInaccessibleAiModels,
}) => {
  const selectedSection = useAppSelector(selectedSectionSelector);
  const handleReviewAiSettings = React.useCallback(() => {
    navigateToHref(
      `/teacher_dashboard/sections/${selectedSection.id}/${TEACHER_NAVIGATION_PATHS.aiChatSettings}`
    );
  }, [selectedSection]);

  const aiChatAccessLevel = selectedSection?.aiChatAccessLevel as
    | AiChatAccessLevel
    | undefined;

  // Blocked models and a disabled access level are independent problems, and a
  // teacher can be hit by both at once, so each gets its own banner.
  const usOnlyModelsBlocked = !!requiresInaccessibleAiModels;

  return (
    <>
      {usOnlyModelsBlocked && (
        <NotificationBanner
          variant="error"
          style="filled"
          className={styles.chatToolsAlert}
          title=""
          description={
            <>
              {usOnlyModelsEssentialMessage(subject)}&nbsp;&nbsp;
              <Link
                href={AI_COUNTRY_AVAILABILITY_SUPPORT_LINK}
                text="Learn more"
                type="secondary"
                size="s"
                openInNewTab
              />
            </>
          }
          icon={{iconName: 'triangle-exclamation', iconStyle: 'solid'}}
        />
      )}
      {aiChatAccessLevel !== AiChatAccessLevels.DISABLED && (
        <AiChatToolsInfoAlert text="This course requires the use of AI chat tools to complete." />
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
              <MuiButton
                variant="outlined"
                color="secondary"
                size="medium"
                onClick={handleReviewAiSettings}
                type="button"
              >
                {'Review AI Settings'}
              </MuiButton>
            )
          }
        />
      )}
    </>
  );
};
export default RequiresAiChatToolsAlert;
