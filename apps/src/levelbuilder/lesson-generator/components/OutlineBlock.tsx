import React from 'react';

import moduleStyles from '../lesson-generator.module.scss';

interface OutlineBlockProps {
  value: string;
  onChange: (next: string) => void;
  onGenerate: () => void;
  isOutlining: boolean;
  disabled: boolean;
  error: string | null;
  // Optional target Web Lab 2 channel id. Lives in this block because
  // the Generate-outline call reads it too (same fetch is shared with
  // the per-level calls later); putting the input next to the outline
  // textarea makes that flow obvious.
  projectChannelId: string;
  onProjectChannelIdChange: (next: string) => void;
}

const OutlineBlock: React.FC<OutlineBlockProps> = ({
  value,
  onChange,
  onGenerate,
  isOutlining,
  disabled,
  error,
  projectChannelId,
  onProjectChannelIdChange,
}) => (
  <details className={moduleStyles.outlineBlock}>
    <summary>Optional: generate the levels below from an outline</summary>
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
    <div className={moduleStyles.outlineProjectRow}>
      <label htmlFor="project-channel-id">
        Optional: target Web Lab 2 project (channel id)
      </label>
      <input
        id="project-channel-id"
        className={moduleStyles.outlineProjectInput}
        value={projectChannelId}
        onChange={e => onProjectChannelIdChange(e.target.value)}
        placeholder="e.g. abc123 — leave blank to skip"
        disabled={isOutlining || disabled}
      />
      <small className={moduleStyles.outlineHelp}>
        When set, the lesson is generated as a progression toward the app stored
        at this channel. The student never sees the target code; the AI uses it
        as the final goal so each level moves closer to it.
      </small>
    </div>
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
  </details>
);

export default OutlineBlock;
