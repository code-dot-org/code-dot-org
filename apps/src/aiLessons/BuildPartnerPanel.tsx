// Student-facing controls for the AI build partner, shown in the tutor
// sidebar on lab steps that enable it (`aiPrompting: 'presets' | 'free'`).
//
// A preset click or a free-form prompt asks the build partner for a new
// complete set of project files.  The result is persisted through our
// sources API and the lab remounts on it (onSourcesApplied bumps the
// epoch in the EmbeddedLab key) — no lab2 AI-version redux involved.
// Undo restores the stashed pre-build source the same way.  Every prompt
// the student writes is recorded as an AnswerRecord so later phases can
// assess prompt quality.

import React, {useState} from 'react';

import {MultiFileSource} from '@cdo/apps/lab2/types';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {saveSources, sourceScopeFor} from './aiLessonsProjectManager';
import {generateProjectFiles} from './buildPartner';
import {AnswerRecord, StudentInputs} from './studentInputs';
import {LabStep, LessonPlan} from './types';

import styles from './aiLessons.module.scss';

interface BuildPartnerPanelProps {
  lesson: LessonPlan;
  step: LabStep;
  inputs: StudentInputs;
  // Records the student's prompt into the inputs store.
  onRecordPrompt: (record: AnswerRecord) => void;
  // The new/restored source is saved server-side; remount the lab on it.
  onSourcesApplied: () => void;
}

interface LastBuild {
  summary: string;
  changedFiles: string[];
  // The source as it was before the build, for Undo.  Undefined when
  // there was nothing yet (undo then isn't offered).
  undoSource?: MultiFileSource;
}

const BuildPartnerPanel: React.FunctionComponent<BuildPartnerPanelProps> = ({
  lesson,
  step,
  inputs,
  onRecordPrompt,
  onSourcesApplied,
}) => {
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [lastBuild, setLastBuild] = useState<LastBuild | undefined>();

  // The live weblab2 source (codebridge keeps this current per
  // keystroke); it's both the build context and the undo stash.
  const currentSource = useAppSelector(
    state => state.lab2Project.projectSources?.source
  ) as MultiFileSource | undefined;

  if (!lesson.id || step.labType !== 'weblab2') return null;
  const lessonId = lesson.id;

  const build = async (promptText: string) => {
    const trimmed = promptText.trim();
    if (!trimmed || busy) return;
    setBusy(true);
    setError(undefined);
    const stash = currentSource;
    try {
      const result = await generateProjectFiles({
        lesson,
        step,
        prompt: trimmed,
        inputs,
        currentSource: stash,
      });
      await saveSources(lessonId, sourceScopeFor(step), result.sources);
      onRecordPrompt({
        questionId: `ai-prompt-${step.id}-${Date.now()}`,
        stepId: step.id,
        prompt: `AI build prompt (${step.title})`,
        answer: trimmed,
        outcome: 'accepted',
        attempts: 1,
        at: new Date().toISOString(),
      });
      setLastBuild({
        summary: result.summary,
        changedFiles: result.changedFiles,
        undoSource: stash,
      });
      setDraft('');
      onSourcesApplied();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const undo = async () => {
    if (!lastBuild?.undoSource || busy) return;
    setBusy(true);
    setError(undefined);
    try {
      await saveSources(lessonId, sourceScopeFor(step), {
        source: lastBuild.undoSource,
      });
      setLastBuild(undefined);
      onSourcesApplied();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.buildPartner}>
      <div className={styles.buildPartnerTitle}>✨ Build with AI</div>

      {lastBuild ? (
        <div className={styles.buildPartnerResult}>
          <div>{lastBuild.summary || 'Done!'}</div>
          {lastBuild.changedFiles.length > 0 && (
            <div className={styles.buildPartnerFiles}>
              Updated: {lastBuild.changedFiles.join(', ')}
            </div>
          )}
          <div className={styles.buildPartnerActions}>
            <button
              type="button"
              onClick={() => setLastBuild(undefined)}
              disabled={busy}
            >
              Keep it
            </button>
            {lastBuild.undoSource && (
              <button type="button" onClick={undo} disabled={busy}>
                Undo
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {(step.presetPrompts || []).map((preset, i) => (
            <button
              key={i}
              type="button"
              className={styles.buildPartnerPreset}
              onClick={() => build(preset)}
              disabled={busy}
            >
              {preset}
            </button>
          ))}
          {step.aiPrompting === 'free' && (
            <div className={styles.buildPartnerComposer}>
              <textarea
                value={draft}
                rows={2}
                placeholder="Tell the AI what to build or change…"
                onChange={e => setDraft(e.target.value)}
                disabled={busy}
              />
              <button
                type="button"
                onClick={() => build(draft)}
                disabled={busy || draft.trim() === ''}
              >
                Build
              </button>
            </div>
          )}
        </>
      )}

      {busy && <div className={styles.muted}>Building…</div>}
      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
};

export default BuildPartnerPanel;
