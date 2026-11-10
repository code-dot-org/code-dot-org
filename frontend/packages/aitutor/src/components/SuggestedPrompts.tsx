// The prompt buttons, as pills above the composer.
//
// Ported from the `chatButtons` path: `AiTutorChat` builds a component per
// prompt and `UserChatMessageEditor` lays them out in a wrapping row. Two
// indirections collapse here — the legacy passes each button as a COMPONENT so
// that different products can style their own, and this package has one panel.
//
// They are disabled while a turn is in flight for the same reason the send
// button is: a second question with the first still unanswered has nowhere to
// go.

import {Button as MuiButton} from '@mui/material';
import type {FC} from 'react';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import type {SuggestedPrompt} from '../prompts/suggestedPrompts';

import moduleStyles from './suggested-prompts.module.scss';

export interface SuggestedPromptsProps {
  prompts: readonly SuggestedPrompt[];
  onChoose: (prompt: SuggestedPrompt) => void;
  disabled?: boolean;
}

export const SuggestedPrompts: FC<SuggestedPromptsProps> = ({
  prompts,
  onChoose,
  disabled,
}) => {
  if (prompts.length === 0) {
    return null;
  }

  return (
    <div className={moduleStyles.prompts}>
      {prompts.map(prompt => (
        <MuiButton
          key={prompt.id}
          variant="outlined"
          color="secondary"
          size="small"
          type="button"
          className={moduleStyles.prompt}
          disabled={disabled}
          onClick={() => onChoose(prompt)}
          startIcon={
            prompt.icon ? (
              <FontAwesomeV6Icon iconName={prompt.icon} />
            ) : undefined
          }
        >
          {prompt.label}
        </MuiButton>
      ))}
    </div>
  );
};

export default SuggestedPrompts;
