import Button, {buttonColors} from '@code-dot-org/component-library/button';
import {Box, List, ListItem, ListItemButton, ListItemText} from '@mui/material';
import React from 'react';

import {commonI18n} from '@cdo/apps/types/locale';

import {ChatThread} from './types';

import styles from './ai-differentiation.module.scss';

interface AiDiffSidebarProps {
  threads?: ChatThread[];
  selectedThreadId?: number;
  threadSelectCallback?: (thread: number) => void;
}

const now = new Date();
const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
const sevenDaysAgo = new Date(now);
sevenDaysAgo.setDate(now.getDate() - 7);
const thirtyDaysAgo = new Date(now);
thirtyDaysAgo.setDate(now.getDate() - 30);
const lastYear = new Date(now);
lastYear.setFullYear(now.getFullYear() - 1);

const drawerWidth = 240;

const ThreadItem: React.FC<{
  chat: ChatThread;
  selected: boolean;
  onClick: () => void;
}> = ({chat, selected, onClick}) => (
  <ListItem key={chat.id} disablePadding>
    <ListItemButton onClick={() => onClick()} selected={selected}>
      <ListItemText
        primary={chat.title}
        secondary={chat.updatedAt.toLocaleString([], {
          dateStyle: 'medium',
          timeStyle: 'short',
        })}
        className={styles.sidebarChatItem}
        classes={{
          primary: styles.sidebarChatItemPrimary,
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
}) => {
  const handleListItemClick = (chatId: number) => {
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
        sx={{width: {sm: drawerWidth}, flexShrink: {sm: 0}}}
        aria-label="AI differentiation chat threads"
        className={styles.sidebarBox}
      >
        <Button
          color={buttonColors.white}
          size="m"
          type="primary"
          iconLeft={{iconName: 'plus'}}
          onClick={() => threadSelectCallback(0)}
          text={commonI18n.aiDifferentiation_new_chat()}
          className={styles.sidebarButton}
        />
        <div className={styles.sidebarContent}>
          <List disablePadding={true}>
            {todayChats.length > 0 && (
              <>
                <p className={styles.sidebarSectionTitle}>TODAY</p>
                {todayChats.map(chat => (
                  <ThreadItem
                    key={chat.id}
                    chat={chat}
                    selected={chat.id === selectedThreadId}
                    onClick={() => handleListItemClick(chat.id)}
                  />
                ))}
              </>
            )}
            {past7DaysChats.length > 0 && (
              <>
                <p className={styles.sidebarSectionTitle}>PREVIOUS 7 DAYS</p>
                {past7DaysChats.map(chat => (
                  <ThreadItem
                    key={chat.id}
                    chat={chat}
                    selected={chat.id === selectedThreadId}
                    onClick={() => handleListItemClick(chat.id)}
                  />
                ))}
              </>
            )}
            {past30DaysChats.length > 0 && (
              <>
                <p className={styles.sidebarSectionTitle}>PREVIOUS 30 DAYS</p>
                {past30DaysChats.map(chat => (
                  <ThreadItem
                    key={chat.id}
                    chat={chat}
                    selected={chat.id === selectedThreadId}
                    onClick={() => handleListItemClick(chat.id)}
                  />
                ))}
              </>
            )}
            {oldChats.length > 0 && (
              <>
                <p className={styles.sidebarSectionTitle}>OLDER CHATS</p>
                {oldChats.map(chat => (
                  <ThreadItem
                    key={chat.id}
                    chat={chat}
                    selected={chat.id === selectedThreadId}
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
