import Button, {buttonColors} from '@code-dot-org/component-library/button';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {OverlineThreeText} from '@code-dot-org/component-library/typography';
import {Box, List, ListItem, ListItemButton, ListItemText} from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import {commonI18n} from '@cdo/apps/types/locale';
import experiments from '@cdo/apps/util/experiments';
import i18n from '@cdo/locale';

import {ChatThread} from './types';

import styles from './ai-differentiation.module.scss';

interface AiDiffSidebarProps {
  threads?: ChatThread[];
  selectedThreadId?: number;
  threadSelectCallback?: (thread: number) => void;
  setShowNotifications: (show: boolean) => void;
  showNotifications: boolean;
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

const AiDiffSidebar: React.FC<AiDiffSidebarProps> = ({
  threads = [],
  selectedThreadId,
  threadSelectCallback = () => {},
  setShowNotifications,
  showNotifications,
}) => {
  const handleListItemClick = (chatId: number) => {
    setShowNotifications(false);
    threadSelectCallback(chatId);
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

  return (
    <aside className={styles.sidebarContainer}>
      <Box
        component="nav"
        sx={{width: {sm: '100%'}, flexShrink: {sm: 0}}}
        aria-label="AI differentiation chat threads"
        className={styles.sidebarBox}
      >
        <Button
          color={buttonColors.white}
          size="s"
          type="primary"
          iconLeft={{iconName: 'plus'}}
          onClick={() => {
            setShowNotifications(false);
            threadSelectCallback(0);
          }}
          text={commonI18n.aiDifferentiation_new_chat()}
          className={styles.sidebarButton}
        />
        {experiments.isEnabled('teacher-notifications') && (
          <button
            onClick={() => setShowNotifications(true)}
            className={classNames(styles.notificationsButton, {
              [styles.selected]: showNotifications,
            })}
            id="ui-notificationsButton"
            type="button"
          >
            <FontAwesomeV6Icon iconName="bell" />
            <span>{commonI18n.notifications()}</span>
            <FontAwesomeV6Icon
              iconName="circle"
              iconStyle="solid"
              className={styles.readAt}
              aria-label={i18n.unread()}
            />
          </button>
        )}
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
                    selected={
                      !showNotifications && chat.id === selectedThreadId
                    }
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
                    selected={
                      !showNotifications && chat.id === selectedThreadId
                    }
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
                    selected={
                      !showNotifications && chat.id === selectedThreadId
                    }
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
                    selected={
                      !showNotifications && chat.id === selectedThreadId
                    }
                    onClick={() => handleListItemClick(chat.id)}
                  />
                ))}
              </>
            )}
          </List>
        </div>
      </Box>
    </aside>
  );
};

export default AiDiffSidebar;
