import {randomUUID} from 'node:crypto';

import type {AuthoringState} from '../state/AuthoringState.js';
import type {SessionStore} from '../store/SessionStore.js';

import {
  buildMazeLevelWireProperties,
  verifyMazeLevelSolvable,
  type MazeLevelDefinition,
} from './mazeLevel.js';

export interface CreateMazeLevelParams {
  lessonId: string;
  position: number;
  title: string;
  definition: MazeLevelDefinition;
  actor: 'agent' | 'author';
}

export type CreateMazeLevelResult =
  | {ok: true; levelId: string; experienceId: string; levelNumericId: number}
  | {ok: false; reason: string};

/**
 * The create_level orchestration — gate the definition, allocate an id,
 * write the on-disk definition, register its wire LevelProperties, then
 * apply the `createLevel` CurriculumChange that inserts it into the lesson.
 * One place so registering and applying can never happen out of order or
 * independently of the gate: AuthoringState.registerLevelProperties's own
 * doc comment is explicit that it must precede the paired CurriculumChange.
 *
 * Shared by the agent's `create_level` tool (ClaudeAgentRunner) and the
 * manual "New maze level" authoring route (server.ts) — the same
 * orchestration either way, differing only in where `definition` comes
 * from (AI-authored vs. buildBlankMazeLevelDefinition's template) and
 * `actor`.
 */
export function createMazeLevel(
  state: AuthoringState,
  store: SessionStore,
  params: CreateMazeLevelParams,
): CreateMazeLevelResult {
  const gate = verifyMazeLevelSolvable(params.definition);
  if (!gate.ok) {
    return {ok: false, reason: gate.reason};
  }

  const levelId = `draft-level-${randomUUID().slice(0, 8)}`;
  const levelKey = `draft:${levelId}`;
  const numericId = state.nextLevelNumericId();
  store.writeLevelDefinition(levelId, params.definition);
  state.registerLevelProperties({
    [String(numericId)]: buildMazeLevelWireProperties(
      numericId,
      levelKey,
      params.definition,
    ),
  });

  const experienceId = `draft-exp-${randomUUID().slice(0, 8)}`;
  state.applyCurriculumChange(
    {
      op: 'createLevel',
      lessonId: params.lessonId,
      position: params.position,
      level: {
        id: experienceId,
        kind: 'existingLevel',
        origin: 'draft',
        title: params.title,
        levelKey,
        levelType: 'Maze',
        runtime: 'labhost',
        labKey: 'maze',
        levelNumericId: numericId,
      },
    },
    params.actor,
  );

  return {ok: true, levelId, experienceId, levelNumericId: numericId};
}
