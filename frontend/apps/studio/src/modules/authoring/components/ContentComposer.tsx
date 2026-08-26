import {Button, Typography} from '@mui/material';
import {useEffect, useRef, useState} from 'react';

import {useEscapeKeyHandler} from '@code-dot-org/component-library/common/hooks';

import styles from './authoring.module.scss';

interface ContentComposerProps {
  initialTitle?: string;
  initialMarkdown?: string;
  /** "Insert" for a new content experience, "Save" when editing one. */
  submitLabel: string;
  onCancel: () => void;
  /** Caller builds and applies the actual CurriculumChange. */
  onSubmit: (input: {title: string; markdown: string}) => Promise<void>;
}

/**
 * Minimal manual-authoring form for a content experience: title (optional)
 * plus a markdown textarea. Shared by the insertion-point "Write content"
 * flow and the in-place "Edit" affordance on an existing content experience.
 */
export default function ContentComposer({
  initialTitle,
  initialMarkdown,
  submitLabel,
  onCancel,
  onSubmit,
}: ContentComposerProps) {
  const [title, setTitle] = useState(initialTitle ?? '');
  const [markdown, setMarkdown] = useState(initialMarkdown ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  useEscapeKeyHandler(onCancel);
  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  const submit = async () => {
    if (busy || !markdown.trim()) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await onSubmit({title: title.trim(), markdown});
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
        ref={titleRef}
        aria-label="Title (optional)"
        placeholder="Title (optional)"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />
      <textarea
        aria-label="Content (markdown)"
        placeholder="Write the content…"
        value={markdown}
        onChange={e => setMarkdown(e.target.value)}
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
          disabled={busy || !markdown.trim()}
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
