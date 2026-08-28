import {randomUUID} from 'node:crypto';

import type {
  ApplyChange,
  CourseModel,
  CurriculumChange,
  CurriculumChangeBody,
  LevelDefinitionPatch,
  ResolveLevel,
  WidgetDescriptor,
} from '../authoring/model.js';
import type {MazeLevelDefinition} from '../levels/mazeLevel.js';
import type {
  ChatMessage,
  ChatRole,
  ChatScope,
  CurriculumSnapshot,
  SessionStore,
} from '../store/SessionStore.js';

export type AgentStatus = 'started' | 'tool' | 'text' | 'done' | 'error';

export type ServerEvent =
  | {type: 'state'; version: number}
  | {type: 'widget'; widgetId: string; version: number}
  | {type: 'chat'; message: ChatMessage}
  | {
      type: 'agent-status';
      turnId: string;
      status: AgentStatus;
      detail?: string;
    };

export type ServerEventListener = (event: ServerEvent) => void;

export interface AuthoringStateOptions {
  store: SessionStore;
  applyChange: ApplyChange;
  snapshot: CurriculumSnapshot;
  changes: CurriculumChange[];
  resolveLevel?: ResolveLevel;
}

/**
 * In-memory authority for one session. Every mutation writes through the store
 * before it notifies listeners, so an SSE client never sees a version the disk
 * does not already hold.
 */
export class AuthoringState {
  private readonly store: SessionStore;
  private readonly applyChange: ApplyChange;
  private readonly resolveLevel?: ResolveLevel;
  private readonly listeners = new Set<ServerEventListener>();
  private snapshot: CurriculumSnapshot;
  private changes: CurriculumChange[];

  constructor(options: AuthoringStateOptions) {
    this.store = options.store;
    this.applyChange = options.applyChange;
    this.resolveLevel = options.resolveLevel;
    this.snapshot = options.snapshot;
    this.changes = options.changes;
  }

  get version(): number {
    return this.snapshot.version;
  }

  getSnapshot(): CurriculumSnapshot {
    return this.snapshot;
  }

  getChanges(): CurriculumChange[] {
    return this.changes;
  }

  getChatLog(): ChatMessage[] {
    return this.store.readChat();
  }

