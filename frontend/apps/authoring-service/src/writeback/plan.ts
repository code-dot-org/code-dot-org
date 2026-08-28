// Dry-run write-back planner: projects the session's change log onto the
// .level files an author's overrides actually touch, without writing
// anything. GET /api/writeback/plan (server.ts) is the only caller; apply
// (a later pass) is meant to call buildWritebackPlan verbatim and then write
// each edit's `after` to `edit.path` — planning and applying share this one
// computation so they cannot diverge.
//
// Scope (v1): overrideLevelInstructions and overrideLevelDefinition on
// imported (`lb:`) levels. Everything else — draft levels, other ops,
// fields with no .level home — is reported in `skipped`, never silently
// dropped.

import {createTwoFilesPatch} from 'diff';
import {createHash} from 'node:crypto';
import path from 'node:path';

import type {
  CourseModel,
  CurriculumChange,
  ExistingLevelExperience,
  InstructionsPatch,
  LevelDefinitionPatch,
  LevelFilePatch,
  ParseLevelXml,
  PatchLevelFile,
} from '../authoring/model.js';

import {
  sanitizeDefaultLevelName,
  uniqueDefaultLevelName,
  validateExplicitLevelName,
} from './newLevelName.js';

/** Shared shape between an in-place edit and a brand-new file, so apply.ts
 * and the write-back dialog can walk `plan.edits` uniformly and switch on
 * `kind` only where the two actually differ. */
interface WritebackEditBase {
  /** Repo-root-relative when `repoRoot` is given, else absolute. */
  path: string;
  levelKey: string;
  unifiedDiff: string;
  afterHash: string;
  /**
   * The full file content apply.ts writes verbatim (an edit's patched
   * result, or a create's whole new file). GET /api/writeback/plan
   * (server.ts) strips this before returning the plan to a client — a diff
   * is what the dialog renders, and there's no reason to ship the whole
   * file twice over the wire.
   */
  after: string;
}

export interface WritebackFileEdit extends WritebackEditBase {
  kind: 'edit';
  beforeHash: string;
}

/** A `createLevel` op whose experience is still attached to a lesson — see
 * buildWritebackPlan's doc comment on why an orphaned (removed) one produces
 * no entry here at all. */
export interface WritebackFileCreate extends WritebackEditBase {
  kind: 'create';
  experienceId: string;
  /** The level's filename (no `.level` extension) — editable in the
   * write-back dialog before apply; see server.ts's `names` query param and
   * newLevelName.ts's doc comment on why an edited name is validated, never
   * silently rewritten. */
  name: string;
}

export type WritebackPlanEdit = WritebackFileEdit | WritebackFileCreate;

export interface WritebackSkip {
  experienceId: string;
  field?: string;
  reason: string;
}

export interface WritebackPlan {
  edits: WritebackPlanEdit[];
  skipped: WritebackSkip[];
}

export interface WritebackPlanInput {
  courses: CourseModel[];
  changes: CurriculumChange[];
  /** Same name→path convention LevelCatalog scans (boot/levelCatalog.ts). */
  resolveLevelFilePath: (levelKey: string) => string | undefined;
  readFile: (filePath: string) => string;
  parseLevelXml: ParseLevelXml;
  patchLevelFile: PatchLevelFile;
  /** Strips this prefix from `edits[].path` for display; omit to keep it absolute. */
  repoRoot?: string;
  /**
   * Wire-shape LevelProperties keyed by numeric id — AuthoringState's served
   * snapshot. A draft level's file contents come from here, never from the
   * change log: createLevel's own payload carries only experience metadata
   * (id/title/levelKey/...), and AuthoringState.getLevelProperties is the
   * one place that holds the level's actual properties, already reflecting
   * every overrideLevelInstructions/overrideLevelDefinition applied since
   * (see AuthoringState.ts's mergeInstructionsOverride/mergeDefinitionOverride) —
   * so a create entry needs no separate accumulation of those ops the way
   * an existing (lb:) level's edit entry does. Optional/defaulted to `{}` so
   * every override-only test written before this pass keeps compiling.
   */
  levelProperties?: Record<string, Record<string, unknown>>;
  /** Author-edited level names from the write-back dialog, keyed by
   * experienceId (GET /api/writeback/plan's `names` query param). An
   * experience with no entry here gets the algorithmic default. */
  nameOverrides?: Record<string, string>;
  /** Every `.level` basename under the WHOLE dashboard/config/levels tree,
   * lowercased — see levelNames.ts's doc comment for why this can't reuse
   * LevelCatalog's own narrower scan. Called at most once per plan, and only
   * when a create is actually pending (it walks a real directory tree). */
  listAllLevelFileNames?: () => Set<string>;
  /** Bridged from @code-dot-org/authoring's buildNewLevelFile. Absent means
   * write-back-for-creates is unavailable; server.ts gates the whole
   * endpoint on this the same way it already does for parseLevelXml/
   * patchLevelFile. */
  buildNewLevelFile?: (rootTag: string, patch: LevelFilePatch) => string;
}

