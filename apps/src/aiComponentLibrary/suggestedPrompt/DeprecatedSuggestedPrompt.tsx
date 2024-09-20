import React from 'react';

import moduleStyles from './suggested-prompt.module.scss';

/**
 * Renders a clickable tag that can be customized with a suggested prompt.
 */

export interface SuggestedPromptProps {
  onClick: () => void;
  label: string;
  show: boolean;
}

const SuggestedPrompt: React.FunctionComponent<SuggestedPromptProps> = ({
  onClick,
  label,
  show,
}) =>
  !show ? null : (
    <div onClick={onClick} className={moduleStyles.prompt}>
      <span>{label}</span>
    </div>
  );
export default SuggestedPrompt;
