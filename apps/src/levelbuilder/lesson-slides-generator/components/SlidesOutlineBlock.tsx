import React from 'react';

import moduleStyles from '../lesson-slides-generator.module.scss';

interface SlidesOutlineBlockProps {
  value: string;
  onChange: (next: string) => void;
  onGenerate: () => void;
  isOutlining: boolean;
  disabled: boolean;
  error: string | null;
  defaultOpen: boolean;
}

const SlidesOutlineBlock: React.FC<SlidesOutlineBlockProps> = ({
  value,
  onChange,
  onGenerate,
  isOutlining,
  disabled,
  error,
  defaultOpen,
}) => (
  <details className={moduleStyles.outlineBlock} open={defaultOpen}>
    <summary>Optional: describe what these intro slides should cover</summary>
    <p className={moduleStyles.outlineHelp}>
      These slides play before the lesson, to set context for the student.
      Describe what you want them to cover — themes, mood, concepts to set up —
      and the AI will read your existing lesson content and propose a sequence
      of slide cards. You can edit, reorder, or delete any of them before
      generating the actual panels.
    </p>
    <textarea
      className={moduleStyles.outlineInput}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder="e.g. Three slides that introduce HTML as the backbone of every webpage, motivate why structure matters, and hint at what the student will build today — without giving away the steps."
      disabled={isOutlining || disabled}
    />
    <div className={moduleStyles.outlineActions}>
      <button
        type="button"
        className={moduleStyles.secondaryButton}
        onClick={onGenerate}
        disabled={isOutlining || disabled}
      >
        {isOutlining ? 'Generating outline…' : 'Generate slide outlines'}
      </button>
      {error && (
        <span className={moduleStyles.summaryBad} role="alert">
          {error}
        </span>
      )}
    </div>
  </details>
);

export default SlidesOutlineBlock;
