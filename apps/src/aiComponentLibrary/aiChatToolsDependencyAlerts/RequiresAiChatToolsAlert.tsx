import Link from '@code-dot-org/component-library/link';
import NotificationBanner from '@code-dot-org/component-library/notification-banner';
import {Button as MuiButton} from '@mui/material';
import React from 'react';

import {AI_SETTINGS_SUPPORT_LINK} from '@cdo/apps/aichat/constants';
import {AiChatAccessLevel} from '@cdo/apps/aichat/types/accessControls';
import {selectedSectionSelector} from '@cdo/apps/templates/teacherDashboard/teacherSectionsReduxSelectors';
import {TEACHER_NAVIGATION_PATHS} from '@cdo/apps/templates/teacherNavigation/TeacherNavigationPaths';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import {navigateToHref} from '@cdo/apps/utils';
import {AiChatAccessLevels} from '@cdo/generated-scripts/sharedConstants';

import AiChatToolsInfoAlert from './AiChatToolsInfoAlert';

import styles from './ai-chat-tools-dependency-alerts.module.scss';

/**
 * Alerts the teacher that a course or unit requires AI Chat tools, or
 * warns them loudly if they have it turned off.
 */
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
