import React from 'react';

import moduleStyles from '../unit-generator.module.scss';

interface UnitOutlineBlockProps {
  value: string;
  onChange: (next: string) => void;
  onGenerate: () => void;
  isOutlining: boolean;
  disabled: boolean;
  error: string | null;
}

const UnitOutlineBlock: React.FC<UnitOutlineBlockProps> = ({
  value,
  onChange,
  onGenerate,
  isOutlining,
  disabled,
  error,
}) => (
  <div className={moduleStyles.outlineBlock}>
    <h2 className={moduleStyles.outlineHeading}>
      Optional: generate the lessons below from a unit outline
    </h2>
    <p className={moduleStyles.outlineHelp}>
      Describe the unit as a whole — what it teaches, who it's for, what the
      student should be able to do by the end. The AI will turn that into a
      sequence of lessons with names, keys, and per-lesson prompts. You can
      edit, reorder, or remove any of them before saving.
    </p>
    <textarea
      className={moduleStyles.outlineInput}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder="e.g. A 6-lesson intro to web development for middle schoolers. Start with HTML structure, then visual styling with CSS, then a small project where students build a personal homepage."
      disabled={isOutlining || disabled}
    />
    <div className={moduleStyles.outlineActions}>
      <button
        type="button"
        className={moduleStyles.secondaryButton}
        onClick={onGenerate}
        disabled={isOutlining || disabled || !value.trim()}
      >
        {isOutlining ? 'Generating outline…' : 'Generate lesson outlines'}
      </button>
      {error && (
        <span className={moduleStyles.summaryBad} role="alert">
          {error}
        </span>
      )}
    </div>
  </div>
);

export default UnitOutlineBlock;
