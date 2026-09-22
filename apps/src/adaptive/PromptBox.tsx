import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import React from 'react';

import moduleStyles from './pathway.module.scss';

interface PromptBoxProps {
  /** When set, the box is disabled and this explains how to unlock it. */
  locked?: string;
}

const PromptBox: React.FunctionComponent<PromptBoxProps> = ({locked}) => (
  <>
    {locked && (
      <span className={moduleStyles.lockNote}>
        <FontAwesomeV6Icon iconName="lock" />
        {locked}
      </span>
    )}
    <textarea
      className={moduleStyles.promptBox}
      placeholder="just for display"
      aria-label="Prompt"
      disabled={!!locked}
    />
  </>
);

export default PromptBox;
