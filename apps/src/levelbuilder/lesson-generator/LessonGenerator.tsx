import React, {useCallback, useEffect, useMemo, useState} from 'react';

import AichatContextManager from '@cdo/apps/aichat/aichatContextManager';
import {createUuid} from '@cdo/apps/utils';
import {AiChatClientTypes} from '@cdo/generated-scripts/sharedConstants';

import {generatePanelsForLevel, generateWeblab2Level} from './aiGeneration';
import {
  attachLevelsToLesson,
  createOrFindLevel,
  updateGeneratePrompt,
  updateLongInstructions,
  updatePanelsLevel,
  updateStartSources,
} from './levelApi';
import {
  ExistingLessonData,
  GenerationSummary,
  LabType,
  LevelSpec,
  ProgressUpdate,
  SerializedLevel,
  SerializedScriptLevel,
} from './types';

import moduleStyles from './lesson-generator.module.scss';

const LAB_OPTIONS: {value: LabType; label: string}[] = [
  {value: 'Panels', label: 'Panels'},
  {value: 'Weblab2', label: 'Web Lab 2'},
];

const newLevelSpec = (): LevelSpec => ({
  key: createUuid(),
  id: '',
  labType: 'Panels',
  description: '',
  generate: true,
});

// True if any script_level inside the lesson's activities references a level
// with this id. Used to avoid double-attaching when we reuse a pre-existing
// level by name.
function isLevelAttached(lesson: ExistingLessonData, levelId: number): boolean {
  const idStr = String(levelId);
  for (const activity of lesson.activities || []) {
    for (const section of activity.activitySections || []) {
      for (const sl of section.scriptLevels || []) {
        for (const l of sl.levels || []) {
          if (String(l.id) === idStr) return true;
        }
      }
    }
  }
  return false;
}

const SUPPORTED_TYPES: ReadonlySet<string> = new Set(['Panels', 'Weblab2']);

// Walk the lesson's activities in order and yield each level whose lab type
// the generator supports. Order matches the lesson's display order.
function listSupportedLevels(lesson: ExistingLessonData): SerializedLevel[] {
  const out: SerializedLevel[] = [];
  for (const activity of lesson.activities || []) {
    for (const section of activity.activitySections || []) {
      for (const sl of section.scriptLevels || []) {
        for (const level of sl.levels || []) {
          if (level.type && SUPPORTED_TYPES.has(level.type)) {
            out.push(level);
          }
        }
      }
    }
  }
  return out;
}

// Find the longest hyphen-bounded prefix shared by all level names. Used to
// split each existing level name into a prefix (shown in the prefix box at
// the top) and a short id (shown in the per-level row), so the user sees
// the same prefix/id breakdown they'd type by hand.
function inferPrefix(names: string[]): string {
  if (names.length === 0) return '';
  if (names.length === 1) {
    const idx = names[0].lastIndexOf('-');
    return idx > 0 ? names[0].slice(0, idx) : '';
  }
  let prefix = names[0];
  for (let i = 1; i < names.length; i++) {
    while (!names[i].startsWith(prefix)) {
      prefix = prefix.slice(0, -1);
      if (!prefix) return '';
    }
  }
  while (prefix.length > 0 && !prefix.endsWith('-')) {
    prefix = prefix.slice(0, -1);
  }
  return prefix.endsWith('-') ? prefix.slice(0, -1) : prefix;
}

interface InitialState {
  prefix: string;
  specs: LevelSpec[];
}

function buildInitialState(lesson: ExistingLessonData): InitialState {
  const supported = listSupportedLevels(lesson);
  if (supported.length === 0) {
    return {prefix: '', specs: [newLevelSpec()]};
  }
  const prefix = inferPrefix(supported.map(l => l.name));
  const stripPrefix = (name: string) =>
    prefix && name.startsWith(prefix + '-')
      ? name.slice(prefix.length + 1)
      : name;
  const specs = supported.map(level => {
    const description = level.generatePrompt || '';
    return {
      key: createUuid(),
      id: stripPrefix(level.name),
      labType: level.type as LabType,
      description,
      // Loaded levels start with the saved prompt as their last-generated
      // description, which keeps the Generate checkbox unchecked unless the
      // user edits the description (or has no saved prompt at all).
      lastGeneratedDescription: level.generatePrompt
        ? level.generatePrompt
        : undefined,
      generate: !level.generatePrompt,
    };
  });
  return {prefix, specs};
}

