// A level's extra scene names the blocks the scene starts with under when
// run. A project that already has the scene keeps it, but gets any of those
// blocks it lacks, so a scene made before the level asked for them still
// plays as the level expects.

import {JsonBlockConfig, WorkspaceSerialization} from '@cdo/apps/blockly/types';

import {Scene} from './types';

const WHEN_RUN = 'spritelab2_whenRun';

function topBlocks(
  source: WorkspaceSerialization | undefined
): JsonBlockConfig[] {
  return source && 'blocks' in source ? source.blocks.blocks : [];
}

/** The chain of blocks hanging under `top`, in order. */
function chainUnder(top: JsonBlockConfig): JsonBlockConfig[] {
  const chain: JsonBlockConfig[] = [];
  for (let next = top.next?.block; next; next = next.next?.block) {
    chain.push(next);
  }
  return chain;
}

/** The types of every real block in the tree: the chain and every input,
    but not shadows. */
function typesIn(block: JsonBlockConfig | undefined, into: Set<string>): void {
  for (let current = block; current; current = current.next?.block) {
    into.add(current.type);
    Object.values(current.inputs ?? {}).forEach(input =>
      typesIn(input.block, into)
    );
  }
}

/**
 * The scene with the starter's when-run blocks it lacks, inserted under its
 * own when run in the starter's order; the same scene object when it has
 * them all. A scene with no when run takes the starter whole. Blocks are
 * matched by type anywhere in the scene, so one the student moved or
 * edited still counts.
 */
export function withStarterBlocks(
  scene: Scene,
  starter: WorkspaceSerialization | undefined
): Scene {
  const starterRun = topBlocks(starter).find(block => block.type === WHEN_RUN);
  if (!starterRun) {
    return scene;
  }
  const source = scene.source;
  const tops = topBlocks(source);
  const runIndex = tops.findIndex(block => block.type === WHEN_RUN);
  if (runIndex === -1 || !source || !('blocks' in source)) {
    return tops.length ? scene : {...scene, source: starter};
  }
  const held = new Set<string>();
  tops.forEach(top => typesIn(top, held));
  const missing = chainUnder(starterRun).filter(block => !held.has(block.type));
  if (!missing.length) {
    return scene;
  }
  // Each missing block is a copy without its own `next`, chained in front
  // of what the when run already holds. Its id is dropped: the load gives
  // it one that no other block in the project has.
  const run = tops[runIndex];
  let next = run.next;
  for (let i = missing.length - 1; i >= 0; i--) {
    const block = {...missing[i]};
    delete block.next;
    delete block.id;
    next = {block: {...block, ...(next ? {next} : {})}};
  }
  const repaired = tops.map((block, i) =>
    i === runIndex ? {...run, next} : block
  );
  return {
    ...scene,
    source: {...source, blocks: {...source.blocks, blocks: repaired}},
  };
}
