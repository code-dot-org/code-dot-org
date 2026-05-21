import React from 'react';

import moduleStyles from '../lesson-generator.module.scss';

interface OutlineBlockProps {
  value: string;
  onChange: (next: string) => void;
  onGenerate: () => void;
  isOutlining: boolean;
  disabled: boolean;
  error: string | null;
}

const OutlineBlock: React.FC<OutlineBlockProps> = ({
  value,
  onChange,
  onGenerate,
  isOutlining,
  disabled,
  error,
}) => (
  <div className={moduleStyles.outlineBlock}>
    <h2 className={moduleStyles.outlineHeading}>
      Optional: generate the levels below from an outline
    </h2>
    <p className={moduleStyles.outlineHelp}>
      Describe the learning experience you want this lesson to take a student
      through. The AI will turn that into a sequence of Panels and Web Lab 2
      levels with IDs and per-level descriptions. You can edit or remove any of
      them before generating their content below.
    </p>
    <textarea
      className={moduleStyles.outlineInput}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder="e.g. Introduce the student to CSS selectors, then have them style a simple form, then reflect on what they learned."
      disabled={isOutlining || disabled}
    />
    <div className={moduleStyles.outlineActions}>
      <button
        type="button"
        className={moduleStyles.secondaryButton}
        onClick={onGenerate}
        disabled={isOutlining || disabled || !value.trim()}
      >
        {isOutlining ? 'Generating outline…' : 'Generate outline'}
      </button>
      {error && (
        <span className={moduleStyles.summaryBad} role="alert">
          {error}
        </span>
      )}
    </div>
  </div>
);

export default OutlineBlock;
