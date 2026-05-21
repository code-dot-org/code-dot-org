import React, {useCallback, useMemo, useState} from 'react';

import {LevelPropertiesMap} from '@cdo/apps/lab2/types';
import {createUuid} from '@cdo/apps/utils';

import {loadLessonLevelProperties} from '../curriculum-generator/api/levelProperties';
import OutlineBlock from '../curriculum-generator/components/OutlineBlock';
import {useAichatContext} from '../curriculum-generator/hooks/useAichatContext';
import {useBeforeUnloadWhile} from '../curriculum-generator/hooks/useBeforeUnloadWhile';
import {useReorderableList} from '../curriculum-generator/hooks/useReorderableList';

import {generateLessonOutline} from './ai/outline';
import {generatePanelsForLevel} from './ai/panels';
import {generateWeblab2Level} from './ai/weblab2';
import LevelCard from './components/LevelCard';
import ProgressDialog from './components/ProgressDialog';
import SummaryDialog from './components/SummaryDialog';
import {buildInitialState, newLevelSpec} from './helpers/buildInitialState';
import {
  formatPrecedingLevels,
  PriorEntry,
  PriorOutput,
  priorOutputFromLevelProperties,
} from './helpers/precedingLevels';
import {Placement, rebuildActivities} from './helpers/rebuildActivities';
import {formatTargetProject} from './helpers/targetProject';
import {
  createOrFindLevel,
  loadProjectSources,
  saveLessonActivities,
  updateLevelProperty,
  updatePanelsLevel,
  updateStartSources,
} from './levelApi';
import {
  ExistingLessonData,
  GenerationSummary,
  LabType,
  LevelSpec,
  ProgressUpdate,
  SUPPORTED_LAB_TYPES,
} from './types';

import moduleStyles from './lesson-generator.module.scss';
import sharedStyles from '../curriculum-generator/curriculum-generator.module.scss';

// Display labels for the per-card Lab dropdown. `satisfies` keeps the
// label literals narrow (handy if a caller ever wants them) while
// still requiring every LabType to have an entry — adding a lab to
// SUPPORTED_LAB_TYPES is a compile error here until the label lands.
const LAB_LABELS = {
  panels: 'Panels',
  weblab2: 'Web Lab 2',
} as const satisfies Record<LabType, string>;

const LAB_OPTIONS: {value: LabType; label: string}[] = SUPPORTED_LAB_TYPES.map(
  v => ({value: v, label: LAB_LABELS[v]})
);

interface LessonGeneratorProps {
  lesson: ExistingLessonData;
}

