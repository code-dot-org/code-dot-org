import {Badge} from '@mui/material';
import classNames from 'classnames';
import React, {useEffect, useState} from 'react';

import {fetchThreadMessages} from '@cdo/apps/aichat/redux';
import {setChatIsOpen} from '@cdo/apps/aichat/redux/slice';
import DCDO from '@cdo/apps/dcdo';
import experiments from '@cdo/apps/util/experiments';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import {
  tryGetSessionStorage,
  trySetSessionStorage,
  tryGetLocalStorage,
  trySetLocalStorage,
} from '@cdo/apps/utils';
import i18n from '@cdo/locale';
import aiFabWithoutText from '@cdo/static/ai-bot-ta-no-text.png';

import {EVENTS, PLATFORMS} from '../metrics/AnalyticsConstants';
import analyticsReporter from '../metrics/AnalyticsReporter';
import {createTeacherNotificationSubscription} from '../templates/teacherDashboardShared/WebSocketUtils';
import HttpClient from '../util/HttpClient';

import AiDiffContainer from './AiDiffContainer';
import {AiDiffNotification} from './notifications/types';
import {Context} from './types';

import style from './ai-differentiation.module.scss';

/**
 * Renders an AI Bot icon button in the bottom left corner over other UI elements that controls
 * toggling an AI element open and closed.
 */

interface AiDiffFloatingActionButtonProps {
  context: Context;
  scriptName?: string;
  canShowPulse?: boolean;
  canStartOpen?: boolean;
  canDefaultOpen?: boolean;
}

const SESSION_STORAGE_KEY = 'AiDiffFabOpenStateKey';
const LOCAL_STORAGE_OPENED_KEY = 'AiDiffHasOpenedKey';
const LOCAL_STORAGE_CLOSED_KEY = 'AiDiffHasClosedKey';

