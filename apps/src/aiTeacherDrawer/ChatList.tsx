import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import classNames from 'classnames';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Button as MuiButton,
} from '@mui/material';
import React, {useCallback} from 'react';

import {fetchThreadMessages} from '@cdo/apps/aiDifferentiation/redux';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {commonI18n} from '@cdo/apps/types/locale';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {ChatThread, Context} from './types';

import styles from './ai-differentiation.module.scss';

interface ChatListProps {
  context: Context;
  threads?: ChatThread[];
  curriculumCourses: string[] | undefined;
  fullWidth?: boolean;
  onChatSelect?: () => void;
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
      className={styles.chatListChatButton}
    >
      <ListItemText
        primary={
          chat.hasArtifact ? <TitleAndIcon title={chat.title} /> : chat.title
        }
        secondary={chat.updatedAt.toLocaleString([], {
          dateStyle: 'medium',
          timeStyle: 'short',
        })}
        className={styles.chatListChatItem}
        classes={{
          primary: selected
            ? styles.chatListChatItemPrimarySelected
            : styles.chatListChatItemPrimary,
          secondary: styles.chatListChatItemSecondary,
        }}
      />
    </ListItemButton>
  </ListItem>
);

const TitleAndIcon: React.FC<{
  title: string;
}> = ({title}) => (
  <div className={styles.chatListArtifactIconContainer}>
    <Typography variant="body3">{title}</Typography>
    <FontAwesomeV6Icon
      iconName="shapes"
      className={styles.artifactThreadIcon}
    />
  </div>
);

const ChatList: React.FC<ChatListProps> = ({
  context,
  threads = [],
  curriculumCourses,
  fullWidth = false,
  onChatSelect,
}) => {
  const selectedThreadId = useAppSelector(state => state.aiDiffChat.threadId);

  const dispatch = useAppDispatch();

  const checkIfThreadIsSelected = (thread: ChatThread) =>
    thread.id === selectedThreadId;

  const handleListItemClick = (chatId: number) => {
    dispatch(
      fetchThreadMessages({
        contextType: context.type,
        thread: chatId,
        curriculumCourses: curriculumCourses,
      })
    );
    analyticsReporter.sendEvent(EVENTS.AI_ARTIFACT_THREAD_REOPENED, {
      threadId: chatId,
      url: window.location.href,
    });
    onChatSelect?.();
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
    dispatch(
      fetchThreadMessages({
        contextType: context.type,
        thread: 0,
        curriculumCourses: curriculumCourses,
      })
    );
  }, [curriculumCourses, context, dispatch]);

  return (
    <aside
      className={classNames(
        styles.chatListContainer,
        fullWidth && styles.chatListContainerFullWidth
      )}
    >
      <Box
        component="nav"
        sx={{width: {sm: '100%'}, flexShrink: {sm: 0}}}
        aria-label="AI differentiation chat threads"
        className={styles.chatListBox}
      >
        <div className={styles.chatListContent}>
          <List disablePadding={true}>
            {todayChats.length > 0 && (
              <>
                <Typography
                  className={styles.chatListSectionTitle}
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
                  className={styles.chatListSectionTitle}
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
                  className={styles.chatListSectionTitle}
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
                  className={styles.chatListSectionTitle}
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
        <Box className={styles.chatListActions}>
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
        </Box>
      </Box>
    </aside>
  );
};

export default ChatList;
