import React, {useCallback, useState} from 'react';

import {
  IMPORT_DOC_MAX_CHARS,
  ImportedPlan,
  parsePlanningDoc,
} from '../ai/importPlan';

import sharedStyles from '@cdo/apps/levelbuilder/curriculum-generator/curriculum-generator.module.scss';

interface ImportPlanningDocProps {
  lessonName: string;
  disabled: boolean;
  onBusyChange: (busy: boolean) => void;
  // Returns a note for the status line, if the page had to leave anything out.
  onImported: (plan: ImportedPlan) => string | undefined;
}

const ImportPlanningDoc: React.FC<ImportPlanningDocProps> = ({
  lessonName,
  disabled,
  onBusyChange,
  onImported,
}) => {
  const [text, setText] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const handleImport = useCallback(async () => {
    if (!text.trim()) {
      setError('Paste a planning document first.');
      return;
    }
    if (text.length > IMPORT_DOC_MAX_CHARS) {
      setError(
        `That is ${text.length.toLocaleString()} characters; paste one lesson's section (under ${IMPORT_DOC_MAX_CHARS.toLocaleString()}).`
      );
      return;
    }
    setError(null);
    setStatus(null);
    setIsImporting(true);
    onBusyChange(true);
    try {
      const plan = await parsePlanningDoc(lessonName, text);
      const note = onImported(plan);
      const count = plan.levels.length;
      setStatus(
        [
          `Imported ${count} level${count === 1 ? '' : 's'}.`,
          plan.unsupported.length
            ? `Skipped ${
                plan.unsupported.length
              } unsupported: ${plan.unsupported.join(', ')}.`
            : '',
          note ?? '',
        ]
          .filter(Boolean)
          .join(' ')
      );
      setText('');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsImporting(false);
      onBusyChange(false);
    }
  }, [lessonName, text, onImported, onBusyChange]);

  const busy = disabled || isImporting;
  return (
    <details className={sharedStyles.collapsibleBlock}>
      <summary>Or: import a planning document</summary>
      <p>
        Paste a lesson planning document (lesson info plus a level list, with
        any per-level code). Its levels are imported one-to-one as cards below —
        nothing is added or reordered — and its lesson prose fills the outline
        box above when that box is empty.
      </p>
      <textarea
        className={sharedStyles.outlineInput}
        aria-label="Planning document"
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Paste the planning document here."
        disabled={busy}
      />
      <div className={sharedStyles.outlineActions}>
        <button
          type="button"
          className={sharedStyles.secondaryButton}
          onClick={handleImport}
          disabled={busy}
        >
          {isImporting ? 'Importing…' : 'Import levels'}
        </button>
        {error && (
          <span className={sharedStyles.summaryBad} role="alert">
            {error}
          </span>
        )}
        {status && <span role="status">{status}</span>}
      </div>
    </details>
  );
};

export default ImportPlanningDoc;
