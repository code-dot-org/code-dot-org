// The tutor is here, and cannot be used.
//
// Ported from `apps/src/aichat/views/ChatDisabled.tsx`. It exists as a distinct
// state — rather than the tab simply not being there — because the two mean
// different things to a student. An absent tutor is a course that does not
// offer one. A disabled tutor is one somebody switched off, and the message
// says who to ask (`access/disabledState`).

import {Typography as MuiTypography} from '@mui/material';
import type {FC} from 'react';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import Link from '@code-dot-org/component-library/link';

import type {DisabledLink} from '../access/disabledState';

import moduleStyles from './chat-disabled.module.scss';

export interface ChatDisabledProps {
  message?: string;
  link?: DisabledLink;
}

export const ChatDisabled: FC<ChatDisabledProps> = ({
  message = 'AI chat is currently disabled',
  link,
}) => (
  <div className={moduleStyles.container}>
    <FontAwesomeV6Icon
      className={moduleStyles.icon}
      iconName="ai-locked"
      iconFamily="kit"
    />
    <MuiTypography variant="body3" gutterBottom>
      {message}
      {link && (
        <>
          {' '}
          <Link
            href={link.href}
            text={link.text}
            openInNewTab={link.openInNewTab}
            size="s"
            type="secondary"
          />
        </>
      )}
    </MuiTypography>
  </div>
);

export default ChatDisabled;
