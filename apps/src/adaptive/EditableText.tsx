import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography as MuiTypography} from '@mui/material';
import classNames from 'classnames';
import React, {useState} from 'react';

import moduleStyles from './pathway.module.scss';

interface EditableTextProps {
  value: string;
  onSave: (value: string) => void;
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

  const save = () => {
    if (draft !== null && draft.trim()) onSave(draft.trim());
    setDraft(null);
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
        className={classNames(moduleStyles.editInput, moduleStyles.textArea)}
        rows={3}
        {...shared}
      />
    ) : (
      <input
        className={classNames(moduleStyles.editInput, moduleStyles.editTitle)}
        {...shared}
      />
    );
  }

  return (
    <div className={moduleStyles.editable}>
      <MuiTypography variant={variant} className={className}>
        {value}
      </MuiTypography>
      <button
        type="button"
        className={moduleStyles.editButton}
        aria-label={`Edit ${label}`}
        onClick={() => setDraft(value)}
      >
        <FontAwesomeV6Icon iconName="pencil" />
      </button>
    </div>
  );
};

export default EditableText;