  subscribe(listener: ServerEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  emit(event: ServerEvent): void {
    for (const listener of this.listeners) {
      listener(event);
    }
  }

  applyCurriculumChange(
    body: CurriculumChangeBody,
    actor: 'agent' | 'author',
  ): CurriculumChange {
    const change: CurriculumChange = {
      ...body,
      seq: this.nextSeq(),
      at: new Date().toISOString(),
      actor,
    };

    // Capture before the merge below overwrites it — this is the one place
    // that still has the pre-patch value, whether it's the imported original
    // or an earlier override. A client-supplied `previous` (there shouldn't
    // be one; CurriculumChangeBodySchema doesn't accept the field) is
    // discarded in favor of this authoritative capture either way.
    if (change.op === 'overrideLevelInstructions') {
      change.previous = capturePreviousInstructions(
        this.snapshot.courses,
        this.snapshot.levelProperties,
        change.experienceId,
        change.patch,
      );
    }
    if (change.op === 'overrideLevelDefinition') {
      change.patch = withSolutionStalenessRule(
        this.snapshot.courses,
        this.snapshot.levelProperties,
        change.experienceId,
        change.patch,
      );
      change.previous = capturePreviousDefinition(
        this.snapshot.courses,
        this.snapshot.levelProperties,
        change.experienceId,
        change.patch,
      );
    }
    if (change.op === 'updateWidgetMetadata') {
      change.previous = capturePreviousWidgetMetadata(
        this.snapshot.widgets,
        change.widgetId,
        change.patch,
      );
    }

    const next = this.applyChange(
      {courses: this.snapshot.courses, widgets: this.snapshot.widgets},
      change,
      this.resolveLevel,
    );

    // overrideLevelInstructions has no separate LevelProperties write path
    // (unlike update_level's Maze-only tool, which rewrites the whole
    // wire-shape entry itself) — fold the just-applied override onto the
    // served entry here so GET .../level_properties reflects it immediately,
    // in the same version bump as the change itself.
    const levelProperties =
      change.op === 'overrideLevelInstructions'
        ? mergeInstructionsOverride(
            this.snapshot.levelProperties,
            next.courses,
            change.experienceId,
            change.patch,
          )
        : change.op === 'overrideLevelDefinition'
          ? mergeDefinitionOverride(
              this.snapshot.levelProperties,
              next.courses,
              change.experienceId,
              change.patch,
            )
          : this.snapshot.levelProperties;

    this.snapshot = {
      ...this.snapshot,
      courses: next.courses,
      widgets: next.widgets,
      levelProperties,
      version: this.snapshot.version + 1,
    };
    this.store.writeSnapshot(this.snapshot);
    this.store.appendChange(change);
    this.changes = [...this.changes, change];

    // A draft level also has an on-disk MazeLevelDefinition that
    // update_level rebuilds the whole served entry from — flag it so that
    // tool refuses rather than silently clobbering this edit. Imported
    // (lb:) levels have no such file; findExistingLevelExperience/levelKey
    // check below is what tells the two apart.
    if (change.op === 'overrideLevelDefinition') {
      markDraftLevelVisuallyEdited(
        this.store,
        next.courses,
        change.experienceId,
      );
    }

    // Descriptors also live as files so the agent can read them as code.
    const descriptor = descriptorFor(change, this.snapshot.widgets);
    if (descriptor) {
      this.store.writeWidgetDescriptor(descriptor);
    }

    this.emit({type: 'state', version: this.snapshot.version});
    return change;
  }

  upsertWidgetSource(widgetId: string, html: string): void {
    this.store.writeWidgetSource(widgetId, html);
    this.notifyWidgetSourceChanged(widgetId);
  }

  /** The file changed on disk (agent Write/Edit); bump and broadcast. */
  notifyWidgetSourceChanged(widgetId: string): void {
    this.snapshot = {...this.snapshot, version: this.snapshot.version + 1};
    this.store.writeSnapshot(this.snapshot);
    this.emit({type: 'widget', widgetId, version: this.snapshot.version});
  }

  readWidgetSource(widgetId: string): string | undefined {
    return this.store.readWidgetSource(widgetId);
  }

  findWidget(widgetId: string): WidgetDescriptor | undefined {
    return this.snapshot.widgets.find(widget => widget.id === widgetId);
  }

  registerLevelProperties(map: Record<string, Record<string, unknown>>): void {
    this.snapshot = {
      ...this.snapshot,
      levelProperties: {...this.snapshot.levelProperties, ...map},
    };
    this.store.writeSnapshot(this.snapshot);
  }

  getLevelProperties(numericId: string): Record<string, unknown> | undefined {
    return this.snapshot.levelProperties[numericId];
  }

  /**
   * registerLevelProperties alone (used by createLevel and by attach's
   * lazy-catalog resolution) writes the snapshot without bumping version or
   * emitting — the caller that also runs a CurriculumChange (createLevel's
   * subsequent insertExperience) absorbs it into that change's own bump.
   * updateLevel has no accompanying CurriculumChange (the experience node
   * itself doesn't change, only the level's own definition), so it calls
   * this afterward to notify SSE subscribers explicitly.
   */
  notifyLevelPropertiesChanged(): void {
    this.snapshot = {...this.snapshot, version: this.snapshot.version + 1};
    this.store.writeSnapshot(this.snapshot);
    this.emit({type: 'state', version: this.snapshot.version});
  }

  /** Synthetic ids are assigned above the imported range; see the spec doc. */
  nextLevelNumericId(): number {
    const ids = Object.keys(this.snapshot.levelProperties)
      .map(Number)
      .filter(Number.isFinite);
    return ids.length === 0 ? 1 : Math.max(...ids) + 1;
  }

  seedCourse(
    course: CurriculumSnapshot['courses'][number],
    levelProperties: Record<string, Record<string, unknown>>,
  ): void {
    this.snapshot = {
      ...this.snapshot,
      courses: [...this.snapshot.courses, course],
      levelProperties: {...this.snapshot.levelProperties, ...levelProperties},
      version: this.snapshot.version + 1,
    };
    this.store.writeSnapshot(this.snapshot);
    this.emit({type: 'state', version: this.snapshot.version});
  }

  appendChatMessage(
    role: ChatRole,
    text: string,
    scope?: ChatScope,
  ): ChatMessage {
    const message: ChatMessage = {
      id: randomUUID(),
      at: new Date().toISOString(),
      role,
      text,
      ...(scope ? {scope} : {}),
    };
    this.store.appendChatMessage(message);
    this.emit({type: 'chat', message});
    return message;
  }

  private nextSeq(): number {
    return (
      this.changes.reduce((max, change) => Math.max(max, change.seq), 0) + 1
    );
  }
}

/** Depth-first search for one experience by id, across every course/unit/lesson. */
function findExistingLevelExperience(
  courses: CourseModel[],
  experienceId: string,
) {
  for (const course of courses) {
    for (const unit of course.units) {
      for (const lesson of unit.lessons) {
        for (const experience of lesson.experiences) {
          if (
            experience.id === experienceId &&
            experience.kind === 'existingLevel'
          ) {
            return experience;
          }
        }
      }
    }
  }
  return undefined;
}

// Reads straight from the served levelProperties rather than
// experience.instructionsOverride: the latter only holds the override
// delta, which is empty (undefined) for a field an author has never
// touched, while levelProperties always carries the value currently on
// display — imported original or a prior override alike — for every field.
function capturePreviousInstructions(
  courses: CourseModel[],
  levelProperties: Record<string, Record<string, unknown>>,
  experienceId: string,
  patch: {shortInstructions?: string; longInstructions?: string},
): {shortInstructions?: string; longInstructions?: string} | undefined {
  const experience = findExistingLevelExperience(courses, experienceId);
  if (experience?.levelNumericId === undefined) {
    return undefined;
  }
  const current = levelProperties[String(experience.levelNumericId)];
  const previous: {shortInstructions?: string; longInstructions?: string} = {};
  if ('shortInstructions' in patch) {
    const value = current?.shortInstructions;
    previous.shortInstructions = typeof value === 'string' ? value : '';
  }
  if ('longInstructions' in patch) {
    const value = current?.longInstructions;
    previous.longInstructions = typeof value === 'string' ? value : '';
  }
  return previous;
}

// Same reasoning as capturePreviousInstructions, reading the widget's
// current descriptor (in-memory, not levelProperties) instead — a widget
// has no served/override split, just the one array entry apply.ts's
// updateWidgetMetadata spreads over.
function capturePreviousWidgetMetadata(
  widgets: WidgetDescriptor[],
  widgetId: string,
  patch: Partial<WidgetDescriptor>,
): Partial<WidgetDescriptor> | undefined {
  const widget = widgets.find(w => w.id === widgetId);
  if (!widget) {
    return undefined;
  }
  const previous: Partial<WidgetDescriptor> = {};
  for (const key of Object.keys(patch) as (keyof WidgetDescriptor)[]) {
    (previous as Record<string, unknown>)[key] = widget[key];
  }
  return previous;
}

// buildMazeLevelProperties (packages/authoring/src/importer/levelProperties.ts)
// spreads a maze-family level's raw .level properties onto the served entry
// AND sets an explicit camelCase copy of every field the engine reads —
// so at import time the entry carries both `short_instructions` and
// `shortInstructions`, both `flower_type` and `flowerType`, etc. An override
// patch is keyed by whichever casing that field's authoring surface happens
// to use (instructions overrides send camel; the visualization panel's
// flower-type patch sends the raw snake key — see levelDraft.ts), and a
// merge that writes only the patched casing leaves the OTHER casing at
// whatever the import-time value was: stale, and — for flowerType, which is
// all the engine ever reads (Bee.ts) — the entire reason a saved edit didn't
// show up. Both merge functions below write through this map so a patch on
// either casing keeps both in sync, rather than each field growing its own
// hand-written twin.
const CAMEL_SNAKE_TWINS: Record<string, string> = {
  shortInstructions: 'short_instructions',
  longInstructions: 'long_instructions',
  flowerType: 'flower_type',
  short_instructions: 'shortInstructions',
  long_instructions: 'longInstructions',
  flower_type: 'flowerType',
};

function mergeInstructionsOverride(
  levelProperties: Record<string, Record<string, unknown>>,
  courses: CourseModel[],
  experienceId: string,
  patch: {shortInstructions?: string; longInstructions?: string},
): Record<string, Record<string, unknown>> {
  const experience = findExistingLevelExperience(courses, experienceId);
  if (experience?.levelNumericId === undefined) {
    return levelProperties;
  }
  const numericId = String(experience.levelNumericId);
  const merged = {...levelProperties[numericId], ...patch};
  for (const [key, value] of Object.entries(patch)) {
    const twin = CAMEL_SNAKE_TWINS[key];
    if (twin && value !== undefined) {
      merged[twin] = value;
    }
  }
  return {...levelProperties, [numericId]: merged};
}

// A stored solution (Author Mode Pass D) is proof against one specific
// grid/toolbox/start-direction combination — proof captured against the
// old one says nothing about the new one. Any patch that touches one of
// those fields, on a level that already has a stored solution, and doesn't
// itself carry a fresh `solutionVerified` (the client sets that only when
// the just-run program is what's being saved — see LevelRail's
// solution-offer accept) degrades the merged flag to 'false' here, before
// `previous` is captured, so a later revert restores whatever verification
// state actually held before this save. `ideal` and `startBlocksXml` are
// deliberately excluded: the former is display-only, the latter is the
// LEARNER's starting arrangement, not an input to the author's own
// solution. Gated on an existing stored solution so an ordinary edit on a
// level that never had one (e.g. Pass A's plain startDirection change)
// doesn't grow a spurious solutionVerified: 'false' key.
const SOLUTION_STALENESS_TRIGGERS: (keyof LevelDefinitionPatch)[] = [
  'serialized_maze',
  'maze',
  'toolboxBlocksXml',
  'startDirection',
];

function withSolutionStalenessRule(
  courses: CourseModel[],
  levelProperties: Record<string, Record<string, unknown>>,
  experienceId: string,
  patch: LevelDefinitionPatch,
): LevelDefinitionPatch {
  const touchesEnvironment = SOLUTION_STALENESS_TRIGGERS.some(
    key => key in patch,
  );
  if (!touchesEnvironment || 'solutionVerified' in patch) {
    return patch;
  }
  const experience = findExistingLevelExperience(courses, experienceId);
  const current =
    experience?.levelNumericId === undefined
      ? undefined
      : levelProperties[String(experience.levelNumericId)];
  const hasStoredSolution = typeof current?.solutionBlocksXml === 'string';
  return hasStoredSolution ? {...patch, solutionVerified: 'false'} : patch;
}

// Same reasoning as capturePreviousInstructions, but a definition field that
// was never on the served entry must come back as `null` (an explicit
// "delete this key" signal), not `''` — an empty string is a corrupt
// serialized_maze/maze, and text-field semantics don't apply here.
function capturePreviousDefinition(
  courses: CourseModel[],
  levelProperties: Record<string, Record<string, unknown>>,
  experienceId: string,
  patch: LevelDefinitionPatch,
): LevelDefinitionPatch | undefined {
  const experience = findExistingLevelExperience(courses, experienceId);
  if (experience?.levelNumericId === undefined) {
    return undefined;
  }
  const current = levelProperties[String(experience.levelNumericId)];
  const previous: LevelDefinitionPatch = {};
  for (const key of Object.keys(patch) as (keyof LevelDefinitionPatch)[]) {
    const value = current?.[key];
    previous[key] = typeof value === 'string' ? value : null;
  }
  return previous;
}

// Unlike mergeInstructionsOverride, a `null` patch value deletes the key
// from the served entry rather than being written through — see
// LevelDefinitionPatch's doc comment (model.ts) for why a revert needs that.
function mergeDefinitionOverride(
  levelProperties: Record<string, Record<string, unknown>>,
  courses: CourseModel[],
  experienceId: string,
  patch: LevelDefinitionPatch,
): Record<string, Record<string, unknown>> {
  const experience = findExistingLevelExperience(courses, experienceId);
  if (experience?.levelNumericId === undefined) {
    return levelProperties;
  }
  const numericId = String(experience.levelNumericId);
  const merged = {...levelProperties[numericId]};
  for (const [key, value] of Object.entries(patch)) {
    const twin = CAMEL_SNAKE_TWINS[key];
    if (value === null) {
      delete merged[key];
      if (twin) {
        delete merged[twin];
      }
    } else if (value !== undefined) {
      merged[key] = value;
      if (twin) {
        merged[twin] = value;
      }
    }
  }
  return {...levelProperties, [numericId]: merged};
}

// The one asymmetry between imported and draft levels (see
// docs/prototypes/author-mode-level-editor.md §1.5): a draft Maze level also
// has an on-disk MazeLevelDefinition that update_level rebuilds the served
// entry from wholesale. Flag it so that tool refuses once a visual edit has
// made the definition stale, rather than silently clobbering the edit on the
// agent's next pass. No-ops for an imported (lb:) level or a draft level
// with no stored definition (not a Maze level, or never went through
// create_level).
function markDraftLevelVisuallyEdited(
  store: SessionStore,
  courses: CourseModel[],
  experienceId: string,
): void {
  const experience = findExistingLevelExperience(courses, experienceId);
  const levelKey = experience?.levelKey;
  if (!levelKey?.startsWith('draft:')) {
    return;
  }
  const levelId = levelKey.slice('draft:'.length);
  const existing = store.readLevelDefinition(levelId);
  if (!existing || existing.visuallyEdited) {
    return;
  }
  store.writeLevelDefinition(levelId, {
    ...existing,
    visuallyEdited: true,
  } satisfies MazeLevelDefinition);
}

function descriptorFor(
  change: CurriculumChange,
  widgets: WidgetDescriptor[],
): WidgetDescriptor | undefined {
  if (change.op === 'createWidget') {
    return change.descriptor;
  }
  if (change.op === 'updateWidgetMetadata') {
    return widgets.find(widget => widget.id === change.widgetId);
  }
  return undefined;
}
