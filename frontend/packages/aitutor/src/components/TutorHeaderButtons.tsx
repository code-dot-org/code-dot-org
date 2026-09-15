// The buttons in the panel header, beside the tab title.
//
// One so far. Ported from `apps/src/aichat/views/aiChatHeaderButtons` — the
// legacy also has Copy Chat History, which belongs with the chat-history
// feature that is out of scope (specs/PLAN.md §2).
//
// CLEARING IS BLOCKED WHILE A PROPOSAL STANDS, which is the legacy behaviour
// and the one thing here that is not cosmetic. The host applied the offered
// edits when they arrived, and the workspace is showing them; clearing the
// conversation would take away the only Accept and Reject buttons there are,
// leaving the project holding changes nobody agreed to and no record of where
// they came from.

import {IconButton as MuiIconButton} from '@mui/material';
import type {FC} from 'react';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {WithTooltip} from '@code-dot-org/component-library/tooltip';

import {useTutor} from '../session/useTutor';

const CLEAR_TOOLTIP_ID = 'ai-tutor-clear-chat-tooltip';

export const TutorHeaderButtons: FC = () => {
  const {messages, proposal, clear} = useTutor();

  // Nothing to clear, and nothing to say about why not.
  if (messages.length === 0) {
    return null;
  }

  const blocked = proposal !== undefined;

  return (
    <WithTooltip
      tooltipProps={{
        tooltipId: CLEAR_TOOLTIP_ID,
        text: blocked
          ? 'Accept or reject the suggested changes first'
          : 'Clear chat',
        size: 'xs',
        direction: 'onBottom',
      }}
    >
      <MuiIconButton
        variant="text"
        color="tertiary"
        size="extraSmall"
        type="button"
        aria-label="Clear chat"
        aria-describedby={CLEAR_TOOLTIP_ID}
        disabled={blocked}
        onClick={clear}
      >
        <FontAwesomeV6Icon iconName="eraser" iconStyle="solid" />
      </MuiIconButton>
    </WithTooltip>
  );
};

export default TutorHeaderButtons;
