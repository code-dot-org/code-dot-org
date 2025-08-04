import Button, {buttonColors} from '@code-dot-org/component-library/button';
import {Box, List, ListItem, ListItemButton, ListItemText} from '@mui/material';
import React from 'react';

import {commonI18n} from '@cdo/apps/types/locale';

import styles from './ai-differentiation.module.scss';

interface AiDiffSidebarProps {
  // Props will go here :)
}

const now = new Date();
const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
const otherYesterday = new Date(Date.now() - 25 * 60 * 60 * 1000);
const sevenDaysAgo = new Date(now);
sevenDaysAgo.setDate(now.getDate() - 7);
const thirtyDaysAgo = new Date(now);
thirtyDaysAgo.setDate(now.getDate() - 30);
const lastYear = new Date(now);
lastYear.setFullYear(now.getFullYear() - 1);

const chats = [
  {
    id: 0,
    displayName: 'The most recent chat',
    timestamp: now,
    link: '#',
  },
  {
    id: 1,
    displayName: 'A chat from 10 minutes ago',
    timestamp: tenMinutesAgo,
    link: '#',
  },
  {
    id: 2,
    displayName: 'A chat from 15 minutes ago',
    timestamp: fifteenMinutesAgo,
    link: '#',
  },
  {
    id: 3,
    displayName: 'A chat from yesterday',
    timestamp: yesterday,
    link: '#',
  },
  {
    id: 4,
    displayName: 'Another chat from yesterday',
    timestamp: otherYesterday,
    link: '#',
  },
  {
    id: 5,
    displayName: 'A chat from last month',
    timestamp: thirtyDaysAgo,
    link: '#',
  },
  {
    id: 6,
    displayName: 'A chat from last year',
    timestamp: lastYear,
    link: '#',
  },
];

const todayChats = chats.filter(chat => {
  const chatDate = new Date(chat.timestamp);
  return chatDate > yesterday;
});

const past7DaysChats = chats.filter(chat => {
  const chatDate = new Date(chat.timestamp);

  return chatDate >= sevenDaysAgo && chatDate <= yesterday;
});

const past30DaysChats = chats.filter(chat => {
  const chatDate = new Date(chat.timestamp);
  return chatDate >= thirtyDaysAgo && chatDate <= sevenDaysAgo;
});

const oldChats = chats.filter(chat => {
  const chatDate = new Date(chat.timestamp);
  return chatDate < thirtyDaysAgo;
});

const drawerWidth = 240;

const ChatItem: React.FC<{
  chat: (typeof chats)[0];
  selected: boolean;
  onClick: () => void;
}> = ({chat, selected, onClick}) => (
  <ListItem key={chat.id} disablePadding>
    <ListItemButton onClick={() => onClick()} selected={selected}>
      <ListItemText
        primary={chat.displayName}
        className={styles.sidebarChatItem}
      />
    </ListItemButton>
  </ListItem>
);

const AiDiffSidebar: React.FC<AiDiffSidebarProps> = () => {
  const [selectedChat, setSelectedChat] = React.useState<number>(0);
  const handleListItemClick = (chatId: number) => {
    setSelectedChat(chatId);
  };

  return (
    <aside className={styles.sidebarContainer}>
      <div className={styles.sidebarContent}>
        <Box
          component="nav"
          sx={{width: {sm: drawerWidth}, flexShrink: {sm: 0}}}
          aria-label="AI differentiation chat threads"
        >
          <Button
            color={buttonColors.white}
            size="m"
            type="primary"
            iconLeft={{iconName: 'plus'}}
            onClick={() => console.log('Add new chat thread')}
            text={commonI18n.aiDifferentiation_new_chat()}
            className={styles.sidebarButton}
          />
          <List>
            {todayChats.length > 0 && (
              <>
                <p className={styles.sidebarSectionTitle}>TODAY</p>
                {todayChats.map(chat => (
                  <ChatItem
                    key={chat.id}
                    chat={chat}
                    selected={chat.id === selectedChat}
                    onClick={() => handleListItemClick(chat.id)}
                  />
                ))}
              </>
            )}
            {past7DaysChats.length > 0 && (
              <>
                <p className={styles.sidebarSectionTitle}>PREVIOUS 7 DAYS</p>
                {past7DaysChats.map(chat => (
                  <ChatItem
                    key={chat.id}
                    chat={chat}
                    selected={chat.id === selectedChat}
                    onClick={() => handleListItemClick(chat.id)}
                  />
                ))}
              </>
            )}
            {past30DaysChats.length > 0 && (
              <>
                <p className={styles.sidebarSectionTitle}>PREVIOUS 30 DAYS</p>
                {past30DaysChats.map(chat => (
                  <ChatItem
                    key={chat.id}
                    chat={chat}
                    selected={chat.id === selectedChat}
                    onClick={() => handleListItemClick(chat.id)}
                  />
                ))}
              </>
            )}
            {oldChats.length > 0 && (
              <>
                <p className={styles.sidebarSectionTitle}>OLDER CHATS</p>
                {oldChats.map(chat => (
                  <ChatItem
                    key={chat.id}
                    chat={chat}
                    selected={chat.id === selectedChat}
                    onClick={() => handleListItemClick(chat.id)}
                  />
                ))}
              </>
            )}
          </List>
        </Box>
      </div>
    </aside>
  );
};

export default AiDiffSidebar;
