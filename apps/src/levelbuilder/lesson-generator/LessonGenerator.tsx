import React, {useCallback, useEffect, useMemo, useState} from 'react';

import AichatContextManager from '@cdo/apps/aichat/aichatContextManager';
import {
  LevelProperties,
  LevelPropertiesMap,
  MultiFileSource,
} from '@cdo/apps/lab2/types';
import {Panel, PanelsLevelProperties} from '@cdo/apps/panels/types';
import {createUuid} from '@cdo/apps/utils';
import {AiChatClientTypes} from '@cdo/generated-scripts/sharedConstants';

import {
  generateLessonOutline,
  generatePanelsForLevel,
  generateWeblab2Level,
  Weblab2Generation,
} from './aiGeneration';
import {
  createOrFindLevel,
  loadLessonLevelProperties,
  saveLessonActivities,
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
  SerializedActivity,
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

const SUPPORTED_TYPES: ReadonlySet<string> = new Set(['Panels', 'Weblab2']);

interface Placement {
  scriptLevel: SerializedScriptLevel;
  // -1 means "place at the tail of the last activity section". Used for
  // brand-new levels that don't already live anywhere in the lesson.
  activityIndex: number;
  sectionIndex: number;
}

function blankActivity(position: number): SerializedActivity {
  return {
    position,
    name: '',
    duration: 0,
    activitySections: [blankSection(1)],
  };
}

function blankSection(position: number) {
  return {
    position,
    name: '',
    description: '',
    duration: 0,
    remarks: '',
    progressionName: '',
    tips: [],
    scriptLevels: [],
  };
}

// Rebuild the lesson's activities array from a fresh list of placements.
// We clone the original tree, empty every section's scriptLevels, then
// drop each placement back into its target section (or the last section
// for placements with index -1) in the order the caller provides. The
// server's update_activities pipeline diffs against the existing rows by
// id, so existing script_levels keep their ids and just get repositioned.
// Per-spec content captured during a single Generate run, so each level we
// process can be told what came before it. Existing levels that we skipped
// don't have content here (we'd need an extra round-trip to fetch it from
// the server); those just contribute their description to the context.
interface PriorOutput {
  panels?: Panel[];
  weblab2?: Weblab2Generation;
}

interface PriorEntry {
  position: number;
  name: string;
  labType: string;
  description: string;
  output?: PriorOutput;
}

// Adapt the camelCased level properties returned by /lessons/:id/level_properties
// to the same PriorOutput shape we use for content we just generated. This
// lets the continuity context for skipped levels match what we'd send for
// regenerated ones, so the AI sees a uniform record.
function priorOutputFromLevelProperties(
  props: LevelProperties | undefined,
  labType: LabType
): PriorOutput | undefined {
  if (!props) return undefined;
  if (labType === 'Panels') {
    const panels = (props as PanelsLevelProperties).panels;
    if (Array.isArray(panels) && panels.length > 0) {
      return {panels};
    }
    return undefined;
  }
  if (labType === 'Weblab2') {
    // Weblab2 stores starter sources as MultiFileSource (per the
    // ProjectSources | MultiFileSource union on LevelProperties).
    const startSources = props.startSources as MultiFileSource | undefined;
    const longInstructions = props.longInstructions || '';
    const files = startSources?.files
      ? Object.values(startSources.files).map(f => ({
          name: f.name,
          contents: f.contents,
        }))
      : [];
    if (files.length === 0 && !longInstructions) return undefined;
    return {
      weblab2: {
        startSources: startSources || {folders: {}, files: {}},
        longInstructions,
        files,
      },
    };
  }
  return undefined;
}

// Render the running preceding-levels context as a plain-text block. Image
// URLs and binary data are deliberately left out — only the text content
// matters for continuity, and feeding image bytes to a text model is
// pointless waste. Caller responsibility to skip emitting a heading when
// this returns the empty string.
function formatPrecedingLevels(entries: PriorEntry[]): string {
  if (entries.length === 0) return '';
  const blocks = entries.map(e => {
    const lines: string[] = [];
    lines.push(`Level ${e.position}: ${e.name} (${e.labType})`);
    if (e.description) {
      lines.push(`  Description: ${e.description}`);
    }
    if (e.output?.panels?.length) {
      lines.push('  Panels:');
      e.output.panels.forEach((p, i) => {
        lines.push(`    ${i + 1}. [${p.layout || 'default'}] ${p.text}`);
      });
    }
    if (e.output?.weblab2) {
      lines.push('  Files:');
      for (const f of e.output.weblab2.files) {
        lines.push(`    ${f.name}:`);
        for (const line of f.contents.split('\n')) {
          lines.push(`      ${line}`);
        }
      }
      lines.push('  Instructions:');
      for (const line of e.output.weblab2.longInstructions.split('\n')) {
        lines.push(`    ${line}`);
      }
    }
    return lines.join('\n');
  });
  return blocks.join('\n\n');
}

function rebuildActivities(
  originalActivities: SerializedActivity[],
  placements: Placement[]
): SerializedActivity[] {
  const cloned: SerializedActivity[] = JSON.parse(
    JSON.stringify(originalActivities)
  );

  for (const a of cloned) {
    a.activitySections = a.activitySections || [];
    for (const s of a.activitySections) {
      s.scriptLevels = [];
    }
  }
  if (cloned.length === 0) cloned.push(blankActivity(1));
  const lastActivity = cloned[cloned.length - 1];
  if (lastActivity.activitySections.length === 0) {
    lastActivity.activitySections.push(blankSection(1));
  }
  const lastSection =
    lastActivity.activitySections[lastActivity.activitySections.length - 1];

  for (const p of placements) {
    let section = lastSection;
    if (p.activityIndex >= 0 && cloned[p.activityIndex]) {
      const sections = cloned[p.activityIndex].activitySections || [];
      section = sections[p.sectionIndex] || section;
    }
    section.scriptLevels.push({
      ...p.scriptLevel,
      activitySectionPosition: section.scriptLevels.length + 1,
    });
  }
  return cloned;
}

interface LessonLevelEntry {
  level: SerializedLevel;
  scriptLevel: SerializedScriptLevel;
  activityIndex: number;
  sectionIndex: number;
}

// Walk every level in the lesson in display order, yielding the level
// summary along with the activity/section it belongs to and the
// surrounding script_level (which we ship back verbatim on save).
function listLessonLevels(lesson: ExistingLessonData): LessonLevelEntry[] {
  const out: LessonLevelEntry[] = [];
  const activities = lesson.activities || [];
  for (let a = 0; a < activities.length; a++) {
    const sections = activities[a].activitySections || [];
    for (let s = 0; s < sections.length; s++) {
      const scriptLevels = sections[s].scriptLevels || [];
      for (const scriptLevel of scriptLevels) {
        // Each script_level can contain variant levels. The lesson edit
        // page treats the first level as the canonical one; mirror that.
        const level = (scriptLevel.levels || [])[0];
        if (!level) continue;
        out.push({level, scriptLevel, activityIndex: a, sectionIndex: s});
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
  const entries = listLessonLevels(lesson);
  if (entries.length === 0) {
    return {prefix: '', specs: [newLevelSpec()]};
  }
  // Infer the shared prefix only from supported levels — unsupported
  // placeholders may have unrelated names (or names that share no prefix
  // with the supported ones) and would otherwise erode the inferred
  // prefix to the empty string.
  const supportedNames = entries
    .filter(e => e.level.type && SUPPORTED_TYPES.has(e.level.type))
    .map(e => e.level.name);
  const prefix = inferPrefix(supportedNames);
  const stripPrefix = (name: string) =>
    prefix && name.startsWith(prefix + '-')
      ? name.slice(prefix.length + 1)
      : name;
  const specs = entries.map(
    ({level, scriptLevel, activityIndex, sectionIndex}) => {
      const supported = !!(level.type && SUPPORTED_TYPES.has(level.type));
      const description = level.generatePrompt || '';
      return {
        key: createUuid(),
        id: stripPrefix(level.name),
        // Pick a valid LabType for the dropdown; if the level isn't
        // generator-supported, the dropdown is hidden anyway.
        labType: supported ? (level.type as LabType) : 'Panels',
        description,
        lastGeneratedDescription: level.generatePrompt
          ? level.generatePrompt
          : undefined,
        generate: supported && !level.generatePrompt,
        existing: {activityIndex, sectionIndex, scriptLevel},
        unsupportedType: supported ? undefined : level.type,
      };
    }
  );
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
  const [outline, setOutline] = useState<string>(lesson.generateOutline || '');
  const [isOutlining, setIsOutlining] = useState(false);
  const [outlineError, setOutlineError] = useState<string | null>(null);

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

  const handleGenerateOutline = useCallback(async () => {
    if (!outline.trim()) {
      setOutlineError('Type an outline first.');
      return;
    }
    setOutlineError(null);
    setIsOutlining(true);
    try {
      const planned = await generateLessonOutline(outline.trim());
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
  }, [outline]);

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
          // The outline (if the user typed one) gives every level call the
          // same lesson-wide framing, so panels + weblab2 levels in the same
          // lesson stay tonally coherent.
          const lessonContext = outline.trim() || undefined;
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
              },
              lessonContext,
              precedingLevelsText
            );
            setStage('saving-properties');
            appendLog(`Saving panel data for "${levelName}"…`);
            await updatePanelsLevel(level.id, panels);
            generatedOutput = {panels};
          } else if (spec.labType === 'Weblab2') {
            const result = await generateWeblab2Level(
              spec.description.trim(),
              lessonContext,
              precedingLevelsText
            );
            setStage('saving-properties');
            appendLog(`Saving start sources for "${levelName}"…`);
            await updateStartSources(level.id, result.startSources);
            appendLog(`Saving instructions for "${levelName}"…`);
            await updateLongInstructions(level.id, result.longInstructions);
            generatedOutput = {weblab2: result};
          }
        }

        // Save the prompt onto the level itself so reopening /generate
        // later pre-populates it. We do this even on skip so an edited
        // prompt still persists. Failures here are non-fatal: the level
        // content is already saved.
        try {
          await updateGeneratePrompt(level.id, spec.description.trim());
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          appendLog(
            `Warning: couldn't save generate prompt for "${levelName}": ${message}`
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
        // Persist the outline so reopening /generate restores it. Sending
        // an empty string clears any previously-saved value.
        await saveLessonActivities(lesson.id, newActivities, outline.trim());
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
  }, [validationError, lesson, levelSpecs, fullName, appendLog, outline]);

  return (
    <div className={moduleStyles.container}>
      <h1 className={moduleStyles.heading}>
        Generate levels for "{lesson.name}"
      </h1>
      <p className={moduleStyles.subheading}>
        Plan a sequence of levels and let AI fill them with starter content.
        Each level is created, populated, and added to the end of this lesson.
      </p>

      <details className={moduleStyles.outlineBlock}>
        <summary>Optional: generate the levels below from an outline</summary>
        <p className={moduleStyles.outlineHelp}>
          Describe the learning experience you want this lesson to take a
          student through. The AI will turn that into a sequence of Panels and
          Web Lab 2 levels with IDs and per-level descriptions. You can edit or
          remove any of them before generating their content below.
        </p>
        <textarea
          className={moduleStyles.outlineInput}
          value={outline}
          onChange={e => setOutline(e.target.value)}
          placeholder="e.g. Introduce the student to CSS selectors, then have them style a simple form, then reflect on what they learned."
          disabled={isOutlining || isGenerating}
        />
        <div className={moduleStyles.outlineActions}>
          <button
            type="button"
            className={moduleStyles.secondaryButton}
            onClick={handleGenerateOutline}
            disabled={isOutlining || isGenerating || !outline.trim()}
          >
            {isOutlining ? 'Generating outline…' : 'Generate outline'}
          </button>
          {outlineError && (
            <span className={moduleStyles.summaryBad} role="alert">
              {outlineError}
            </span>
          )}
        </div>
      </details>

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
  const unsupported = !!spec.unsupportedType;
  return (
    <div
      className={
        unsupported
          ? `${moduleStyles.levelCard} ${moduleStyles.levelCardUnsupported}`
          : moduleStyles.levelCard
      }
    >
      <div className={moduleStyles.levelCardHeader}>
        <h3>
          Level {index + 1} —{' '}
          <code>
            {unsupported && spec.existing
              ? spec.existing.scriptLevel.levels?.[0]?.name || previewName
              : previewName}
          </code>
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
          title={
            unsupported
              ? 'Remove from this lesson (the level itself is preserved)'
              : 'Remove level'
          }
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
              disabled={disabled || unsupported}
            />
          </div>
          <div className={moduleStyles.cardField}>
            <label htmlFor={`lab-${spec.key}`}>Lab</label>
            {unsupported ? (
              <input
                id={`lab-${spec.key}`}
                value={spec.unsupportedType}
                disabled
              />
            ) : (
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
            )}
          </div>
          {!unsupported && (
            <label className={moduleStyles.skipLabel}>
              <input
                type="checkbox"
                checked={spec.generate}
                onChange={e => onChange(spec.key, {generate: e.target.checked})}
                disabled={disabled}
              />
              Generate
            </label>
          )}
        </div>
        <div className={moduleStyles.cardMain}>
          {unsupported ? (
            <p className={moduleStyles.unsupportedNote}>
              The generator doesn't support this lab type. The level stays in
              the lesson at this position; edit its content from the level edit
              page.
            </p>
          ) : (
            <>
              <label htmlFor={`desc-${spec.key}`}>Description</label>
              <textarea
                id={`desc-${spec.key}`}
                value={spec.description}
                onChange={e =>
                  onChange(spec.key, {description: e.target.value})
                }
                placeholder="What this level should teach or do."
                disabled={disabled}
              />
            </>
          )}
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

export default LessonGenerator;
