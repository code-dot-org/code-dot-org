import classNames from 'classnames';
import React, {useEffect, useState} from 'react';

import {tryGetSessionStorage, trySetSessionStorage} from '@cdo/apps/utils';
import i18n from '@cdo/locale';
import aiFabWithIcon from '@cdo/static/ai-bot-ta.png';

import {EVENTS, PLATFORMS} from '../metrics/AnalyticsConstants';
import analyticsReporter from '../metrics/AnalyticsReporter';
import HttpClient from '../util/HttpClient';
import {useAppSelector} from '../util/reduxHooks';

import AiDiffContainer from './AiDiffContainer';

import style from './ai-differentiation.module.scss';

/**
 * Renders an AI Bot icon button in the bottom left corner over other UI elements that controls
 * toggling an AI element open and closed.
 */

const HAS_OPENED_DIFF_URL = '/api/v1/users/has_opened_ai_differentiation';

interface AiDiffFloatingActionButtonProps {
  context: string;
  scriptId?: number;
  scriptName?: string;
  unitDisplayName?: string;
}

const AiDiffFloatingActionButton: React.FC<AiDiffFloatingActionButtonProps> = ({
  context,
  scriptId,
  scriptName,
  unitDisplayName,
}) => {
  const sessionStorageKey = 'AiDiffFabOpenStateKey';

  // Show the pulse until the user clicks the FAB to open the chat window
  const hasOpened = useAppSelector(
    state => state.currentUser.hasOpenedAiDifferentiation
  );

  // Open the chat window if this is the first time the user has seen the FAB in this
  // session and they haven't opened the FAB yet.
  // Depends on other logic which sets the open state in session storage.
  const isFirstSession =
    JSON.parse(tryGetSessionStorage(sessionStorageKey, null)) === null &&
    !hasOpened;

  const [isOpen, setIsOpen] = useState(
    JSON.parse(tryGetSessionStorage(sessionStorageKey, isFirstSession)) ||
      isFirstSession
  );

  const [isFabImageLoaded, setIsFabImageLoaded] = useState(false);

  const showPulse = !hasOpened && isFabImageLoaded;
  const classes = showPulse
    ? classNames(style.floatingActionButton, style.pulse, 'unittest-fab-pulse')
    : style.floatingActionButton;

  const handleClick = () => {
    const eventData = {
      aiDiffChatContext: context,
      scriptId: scriptId,
      scriptName: scriptName,
      unitName: unitDisplayName,
    };
    const eventName = isOpen
      ? EVENTS.AI_DIFF_CHAT_CLOSED
      : EVENTS.AI_DIFF_CHAT_OPENED;
    analyticsReporter.sendEvent(eventName, eventData, PLATFORMS.STATSIG);
    if (eventName === EVENTS.AI_DIFF_CHAT_OPENED) {
      updateHasOpenedDiff();
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    trySetSessionStorage(sessionStorageKey, isOpen);
  }, [isOpen]);

  const updateHasOpenedDiff = React.useCallback(() => {
    HttpClient.post(HAS_OPENED_DIFF_URL, undefined, true).then(() => {});
  }, []);

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
        open={isOpen || isFirstSession}
        context={context}
        closeTutor={handleClick}
        scriptId={scriptId}
        scriptName={scriptName}
        unitDisplayName={unitDisplayName}
      />
    </div>
  );
};

export default AiDiffFloatingActionButton;
