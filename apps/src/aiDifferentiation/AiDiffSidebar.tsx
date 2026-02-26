import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {WithTooltip} from '@code-dot-org/component-library/tooltip';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Button as MuiButton,
  IconButton as MuiIconButton,
} from '@mui/material';
import classNames from 'classnames';
import React, {useCallback, useState} from 'react';

import {fetchThreadMessages} from '@cdo/apps/aichat/redux/thunks';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {commonI18n} from '@cdo/apps/types/locale';
import experiments from '@cdo/apps/util/experiments';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import i18n from '@cdo/locale';

import {ChatThread, Context} from './types';

import styles from './ai-differentiation.module.scss';

interface AiDiffSidebarProps {
  context: Context;
  threads?: ChatThread[];
  setShowNotifications: (show: boolean) => void;
  showNotifications: boolean;
  unreadNotificationCount: number;
  curriculumCourses: string[] | undefined;
}

const now = new Date();
const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
const sevenDaysAgo = new Date(now);
sevenDaysAgo.setDate(now.getDate() - 7);
const thirtyDaysAgo = new Date(now);
thirtyDaysAgo.setDate(now.getDate() - 30);
const lastYear = new Date(now);
lastYear.setFullYear(now.getFullYear() - 1);

const ThreadItem: React.FC<{
  chat: ChatThread;
  selected: boolean;
  onClick: () => void;
}> = ({chat, selected, onClick}) => (
  <ListItem key={chat.id} disablePadding>
    <ListItemButton
      onClick={() => onClick()}
      selected={selected}
      className={styles.sidebarChatButton}
    >
      <ListItemText
        primary={
          chat.hasArtifact ? <TitleAndIcon title={chat.title} /> : chat.title
        }
        secondary={chat.updatedAt.toLocaleString([], {
          dateStyle: 'medium',
          timeStyle: 'short',
        })}
        className={styles.sidebarChatItem}
        classes={{
          primary: selected
            ? styles.sidebarChatItemPrimarySelected
            : styles.sidebarChatItemPrimary,
          secondary: styles.sidebarChatItemSecondary,
        }}
      />
    </ListItemButton>
  </ListItem>
);

const TitleAndIcon: React.FC<{
  title: string;
}> = ({title}) => (
  <div className={styles.sidebarArtifactIconContainer}>
    <text>{title}</text>
    <FontAwesomeV6Icon
      iconName="shapes"
      className={styles.artifactThreadIcon}
    />
  </div>
);

