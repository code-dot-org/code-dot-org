// Authoring UI for an AI-generated lesson plan.
//
// The author types a single lesson objective and a list of checkpoint
// descriptions (each with a target lab type).  Pressing "Generate" calls
// the AI Gateway to flesh those into a full LessonPlan, which the author
// can then review, tweak, and save.  Saving POSTs/PUTs JSON to the Rails
// controller, which writes it to the filesystem.

import React, {useState} from 'react';

import {createLesson, updateLesson} from './api';
import {generateLessonPlan} from './lessonGenerator';
import {CheckpointInput, LabType, LessonPlan} from './types';

import styles from './aiLessons.module.scss';

const LAB_OPTIONS: {value: LabType; label: string}[] = [
  {value: 'weblab2', label: 'Web Lab 2'},
  {value: 'music', label: 'Music Lab'},
  {value: 'panels', label: 'Panels (instructional slides)'},
];

interface AuthorPageProps {
  mode: 'new' | 'edit';
  lessonId?: string;
  initialLesson?: LessonPlan;
}

interface DraftState {
  objective: string;
  inputs: CheckpointInput[];
}

const blankCheckpoint = (): CheckpointInput => ({
  description: '',
  labType: 'weblab2',
});

const deriveDraft = (lesson?: LessonPlan): DraftState => {
  if (lesson?.authorInputs) {
    return {
      objective: lesson.authorInputs.objective,
      inputs:
        lesson.authorInputs.checkpointInputs.length > 0
          ? lesson.authorInputs.checkpointInputs.map(c => ({...c}))
          : [blankCheckpoint()],
    };
  }
  return {objective: '', inputs: [blankCheckpoint()]};
};

const AuthorPage: React.FunctionComponent<AuthorPageProps> = ({
  mode,
  lessonId,
  initialLesson,
}) => {
  const [draft, setDraft] = useState<DraftState>(() =>
    deriveDraft(initialLesson)
  );
  const [plan, setPlan] = useState<LessonPlan | undefined>(initialLesson);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [savedId, setSavedId] = useState<string | undefined>(lessonId);

  const setCheckpoint = (i: number, patch: Partial<CheckpointInput>) =>
    setDraft(d => ({
      ...d,
      inputs: d.inputs.map((c, idx) => (idx === i ? {...c, ...patch} : c)),
    }));

  const addCheckpoint = () =>
    setDraft(d => ({...d, inputs: [...d.inputs, blankCheckpoint()]}));

  const removeCheckpoint = (i: number) =>
    setDraft(d => ({
      ...d,
      inputs:
        d.inputs.length > 1 ? d.inputs.filter((_, idx) => idx !== i) : d.inputs,
    }));

  const handleGenerate = async () => {
    setBusy(true);
    setError(undefined);
    try {
      const cleaned = draft.inputs.filter(c => c.description.trim().length > 0);
      if (!draft.objective.trim()) {
        throw new Error('Please write a lesson objective.');
      }
      if (cleaned.length === 0) {
        throw new Error('Please add at least one checkpoint description.');
      }
      const generated = await generateLessonPlan(draft.objective, cleaned);
      setPlan(generated);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const handleSave = async () => {
    if (!plan) return;
    setBusy(true);
    setError(undefined);
    try {
      if (savedId) {
        await updateLesson(savedId, plan);
      } else {
        const id = await createLesson(plan);
        setSavedId(id);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const planJson = plan ? JSON.stringify(plan, null, 2) : '';

  return (
    <div className={styles.authorPage}>
      <header className={styles.authorHeader}>
        <h1>{mode === 'edit' ? 'Edit AI Lesson' : 'Author a new AI Lesson'}</h1>
        <p className={styles.muted}>
          Describe the objective and the discrete checkpoints. The AI fills in
          the rest — instructions for the student, success criteria, and any
          instructional slides.
        </p>
      </header>

      <section className={styles.formSection}>
        <label className={styles.field}>
          <span>Lesson objective</span>
          <textarea
            value={draft.objective}
            onChange={e => setDraft(d => ({...d, objective: e.target.value}))}
            rows={3}
            placeholder="e.g. Students learn how a song's structure is built from repeating patterns by composing a short loop in Music Lab."
          />
        </label>

        <h2>Checkpoints</h2>
        <ol className={styles.checkpointList}>
          {draft.inputs.map((cp, i) => (
            <li key={i} className={styles.checkpointInput}>
              <div className={styles.checkpointRow}>
                <select
                  value={cp.labType}
                  onChange={e =>
                    setCheckpoint(i, {labType: e.target.value as LabType})
                  }
                  aria-label={`Checkpoint ${i + 1} lab type`}
                >
                  {LAB_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className={styles.linkButton}
                  onClick={() => removeCheckpoint(i)}
                  disabled={draft.inputs.length <= 1}
                  aria-label={`Remove checkpoint ${i + 1}`}
                >
                  Remove
                </button>
              </div>
              <textarea
                value={cp.description}
                onChange={e => setCheckpoint(i, {description: e.target.value})}
                rows={2}
                placeholder="What should the student demonstrate at this checkpoint?"
              />
            </li>
          ))}
        </ol>
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={addCheckpoint}
        >
          + Add checkpoint
        </button>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={handleGenerate}
            disabled={busy}
          >
            {busy ? 'Working…' : plan ? 'Regenerate' : 'Generate lesson plan'}
          </button>
        </div>
        {error && <div className={styles.error}>{error}</div>}
      </section>

      {plan && (
        <section className={styles.previewSection}>
          <h2>Generated plan</h2>
          <div className={styles.previewSummary}>
            <h3>{plan.title}</h3>
            <p>{plan.introduction}</p>
            <ol>
              {plan.checkpoints.map(c => (
                <li key={c.id}>
                  <strong>{c.title}</strong>{' '}
                  <span className={styles.muted}>({c.labType})</span>
                  <p>{c.instructions}</p>
                  <p className={styles.muted}>
                    <em>Success: {c.successCriteria}</em>
                  </p>
                  {c.panels && c.panels.length > 0 && (
                    <ul>
                      {c.panels.map((p, i) => (
                        <li key={i}>{p.caption}</li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ol>
          </div>

          <details>
            <summary>Raw JSON</summary>
            <pre className={styles.codeBlock}>{planJson}</pre>
          </details>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={handleSave}
              disabled={busy}
            >
              {busy ? 'Saving…' : savedId ? 'Save changes' : 'Save lesson'}
            </button>
            {savedId && (
              <a
                className={styles.secondaryButton}
                href={`/ai_lessons/${savedId}`}
              >
                Open student view →
              </a>
            )}
            <a className={styles.linkButton} href="/ai_lessons">
              Back to list
            </a>
          </div>
        </section>
      )}
    </div>
  );
};

export default AuthorPage;
