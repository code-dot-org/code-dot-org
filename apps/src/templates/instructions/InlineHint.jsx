/* eslint-disable react/no-danger */
import React from 'react';
import Radium from 'radium';
import ReadOnlyBlockSpace from '../ReadOnlyBlockSpace';
import ChatBubble from './ChatBubble';

const InlineHint = ({ borderColor, block, content }) => {
  return (
    <ChatBubble borderColor={borderColor}>
      <div
        dangerouslySetInnerHTML={{ __html: content }}
      />
      {block && <ReadOnlyBlockSpace block={block} />}
    </ChatBubble>
  );
};

InlineHint.propTypes = {
  block: React.PropTypes.object, // XML
  borderColor: React.PropTypes.string,
  content: React.PropTypes.string.isRequired,
};

export default Radium(InlineHint);
