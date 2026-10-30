import SimpleDropdown from '@code-dot-org/component-library/dropdown/simpleDropdown';
import PropTypes from 'prop-types';
import React from 'react';

import i18n from '@cdo/locale';

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

  const items = [
    {value: DEFAULT_FILTER_KEY, text: DEFAULT_FILTER_KEY},
    ...lessons.map(lesson => ({value: lesson, text: lesson})),
  ];

  return (
    <SimpleDropdown
      id="uitest-lesson-filter"
      name="lesson-filter"
      labelText={i18n.filterByStage()}
      items={items}
      onChange={onChange}
      size="s"
    />
  );
}

TextResponsesLessonSelector.propTypes = {
  lessons: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChangeFilter: PropTypes.func.isRequired,
};

export default TextResponsesLessonSelector;
