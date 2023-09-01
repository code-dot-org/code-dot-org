import React, {useState} from 'react';
import style from './rubrics.module.scss';
const icon = require('@cdo/static/AI-FAB.png');
import RubricContainer from './RubricContainer';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import {
  rubricShape,
  reportingDataShape,
  studentLevelInfoShape,
} from './rubricShapes';

export default function RubricFloatingActionButton({
  rubric,
  studentLevelInfo,
  reportingData,
}) {
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
      {/* TODO: do not hardcode in AI setting */}
      {isOpen && (
        <RubricContainer
          rubric={rubric}
          studentLevelInfo={studentLevelInfo}
          reportingData={reportingData}
          teacherHasEnabledAi
        />
      )}
    </div>
  );
}

RubricFloatingActionButton.propTypes = {
  rubric: rubricShape,
  studentLevelInfo: studentLevelInfoShape,
  reportingData: reportingDataShape,
};
