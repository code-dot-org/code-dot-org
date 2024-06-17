import React from 'react';

import moduleStyles from './suggested-prompt.module.scss';

/**
 * Renders a clickable tag that can be customized with a suggested prompt.
 */

export interface SuggestedPromptProps {
  onClick: () => void;
  label: string;
  hide: boolean;
}

const SuggestedPrompt: React.FunctionComponent<SuggestedPromptProps> = ({
  onClick,
  label,
  hide
}) => (
  <>
  {!hide ? (
    <div onClick={onClick} className={moduleStyles.tag}>
    <span>{label}</span>
  </div>
  ): null 
  }
  </>
);
export default SuggestedPrompt;