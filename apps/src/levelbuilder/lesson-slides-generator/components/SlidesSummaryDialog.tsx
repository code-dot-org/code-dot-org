import React from 'react';

import Dialog from '../../curriculum-generator/components/Dialog';
import {SlidesGenerationSummary} from '../types';

import sharedStyles from '../../curriculum-generator/curriculum-generator.module.scss';
import moduleStyles from '../lesson-slides-generator.module.scss';

interface SlidesSummaryDialogProps {
  summary: SlidesGenerationSummary;
  slidesUrl: string;
  editLessonUrl: string;
  onClose: () => void;
}

const SlidesSummaryDialog: React.FC<SlidesSummaryDialogProps> = ({
  summary,
  slidesUrl,
  editLessonUrl,
  onClose,
}) => {
  const total = summary.generated.length + summary.failed.length;
  const anyGenerated = summary.generated.length > 0;
  return (
    <Dialog>
      <h2>Slides saved</h2>
      <p>
        Generated <strong>{summary.generated.length}</strong> of {total}{' '}
        slide(s).
        {summary.failed.length > 0 && (
          <>
            {' '}
            <span className={sharedStyles.summaryBad}>
              {summary.failed.length} failed.
            </span>
          </>
        )}
      </p>
      {summary.failed.length > 0 && (
        <ul className={moduleStyles.summaryList}>
          {summary.failed.map((f, i) => (
            <li key={i}>
              <strong>slide:</strong> {f.description.slice(0, 80) || '(blank)'}{' '}
              — <span className={sharedStyles.summaryBad}>{f.error}</span>
            </li>
          ))}
        </ul>
      )}
      {anyGenerated && (
        <p className={sharedStyles.dialogNote}>
          <a href={slidesUrl} target="_blank" rel="noopener noreferrer">
            Open the slides viewer ↗
          </a>{' '}
          to see how they look to a student.
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
        <a href={editLessonUrl} className={sharedStyles.secondaryButton}>
          Back to lesson editor
        </a>
      </div>
    </Dialog>
  );
};

export default SlidesSummaryDialog;
