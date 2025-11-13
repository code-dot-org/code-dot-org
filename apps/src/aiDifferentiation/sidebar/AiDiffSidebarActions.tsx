import Button, {buttonColors} from '@code-dot-org/component-library/button';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {WithTooltip} from '@code-dot-org/component-library/tooltip';
import {Box} from '@mui/material';
import classNames from 'classnames';
import React, {useCallback} from 'react';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {commonI18n} from '@cdo/apps/types/locale';
import experiments from '@cdo/apps/util/experiments';
import i18n from '@cdo/locale';

import styles from './../ai-differentiation.module.scss';

interface AiDiffSidebarActionsProps {
  threadSelectCallback?: (thread: number) => void;
  setShowNotifications: (show: boolean) => void;
  showNotifications: boolean;
  unreadNotificationCount: number;
  setShowDailyBytes: (show: boolean) => void;
  showDailyBytes: boolean;
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

const AiDiffSidebarActions: React.FC<AiDiffSidebarActionsProps> = ({
  threadSelectCallback = () => {},
  setShowNotifications,
  showNotifications,
  showDailyBytes,
  setShowDailyBytes,
  isCollapsed,
  toggleSidebar,
  unreadNotificationCount,
}) => {
  const onNewChatButtonClick = useCallback(() => {
    setShowNotifications(false);
    setShowDailyBytes(false);
    threadSelectCallback(0);
  }, [setShowNotifications, threadSelectCallback, setShowDailyBytes]);

  const onNotificationsButtonClick = useCallback(() => {
    setShowNotifications(true);
    setShowDailyBytes(false);

    analyticsReporter.sendEvent(EVENTS.AI_DIFF_NOTIFICATIONS_OPENED, {
      unreadNotificationCount: unreadNotificationCount,
    });
  }, [setShowNotifications, unreadNotificationCount, setShowDailyBytes]);

  const onDailyBytesButtonClick = useCallback(() => {
    setShowDailyBytes(true);
    setShowNotifications(false);
    // TODO: add daily bytes logic
  }, [setShowNotifications, setShowDailyBytes]);

  return (
    <>
      <Box className={styles.sidebarActions}>
        <WithTooltip
          tooltipProps={{
            tooltipId: 'sidebar-toggle-tooltip',
            direction: 'onRight',
            text: isCollapsed ? 'Expand sidebar' : 'Collapse sidebar',
            className: styles.sidebarActionTooltip,
            hideTail: true,
            size: 's',
          }}
        >
          <Button
            isIconOnly
            onClick={toggleSidebar}
            icon={{
              iconName: isCollapsed
                ? 'arrow-right-to-line'
                : 'arrow-left-to-line',
            }}
            color="gray"
            type="secondary"
            size="s"
            className={styles.sidebarToggleButton}
          />
        </WithTooltip>
        {isCollapsed ? (
          <WithTooltip
            tooltipProps={{
              tooltipId: 'new-chat-button-tooltip',
              direction: 'onRight',
              text: commonI18n.aiDifferentiation_new_chat(),
              className: styles.sidebarActionTooltip,
              hideTail: true,
              size: 's',
            }}
          >
            <Button
              color={buttonColors.purple}
              size="s"
              type="primary"
              onClick={onNewChatButtonClick}
              isIconOnly
              icon={{iconName: 'plus'}}
              aria-label={commonI18n.aiDifferentiation_new_chat()}
            />
          </WithTooltip>
        ) : (
          <Button
            color={buttonColors.purple}
            size="s"
            type="primary"
            onClick={onNewChatButtonClick}
            iconLeft={{iconName: 'plus'}}
            text={commonI18n.aiDifferentiation_new_chat()}
            className={styles.expandedNewChatButton}
          />
        )}
      </Box>
      {isCollapsed ? (
        <Box className={styles.sidebarActions}>
          {experiments.isEnabled('teacher-notifications') && (
            <WithTooltip
              tooltipProps={{
                tooltipId: 'notifications-button-tooltip',
                direction: 'onRight',
                text: commonI18n.notifications(),
                className: styles.sidebarActionTooltip,
                hideTail: true,
                size: 's',
              }}
            >
              <Button
                isIconOnly
                onClick={onNotificationsButtonClick}
                className={classNames(
                  unreadNotificationCount > 0 && styles.buttonWithUnreadDot
                )}
                color="black"
                type="tertiary"
                size="s"
                icon={{iconName: 'bell'}}
                aria-label={commonI18n.notifications()}
              />
            </WithTooltip>
          )}
          {experiments.isEnabled('daily-bytes') && (
            <WithTooltip
              tooltipProps={{
                tooltipId: 'daily-bytes-button-tooltip',
                direction: 'onRight',
                text: 'Daily Bytes',
                className: styles.sidebarActionTooltip,
                hideTail: true,
                size: 's',
              }}
            >
              <Button
                isIconOnly
                onClick={onDailyBytesButtonClick}
                color="black"
                type="tertiary"
                size="s"
                icon={{iconName: 'podcast'}}
                aria-label="Daily Bytes"
              />
            </WithTooltip>
          )}
        </Box>
      ) : (
        <Box className={styles.sidebarCategories}>
          {experiments.isEnabled('teacher-notifications') && (
            <button
              onClick={onNotificationsButtonClick}
              className={classNames(styles.categoryActionButton, {
                [styles.selected]: showNotifications,
              })}
              id="ui-notificationsButton"
              type="button"
            >
              <FontAwesomeV6Icon iconName="bell" />
              <span>{commonI18n.notifications()}</span>
              {unreadNotificationCount > 0 && (
                <FontAwesomeV6Icon
                  iconName="circle"
                  iconStyle="solid"
                  className={styles.readAt}
                  aria-label={i18n.unread()}
                />
              )}
            </button>
          )}
          {experiments.isEnabled('daily-bytes') && (
            <button
              onClick={onDailyBytesButtonClick}
              className={classNames(styles.categoryActionButton, {
                [styles.selected]: showDailyBytes,
              })}
              id="ui-dailyBytesButton"
              type="button"
            >
              <FontAwesomeV6Icon iconName="podcast" />
              <span>Daily Bytes</span>
            </button>
          )}
        </Box>
      )}
    </>
  );
};

export default AiDiffSidebarActions;
