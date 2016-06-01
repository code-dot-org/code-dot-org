import React from 'react';

import ProtectedStatefulDiv from '../ProtectedStatefulDiv';

/**
 * Simple component for our icon for hints. May be modified by authoredHints.js.
 */
const PromptIconCell = (props) => (
  <ProtectedStatefulDiv id="prompt-icon-cell">
    <img src={props.src} id="prompt-icon"/>
  </ProtectedStatefulDiv>
);
PromptIconCell.propTypes = {
  src: React.PropTypes.string.isRequired
};

export default PromptIconCell;
