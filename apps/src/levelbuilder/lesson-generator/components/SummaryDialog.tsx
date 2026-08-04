import React from 'react';

import Dialog from '@cdo/apps/levelbuilder/curriculum-generator/components/Dialog';

import {GenerationSummary} from '../types';

import moduleStyles from '../lesson-generator.module.scss';
import sharedStyles from '@cdo/apps/levelbuilder/curriculum-generator/curriculum-generator.module.scss';

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
    <Dialog>
      <h2>Generation complete</h2>
      <p>
        Created <strong>{summary.created.length}</strong> of {total} level(s).
        {summary.failed.length > 0 && (
          <>
            {' '}
            <span className={sharedStyles.summaryBad}>
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
      {summary.templates && summary.templates.length > 0 && (
        <>
          <h3 className={moduleStyles.summaryGood}>Templates</h3>
          <p className={sharedStyles.dialogNote}>
            Shared starter files backing the levels above. Templates sit outside
            the lesson's activity tree — open each one to tune the files by
            hand.
          </p>
          <ul>
            {summary.templates.map(t => (
              <li key={t.editUrl}>
                <a href={t.editUrl}>{t.name}</a>
              </li>
            ))}
          </ul>
        </>
      )}
      {summary.failed.length > 0 && (
        <>
          <h3 className={sharedStyles.summaryBad}>Failed</h3>
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
        <p className={sharedStyles.dialogNote}>
          The new levels are attached to this lesson. Open it in the editor to
          review, reorder, or tweak before publishing.
        </p>
      )}
      <div className={sharedStyles.dialogActions}>
        <button
          type="button"
          className={sharedStyles.secondaryButton}
          onClick={onClose}
        >
          Stay here
        </button>
        <a
          href={editLessonUrl}
          className={
            anyCreated
              ? sharedStyles.primaryButton
              : sharedStyles.secondaryButton
          }
        >
          {anyCreated ? 'Open lesson editor' : 'Open lesson edit'}
        </a>
      </div>
    </Dialog>
  );
};

export default SummaryDialog;
