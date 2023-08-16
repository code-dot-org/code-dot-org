import React, {useState} from 'react';
import PropTypes from 'prop-types';
import style from './rubrics.module.scss';
const icon = require('@cdo/static/AI-FAB.png');
import RubricContainer from './RubricContainer';
import {rubricShape} from './rubricShapes';

export default function RubricFloatingActionButton({
  rubric,
  teacherHasEnabledAi,
  studentLevelInfo,
}) {
  const [isOpen, setIsOpen] = useState(false);

  console.log(studentLevelInfo);

  return (
    <div id="fab-contained">
      <button
        className={style.floatingActionButton}
        // I couldn't get an image url to work in the SCSS module, so using an inline style for now
        style={{backgroundImage: `url(${icon})`}}
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      />
      {isOpen && (
        <RubricContainer
          rubric={rubric}
          teacherHasEnabledAi={teacherHasEnabledAi}
          studentLevelInfo={studentLevelInfo}
        />
      )}
    </div>
  );
}

RubricFloatingActionButton.propTypes = {
  rubric: rubricShape,
  teacherHasEnabledAi: PropTypes.bool,
  studentLevelInfo: PropTypes.object,
};
