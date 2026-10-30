import React from 'react';

import sharedStyles from '../curriculum-generator.module.scss';

// The dashed "Optional: generate the X below from an outline" block at
// the top of every AI-generation page. The shape is fixed (heading,
// help text, textarea, "Generate" button, optional error); pages just
// supply the copy strings and the wiring.

interface OutlineBlockProps {
  heading: string;
  helpText: React.ReactNode;
  placeholder: string;
  buttonLabel: string;
  busyLabel?: string;
  value: string;
  onChange: (next: string) => void;
  onGenerate: () => void;
  isOutlining: boolean;
  disabled: boolean;
  error: string | null;
  // Extra rendered inside the block above the actions row. Used by the
  // project-flavoured lesson generator to tuck the channel-id input
  // alongside the outline textarea.
  extra?: React.ReactNode;
}

const OutlineBlock: React.FC<OutlineBlockProps> = ({
  heading,
  helpText,
  placeholder,
  buttonLabel,
  busyLabel = 'Generating outline…',
  value,
  onChange,
  onGenerate,
  isOutlining,
  disabled,
  error,
  extra,
}) => (
  <div className={sharedStyles.outlineBlock}>
    <h2 className={sharedStyles.outlineHeading}>{heading}</h2>
    <p className={sharedStyles.outlineHelp}>{helpText}</p>
    <textarea
      className={sharedStyles.outlineInput}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={isOutlining || disabled}
    />
    {extra}
    <div className={sharedStyles.outlineActions}>
      <button
        type="button"
        className={sharedStyles.secondaryButton}
        onClick={onGenerate}
        disabled={isOutlining || disabled || !value.trim()}
      >
        {isOutlining ? busyLabel : buttonLabel}
      </button>
      {error && (
        <span className={sharedStyles.summaryBad} role="alert">
          {error}
        </span>
      )}
    </div>
  </div>
);

export default OutlineBlock;
