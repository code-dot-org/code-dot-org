import {Button, Typography} from '@mui/material';
import {useEffect, useRef, useState} from 'react';

import {useEscapeKeyHandler} from '@code-dot-org/component-library/common/hooks';

import styles from './authoring.module.scss';

interface TitleComposerProps {
  /** Used as both the input's aria-label and its placeholder. */
  fieldLabel: string;
  submitLabel: string;
  onCancel: () => void;
  /** Caller builds and applies the actual CurriculumChange. */
  onSubmit: (title: string) => Promise<void>;
}

/**
 * Minimal manual-authoring form for a single title field — the shared shape
 * of "new course"/"new unit"/"new lesson", which all take only a displayName.
 * Mirrors ContentComposer's layout and busy/error handling.
 */
export default function TitleComposer({
  fieldLabel,
  submitLabel,
  onCancel,
  onSubmit,
}: TitleComposerProps) {
  const [title, setTitle] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEscapeKeyHandler(onCancel);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const submit = async () => {
    const trimmed = title.trim();
    if (busy || !trimmed) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await onSubmit(trimmed);
    } catch {
      setError('That change failed to apply.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      className={styles.contentComposer}
      onSubmit={e => {
        e.preventDefault();
        void submit();
      }}
    >
      <input
        ref={inputRef}
        aria-label={fieldLabel}
        placeholder={fieldLabel}
        value={title}
        onChange={e => setTitle(e.target.value)}
      />
      {error && (
        <Typography
          variant="body4"
          role="status"
          className={styles.inlineError}
        >
          {error}
        </Typography>
      )}
      <div className={styles.composerActions}>
        <Button variant="outlined" size="small" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          size="small"
          disabled={busy || !title.trim()}
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
