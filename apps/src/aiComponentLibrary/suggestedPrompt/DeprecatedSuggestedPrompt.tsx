import React from 'react';

import moduleStyles from './suggested-prompt.module.scss';

/**
 * Renders a clickable tag that can be customized with a suggested prompt.
 */

export interface SuggestedPromptProps {
  onClick: (prompt: SuggestedPromptProps) => void;
  label: string;
  show: boolean;
  selected: boolean;
}

const DeprecatedSuggestedPrompt: React.FunctionComponent<
  SuggestedPromptProps
> = ({onClick, label, show}) =>
  !show ? null : (
    <div className={moduleStyles.prompt}>
      <span>{label}</span>
    </div>
  );
export default DeprecatedSuggestedPrompt;
