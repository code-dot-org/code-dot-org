// Nothing here is specific to adaptive; a candidate for a shared components
// directory once a second caller appears.

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {CircularProgress, Typography as MuiTypography} from '@mui/material';
import classNames from 'classnames';
import React, {useEffect, useRef, useState} from 'react';

import styles from './editableText.module.scss';

interface EditableTextProps {
  value: string;
  /**
   * Called with the trimmed text. While a returned promise is pending the
   * new text shows with a spinner in place of the pencil.
   */
  onSave: (value: string) => void | Promise<unknown>;
  /** Accessible name for the edit control, e.g. "project title". */
  label: string;
  variant: 'h4' | 'body3';
  multiline?: boolean;
  className?: string;
}

/** Text with a pencil that appears on hover; click it to edit in place. */
const EditableText: React.FunctionComponent<EditableTextProps> = ({
  value,
  onSave,
  label,
  variant,
  multiline,
  className,
}) => {
  const [draft, setDraft] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const mounted = useRef(true);
  useEffect(
    () => () => {
      mounted.current = false;
    },
    []
  );

  const save = () => {
    const next = draft?.trim();
    setDraft(null);
    if (!next || next === value) return;
    const result = onSave(next);
    if (!result) return;
    setPending(next);
    const settle = () => {
      if (mounted.current) setPending(null);
    };
    result.then(settle, settle);
  };

  if (draft !== null) {
    const shared = {
      autoFocus: true,
      'aria-label': label,
      value: draft,
      onBlur: save,
      onChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      ) => setDraft(e.target.value),
      onKeyDown: (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') setDraft(null);
        if (e.key === 'Enter' && !multiline) save();
      },
    };
    return multiline ? (
      <textarea
        className={classNames(styles.editInput, styles.textArea)}
        rows={3}
        {...shared}
      />
    ) : (
      <input
        className={classNames(styles.editInput, styles.editTitle)}
        {...shared}
      />
    );
  }

  return (
    <div className={styles.editable}>
      <MuiTypography variant={variant} className={className}>
        {pending ?? value}
      </MuiTypography>
      {pending !== null ? (
        <span
          className={styles.saving}
          role="status"
          aria-label={`Saving ${label}`}
        >
          <CircularProgress size={14} />
        </span>
      ) : (
        <button
          type="button"
          className={styles.editButton}
          aria-label={`Edit ${label}`}
          onClick={() => setDraft(value)}
        >
          <FontAwesomeV6Icon iconName="pencil" />
        </button>
      )}
    </div>
  );
};

export default EditableText;
