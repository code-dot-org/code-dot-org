import React, {useState} from 'react';
import {Provider, useSelector} from 'react-redux';
import {getStore} from '@cdo/apps/redux';
import style from './ai-tutor.module.scss';
import aiFabIcon from '@cdo/static/ai-fab-background.png';
import AITutorPanel from './aiTutorPanel';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import {AITutorState} from '@cdo/apps/aiTutor/redux/aiTutorRedux';

/**
 * Renders an AI Bot icon button in the bottom left corner over other UI elements that controls
 * toggling the AI Tutor Panel open and closed.
 */

const AITutorFloatingActionButton: React.FunctionComponent = () => {
  const store = getStore();
  const [isOpen, setIsOpen] = useState(false);
  const level = useSelector(
    (state: {aiTutor: AITutorState}) => state.aiTutor.level
  );

  const handleClick = () => {
    const event = isOpen
      ? EVENTS.AI_TUTOR_PANEL_CLOSED
      : EVENTS.AI_TUTOR_PANEL_OPENED;
    analyticsReporter.sendEvent(event, {
      levelId: level?.id,
      levelType: level?.type,
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
        <AITutorPanel open={isOpen} />
      </Provider>
    </div>
  );
};

export default AITutorFloatingActionButton;
