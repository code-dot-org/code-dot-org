import React from 'react';

import ProtectedStatefulDiv from '../ProtectedStatefulDiv';

/**
 * Simple component for our icon for hints.
 */
const PromptIcon = (props) => (
  <img src={props.src} id="prompt-icon"/>
);
PromptIcon.propTypes = {
  src: React.PropTypes.string.isRequired
};

export default PromptIcon;
