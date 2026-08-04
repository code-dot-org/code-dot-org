// Every block the shipped project names must exist.
//
// The default project is a hundred kilobytes of serialized workspaces naming
// block types as strings, and nothing in the type system connects those strings
// to the blocks that define them. Retire a block, rename one, change how a
// generated type is spelled, and the files still parse, the tests still pass,
// and the project fails to open with
//
//   Blockly generation failed: Invalid block definition for type: world_emit
//
// which is a whole project that will not run. That happened when `world_emit`
// was retired for the generated per-event blocks: `input.rule` was repointed,
// `gravity.rule` was not, and no test loaded a `.rule` through the palette.
//
// So this walks the shipped workspaces the way Blockly loads them and asks the
// palette about every type it finds. What it cannot see is a block that exists
// but has changed shape — a socket renamed under a block still holding the old
// name — which is what the browser is for.

import * as Blockly from 'blockly';
import {describe, expect, it} from 'vitest';

import {DEFAULT_PROJECT} from '../../constants';
import {projectFiles} from '../../runtime/projectFiles';
import {buildDomainPalette} from '../domainBlocks';
import {projectRuleMetas} from '../projectModules';

/** A saved block, as much of one as this needs to walk it. */
interface SavedBlock {
  type?: string;
  inputs?: Record<string, {block?: SavedBlock; shadow?: SavedBlock}>;
  next?: {block?: SavedBlock; shadow?: SavedBlock};
}

/**
 * Every block type a workspace names.
 *
 * Walks the block tree specifically rather than every `type` key in the JSON:
 * a parameter's type is `type` too (`enum:Engine#Key`, `vector`), and so is a
 * variable's, and neither is a block.
 */
function typesIn(contents: string): string[] {
  let parsed: {blocks?: {blocks?: SavedBlock[]}};
  try {
    parsed = JSON.parse(contents);
  } catch {
    return [];
  }
  const found: string[] = [];
  const visit = (block: SavedBlock | undefined): void => {
    if (!block) {
      return;
    }
    if (block.type) {
      found.push(block.type);
    }
    for (const input of Object.values(block.inputs ?? {})) {
      visit(input.block);
      visit(input.shadow);
    }
    visit(block.next?.block);
    visit(block.next?.shadow);
  };
  (parsed.blocks?.blocks ?? []).forEach(visit);
  return found;
}

const files = projectFiles(DEFAULT_PROJECT.source);

// The generator's palette, not an editor's: it defines every rule's blocks at
// once, which is the widest set a shipped file may draw on.
const palette = new Set(
  buildDomainPalette(projectRuleMetas(files), {
    allRuleModules: true,
  }).blocks.map(block => block.type),
);

const WORKSPACE_FILE = /\.(rule|actor|world)$/;

describe('the shipped project', () => {
  it('names only blocks that exist', () => {
    const missing: string[] = [];
    for (const [path, contents] of Object.entries(files)) {
      if (!WORKSPACE_FILE.test(path)) {
        continue;
      }
      for (const type of typesIn(contents)) {
        // Ours, or Blockly's own (`controls_if`, `math_number`, …), which are
        // registered by importing blockly at all.
        if (!palette.has(type) && !Blockly.Blocks[type]) {
          missing.push(`${path}: ${type}`);
        }
      }
    }
    expect(missing).toEqual([]);
  });

  it('walks enough of each file to be worth trusting', () => {
    // A guard on the guard: a walk that quietly found nothing would pass the
    // test above for every project, including a broken one.
    const walked = Object.entries(files)
      .filter(([path]) => WORKSPACE_FILE.test(path))
      .map(([path, contents]) => [path, typesIn(contents).length] as const);

    expect(walked.length).toBeGreaterThanOrEqual(7);
    for (const [path, count] of walked) {
      expect(`${path}: ${count > 0}`).toBe(`${path}: true`);
    }
    // The deep ones: gravity's steps and the world's own body.
    expect(
      typesIn(DEFAULT_PROJECT.source.files.gravityRule.contents).length,
    ).toBeGreaterThan(40);
  });
});
