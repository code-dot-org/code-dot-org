import React from 'react';
import {Provider} from 'react-redux';

import {setIsChatOpen} from '@cdo/apps/aiTutor/redux/aiTutorRedux';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {getStore} from '@cdo/apps/redux';
import {useAppSelector, useAppDispatch} from '@cdo/apps/util/reduxHooks';
import aiFabIcon from '@cdo/static/ai-fab-background.png';

import AITutorContainer from './AITutorContainer';

import style from './ai-tutor.module.scss';

/**
 * Renders an AI Bot icon button in the bottom left corner over other UI elements that controls
 * toggling the AI Tutor Panel open and closed.
 */

const AITutorFloatingActionButton: React.FunctionComponent = () => {
  const store = getStore();
  const dispatch = useAppDispatch();
  const level = useAppSelector(state => state.aiTutor.level);
  const isChatOpen = useAppSelector(state => state.aiTutor.isChatOpen);

  const handleClick = () => {
    const event = isChatOpen
      ? EVENTS.AI_TUTOR_PANEL_CLOSED
      : EVENTS.AI_TUTOR_PANEL_OPENED;
    analyticsReporter.sendEvent(event, {
      levelId: level?.id,
      levelType: level?.type,
    });
    dispatch(setIsChatOpen(!isChatOpen));
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
        <AITutorContainer open={isChatOpen} closeTutor={handleClick} />
      </Provider>
    </div>
  );
};

export default AITutorFloatingActionButton;
