import PropTypes from 'prop-types';
import React from 'react';

import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';

const QuestionRenderer = ({levelData}) => {
  const {properties} = levelData;

  const isImagePath = text => {
    return /\.(jpeg|jpg|gif|png|svg)$/.test(text);
  };

  const imageStyle = {
    maxWidth: '100px', // Adjust the max width as needed
    maxHeight: '100px', // Adjust the max height as needed
    objectFit: 'contain',
  };

  const renderContent = (content, altStart, altIndex) => {
    return isImagePath(content) ? (
      <img
        src={content}
        alt={`${altStart} ${altIndex + 1}`}
        style={imageStyle}
      />
    ) : (
      <SafeMarkdown markdown={content} />
    );
  };

  if (levelData.type === 'Multi') {
    // Multi level
    return (
      <div>
        {properties.questions && (
          <SafeMarkdown markdown={properties.questions[0]['text']} />
        )}
        {properties.markdown && <SafeMarkdown markdown={properties.markdown} />}
        {properties.content1 &&
          renderContent(properties.content1, 'Content', 0)}
        {properties.content2 &&
          renderContent(properties.content2, 'Content', 1)}
        {properties.content3 &&
          renderContent(properties.content3, 'Content', 2)}
        <ol type="A">
          {properties.answers.map((answer, index) => (
            <li key={index}>
              {renderContent(answer['text'], 'Answer', index)}
            </li>
          ))}
        </ol>
      </div>
    );
  } else if (levelData.type === 'FreeResponse') {
    // Free response level
    return (
      <div>
        {properties.title && <h2>{properties.title}</h2>}
        {properties.long_instructions && (
          <SafeMarkdown markdown={properties.long_instructions} />
        )}
      </div>
    );
  } else {
    return null;
  }
};

QuestionRenderer.propTypes = {
  levelData: PropTypes.object,
};

export default QuestionRenderer;
