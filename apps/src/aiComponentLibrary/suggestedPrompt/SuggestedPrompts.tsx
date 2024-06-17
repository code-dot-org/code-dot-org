import React from 'react';

import SuggestedPrompt from './SuggestedPrompt';

import moduleStyles from './suggested-prompt.module.scss';

/**
 * Renders a clickable tags that can be customized with a suggested prompt.
 */

const suggestedPrompts = [
    {
      label: `Why doesn't my code compile?`,
      handleClick: () => console.log("suggested prompt was clicked!"),
      hide: false
    }
  ]
  
const SuggestedPrompts: React.FunctionComponent = ({
}) => (
    <>
    {suggestedPrompts.map((prompt) =>
        <SuggestedPrompt 
            onClick={prompt.handleClick}
            label={prompt.label}
            hide={prompt.hide}
        />
    )}
    </>
);
export default SuggestedPrompts;