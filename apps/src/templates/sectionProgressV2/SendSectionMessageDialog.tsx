import Dialog from '@code-dot-org/component-library/dialog';
import {TextField as MuiTextField} from '@mui/material';
import React from 'react';

import HttpClient from '@cdo/apps/util/HttpClient';

import styles from './send-section-message-dialog.module.scss';

const MESSAGE_MAX_LEN = 500;

interface SendSectionMessageDialogProps {
  sectionId: number;
  onClose: () => void;
}

const SendSectionMessageDialog: React.FC<SendSectionMessageDialogProps> = ({
  sectionId,
  onClose,
}) => {
  const [message, setMessage] = React.useState('');
  const [link, setLink] = React.useState('');
  const [isSending, setIsSending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [didSend, setDidSend] = React.useState(false);

  const linkLooksValid = React.useMemo(() => {
    const trimmed = link.trim();
    if (!trimmed) return true;
    try {
      const url = new URL(trimmed);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }, [link]);

  const canSend = !isSending && message.trim().length > 0 && linkLooksValid;

  const handleSend = React.useCallback(async () => {
    setError(null);
    setIsSending(true);
    try {
      const body = new FormData();
      body.append('message', message.trim());
      if (link.trim()) {
        body.append('link', link.trim());
      }
      await HttpClient.post(
        `/api/v1/sections/${sectionId}/broadcast_message`,
        body,
        true
      );
      setDidSend(true);
    } catch (e) {
      setError("Couldn't send message. Try again.");
    } finally {
      setIsSending(false);
    }
  }, [sectionId, message, link]);

  if (didSend) {
    return (
      <Dialog
        title="Message sent"
        description="Students who are signed in will see your message."
        primaryButtonProps={{children: 'Close', onClick: onClose}}
        onClose={onClose}
      />
    );
  }

  return (
    <Dialog
      title="Send a message to your students"
      description="Write a quick note. Students currently signed in will see it pop up right away."
      customContent={
        <div className={styles.form}>
          <div>
            <label htmlFor="section-message-body" className={styles.fieldLabel}>
              Message
            </label>
            <MuiTextField
              id="section-message-body"
              fullWidth
              multiline
              minRows={3}
              maxRows={6}
              value={message}
              onChange={e => setMessage(e.target.value)}
              inputProps={{maxLength: MESSAGE_MAX_LEN, 'aria-label': 'Message'}}
              placeholder="e.g. Pause for a moment and look at the board."
            />
            <div className={styles.counter}>
              {message.length}/{MESSAGE_MAX_LEN}
            </div>
          </div>
          <div>
            <label htmlFor="section-message-link" className={styles.fieldLabel}>
              Link
              <span className={styles.optionalNote}>(optional)</span>
            </label>
            <MuiTextField
              id="section-message-link"
              fullWidth
              value={link}
              onChange={e => setLink(e.target.value)}
              placeholder="https://example.com"
              error={!linkLooksValid}
              inputProps={{'aria-label': 'Optional link'}}
            />
            <div className={styles.helper}>
              {linkLooksValid
                ? 'Students will see this URL and can open it in a new tab.'
                : 'Enter a valid http:// or https:// URL.'}
            </div>
          </div>
          {error && <div className={styles.error}>{error}</div>}
        </div>
      }
      primaryButtonProps={{
        children: isSending ? 'Sending…' : 'Send',
        onClick: handleSend,
        disabled: !canSend,
      }}
      secondaryButtonProps={{
        children: 'Cancel',
        onClick: onClose,
        disabled: isSending,
      }}
      onClose={onClose}
    />
  );
};

export default SendSectionMessageDialog;
