import classNames from 'classnames';
import React, {useEffect, useState} from 'react';

import {tryGetSessionStorage, trySetSessionStorage} from '@cdo/apps/utils';
import i18n from '@cdo/locale';
import aiFabWithIcon from '@cdo/static/ai-bot-ta.png';

import {EVENTS, PLATFORMS} from '../metrics/AnalyticsConstants';
import analyticsReporter from '../metrics/AnalyticsReporter';

import AiDiffContainer from './AiDiffContainer';

import style from './ai-differentiation.module.scss';

/**
 * Renders an AI Bot icon button in the bottom left corner over other UI elements that controls
 * toggling an AI element open and closed.
 */

interface AiDiffFloatingActionButtonProps {
  context: string;
  scriptId: number;
  scriptName: string;
  unitDisplayName: string;
}

const AiDiffFloatingActionButton: React.FC<AiDiffFloatingActionButtonProps> = ({
  context,
  scriptId,
  scriptName,
  unitDisplayName,
}) => {
  const sessionStorageKey = 'AiDiffFabOpenStateKey';
  // Show the pulse if this is the first time the user has seen the FAB in this
  // session. Depends on other logic which sets the open state in session storage.
  const [isFirstSession] = useState(
    JSON.parse(tryGetSessionStorage(sessionStorageKey, null)) === null
  );
  const [isOpen, setIsOpen] = useState(
    JSON.parse(tryGetSessionStorage(sessionStorageKey, false)) || false
  );
  const [isFabImageLoaded, setIsFabImageLoaded] = useState(false);

  const showPulse = isFirstSession && isFabImageLoaded;
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
      ? EVENTS.TA_RUBRIC_CLOSED_FROM_FAB_EVENT
      : EVENTS.TA_RUBRIC_OPENED_FROM_FAB_EVENT;
    analyticsReporter.sendEvent(eventName, eventData, PLATFORMS.STATSIG);
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    trySetSessionStorage(sessionStorageKey, isOpen);
  }, [isOpen]);

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
        scriptId={scriptId}
        scriptName={scriptName}
        unitDisplayName={unitDisplayName}
      />
    </div>
  );
};

export default AiDiffFloatingActionButton;
