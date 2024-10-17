import PropTypes from 'prop-types';
import React from 'react';

import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';

const QuestionRenderer = ({viewingLevelData}) => {
  const {properties} = viewingLevelData;

  if (properties.questions) {
    // Multi level
    return (
      <div>
        <SafeMarkdown markdown={properties.questions[0]['text']} />
        <ol type="A">
          {properties.answers.map((answer, index) => (
            <li key={index}>{answer['text']}</li>
          ))}
        </ol>
      </div>
    );
  } else if (properties.long_instructions) {
    // Free response level
    return (
      <div>
        <SafeMarkdown markdown={properties.long_instructions} />
      </div>
    );
  } else {
    return null;
  }
};

QuestionRenderer.propTypes = {
  viewingLevelData: PropTypes.object,
};

export default QuestionRenderer;
