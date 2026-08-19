import {Badge} from '@mui/material';
import classNames from 'classnames';
import React, {useEffect, useRef, useState} from 'react';

import {
  setChatIsOpen,
  fetchThreadMessages,
} from '@cdo/apps/aiDifferentiation/redux';
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

import {EVENTS} from '../metrics/AnalyticsConstants';
import analyticsReporter from '../metrics/AnalyticsReporter';
import {createTeacherNotificationSubscription} from '../templates/teacherDashboardShared/WebSocketUtils';
import HttpClient from '../util/HttpClient';

import {DRAWER_FAB_MARGIN} from './constants';
import {AiDiffNotification} from './notifications/types';
import {Context} from './types';

import style from './ai-differentiation.module.scss';

const LazyAiDiffDrawer = React.lazy(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  () => import('../aiTeacherDrawer/AiDiffDrawer' as any)
);

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

  const chatIsOpen = useAppSelector(state => state.aiDiffChat.chatIsOpen);
  const threadMessages = useAppSelector(
    state => state.aiDiffChat.threadMessages
  );

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

  const [fabPosition, setFabPosition] = useState<{top: number} | null>(null);
  const [dragging, setDragging] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dragStateRef = useRef<{
    mouseY: number;
    elemTop: number;
    isDragging: boolean;
    currentTop: number;
  } | null>(null);
  const wasDraggingRef = useRef(false);

  const FAB_SIZE = 48;
  const HEADER_HEIGHT = 50;

  useEffect(() => {
    const onResize = () => {
      setFabPosition(prev => {
        if (!prev) return null;
        return prev.top > window.innerHeight - FAB_SIZE ? null : prev;
      });
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const onDragMove = (clientY: number) => {
    const drag = dragStateRef.current;
    if (!drag) return;
    const dy = clientY - drag.mouseY;
    if (!drag.isDragging && Math.abs(dy) < 4) return;
    if (!drag.isDragging) {
      drag.isDragging = true;
      wasDraggingRef.current = true;
      setDragging(true);
    }
    drag.currentTop = Math.max(
      HEADER_HEIGHT,
      Math.min(window.innerHeight - FAB_SIZE, drag.elemTop + dy)
    );
    // Direct DOM write bypasses React scheduling so the position tracks
    // the pointer on every mousemove frame without waiting for a render.
    if (buttonRef.current) {
      buttonRef.current.style.top = `${drag.currentTop}px`;
      buttonRef.current.style.bottom = 'auto';
    }
  };

  const onDragEnd = () => {
    const drag = dragStateRef.current;
    dragStateRef.current = null;
    setDragging(false);
    if (drag?.isDragging) {
      setFabPosition({top: drag.currentTop});
    }
    // Some browsers don't fire 'click' after a large drag, leaving
    // wasDraggingRef stuck true and eating the next tap. Self-clear after
    // the click event window (a few ms) has passed.
    setTimeout(() => {
      wasDraggingRef.current = false;
    }, 300);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const rect = e.currentTarget.getBoundingClientRect();
    dragStateRef.current = {
      mouseY: e.clientY,
      elemTop: rect.top,
      isDragging: false,
      currentTop: rect.top,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragStateRef.current) return;
    e.preventDefault();
    onDragMove(e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragStateRef.current) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    onDragEnd();
  };

  const showPulse = canShowPulse && !hasOpened && isFabImageLoaded;
  const classes = showPulse
    ? classNames(style.floatingActionButton, style.pulse, 'unittest-fab-pulse')
    : style.floatingActionButtonRight;

  const handleClick = () => {
    if (wasDraggingRef.current) {
      wasDraggingRef.current = false;
      return;
    }
    const eventData = {
      aiDiffChatContext: context,
      scriptName,
    };
    const eventName = chatIsOpen
      ? EVENTS.AI_DIFF_CHAT_CLOSED
      : EVENTS.AI_DIFF_CHAT_OPENED;
    analyticsReporter.sendEvent(eventName, eventData);
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

  const brand = document.documentElement.dataset.brand;

  return (
    <div id="fab-contained">
      {!chatIsOpen && (
        <button
          ref={buttonRef}
          id="ui-floatingActionButton"
          aria-label={i18n.openOrCloseTeachingAssistant()}
          className={classes}
          onClick={handleClick}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onDragStart={e => e.preventDefault()}
          type="button"
          style={{
            touchAction: 'none',
            right: `${DRAWER_FAB_MARGIN}px`,
            transition: 'right 195ms cubic-bezier(0.4, 0, 0.6, 1) 0ms',
            ...(fabPosition
              ? {
                  top: `${fabPosition.top}px`,
                  bottom: 'auto',
                  cursor: dragging ? 'grabbing' : 'grab',
                }
              : {cursor: 'grab'}),
          }}
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
                    : 'var(--background-brand-aqua-primary)',
                color:
                  unreadNotificationCount === 'loading' ||
                  unreadNotificationCount > 0 ||
                  brand === 'codeai-next'
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
              draggable={false}
            />
          </Badge>
        </button>
      )}
      <React.Suspense fallback={<div />}>
        <LazyAiDiffDrawer
          context={context}
          closeTutor={handleClick}
          curriculumCourses={curriculumCourses || ([] as string[])}
          scriptName={scriptName}
          unreadNotificationCount={
            unreadNotificationCount === 'loading' ? 0 : unreadNotificationCount
          }
        />
      </React.Suspense>
    </div>
  );
};

export default AiDiffFloatingActionButton;