// Reverse of importer/levelProperties.ts's wire-shape builders — see the
// writeback plan doc (docs/prototypes, §2.2) for the citation-by-citation
// derivation of each destination.
type FieldDestination =
  | {kind: 'property'; key: string}
  | {kind: 'block'; tag: 'startBlocksXml' | 'toolboxBlocksXml' | 'solutionBlocksXml'}
  | {kind: 'unmapped'; reason: string};

const INSTRUCTIONS_FIELD_MAP: Record<
  keyof InstructionsPatch,
  Extract<FieldDestination, {kind: 'property'}>
> = {
  shortInstructions: {kind: 'property', key: 'short_instructions'},
  longInstructions: {kind: 'property', key: 'long_instructions'},
};

const SOLUTION_VERIFIED_REASON =
  'solutionVerified is prototype-only (Author Mode Pass D solution-proof state) — it has no production .level field, so it is dropped rather than written';

const DEFINITION_FIELD_MAP: Record<keyof LevelDefinitionPatch, FieldDestination> = {
  serialized_maze: {kind: 'property', key: 'serialized_maze'},
  maze: {kind: 'property', key: 'maze'},
  initial_dirt: {kind: 'property', key: 'initial_dirt'},
  startDirection: {kind: 'property', key: 'start_direction'},
  ideal: {kind: 'property', key: 'ideal'},
  nectar_goal: {kind: 'property', key: 'nectar_goal'},
  honey_goal: {kind: 'property', key: 'honey_goal'},
  min_collected: {kind: 'property', key: 'min_collected'},
  flower_type: {kind: 'property', key: 'flower_type'},
  startBlocksXml: {kind: 'block', tag: 'startBlocksXml'},
  toolboxBlocksXml: {kind: 'block', tag: 'toolboxBlocksXml'},
  solutionBlocksXml: {kind: 'block', tag: 'solutionBlocksXml'},
  solutionVerified: {kind: 'unmapped', reason: SOLUTION_VERIFIED_REASON},
};

type BlocksPatch = NonNullable<LevelFilePatch['blocks']>;
type BlockTag = keyof BlocksPatch;

/** Cumulative, last-write-wins patch for one level across the whole log. */
interface LevelAccumulator {
  properties: Record<string, string | null>;
  blocks: BlocksPatch;
  /** First-seen `previous` per touched key, for the stale-import check. */
  baselineProperties: Record<string, string | null>;
  baselineBlocks: Partial<Record<BlockTag, string | null>>;
}

function newAccumulator(): LevelAccumulator {
  return {properties: {}, blocks: {}, baselineProperties: {}, baselineBlocks: {}};
}