interface LessonGeneratorProps {
  lesson: ExistingLessonData;
}

const LessonGenerator: React.FC<LessonGeneratorProps> = ({lesson}) => {
  // Lazy initializer: walk the lesson's existing levels to pre-populate the
  // form. This runs once per mount; the lesson prop is the snapshot the page
  // was rendered with and isn't expected to change.
  const initial = useMemo(() => buildInitialState(lesson), [lesson]);
  const [prefix, setPrefix] = useState<string>(initial.prefix);
  const [levelSpecs, setLevelSpecs] = useState<LevelSpec[]>(initial.specs);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<ProgressUpdate | null>(null);
  const [progressLog, setProgressLog] = useState<string[]>([]);
  const [summary, setSummary] = useState<GenerationSummary | null>(null);
  const [topLevelError, setTopLevelError] = useState<string | null>(null);

  // The AI gateway expects an AichatContext on every access-token request.
  // We're not actually inside an aichat lab here, but setting the context
  // up front lets the levelbuilder page reuse the same generateText path
  // the chat lab uses without each call site having to thread its own
  // context through. Levelbuilders pass the access check unconditionally.
  useEffect(() => {
    AichatContextManager.setContext({
      clientType: AiChatClientTypes.AI_CHAT_LAB,
      currentLevelId: null,
      scriptId: null,
      channelId: undefined,
      lessonId: lesson.id,
    });
  }, [lesson.id]);

  // Block accidental navigation while generation is in progress. The user
  // explicitly asked for a confirmation prompt; the browser default
  // beforeunload dialog is the only portable way to get one.
  useEffect(() => {
    if (!isGenerating) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isGenerating]);

  const updateSpec = useCallback((key: string, patch: Partial<LevelSpec>) => {
    setLevelSpecs(specs =>
      specs.map(s => {
        if (s.key !== key) return s;
        const next = {...s, ...patch};
        // If the description was edited, re-derive whether to generate based
        // on whether it now matches the description recorded at the last
        // successful generation. The user can still manually toggle the
        // checkbox afterward.
        if ('description' in patch) {
          next.generate =
            next.lastGeneratedDescription === undefined ||
            next.description.trim() !== next.lastGeneratedDescription;
        }
        return next;
      })
    );
  }, []);

  const removeSpec = useCallback((key: string) => {
    setLevelSpecs(specs => specs.filter(s => s.key !== key));
  }, []);

  const moveSpec = useCallback((key: string, direction: 'up' | 'down') => {
    setLevelSpecs(specs => {
      const index = specs.findIndex(s => s.key === key);
      if (index === -1) return specs;
      const target = direction === 'up' ? index - 1 : index + 1;
      if (target < 0 || target >= specs.length) return specs;
      const next = [...specs];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }, []);

  const addSpec = useCallback(() => {
    setLevelSpecs(specs => [...specs, newLevelSpec()]);
  }, []);

  const validationError = useMemo(() => {
    if (levelSpecs.length === 0) return 'Add at least one level.';
    for (const spec of levelSpecs) {
      if (!spec.id.trim()) return 'Every level needs an ID.';
      if (!spec.description.trim()) return 'Every level needs a description.';
    }
    const ids = new Set<string>();
    for (const spec of levelSpecs) {
      const id = spec.id.trim();
      if (ids.has(id)) return `Duplicate level ID: ${id}`;
      ids.add(id);
    }
    return null;
  }, [levelSpecs]);

  const fullName = useCallback(
    (id: string) => (prefix ? `${prefix}-${id}` : id),
    [prefix]
  );

  const appendLog = useCallback((line: string) => {
    setProgressLog(log => [...log, line]);
  }, []);

  const handleGenerate = useCallback(async () => {
    if (validationError) {
      setTopLevelError(validationError);
      return;
    }
    setTopLevelError(null);
    setSummary(null);
    setProgressLog([]);
    setIsGenerating(true);

    const created: GenerationSummary['created'] = [];
    const failed: GenerationSummary['failed'] = [];
    const newScriptLevels: SerializedScriptLevel[] = [];
    // For each spec key that finished successfully, the trimmed description
    // we should record as `lastGeneratedDescription` afterward. We capture it
    // here rather than reading it back off state because state updates are
    // batched.
    const succeededDescriptions = new Map<string, string>();

    for (let i = 0; i < levelSpecs.length; i++) {
      const spec = levelSpecs[i];
      const levelName = fullName(spec.id.trim());
      const setStage = (phase: ProgressUpdate['phase'], detail?: string) => {
        setProgress({
          levelIndex: i,
          totalLevels: levelSpecs.length,
          levelName,
          phase,
          detail,
        });
      };

      const shouldGenerate = spec.generate;

      try {
        setStage('creating');
        appendLog(
          shouldGenerate
            ? `Creating level "${levelName}"…`
            : `Skipping content generation for "${levelName}" (Generate is unchecked).`
        );
        const level = await createOrFindLevel(spec.labType, levelName);
        if (level.reused && shouldGenerate) {
          appendLog(
            `Level "${levelName}" already exists — reusing and overwriting its content.`
          );
        }

        if (shouldGenerate) {
          setStage('planning');
          appendLog(`Planning content for "${levelName}"…`);
          if (spec.labType === 'Panels') {
            const panels = await generatePanelsForLevel(
              levelName,
              spec.description.trim(),
              {
                onPlanned: count =>
                  appendLog(`Planned ${count} panel(s) for "${levelName}".`),
                onPanelStart: (idx, count) => {
                  setStage('generating-image', `panel ${idx + 1} of ${count}`);
                  appendLog(
                    `Generating image for panel ${idx + 1} of ${count}…`
                  );
                },
              }
            );
            setStage('saving-properties');
            appendLog(`Saving panel data for "${levelName}"…`);
            await updatePanelsLevel(level.id, panels);
          } else if (spec.labType === 'Weblab2') {
            const {startSources, longInstructions} = await generateWeblab2Level(
              spec.description.trim()
            );
            setStage('saving-properties');
            appendLog(`Saving start sources for "${levelName}"…`);
            await updateStartSources(level.id, startSources);
            appendLog(`Saving instructions for "${levelName}"…`);
            await updateLongInstructions(level.id, longInstructions);
          }
        }

        // Save the prompt onto the level itself so reopening /generate later
        // pre-populates it. We do this even on skip so an edited prompt
        // still persists. Failures here are non-fatal: the level content
        // is already saved.
        try {
          await updateGeneratePrompt(level.id, spec.description.trim());
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          appendLog(
            `Warning: couldn't save generate prompt for "${levelName}": ${message}`
          );
        }

        const alreadyInLesson =
          level.reused && isLevelAttached(lesson, level.id);
        if (!alreadyInLesson) {
          newScriptLevels.push({
            activitySectionPosition: 0, // overwritten on the server
            assessment: false,
            bonus: false,
            challenge: false,
            variants: [],
            levels: [
              {
                id: String(level.id),
                name: level.name,
                url: `/levels/${level.id}/edit`,
              },
            ],
          });
        } else {
          appendLog(
            `Level "${levelName}" is already attached to this lesson; leaving its position unchanged.`
          );
        }
        created.push({
          name: level.name,
          editUrl: `/levels/${level.id}/edit`,
        });
        succeededDescriptions.set(spec.key, spec.description.trim());
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        appendLog(`Failed "${levelName}": ${message}`);
        failed.push({name: levelName, error: message});
      }
    }

    if (newScriptLevels.length > 0) {
      try {
        setProgress({
          levelIndex: levelSpecs.length - 1,
          totalLevels: levelSpecs.length,
          levelName: '',
          phase: 'attaching',
        });
        appendLog(
          `Attaching ${newScriptLevels.length} level(s) to the lesson…`
        );
        await attachLevelsToLesson(
          lesson.id,
          lesson.activities || [],
          newScriptLevels
        );
        appendLog('Lesson updated.');
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        appendLog(`Failed to attach levels to lesson: ${message}`);
        // Mark the otherwise-created levels as failed so the user knows the
        // levels exist but aren't part of the lesson yet.
        for (const c of created) {
          failed.push({
            name: c.name,
            error: 'Created, but could not be attached to the lesson.',
          });
        }
      }
    }

    // Record the description we used for each successful spec, and clear
    // its Generate flag. Subsequent runs default to off for these unless
    // the user edits the description (which auto-rechecks via updateSpec)
    // or clicks the checkbox manually.
    if (succeededDescriptions.size > 0) {
      setLevelSpecs(specs =>
        specs.map(s => {
          const desc = succeededDescriptions.get(s.key);
          if (desc === undefined) return s;
          return {...s, lastGeneratedDescription: desc, generate: false};
        })
      );
    }

    setSummary({created, failed});
    setIsGenerating(false);
    setProgress(null);
  }, [validationError, lesson, levelSpecs, fullName, appendLog]);

  return (
    <div className={moduleStyles.container}>
      <h1 className={moduleStyles.heading}>
        Generate levels for "{lesson.name}"
      </h1>
      <p className={moduleStyles.subheading}>
        Plan a sequence of levels and let AI fill them with starter content.
        Each level is created, populated, and added to the end of this lesson.
      </p>

      <div className={moduleStyles.fieldRow}>
        <label htmlFor="level-prefix">Level name prefix</label>
        <input
          id="level-prefix"
          className={moduleStyles.prefixInput}
          value={prefix}
          onChange={e => setPrefix(e.target.value)}
          placeholder="e.g. csd-unit3-lesson5"
          disabled={isGenerating}
        />
      </div>

      <div className={moduleStyles.levelList}>
        {levelSpecs.map((spec, index) => (
          <LevelCard
            key={spec.key}
            spec={spec}
            index={index}
            total={levelSpecs.length}
            previewName={fullName(spec.id || '<id>')}
            disabled={isGenerating}
            onChange={updateSpec}
            onRemove={removeSpec}
            onMove={moveSpec}
          />
        ))}
      </div>

      <div className={moduleStyles.addButtonRow}>
        <button
          type="button"
          className={moduleStyles.secondaryButton}
          onClick={addSpec}
          disabled={isGenerating}
        >
          + Add level
        </button>
      </div>

      {topLevelError && (
        <p className={moduleStyles.summaryBad} role="alert">
          {topLevelError}
        </p>
      )}

      <footer className={moduleStyles.footer}>
        <a href={lesson.editLessonUrl} className={moduleStyles.secondaryButton}>
          Back to lesson edit
        </a>
        <button
          type="button"
          className={moduleStyles.primaryButton}
          onClick={handleGenerate}
          disabled={isGenerating || !!validationError}
          title={validationError || ''}
        >
          {isGenerating ? 'Generating…' : 'Generate Lesson with AI'}
        </button>
      </footer>

      {(isGenerating || progress) && (
        <ProgressDialog
          progress={progress}
          log={progressLog}
          isGenerating={isGenerating}
        />
      )}

      {summary && !isGenerating && (
        <SummaryDialog
          summary={summary}
          editLessonUrl={lesson.editLessonUrl}
          onClose={() => setSummary(null)}
        />
      )}
    </div>
  );
};

interface LevelCardProps {
  spec: LevelSpec;
  index: number;
  total: number;
  previewName: string;
  disabled: boolean;
  onChange: (key: string, patch: Partial<LevelSpec>) => void;
  onRemove: (key: string) => void;
  onMove: (key: string, direction: 'up' | 'down') => void;
}

const LevelCard: React.FC<LevelCardProps> = ({
  spec,
  index,
  total,
  previewName,
  disabled,
  onChange,
  onRemove,
  onMove,
}) => {
  return (
    <div className={moduleStyles.levelCard}>
      <div className={moduleStyles.levelCardHeader}>
        <h3>
          Level {index + 1} — <code>{previewName}</code>
        </h3>
        <button
          type="button"
          className={moduleStyles.iconButton}
          onClick={() => onMove(spec.key, 'up')}
          disabled={disabled || index === 0}
          aria-label="Move up"
          title="Move up"
        >
          ↑
        </button>
        <button
          type="button"
          className={moduleStyles.iconButton}
          onClick={() => onMove(spec.key, 'down')}
          disabled={disabled || index === total - 1}
          aria-label="Move down"
          title="Move down"
        >
          ↓
        </button>
        <button
          type="button"
          className={moduleStyles.deleteButton}
          onClick={() => onRemove(spec.key)}
          disabled={disabled}
          aria-label="Remove level"
          title="Remove level"
        >
          🗑
        </button>
      </div>
      <div className={moduleStyles.cardBody}>
        <div className={moduleStyles.cardSidebar}>
          <div className={moduleStyles.cardField}>
            <label htmlFor={`id-${spec.key}`}>ID</label>
            <input
              id={`id-${spec.key}`}
              value={spec.id}
              onChange={e => onChange(spec.key, {id: e.target.value})}
              placeholder="e.g. intro-1"
              disabled={disabled}
            />
          </div>
          <div className={moduleStyles.cardField}>
            <label htmlFor={`lab-${spec.key}`}>Lab</label>
            <select
              id={`lab-${spec.key}`}
              value={spec.labType}
              onChange={e =>
                onChange(spec.key, {labType: e.target.value as LabType})
              }
              disabled={disabled}
            >
              {LAB_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <label className={moduleStyles.skipLabel}>
            <input
              type="checkbox"
              checked={spec.generate}
              onChange={e => onChange(spec.key, {generate: e.target.checked})}
              disabled={disabled}
            />
            Generate
          </label>
        </div>
        <div className={moduleStyles.cardMain}>
          <label htmlFor={`desc-${spec.key}`}>Description</label>
          <textarea
            id={`desc-${spec.key}`}
            value={spec.description}
            onChange={e => onChange(spec.key, {description: e.target.value})}
            placeholder="What this level should teach or do."
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
};

const phaseLabel = (phase: ProgressUpdate['phase']): string => {
  switch (phase) {
    case 'creating':
      return 'Creating level';
    case 'planning':
      return 'Planning content';
    case 'generating-image':
      return 'Generating image';
    case 'saving-properties':
      return 'Saving content';
    case 'attaching':
      return 'Attaching levels to lesson';
  }
};

interface ProgressDialogProps {
  progress: ProgressUpdate | null;
  log: string[];
  isGenerating: boolean;
}

const ProgressDialog: React.FC<ProgressDialogProps> = ({
  progress,
  log,
  isGenerating,
}) => {
  const fraction =
    progress && progress.totalLevels > 0
      ? (progress.levelIndex + (progress.phase === 'attaching' ? 1 : 0.5)) /
        progress.totalLevels
      : 0;
  return (
    <div className={moduleStyles.dialogBackdrop} role="dialog" aria-modal>
      <div className={moduleStyles.dialog}>
        <h2>{isGenerating ? 'Generating…' : 'Done'}</h2>
        {progress && (
          <>
            <div>
              Level {progress.levelIndex + 1} of {progress.totalLevels}
              {progress.levelName && (
                <>
                  {' '}
                  — <code>{progress.levelName}</code>
                </>
              )}
            </div>
            <div>
              <strong>{phaseLabel(progress.phase)}</strong>
              {progress.detail ? `: ${progress.detail}` : ''}
            </div>
          </>
        )}
        <div className={moduleStyles.progressBarOuter}>
          <div
            className={moduleStyles.progressBarInner}
            style={{width: `${Math.min(100, fraction * 100)}%`}}
          />
        </div>
        <div>
          {log.slice(-10).map((line, i) => (
            <div className={moduleStyles.progressLine} key={i}>
              {line}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

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
          <p>
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

export default LessonGenerator;
