import React from 'react';

import {GenerationSummary} from '../types';

import moduleStyles from '../lesson-generator.module.scss';

interface SummaryDialogProps {
  summary: GenerationSummary;
  editLessonUrl: string;
  onClose: () => void;
}

const SummaryDialog: React.FC<SummaryDialogProps> = ({
  summary,
  editLessonUrl,
  onClose,
}) => {
  const total = summary.created.length + summary.failed.length;
  const anyCreated = summary.created.length > 0;
  return (
    <div className={moduleStyles.dialogBackdrop} role="dialog" aria-modal>
      <div className={moduleStyles.dialog}>
        <h2>Generation complete</h2>
        <p>
          Created <strong>{summary.created.length}</strong> of {total} level(s).
          {summary.failed.length > 0 && (
            <>
              {' '}
              <span className={moduleStyles.summaryBad}>
                {summary.failed.length} failed.
              </span>
            </>
          )}
        </p>
        {anyCreated && (
          <>
            <h3 className={moduleStyles.summaryGood}>Created</h3>
            <ul>
              {summary.created.map(c => (
                <li key={c.editUrl}>
                  <a href={c.editUrl}>{c.name}</a>
                </li>
              ))}
            </ul>
          </>
        )}
        {summary.failed.length > 0 && (
          <>
            <h3 className={moduleStyles.summaryBad}>Failed</h3>
            <ul>
              {summary.failed.map((f, i) => (
                <li key={i}>
                  <strong>{f.name}</strong>: {f.error}
                </li>
              ))}
            </ul>
          </>
        )}
        {anyCreated && (
          <p className={moduleStyles.dialogNote}>
            The new levels are attached to this lesson. Open it in the editor to
            review, reorder, or tweak before publishing.
          </p>
        )}
        <div className={moduleStyles.dialogActions}>
          <button
            type="button"
            className={moduleStyles.secondaryButton}
            onClick={onClose}
          >
            Stay here
          </button>
          <a
            href={editLessonUrl}
            className={
              anyCreated
                ? moduleStyles.primaryButton
                : moduleStyles.secondaryButton
            }
          >
            {anyCreated ? 'Open lesson editor' : 'Open lesson edit'}
          </a>
        </div>
      </div>
    </div>
  );
};

export default SummaryDialog;