export function buildWritebackPlan(input: WritebackPlanInput): WritebackPlan {
  const {courses, changes, resolveLevelFilePath, readFile, parseLevelXml, patchLevelFile} =
    input;
  const skipped: WritebackSkip[] = [];
  const reportedUnmapped = new Set<string>();
  const perLevel = new Map<string, LevelAccumulator>();

  // A draft level's whole file comes from a single createLevel entry further
  // below (built from the CURRENT served levelProperties, which already
  // reflects every override made since) — so an override on a level this
  // session itself created must not ALSO fall through to the "draft
  // (non-lb) level, out of scope" skip further down; that reason is only
  // for a draft level with no createLevel op in this log at all (shouldn't
  // happen, but the plan doesn't assume it can't).
  const createdExperienceIds = new Set(
    changes.filter(c => c.op === 'createLevel').map(c => c.level.id),
  );

  for (const change of changes) {
    if (change.op === 'updateLevel') {
      if (change.patch.title !== undefined) {
        reportUnmappedOnce(
          skipped,
          reportedUnmapped,
          change.experienceId,
          'title',
          "title has no .level file field — a level's display name in a " +
            'lesson comes from script_levels.properties.progression / i18n, ' +
            'not the level file; v1 reports it as unmapped rather than guessing',
        );
      }
      continue;
    }
    if (change.op !== 'overrideLevelInstructions' && change.op !== 'overrideLevelDefinition') {
      continue;
    }
    let acc = perLevel.get(change.experienceId);
    if (!acc) {
      acc = newAccumulator();
      perLevel.set(change.experienceId, acc);
    }
    if (change.op === 'overrideLevelInstructions') {
      applyInstructionsChange(acc, change.patch, change.previous);
    } else {
      applyDefinitionChange(
        acc,
        change.patch,
        change.previous,
        change.experienceId,
        skipped,
        reportedUnmapped,
      );
    }
  }

  const edits: WritebackPlanEdit[] = [];
  for (const [experienceId, acc] of perLevel) {
    const experience = findExistingLevelExperience(courses, experienceId);
    if (!experience) {
      skipped.push({
        experienceId,
        reason:
          'experience not found in the current session (removed since the override was made)',
      });
      continue;
    }
    if (experience.origin !== 'levelbuilder') {
      if (createdExperienceIds.has(experienceId)) {
        continue; // covered by this same level's createLevel entry below
      }
      skipped.push({
        experienceId,
        reason:
          'draft (non-lb) level — writing a draft level\'s own file is out of ' +
          "this pass's scope",
      });
      continue;
    }
    if (
      Object.keys(acc.properties).length === 0 &&
      Object.keys(acc.blocks).length === 0
    ) {
      continue; // every touched field was unmapped (e.g. only solutionVerified)
    }

    const filePath = resolveLevelFilePath(experience.levelKey);
    if (!filePath) {
      skipped.push({
        experienceId,
        reason: `no .level file found for level key "${experience.levelKey}"`,
      });
      continue;
    }

    let before: string;
    try {
      before = readFile(filePath);
    } catch (error) {
      skipped.push({experienceId, reason: `could not read ${filePath}: ${String(error)}`});
      continue;
    }

    const staleField = findStaleField(parseLevelXml, before, acc);
    if (staleField) {
      skipped.push({
        experienceId,
        field: staleField,
        reason:
          `stale-import: ${filePath}'s current "${staleField}" no longer matches ` +
          'what this session imported at boot — dashboard/config changed ' +
          'underneath the session (another process, a checkout, a manual edit); ' +
          're-import to pick up the writeback',
      });
      continue;
    }

    let after: string;
    try {
      after = patchLevelFile(before, {properties: acc.properties, blocks: acc.blocks});
    } catch (error) {
      skipped.push({experienceId, reason: `could not patch ${filePath}: ${String(error)}`});
      continue;
    }

    if (after === before) {
      continue; // the session's edits net out to the file's current content
    }

    const displayPath = input.repoRoot ? path.relative(input.repoRoot, filePath) : filePath;
    edits.push({
      kind: 'edit',
      path: displayPath,
      levelKey: experience.levelKey,
      unifiedDiff: buildUnifiedDiff(displayPath, before, after),
      beforeHash: sha256(before),
      afterHash: sha256(after),
      after,
    });
  }

  buildCreateEdits(input, createdExperienceIds, edits, skipped);

  return {edits, skipped};
}

