import {Box} from '@mui/material';
import {useLocation} from '@tanstack/react-router';
import {useEffect, useState} from 'react';

import Alert, {type AlertProps} from '@code-dot-org/component-library/alert';

import {getPageFlash, type PageFlashMessage} from './getPageFlash';

const alertPropsByType: Record<
  PageFlashMessage['type'],
  Pick<AlertProps, 'type' | 'isImmediateImportance'>
> = {
  notice: {type: 'success', isImmediateImportance: false},
  info: {type: 'info', isImmediateImportance: false},
  alert: {type: 'danger', isImmediateImportance: true},
};

// The flash belongs to the page load, not to a mount: the root layout remounts
// during client-side navigation, so what has been shown is tracked here.
let loadPathname: string | undefined;
let remaining: PageFlashMessage[] | undefined;

function remainingPageFlash(): PageFlashMessage[] {
  remaining ??= getPageFlash();
  return remaining;
}

/**
 * Shows the session flash the Rails shell carried for this page load, one
 * dismissible Alert per message. Leaving the pathname that loaded it, by
 * client-side navigation, consumes it.
 */
export default function PageFlash() {
  const pathname = useLocation({select: location => location.pathname});
  const [messages, setMessages] = useState(remainingPageFlash);
  loadPathname ??= pathname;
  const onLoadPathname = pathname === loadPathname;

  const update = (next: PageFlashMessage[]) => {
    remaining = next;
    setMessages(next);
  };

  useEffect(() => {
    if (!onLoadPathname) update([]);
  }, [onLoadPathname]);

  if (!onLoadPathname || messages.length === 0) return null;

  return (
    <Box
      sx={{
        // Same content column as the users page.
        maxWidth: 1008,
        mx: 'auto',
        px: {xs: 2, sm: 3},
        pt: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
      }}
    >
      {messages.map((message, index) => (
        <Alert
          key={index}
          {...alertPropsByType[message.type]}
          text={message.message}
          onClose={() => update(messages.filter(m => m !== message))}
        />
      ))}
    </Box>
  );
}
