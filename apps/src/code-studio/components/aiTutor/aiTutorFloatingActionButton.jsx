import React, {useState} from 'react';
import {Provider} from 'react-redux';
import {getStore} from '@cdo/apps/redux';
import style from './ai-tutor.module.scss';
import aiFabIcon from '@cdo/static/ai-fab-background.png';
import AITutorPanel from './aiTutorPanel';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import {levelShape} from './aiTutorShapes';

/**
 * Renders an AI Bot icon button in the bottom left corner over other UI elements that controls
 * toggling the AI Tutor Panel open and closed.
 */
const AITutorFloatingActionButton = ({level, scriptId}) => {
  const store = getStore();
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    const event = isOpen
      ? EVENTS.AI_TUTOR_PANEL_CLOSED
      : EVENTS.AI_TUTOR_PANEL_OPENED;
    analyticsReporter.sendEvent(event, {
      levelId: level.id,
      levelType: level.type,
    });
    setIsOpen(!isOpen);
  };

  return (
    <div id="fab-contained">
      <button
        id="ui-floatingActionButton"
        className={style.floatingActionButton}
        style={{backgroundImage: `url(${aiFabIcon})`}}
        onClick={handleClick}
        type="button"
      />
      <Provider store={store}>
        <AITutorPanel level={level} open={isOpen} scriptId={scriptId} />
      </Provider>
    </div>
  );
};

AITutorFloatingActionButton.propTypes = {
  level: levelShape,
};

export default AITutorFloatingActionButton;
