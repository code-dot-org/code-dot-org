import React, {useState} from 'react';
import style from './rubrics.module.scss';
const icon = require('@cdo/static/AI-FAB.png');
import RubricContainer from './RubricContainer';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import {reportingDataShape} from './rubricShapes';

export default function RubricFloatingActionButton({reportingData}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    const eventName = isOpen
      ? EVENTS.RUBRIC_CLOSED_FROM_FAB
      : EVENTS.RUBRIC_OPENED_FROM_FAB;
    analyticsReporter.sendEvent(eventName, reportingData);
    setIsOpen(!isOpen);
  };

  return (
    <div id="fab-contained">
      <button
        className={style.floatingActionButton}
        // I couldn't get an image url to work in the SCSS module, so using an inline style for now
        style={{backgroundImage: `url(${icon})`}}
        onClick={handleClick}
        type="button"
      />
      {isOpen && <RubricContainer />}
    </div>
  );
}

RubricFloatingActionButton.propTypes = {
  reportingData: reportingDataShape,
};
