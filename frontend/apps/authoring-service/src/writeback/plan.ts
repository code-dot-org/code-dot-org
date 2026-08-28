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

export interface WritebackFileEdit {
  /** Repo-root-relative when `repoRoot` is given, else absolute. */
  path: string;
  levelKey: string;
  unifiedDiff: string;
  beforeHash: string;
  afterHash: string;
  /**
   * The full patched file content. apply.ts writes this verbatim once its
   * own re-read confirms `beforeHash` still matches; GET /api/writeback/plan
   * (server.ts) strips it before returning the plan to a client — a diff is
   * what the dialog renders, and there's no reason to ship the whole file
   * twice over the wire.
   */
  after: string;
}

export interface WritebackSkip {
  experienceId: string;
  field?: string;
  reason: string;
}

export interface WritebackPlan {
  edits: WritebackFileEdit[];
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

  const edits: WritebackFileEdit[] = [];
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
      path: displayPath,
      levelKey: experience.levelKey,
      unifiedDiff: buildUnifiedDiff(displayPath, before, after),
      beforeHash: sha256(before),
      afterHash: sha256(after),
      after,
    });
  }

  return {edits, skipped};
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