const AiDiffSidebar: React.FC<AiDiffSidebarProps> = ({
  context,
  threads = [],
  setShowNotifications,
  showNotifications,
  unreadNotificationCount,
  curriculumCourses,
}) => {
  const selectedThreadId = useAppSelector(state => state.aichat.threadId);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showDailyBytes, setShowDailyBytes] = useState(false);

  const dispatch = useAppDispatch();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const checkIfThreadIsSelected = (thread: ChatThread) =>
    !showNotifications && !showDailyBytes && thread.id === selectedThreadId;

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

  const handleListItemClick = (chatId: number) => {
    setShowNotifications(false);
    setShowDailyBytes(false);
    dispatch(
      fetchThreadMessages({
        contextType: context.type,
        thread: chatId,
        curriculumCourses: curriculumCourses,
      })
    );
  };

  const todayChats = threads.filter(thread => {
    return thread.updatedAt > yesterday;
  });
  const past7DaysChats = threads.filter(thread => {
    return thread.updatedAt >= sevenDaysAgo && thread.updatedAt <= yesterday;
  });
  const past30DaysChats = threads.filter(thread => {
    return (
      thread.updatedAt >= thirtyDaysAgo && thread.updatedAt <= sevenDaysAgo
    );
  });
  const oldChats = threads.filter(thread => {
    return thread.updatedAt < thirtyDaysAgo;
  });

  const onNewChatButtonClick = useCallback(() => {
    setShowNotifications(false);
    setShowDailyBytes(false);
    dispatch(
      fetchThreadMessages({
        contextType: context.type,
        thread: 0,
        curriculumCourses: curriculumCourses,
      })
    );
  }, [
    setShowNotifications,
    setShowDailyBytes,
    curriculumCourses,
    context,
    dispatch,
  ]);

  return (
    <aside
      className={classNames(
        styles.sidebarContainer,
        isCollapsed && styles.sidebarContainerCollapsed
      )}
    >
      <Box
        component="nav"
        sx={{width: {sm: '100%'}, flexShrink: {sm: 0}}}
        aria-label="AI differentiation chat threads"
        className={classNames(
          styles.sidebarBox,
          isCollapsed && styles.sidebarBoxCollapsed
        )}
      >
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
            <MuiIconButton
              variant="outlined"
              color="tertiary"
              size="small"
              className={styles.sidebarToggleButton}
              onClick={toggleSidebar}
              type="button"
            >
              <FontAwesomeV6Icon
                iconName={
                  isCollapsed ? 'arrow-right-to-line' : 'arrow-left-to-line'
                }
              />
            </MuiIconButton>
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
              <MuiIconButton
                variant="contained"
                color="primary"
                size="small"
                onClick={onNewChatButtonClick}
                aria-label={commonI18n.aiDifferentiation_new_chat()}
                type="button"
              >
                <FontAwesomeV6Icon iconName="plus" />
              </MuiIconButton>
            </WithTooltip>
          ) : (
            <MuiButton
              variant="contained"
              color="primary"
              size="small"
              className={styles.expandedNewChatButton}
              onClick={onNewChatButtonClick}
              type="button"
              startIcon={<FontAwesomeV6Icon iconName="plus" />}
            >
              {commonI18n.aiDifferentiation_new_chat()}
            </MuiButton>
          )}
        </Box>
        {isCollapsed ? (
          <Box className={styles.sidebarActions}>
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
              <MuiIconButton
                variant="text"
                color="secondary"
                size="small"
                className={classNames(
                  unreadNotificationCount > 0 && styles.buttonWithUnreadDot
                )}
                onClick={onNotificationsButtonClick}
                aria-label={commonI18n.notifications()}
                type="button"
              >
                <FontAwesomeV6Icon iconName="bell" />
              </MuiIconButton>
            </WithTooltip>
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
                <MuiIconButton
                  variant="text"
                  color="secondary"
                  size="small"
                  onClick={onDailyBytesButtonClick}
                  aria-label="Daily Bytes"
                  type="button"
                >
                  <FontAwesomeV6Icon iconName="podcast" />
                </MuiIconButton>
              </WithTooltip>
            )}
          </Box>
        ) : (
          <Box className={styles.sidebarCategories}>
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
        {!isCollapsed && (
          <div className={styles.sidebarContent}>
            <List disablePadding={true}>
              {todayChats.length > 0 && (
                <>
                  <Typography
                    className={styles.sidebarSectionTitle}
                    variant="overline3"
                    gutterBottom
                  >
                    TODAY
                  </Typography>
                  {todayChats.map(chat => (
                    <ThreadItem
                      key={chat.id}
                      chat={chat}
                      selected={checkIfThreadIsSelected(chat)}
                      onClick={() => handleListItemClick(chat.id)}
                    />
                  ))}
                </>
              )}
              {past7DaysChats.length > 0 && (
                <>
                  <Typography
                    className={styles.sidebarSectionTitle}
                    variant="overline3"
                    gutterBottom
                  >
                    PREVIOUS 7 DAYS
                  </Typography>
                  {past7DaysChats.map(chat => (
                    <ThreadItem
                      key={chat.id}
                      chat={chat}
                      selected={checkIfThreadIsSelected(chat)}
                      onClick={() => handleListItemClick(chat.id)}
                    />
                  ))}
                </>
              )}
              {past30DaysChats.length > 0 && (
                <>
                  <Typography
                    className={styles.sidebarSectionTitle}
                    variant="overline3"
                    gutterBottom
                  >
                    PREVIOUS 30 DAYS
                  </Typography>
                  {past30DaysChats.map(chat => (
                    <ThreadItem
                      key={chat.id}
                      chat={chat}
                      selected={checkIfThreadIsSelected(chat)}
                      onClick={() => handleListItemClick(chat.id)}
                    />
                  ))}
                </>
              )}
              {oldChats.length > 0 && (
                <>
                  <Typography
                    className={styles.sidebarSectionTitle}
                    variant="overline3"
                    gutterBottom
                  >
                    OLDER CHATS
                  </Typography>
                  {oldChats.map(chat => (
                    <ThreadItem
                      key={chat.id}
                      chat={chat}
                      selected={checkIfThreadIsSelected(chat)}
                      onClick={() => handleListItemClick(chat.id)}
                    />
                  ))}
                </>
              )}
            </List>
          </div>
        )}
      </Box>
    </aside>
  );
};

export default AiDiffSidebar;