// The .level properties key list a NEW Maze-family file writes, sourced
// directly from the level's served levelProperties entry (see
// WritebackPlanInput.levelProperties's doc comment for why that's the
// authoritative source rather than the createLevel change's own payload or
// the on-disk MazeLevelDefinition). Every key here is one buildMazeLevelWireProperties
// (mazeLevel.ts) or an overrideLevelDefinition patch (model.ts's
// LevelDefinitionPatch) can set; `skin` has no override path today but is
// still a real, load-bearing file property set once at creation.
const NEW_MAZE_PROPERTY_KEYS = [
  'skin',
  'maze',
  'serialized_maze',
  'initial_dirt',
  'start_direction',
  'short_instructions',
  'long_instructions',
  'ideal',
  'nectar_goal',
  'honey_goal',
  'min_collected',
  'flower_type',
] as const;

/** Maze-family levels are the only ones this project can currently create
 * (createMazeLevel.ts) — a v1 boundary, not a format limitation. */
const CREATABLE_LEVEL_TYPES = new Set(['Maze']);
/** Repo-root-relative segments a new Maze-family level's file lands under —
 * one of LevelCatalog's own SCANNED_DIRECTORIES, so a level this plan
 * creates is one a fresh session's catalog scan finds. Exported so apply.ts
 * recomputes the identical absolute path rather than trusting one carried on
 * the plan object across a rebuild (same "never trust a stored path"
 * discipline as an edit's own resolveLevelFilePath re-resolution). */
export const CREATABLE_LEVEL_DIRECTORY = ['dashboard', 'config', 'levels', 'custom', 'maze'];

/**
 * Turns each attached `createLevel` op into a WritebackFileCreate. A
 * createLevel change whose experience is no longer found in the current
 * course tree (removed — a scratch level the author deleted, or a course
 * torn down) produces NOTHING here, not even a skip entry: it was never
 * attached to begin with from write-back's point of view, and reporting a
 * "skipped" line for every scratch level an author tried and discarded
 * would just be noise on every plan from here on.
 */