const LessonGenerator: React.FC<LessonGeneratorProps> = ({lesson}) => {
  // Lazy initializer: walk the lesson's existing levels to pre-populate the
  // form. This runs once per mount; the lesson prop is the snapshot the page
  // was rendered with and isn't expected to change.
  const initial = useMemo(() => buildInitialState(lesson), [lesson]);
  const [prefix, setPrefix] = useState<string>(initial.prefix);
  const {
    specs: levelSpecs,
    setSpecs: setLevelSpecs,
    updateSpec,
    removeSpec,
    moveSpec,
    addSpec,
  } = useReorderableList<LevelSpec>({
    initial: initial.specs,
    getKey: s => s.key,
    newSpec: newLevelSpec,
    // Editing the description re-derives the `generate` checkbox from
    // whether the description still matches what we last generated for.
    // The user can still override manually after.
    onAfterPatch: (_prev, next, patch) => {
      if (!('description' in patch)) return next;
      return {
        ...next,
        generate:
          next.lastGeneratedDescription === undefined ||
          next.description.trim() !== next.lastGeneratedDescription,
      };
    },
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<ProgressUpdate | null>(null);
  const [progressLog, setProgressLog] = useState<string[]>([]);
  const [summary, setSummary] = useState<GenerationSummary | null>(null);
  const [topLevelError, setTopLevelError] = useState<string | null>(null);
  const [outline, setOutline] = useState<string>(lesson.generateOutline || '');
  const [isOutlining, setIsOutlining] = useState(false);
  const [outlineError, setOutlineError] = useState<string | null>(null);
  // Optional Weblab2 channel id. When set, the lesson is generated as
  // progressing toward the app stored at that channel; the source files
  // (MultiFileSource) get fetched once and fed to the per-level AI
  // prompts as "final goal" context.
  const [projectChannelId, setProjectChannelId] = useState<string>(
    lesson.generateProjectChannelId || ''
  );

  useAichatContext({lessonId: lesson.id});
  useBeforeUnloadWhile(isGenerating);

  // Fetch + format the target project's source for the current channel
  // id. Returns the formatted "=== path ===\n..." string suitable for a
  // prompt, or undefined when the field is blank, the fetch fails, or
  // the channel doesn't carry a MultiFileSource. Both the outline AI
  // call and the per-level AI calls use this; we don't memoize because
  // a fetch per click is cheap and avoids stale data after the user
  // changes the channel id mid-session.
  const loadTargetProject = useCallback(
    async (onLog: (line: string) => void): Promise<string | undefined> => {
      const id = projectChannelId.trim();
      if (!id) return undefined;
      try {
        const {value} = await loadProjectSources(id);
        const formatted = formatTargetProject(value);
        if (formatted) {
          onLog(`Loaded target project source from channel ${id}.`);
          return formatted;
        }
        onLog(
          `Channel ${id} returned no MultiFileSource; continuing without target context.`
        );
        return undefined;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        onLog(
          `Warning: couldn't load target project ${id}: ${message}. Continuing.`
        );
        return undefined;
      }
    },
    [projectChannelId]
  );

  const handleGenerateOutline = useCallback(async () => {
    if (!outline.trim()) {
      setOutlineError('Type an outline first.');
      return;
    }
    setOutlineError(null);
    setIsOutlining(true);
    try {
      // Outline-phase fetch errors surface in outlineError too, since
      // the user is right there watching the outline button. Non-fatal
      // results just produce no target context for this run.
      const targetProject = await loadTargetProject(line => {
        if (line.startsWith('Warning:')) setOutlineError(line);
      });
      // Build the lesson-scope context once. Outer unit-scope fields
      // are piped down via lesson.unitName / lesson.unitOutline so the
      // outline AI can frame this lesson against the broader unit.
      const lessonCtx = {
        unitName: lesson.unitName,
        unitOutline: lesson.unitOutline,
        lessonName: lesson.name,
        lessonOutline: outline.trim(),
        targetProject,
      };
      const planned = await generateLessonOutline(lessonCtx);
      const newSpecs: LevelSpec[] = planned.map(level => ({
        key: createUuid(),
        id: level.id,
        labType: level.labType,
        description: level.description,
        generate: true,
      }));
      // Drop any blank brand-new rows (the default "Add level" placeholder
      // when nothing has been typed yet) before appending the AI plan, so
      // a fresh page replaces the empty starter card cleanly.
      setLevelSpecs(prev => {
        const kept = prev.filter(s => {
          if (s.existing || s.unsupportedType) return true;
          return !!(s.id.trim() || s.description.trim());
        });
        return [...kept, ...newSpecs];
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setOutlineError(message);
    } finally {
      setIsOutlining(false);
    }
  }, [
    outline,
    lesson.name,
    lesson.unitName,
    lesson.unitOutline,
    setLevelSpecs,
    loadTargetProject,
  ]);

  const validationError = useMemo(() => {
    if (!prefix.trim()) return 'Set a level name prefix before generating.';
    if (levelSpecs.length === 0) return 'Add at least one level.';
    for (const spec of levelSpecs) {
      // Read-only placeholders for unsupported lab types are exempt from
      // the id/description requirements — we never create or regenerate
      // them here.
      if (spec.unsupportedType) continue;
      if (!spec.id.trim()) return 'Every level needs an ID.';
      if (!spec.description.trim()) return 'Every level needs a description.';
    }
    const ids = new Set<string>();
    for (const spec of levelSpecs) {
      if (spec.unsupportedType) continue;
      const id = spec.id.trim();
      if (ids.has(id)) return `Duplicate level ID: ${id}`;
      ids.add(id);
    }
    return null;
  }, [prefix, levelSpecs]);

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
    const placements: Placement[] = [];
    // For each spec key that finished successfully, the trimmed description
    // we should record as `lastGeneratedDescription` afterward. We capture
    // it here rather than reading it back off state because state updates
    // are batched.
    const succeededDescriptions = new Map<string, string>();
    // Generated content for each spec we've already processed this run, in
    // order. Fed to subsequent levels as continuity context so panels/sources
    // can build on what came before.
    const priorEntries: PriorEntry[] = [];

    // Pull the live properties for every existing level in the lesson so
    // levels we're skipping this run still contribute their full content
    // (panel text, weblab2 files, instructions) to the continuity context
    // for later levels. Soft-fail: if this round-trip fails, we just lose
    // the extra context and fall back to descriptions.
    let levelPropertiesById: LevelPropertiesMap = {};
    try {
      levelPropertiesById = await loadLessonLevelProperties(lesson.id);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      appendLog(
        `Warning: couldn't load existing level content for context: ${message}`
      );
    }

    // Fetch the target project's source files (if a channel id was given)
    // once for this run and pass the formatted text to each per-level AI
    // call as "final goal" context. Soft-fail: if the fetch or format
    // doesn't yield anything usable, every level just runs without the
    // extra context — same as if the field were blank.
    const targetProject = await loadTargetProject(appendLog);

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

      // Unsupported placeholder: pass the existing script_level through to
      // its original section unchanged. Lets the user reorder around it.
      if (spec.unsupportedType) {
        if (spec.existing) {
          placements.push({
            scriptLevel: spec.existing.scriptLevel,
            activityIndex: spec.existing.activityIndex,
            sectionIndex: spec.existing.sectionIndex,
          });
        }
        priorEntries.push({
          position: i + 1,
          name: levelName,
          labType: spec.unsupportedType,
          description:
            '(unsupported lab type — content not visible to the generator)',
        });
        continue;
      }

      const shouldGenerate = spec.generate;
      const isExisting = !!spec.existing;

      // A brand-new card the user added but unchecked Generate on without
      // ever generating: nothing to attach. Drop it silently.
      if (!shouldGenerate && !isExisting) {
        continue;
      }

      // Snapshot the running context for this level. We deliberately do
      // not include image bytes — text + layouts is what carries continuity.
      const precedingLevelsText = formatPrecedingLevels(priorEntries);

      // Filled in below if we actually run AI for this level. Used to feed
      // the next iteration's continuity context.
      let generatedOutput: PriorOutput | undefined;

      try {
        setStage('creating');
        appendLog(
          shouldGenerate
            ? `Creating level "${levelName}"…`
            : `Skipping content generation for "${levelName}" (Generate is unchecked).`
        );
        const level = await createOrFindLevel(spec.labType, levelName);
        if (level.reused && shouldGenerate && !isExisting) {
          appendLog(
            `Level "${levelName}" already exists — reusing and overwriting its content.`
          );
        }

        if (shouldGenerate) {
          setStage('planning');
          appendLog(`Planning content for "${levelName}"…`);
          // Narrow the lesson-scope context to a LevelContext for this
          // specific level. Outer-scope fields propagate via the spread;
          // sibling-forward (precedingLevels) is fresh per call from the
          // running priorEntries list.
          const levelCtx = {
            unitName: lesson.unitName,
            unitOutline: lesson.unitOutline,
            lessonName: lesson.name,
            lessonOutline: outline.trim() || undefined,
            targetProject,
            levelName,
            levelDescription: spec.description.trim(),
            precedingLevels: precedingLevelsText || undefined,
          };
          if (spec.labType === 'panels') {
            const panels = await generatePanelsForLevel(levelCtx, {
              onPlanned: count =>
                appendLog(`Planned ${count} panel(s) for "${levelName}".`),
              onPanelStart: (idx, count) => {
                setStage('generating-image', `panel ${idx + 1} of ${count}`);
                appendLog(`Generating image for panel ${idx + 1} of ${count}…`);
              },
            });
            setStage('saving-properties');
            appendLog(`Saving panel data for "${levelName}"…`);
            await updatePanelsLevel(level.id, panels);
            generatedOutput = {panels};
          } else if (spec.labType === 'weblab2') {
            const result = await generateWeblab2Level(levelCtx);
            setStage('saving-properties');
            appendLog(`Saving start sources for "${levelName}"…`);
            await updateStartSources(level.id, result.startSources);
            appendLog(`Saving instructions for "${levelName}"…`);
            await updateLevelProperty(
              level.id,
              'long_instructions',
              result.longInstructions
            );
            generatedOutput = {weblab2: result};
          }
        }

        // Save the prompt onto the level itself so reopening /generate
        // later pre-populates it. We do this even on skip so an edited
        // prompt still persists. Failures here are non-fatal: the level
        // content is already saved.
        try {
          await updateLevelProperty(
            level.id,
            'generate_outline',
            spec.description.trim()
          );
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          appendLog(
            `Warning: couldn't save generate outline for "${levelName}": ${message}`
          );
        }

        // Place this spec back into the lesson tree. Existing levels keep
        // their original (activity, section) so we honour the curriculum
        // structure; new levels are appended to the last section.
        if (spec.existing) {
          placements.push({
            scriptLevel: spec.existing.scriptLevel,
            activityIndex: spec.existing.activityIndex,
            sectionIndex: spec.existing.sectionIndex,
          });
        } else {
          placements.push({
            scriptLevel: {
              activitySectionPosition: 0, // recomputed during rebuild
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
            },
            activityIndex: -1,
            sectionIndex: -1,
          });
        }
        created.push({
          name: level.name,
          editUrl: `/levels/${level.id}/edit`,
        });
        succeededDescriptions.set(spec.key, spec.description.trim());
        // For skipped existing levels (no fresh generatedOutput), fall back
        // to the server-fetched properties so subsequent levels still see
        // the actual content rather than just a description.
        let outputForContext = generatedOutput;
        if (!outputForContext) {
          outputForContext = priorOutputFromLevelProperties(
            levelPropertiesById[String(level.id)],
            spec.labType
          );
        }
        priorEntries.push({
          position: i + 1,
          name: level.name,
          labType: spec.labType,
          description: spec.description.trim(),
          output: outputForContext,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        appendLog(`Failed "${levelName}": ${message}`);
        failed.push({name: levelName, error: message});
        // Even on failure, keep an existing level in the lesson — the
        // failure was about regenerating its content, not about removing
        // it from the curriculum structure.
        if (spec.existing) {
          placements.push({
            scriptLevel: spec.existing.scriptLevel,
            activityIndex: spec.existing.activityIndex,
            sectionIndex: spec.existing.sectionIndex,
          });
        }
      }
    }

    if (placements.length > 0) {
      try {
        setProgress({
          levelIndex: levelSpecs.length - 1,
          totalLevels: levelSpecs.length,
          levelName: '',
          phase: 'attaching',
        });
        appendLog(`Saving lesson with ${placements.length} level(s)…`);
        const newActivities = rebuildActivities(
          lesson.activities || [],
          placements
        );
        // Persist the outline + target-project channel id so reopening
        // /generate restores them. Sending '' for either clears the
        // previously-saved value.
        await saveLessonActivities(
          lesson.id,
          newActivities,
          outline.trim(),
          projectChannelId.trim()
        );
        appendLog('Lesson updated.');
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        appendLog(`Failed to save lesson activities: ${message}`);
        // Mark the otherwise-created levels as failed so the user knows the
        // levels exist but aren't part of the lesson yet.
        for (const c of created) {
          failed.push({
            name: c.name,
            error: 'Created, but the lesson could not be saved.',
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
  }, [
    validationError,
    lesson,
    levelSpecs,
    fullName,
    appendLog,
    outline,
    setLevelSpecs,
    projectChannelId,
    loadTargetProject,
  ]);

  return (
    <div className={sharedStyles.container}>
      <h1 className={sharedStyles.heading}>
        Generate levels for "{lesson.name}"
      </h1>
      <p className={sharedStyles.subheading}>
        Plan a sequence of levels and let AI fill them with starter content.
        Each level is created, populated, and added to the end of this lesson.
      </p>

      <OutlineBlock
        heading="Optional: generate the levels below from an outline"
        helpText="Describe the learning experience you want this lesson to take a student through. The AI will turn that into a sequence of Panels and Web Lab 2 levels with IDs and per-level descriptions. You can edit or remove any of them before generating their content below."
        placeholder="e.g. Introduce the student to CSS selectors, then have them style a simple form, then reflect on what they learned."
        buttonLabel="Generate outline"
        value={outline}
        onChange={setOutline}
        onGenerate={handleGenerateOutline}
        isOutlining={isOutlining}
        disabled={isGenerating}
        error={outlineError}
        extra={
          <div className={moduleStyles.outlineProjectRow}>
            <label htmlFor="project-channel-id">
              Optional: target Web Lab 2 project (channel id)
            </label>
            <p className={sharedStyles.outlineHelp}>
              When set, the lesson is generated as a progression toward the app
              stored at this channel. The student never sees the target code;
              the AI uses it as the final goal so each level moves closer to it.
            </p>
            <input
              id="project-channel-id"
              className={moduleStyles.outlineProjectInput}
              value={projectChannelId}
              onChange={e => setProjectChannelId(e.target.value)}
              placeholder="e.g. abc123 — leave blank to skip"
              disabled={isOutlining || isGenerating}
            />
          </div>
        }
      />

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

      <div className={sharedStyles.cardList}>
        {levelSpecs.map((spec, index) => (
          <LevelCard
            key={spec.key}
            spec={spec}
            index={index}
            total={levelSpecs.length}
            previewName={fullName(spec.id || '<id>')}
            disabled={isGenerating}
            labOptions={LAB_OPTIONS}
            onChange={updateSpec}
            onRemove={removeSpec}
            onMove={moveSpec}
          />
        ))}
      </div>

      <div className={sharedStyles.addButtonRow}>
        <button
          type="button"
          className={sharedStyles.secondaryButton}
          onClick={addSpec}
          disabled={isGenerating}
        >
          + Add level
        </button>
      </div>

      {topLevelError && (
        <p className={sharedStyles.summaryBad} role="alert">
          {topLevelError}
        </p>
      )}

      <footer className={sharedStyles.footer}>
        <a href={lesson.editLessonUrl} className={sharedStyles.secondaryButton}>
          Back to lesson edit
        </a>
        <button
          type="button"
          className={sharedStyles.primaryButton}
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

export default LessonGenerator;
