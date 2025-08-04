import classNames from 'classnames';
import React, {useEffect, useState} from 'react';

import {
  tryGetSessionStorage,
  trySetSessionStorage,
  tryGetLocalStorage,
  trySetLocalStorage,
} from '@cdo/apps/utils';
import i18n from '@cdo/locale';
import aiFabWithIcon from '@cdo/static/ai-bot-ta.png';

import {EVENTS, PLATFORMS} from '../metrics/AnalyticsConstants';
import analyticsReporter from '../metrics/AnalyticsReporter';
import HttpClient from '../util/HttpClient';

import AiDiffContainer from './AiDiffContainer';
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

  const [isOpen, setIsOpen] = useState<boolean>(false);

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
      setIsOpen(
        canStartOpen &&
          ((isFirstSession && canDefaultOpen) ||
            JSON.parse(tryGetSessionStorage(SESSION_STORAGE_KEY, false)))
      );
    }
  }, [canStartOpen, hasOpened, hasClosed, canDefaultOpen]);

  const [curriculumCourses, setCurriculumCourses] = useState<string[]>();

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
  }, [context]);

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
    const eventName = isOpen
      ? EVENTS.AI_DIFF_CHAT_CLOSED
      : EVENTS.AI_DIFF_CHAT_OPENED;
    analyticsReporter.sendEvent(eventName, eventData, PLATFORMS.STATSIG);
    if (eventName === EVENTS.AI_DIFF_CHAT_OPENED) {
      trySetLocalStorage(LOCAL_STORAGE_OPENED_KEY, true.toString());
    } else {
      trySetLocalStorage(LOCAL_STORAGE_CLOSED_KEY, true.toString());
    }
    setIsOpen(!isOpen);
    trySetSessionStorage(SESSION_STORAGE_KEY, (!isOpen).toString());
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
        <img
          alt="AI bot"
          src={aiFabWithIcon}
          onLoad={() => !isFabImageLoaded && setIsFabImageLoaded(true)}
        />
      </button>
      <AiDiffContainer
        open={isOpen}
        context={context}
        closeTutor={handleClick}
        scriptName={scriptName}
        curriculumCourses={curriculumCourses}
      />
    </div>
  );
};

export default AiDiffFloatingActionButton;