function buildCreateEdits(
  input: WritebackPlanInput,
  createdExperienceIds: Set<string>,
  edits: WritebackPlanEdit[],
  skipped: WritebackSkip[],
): void {
  if (createdExperienceIds.size === 0) {
    return;
  }

  const levelProperties = input.levelProperties ?? {};
  const nameOverrides = input.nameOverrides ?? {};

  // Attached first, so a corpus-wide directory walk (listAllLevelFileNames)
  // never runs when every createLevel in the log was later discarded.
  const attached: {experienceId: string; experience: ExistingLevelExperience}[] = [];
  for (const experienceId of createdExperienceIds) {
    const experience = findExistingLevelExperience(input.courses, experienceId);
    if (experience) {
      attached.push({experienceId, experience});
    }
  }
  if (attached.length === 0) {
    return;
  }

  if (!input.repoRoot) {
    for (const {experienceId} of attached) {
      skipped.push({
        experienceId,
        reason: 'cannot compute a target path for a new level without a resolved repo root',
      });
    }
    return;
  }
  if (!input.buildNewLevelFile) {
    for (const {experienceId} of attached) {
      skipped.push({
        experienceId,
        reason: '@code-dot-org/authoring writeback (buildNewLevelFile) is not available',
      });
    }
    return;
  }

  let existingLower: Set<string> | undefined;
  const takenThisPlan = new Set<string>();

  for (const {experienceId, experience} of attached) {
    if (!CREATABLE_LEVEL_TYPES.has(experience.levelType)) {
      skipped.push({
        experienceId,
        reason: `write-back can only create Maze-family levels in this pass; "${experience.levelType}" is not one`,
      });
      continue;
    }
    if (experience.levelNumericId === undefined) {
      skipped.push({experienceId, reason: 'this draft level has no numeric id registered'});
      continue;
    }
    const served = levelProperties[String(experience.levelNumericId)];
    if (!served) {
      skipped.push({
        experienceId,
        reason: `no served levelProperties entry for numeric id ${experience.levelNumericId}`,
      });
      continue;
    }

    const properties: Record<string, string> = {};
    for (const key of NEW_MAZE_PROPERTY_KEYS) {
      const value = served[key];
      if (typeof value === 'string') {
        properties[key] = value;
      }
    }
    const blocks: BlocksPatch = {};
    if (typeof served.startBlocksXml === 'string') blocks.startBlocksXml = served.startBlocksXml;
    if (typeof served.toolboxBlocksXml === 'string') blocks.toolboxBlocksXml = served.toolboxBlocksXml;
    if (typeof served.solutionBlocksXml === 'string') blocks.solutionBlocksXml = served.solutionBlocksXml;

    existingLower ??= (input.listAllLevelFileNames ?? (() => new Set<string>()))();

    const override = nameOverrides[experienceId];
    let name: string;
    if (override !== undefined) {
      const validation = validateExplicitLevelName(override);
      if (!validation.ok) {
        skipped.push({experienceId, field: 'name', reason: validation.reason});
        continue;
      }
      name = override.trim();
      const nameLower = name.toLowerCase();
      if (existingLower.has(nameLower) || takenThisPlan.has(nameLower)) {
        skipped.push({
          experienceId,
          field: 'name',
          reason: `a level named "${name}" already exists — choose a different name`,
        });
        continue;
      }
    } else {
      // Bumped against BOTH the on-disk corpus and every name already
      // claimed earlier in this same loop — two drafts sharing a title (the
      // "New maze level" default, or two AI-authored levels with the same
      // name) must not collide with each other, not just with disk.
      const takenSoFar =
        takenThisPlan.size === 0 ? existingLower : new Set([...existingLower, ...takenThisPlan]);
      name = uniqueDefaultLevelName(sanitizeDefaultLevelName(experience.title), takenSoFar);
    }
    takenThisPlan.add(name.toLowerCase());

    const absolutePath = path.join(input.repoRoot, ...CREATABLE_LEVEL_DIRECTORY, `${name}.level`);
    let content: string;
    try {
      content = input.buildNewLevelFile(experience.levelType, {properties, blocks});
    } catch (error) {
      skipped.push({experienceId, reason: `could not build a new level file: ${String(error)}`});
      continue;
    }

    const displayPath = path.relative(input.repoRoot, absolutePath);
    edits.push({
      kind: 'create',
      experienceId,
      name,
      path: displayPath,
      levelKey: experience.levelKey,
      unifiedDiff: buildUnifiedDiff(displayPath, '', content),
      afterHash: sha256(content),
      after: content,
    });
  }
}

function reportUnmappedOnce(
  skipped: WritebackSkip[],
  reported: Set<string>,
  experienceId: string,
  field: string,
  reason: string,
): void {
  const dedupeKey = `${experienceId}:${field}`;
  if (reported.has(dedupeKey)) {
    return;
  }
  reported.add(dedupeKey);
  skipped.push({experienceId, field, reason});
}

function applyInstructionsChange(
  acc: LevelAccumulator,
  patch: InstructionsPatch,
  previous: InstructionsPatch | undefined,
): void {
  for (const field of Object.keys(patch) as (keyof InstructionsPatch)[]) {
    const value = patch[field];
    if (value === undefined) {
      continue;
    }
    const dest = INSTRUCTIONS_FIELD_MAP[field];
    acc.properties[dest.key] = value;
    if (!(dest.key in acc.baselineProperties)) {
      // capturePreviousInstructions (AuthoringState.ts) records '' for a
      // field the level never had; normalize that to null, matching
      // LevelDefinitionPatch's absent-key convention, so one comparison
      // (findStaleField) covers both patch kinds.
      const capturedPrevious = previous?.[field];
      acc.baselineProperties[dest.key] =
        capturedPrevious === undefined || capturedPrevious === '' ? null : capturedPrevious;
    }
  }
}

