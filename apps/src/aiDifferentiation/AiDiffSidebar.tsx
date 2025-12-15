import Button, {buttonColors} from '@code-dot-org/component-library/button';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {WithTooltip} from '@code-dot-org/component-library/tooltip';
import {OverlineThreeText} from '@code-dot-org/component-library/typography';
import {Box, List, ListItem, ListItemButton, ListItemText} from '@mui/material';
import classNames from 'classnames';
import React, {useCallback, useState} from 'react';

import {fetchThreadMessages} from '@cdo/apps/aichat/redux/thunks';
import {
  EXAMPLE_PROMPT,
  EXPLAIN_CONCEPT_PROMPT,
  DEBUG_MISTAKES_PROMPT,
  EXIT_TICKET_PROMPT,
  MINI_LESSON_PROMPT,
  APCSP_DUMMY_CREATE,
  APCSP_DUMMY_EXAM,
  DEBUG_THIS_CODE,
  IMPROVE_THIS_CODE,
  SUGGESTED_PROMPTS_FOR_SELECTION,
  SUGGEST_CURRICULUM_PROMPT,
  GET_STARTED_PROMPT,
  CREATE_SECTION_PROMPT,
} from '@cdo/apps/aiDifferentiation/predefinedPrompts';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {commonI18n} from '@cdo/apps/types/locale';
import experiments from '@cdo/apps/util/experiments';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import {AiDiffContext} from '@cdo/generated-scripts/sharedConstants';
import i18n from '@cdo/locale';

import {ChatPrompt, ChatThread, Context} from './types';

import styles from './ai-differentiation.module.scss';

interface AiDiffSidebarProps {
  context: Context;
  threads?: ChatThread[];
  setShowNotifications: (show: boolean) => void;
  showNotifications: boolean;
  unreadNotificationCount: number;
  curriculumCourses: string[] | undefined;
}

const APCSP_PROMPTS = [APCSP_DUMMY_CREATE, APCSP_DUMMY_EXAM];

const SUGGESTED_PROMPTS = [
  EXAMPLE_PROMPT,
  EXPLAIN_CONCEPT_PROMPT,
  DEBUG_MISTAKES_PROMPT,
  MINI_LESSON_PROMPT,
  EXIT_TICKET_PROMPT,
];

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
        primary={chat.title}
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

const getDefaultSuggestedPrompts = (
  context: Context,
  teacherHasSections: boolean,
  teacherHasSectionWithCurriculum: boolean,
  teacherHasSectionWithStudents: boolean
) =>
  context.type === AiDiffContext.GENERAL
    ? SUGGESTED_PROMPTS_FOR_SELECTION['support'].suggestedPrompts.filter(
        ({label}) => {
          // Hide some new thread default prompts based on teacher's sections
          if (
            (label === GET_STARTED_PROMPT.label ||
              label === CREATE_SECTION_PROMPT.label) &&
            teacherHasSections &&
            teacherHasSectionWithCurriculum &&
            teacherHasSectionWithStudents
          ) {
            return false;
          }

          if (
            label === SUGGEST_CURRICULUM_PROMPT.label &&
            teacherHasSectionWithCurriculum
          ) {
            return false;
          }

          return true;
        }
      )
    : SUGGESTED_PROMPTS;

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
    dispatch(fetchThreadMessages({thread: chatId}));
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

  const teacherSections = Object.values(
    useAppSelector(state => state.teacherSections?.sections ?? {})
  );
  const teacherHasSections = teacherSections.length > 0;
  const teacherHasSectionWithCurriculum = !!teacherSections.find(
    section => section.courseId !== null
  );
  const teacherHasSectionWithStudents = !!teacherSections.find(
    section => section.studentCount > 0
  );

  const suggestedPrompts = React.useMemo(() => {
    const defaultSuggestedPrompts = getDefaultSuggestedPrompts(
      context,
      teacherHasSections,
      teacherHasSectionWithCurriculum,
      teacherHasSectionWithStudents
    );
    const additionalPrompts: ChatPrompt[] = [];
    if (curriculumCourses?.includes('csp')) {
      additionalPrompts.push(...APCSP_PROMPTS);
    }
    if (context.type === AiDiffContext.LEVEL) {
      additionalPrompts.push(DEBUG_THIS_CODE, IMPROVE_THIS_CODE);
    }
    return defaultSuggestedPrompts.concat(additionalPrompts);
  }, [
    context,
    curriculumCourses,
    teacherHasSectionWithCurriculum,
    teacherHasSectionWithStudents,
    teacherHasSections,
  ]);

  const onNewChatButtonClick = useCallback(() => {
    setShowNotifications(false);
    setShowDailyBytes(false);
    dispatch(
      fetchThreadMessages({thread: 0, suggestedPrompts: suggestedPrompts})
    );
  }, [setShowNotifications, setShowDailyBytes, suggestedPrompts, dispatch]);

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
                  <OverlineThreeText className={styles.sidebarSectionTitle}>
                    TODAY
                  </OverlineThreeText>
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
                  <OverlineThreeText className={styles.sidebarSectionTitle}>
                    PREVIOUS 7 DAYS
                  </OverlineThreeText>
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
                  <OverlineThreeText className={styles.sidebarSectionTitle}>
                    PREVIOUS 30 DAYS
                  </OverlineThreeText>
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
                  <OverlineThreeText className={styles.sidebarSectionTitle}>
                    OLDER CHATS
                  </OverlineThreeText>
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
