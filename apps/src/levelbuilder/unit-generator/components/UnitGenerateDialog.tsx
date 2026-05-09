import React from 'react';

import {UnitGenerationSummary} from '../types';

import moduleStyles from '../unit-generator.module.scss';

interface UnitGenerateDialogProps {
  // While the bulk-write is in flight, `summary` is null and we show a
  // spinner-style status instead. Once the round-trip resolves, the
  // parent feeds in the summary and we flip to the success layout with
  // per-lesson links.
  isSaving: boolean;
  totalToSave: number;
  summary: UnitGenerationSummary | null;
  error: string | null;
  editUnitUrl: string;
  onClose: () => void;
}

const UnitGenerateDialog: React.FC<UnitGenerateDialogProps> = ({
  isSaving,
  totalToSave,
  summary,
  error,
  editUnitUrl,
  onClose,
}) => {
  const showingSummary = summary !== null && !isSaving;
  return (
    <div className={moduleStyles.dialogBackdrop} role="dialog" aria-modal>
      <div className={moduleStyles.dialog}>
        {!showingSummary && (
          <>
            <h2>{error ? 'Save failed' : 'Saving lessons…'}</h2>
            {error ? (
              <p className={moduleStyles.summaryBad} role="alert">
                {error}
              </p>
            ) : (
              <p>
                Writing {totalToSave} lesson{totalToSave === 1 ? '' : 's'} to
                this unit. This usually takes a moment.
              </p>
            )}
          </>
        )}
        {showingSummary && summary && (
          <>
            <h2>Lessons saved</h2>
            <p>
              <strong>{summary.total}</strong> lesson
              {summary.total === 1 ? '' : 's'} are now attached to this unit.
              Open each one's <code>/generate</code> page to flesh out its
              content.
            </p>
            <ul className={moduleStyles.summaryList}>
              {summary.lessons.map((l, i) => (
                <li key={i}>
                  <a href={l.lessonGeneratePath}>{l.name}</a>
                  {l.isNew && <span className={moduleStyles.tagNew}>new</span>}
                  {l.createdSeparately && (
                    <span className={moduleStyles.muted}> no prompt</span>
                  )}{' '}
                  <a className={moduleStyles.muted} href={l.lessonEditPath}>
                    edit
                  </a>
                </li>
              ))}
            </ul>
          </>
        )}
        <div className={moduleStyles.dialogActions}>
          {(showingSummary || error) && (
            <button
              type="button"
              className={moduleStyles.secondaryButton}
              onClick={onClose}
            >
              Stay here
            </button>
          )}
          {showingSummary && (
            <a href={editUnitUrl} className={moduleStyles.primaryButton}>
              Back to unit editor
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default UnitGenerateDialog;