function applyDefinitionChange(
  acc: LevelAccumulator,
  patch: LevelDefinitionPatch,
  previous: LevelDefinitionPatch | undefined,
  experienceId: string,
  skipped: WritebackSkip[],
  reportedUnmapped: Set<string>,
): void {
  for (const field of Object.keys(patch) as (keyof LevelDefinitionPatch)[]) {
    const value = patch[field];
    if (value === undefined) {
      continue;
    }
    const dest = DEFINITION_FIELD_MAP[field];
    if (dest.kind === 'unmapped') {
      reportUnmappedOnce(skipped, reportedUnmapped, experienceId, field, dest.reason);
      continue;
    }
    const capturedPrevious = previous?.[field] ?? null;
    if (dest.kind === 'property') {
      acc.properties[dest.key] = value;
      if (!(dest.key in acc.baselineProperties)) {
        acc.baselineProperties[dest.key] = capturedPrevious;
      }
    } else {
      acc.blocks[dest.tag] = value;
      if (!(dest.tag in acc.baselineBlocks)) {
        acc.baselineBlocks[dest.tag] = capturedPrevious;
      }
    }
  }
}

/** Depth-first search for one existingLevel experience, by id. */
function findExistingLevelExperience(
  courses: CourseModel[],
  experienceId: string,
): ExistingLevelExperience | undefined {
  for (const course of courses) {
    for (const unit of course.units) {
      for (const lesson of unit.lessons) {
        for (const experience of lesson.experiences) {
          if (experience.id === experienceId && experience.kind === 'existingLevel') {
            return experience;
          }
        }
      }
    }
  }
  return undefined;
}

/** null/'' both mean "absent" — matching capturePreviousInstructions and
 * capturePreviousDefinition's own not-quite-symmetric conventions. */
function normalizeForComparison(value: string | null | undefined): string | null {
  return value === undefined || value === null || value === '' ? null : value;
}

/**
 * The first touched field whose current on-disk value matches neither what
 * the session captured as `previous` the first time it was overridden NOR
 * what this same plan is about to write. Either match is fine: the first is
 * "nobody's touched this since import", the second is "a previous
 * write-back already landed this exact value" — re-running the plan right
 * after a successful apply must see the second case and fall through to
 * plan.ts's own after===before check (an empty edit, not a refusal), or
 * every write-back would permanently wedge itself as stale against its own
 * output. Only a THIRD value — neither the baseline nor this plan's target —
 * means dashboard/config moved for a reason this session doesn't know
 * about, which is the actual case this guard exists to catch. Returns
 * undefined when every touched field's current value is explained one way
 * or the other.
 */
function findStaleField(
  parseLevelXml: ParseLevelXml,
  fileXml: string,
  acc: LevelAccumulator,
): string | undefined {
  const parsed = parseLevelXml(fileXml);
  for (const [key, baseline] of Object.entries(acc.baselineProperties)) {
    const current = parsed.properties[key];
    const currentStr = typeof current === 'string' ? current : null;
    if (
      normalizeForComparison(baseline) !== normalizeForComparison(currentStr) &&
      normalizeForComparison(acc.properties[key]) !== normalizeForComparison(currentStr)
    ) {
      return `properties.${key}`;
    }
  }
  for (const [tag, baseline] of Object.entries(acc.baselineBlocks) as [
    BlockTag,
    string | null | undefined,
  ][]) {
    const current = parsed[tag];
    const currentStr = typeof current === 'string' ? current : null;
    if (
      normalizeForComparison(baseline) !== normalizeForComparison(currentStr) &&
      normalizeForComparison(acc.blocks[tag]) !== normalizeForComparison(currentStr)
    ) {
      return `blocks.${tag}`;
    }
  }
  return undefined;
}

function sha256(text: string): string {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

/** Plain `---`/`+++`/`@@` unified diff — createTwoFilesPatch's own `Index:`/
 * `===` banner lines are dropped; they name nothing a caller doesn't already
 * know from `path`. */
function buildUnifiedDiff(displayPath: string, before: string, after: string): string {
  const patch = createTwoFilesPatch(displayPath, displayPath, before, after, undefined, undefined, {
    context: 3,
  });
  return patch
    .split('\n')
    .filter(line => !line.startsWith('Index:') && !/^=+$/.test(line))
    .join('\n');
}
