import PropTypes from 'prop-types';
import React from 'react';
import i18n from '@cdo/locale';
import fontConstants from '@cdo/apps/fontConstants';

const DEFAULT_FILTER_KEY = i18n.all();

function TextResponsesLessonSelector({lessons, onChangeFilter}) {
  // only render filter dropdown if there are 2+ lessons
  if (lessons.length <= 1) {
    return null;
  }

  const onChange = event => {
    const newFilterByLessonName =
      event.target.value === DEFAULT_FILTER_KEY ? null : event.target.value;
    onChangeFilter(newFilterByLessonName);
  };

  return (
    <div style={styles.dropdownContainer}>
      <div style={styles.dropdownLabel}>{i18n.filterByStage()}</div>
      <select
        id="uitest-lesson-filter"
        style={styles.dropdown}
        onChange={onChange}
      >
        <option key={DEFAULT_FILTER_KEY}>{DEFAULT_FILTER_KEY}</option>
        {lessons.map(lesson => (
          <option key={lesson}>{lesson}</option>
        ))}
      </select>
    </div>
  );
}

TextResponsesLessonSelector.propTypes = {
  lessons: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChangeFilter: PropTypes.func.isRequired,
};

const styles = {
  dropdownContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  dropdownLabel: {
    ...fontConstants['main-font-semi-bold'],
  },
  dropdown: {
    display: 'block',
    boxSizing: 'border-box',
    height: 30,
    paddingLeft: 8,
    paddingRight: 8,
    marginLeft: 8,
  },
};

export default TextResponsesLessonSelector;