const AiDiffFloatingActionButton: React.FC<AiDiffFloatingActionButtonProps> = ({
  context,
  scriptName,
  canShowPulse = true,
  /**
   * Prevents the FAB opening without direct user click.
   */
  canStartOpen = true,
  /**
   * Whether the FAB can start open if a user has never interacted with it.
   * Does not prevent auto-opening if the user has interacted with the FAB before.
   */
  canDefaultOpen = true,
}) => {
  // Show the pulse until the user clicks the FAB to open the chat window
  const hasOpened =
    JSON.parse(
      tryGetLocalStorage(LOCAL_STORAGE_OPENED_KEY, false.toString())
    ) || false;

  const hasClosed =
    JSON.parse(
      tryGetLocalStorage(LOCAL_STORAGE_CLOSED_KEY, false.toString())
    ) || false;

  const [unreadNotificationCount, setUnreadNotificationCount] = useState<
    number | 'loading'
  >('loading');

  const chatIsOpen = useAppSelector(state => state.aichat.chatIsOpen);
  const threadMessages = useAppSelector(state => state.aichat.threadMessages);

  const dispatch = useAppDispatch();

  React.useEffect(() => {
    // If the user has manually opened or closed the FAB, we should not open it automatically.
    if (!hasOpened && !hasClosed) {
      // Open the chat window if this is the first time the user has seen the FAB in this
      // session and they haven't interacted with the FAB yet.
      // Depends on other logic which sets the open state in session storage.
      const isFirstSession =
        JSON.parse(tryGetSessionStorage(SESSION_STORAGE_KEY, null)) === null;

      // Keeps FAB open/closed on new pages in the same tab or window
      // New tab or window is default closed if they have previously opened/closed the FAB
      // Default open if they have never opened/closed the fab before (i.e. first time on the site)
      dispatch(
        setChatIsOpen(
          canStartOpen &&
            ((isFirstSession && canDefaultOpen) ||
              JSON.parse(tryGetSessionStorage(SESSION_STORAGE_KEY, false)))
        )
      );
    }
  }, [canStartOpen, hasOpened, hasClosed, canDefaultOpen, dispatch]);

  const updateUnreadNotificationCount = React.useCallback(() => {
    HttpClient.fetchJson<AiDiffNotification[]>('/notifications')
      .then(response => {
        const unreadNotificationCount =
          response?.value?.filter(n => n.readAt === null).length || 0;
        setUnreadNotificationCount(unreadNotificationCount);
      })
      .catch(error => {
        console.error('Error fetching notifications for count:', error);
        setUnreadNotificationCount(0);
      });
  }, []);

  React.useEffect(() => {
    updateUnreadNotificationCount();
  }, [updateUnreadNotificationCount]);

  // WebSocket subscription for real-time notification count updates
  React.useEffect(() => {
    if (
      DCDO.get('ai-lesson-summaries-notifications-enabled', false) ||
      experiments.isEnabled('teacher-notifications-ws')
    ) {
      const unsubscribe = createTeacherNotificationSubscription({
        onNewNotification: () =>
          setUnreadNotificationCount(prevCount =>
            prevCount === 'loading' ? prevCount : prevCount + 1
          ),
      });

      return unsubscribe || undefined;
    }
  }, [updateUnreadNotificationCount]);

  const [curriculumCourses, setCurriculumCourses] = useState<string[]>();

  React.useEffect(() => {
    if (!threadMessages || threadMessages.length === 0) {
      dispatch(
        fetchThreadMessages({
          contextType: context.type,
          thread: 0,
          curriculumCourses: curriculumCourses,
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const body = JSON.stringify({
      context: context,
    });
    HttpClient.post(`/aidiff_threads/curriculum_courses`, body, true, {
      'Content-Type': 'application/json',
    })
      .then(response => response.json())
      .then(json => {
        setCurriculumCourses(json.courses);
      })
      .catch(error => {
        console.log(error);
        setCurriculumCourses([]);
      });
  }, [context, dispatch]);

  const [isFabImageLoaded, setIsFabImageLoaded] = useState(false);

  const showPulse = canShowPulse && !hasOpened && isFabImageLoaded;
  const classes = showPulse
    ? classNames(style.floatingActionButton, style.pulse, 'unittest-fab-pulse')
    : style.floatingActionButton;

  const handleClick = () => {
    const eventData = {
      aiDiffChatContext: context,
      scriptName,
    };
    const eventName = chatIsOpen
      ? EVENTS.AI_DIFF_CHAT_CLOSED
      : EVENTS.AI_DIFF_CHAT_OPENED;
    analyticsReporter.sendEvent(eventName, eventData, PLATFORMS.STATSIG);
    if (eventName === EVENTS.AI_DIFF_CHAT_OPENED) {
      trySetLocalStorage(LOCAL_STORAGE_OPENED_KEY, true.toString());
    } else {
      trySetLocalStorage(LOCAL_STORAGE_CLOSED_KEY, true.toString());
    }
    dispatch(setChatIsOpen(!chatIsOpen));
    dispatch(
      fetchThreadMessages({
        contextType: context.type,
        thread: 0,
        curriculumCourses: curriculumCourses,
      })
    );
    trySetSessionStorage(SESSION_STORAGE_KEY, (!chatIsOpen).toString());
    updateUnreadNotificationCount();
  };

  return (
    <div id="fab-contained">
      <button
        id="ui-floatingActionButton"
        aria-label={i18n.openOrCloseTeachingAssistant()}
        className={classes}
        onClick={handleClick}
        type="button"
      >
        <Badge
          badgeContent={
            unreadNotificationCount === 'loading'
              ? 0
              : unreadNotificationCount > 0
              ? unreadNotificationCount
              : 'TA'
          }
          color="error"
          overlap="circular"
          aria-label={
            unreadNotificationCount &&
            i18n.unreadNotificationsCount({
              unreadCount: unreadNotificationCount,
            })
          }
          sx={{
            height: '48px',
            width: '48px',
            '& .MuiBadge-badge': {
              backgroundColor:
                unreadNotificationCount === 'loading' ||
                unreadNotificationCount > 0
                  ? 'var(--background-error-primary)'
                  : '#3CFFF8',
              color:
                unreadNotificationCount === 'loading' ||
                unreadNotificationCount > 0
                  ? 'var(--text-neutral-white-fixed)'
                  : 'var(--text-neutral-black-fixed)',
              top: '5%',
              right: '5%',
            },
          }}
          className={style.badge}
        >
          <img
            alt="AI bot - unread notifications"
            src={aiFabWithoutText}
            onLoad={() => !isFabImageLoaded && setIsFabImageLoaded(true)}
            className={style.fabImageWithBadge}
          />
        </Badge>
      </button>
      <AiDiffContainer
        context={context}
        closeTutor={handleClick}
        curriculumCourses={curriculumCourses || ([] as string[])}
        scriptName={scriptName}
        unreadNotificationCount={
          unreadNotificationCount === 'loading' ? 0 : unreadNotificationCount
        }
      />
    </div>
  );
};

export default AiDiffFloatingActionButton;
