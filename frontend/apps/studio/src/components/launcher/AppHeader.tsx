import {Box, Button, Tooltip, Typography} from '@mui/material';
import {visuallyHidden} from '@mui/utils';
import {useEffect, useState} from 'react';

import CodeAILogo from '@/config/brand/assets/logo-codeai-inverse.svg';

import styles from './launcher.module.scss';

// Amazon requires the privacy policy inside the app, and Amazon Kids+ as text
// a parent can copy rather than a link a child can follow: tapping it copies
// the address.
const PRIVACY_POLICY_URL = 'https://code.org/privacy';
const PRIVACY_POLICY_TEXT = 'code.org/privacy';
const COPIED_MS = 2000;

/** The app's purple bar. The logo is the page heading unless the page has its own. */
export default function AppHeader({logoIsHeading}: {logoIsHeading: boolean}) {
  const logo = <img className={styles.logo} src={CodeAILogo} alt="CodeAI" />;
  return (
    <header className={styles.header}>
      {logoIsHeading ? <h1 className={styles.logoHeading}>{logo}</h1> : logo}
      <PrivacyPolicy />
    </header>
  );
}

function PrivacyPolicy() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) {
      return;
    }
    const timer = setTimeout(() => setCopied(false), COPIED_MS);
    return () => clearTimeout(timer);
  }, [copied]);

  return (
    <Typography variant="body2" component="p" className={styles.privacy}>
      Privacy Policy:{' '}
      <Tooltip
        title="Copied!"
        open={copied}
        placement="bottom"
        disableFocusListener
        disableHoverListener
        disableTouchListener
      >
        <Button
          variant="text"
          className={styles.privacyCopy}
          aria-label={`Copy the privacy policy address, ${PRIVACY_POLICY_TEXT}`}
          onClick={() =>
            copyText(PRIVACY_POLICY_URL).then(() => setCopied(true))
          }
        >
          {PRIVACY_POLICY_TEXT}
        </Button>
      </Tooltip>
      <Box component="span" sx={visuallyHidden} aria-live="polite">
        {copied ? 'Copied!' : ''}
      </Box>
    </Typography>
  );
}

// The Clipboard API, or the older copy command where a WebView lacks it.
async function copyText(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const field = document.createElement('textarea');
    field.value = text;
    field.setAttribute('readonly', '');
    field.className = styles.copyField;
    document.body.appendChild(field);
    field.select();
    document.execCommand('copy');
    field.remove();
  }
}
