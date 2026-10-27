// An actor, laid out to be compiled (specs/COMPILE_FROM_DATA_PLAN.md, step 2).
//
// The rows of its `define actor` generate as they always have, but for three
// kinds, which are said directly (`BlocklyGenerator.generateActor`): a trait
// it uses, and a block or an event it adds. Those come out of the chain, and
// a block's body goes under its page's head (`memberHead`), so nothing loads
// them as blocks.

import type {Block} from '../actors/actorData';

import {MEMBER_HEAD} from './bodySurfaces';

const ROOT = 'world_actor';
const USE_TRAIT = 'world_use_trait';
const DEFINE_BLOCK = 'world_rule_block';
const DEFINE_EVENT = 'world_rule_event';

type Part = {kind?: string; text?: string; var?: string};

/** One piece of the definition, in the order its rows are. */
export type ActorPiece =
  | {kind: 'row'}
  | {kind: 'trait'; trait: string}
  | {kind: 'event'; parts: Part[]}
  | {kind: 'block'; parts: Part[]; returns?: string; head?: string};

export interface ActorSheet {
  /** The view with those rows out of the chain, and each body under a head. */
  workspace: Record<string, unknown>;
  /** Empty for a file with no `define actor`, which compiles as it is. */
  pieces: ActorPiece[];
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const partsOf = (row: Block): Part[] =>
  isObject(row.extraState) && Array.isArray(row.extraState.parts)
    ? (row.extraState.parts as Part[])
    : [];

const withoutNext = (row: Block): Block =>
  Object.fromEntries(
    Object.entries(row).filter(([key]) => key !== 'next'),
  ) as Block;

/** What a `define block`'s `do` holds. */
const bodyOf = (row: Block): Block | undefined => {
  const inputs = isObject(row.inputs) ? row.inputs : {};
  return isObject(inputs.DO) && isObject(inputs.DO.block)
    ? (inputs.DO.block as Block)
    : undefined;
};

/** An actor's view, as the compiler loads it. */
export function actorSheet(view: Record<string, unknown>): ActorSheet {
  const blocks = isObject(view.blocks) ? view.blocks : {};
  const roots = (Array.isArray(blocks.blocks) ? blocks.blocks : []) as Block[];
  const root = roots.find(one => one.type === ROOT);
  if (!root) {
    return {workspace: view, pieces: []};
  }
  const pieces: ActorPiece[] = [];
  const kept: Block[] = [];
  const heads: Block[] = [];
  for (
    let at: unknown = isObject(root.next) ? root.next.block : undefined;
    isObject(at);
    at = isObject(at.next) ? at.next.block : undefined
  ) {
    const row = at as Block;
    const fields = isObject(row.fields) ? row.fields : {};
    if (row.type === USE_TRAIT) {
      pieces.push({kind: 'trait', trait: String(fields.TRAIT ?? '')});
    } else if (row.type === DEFINE_EVENT) {
      pieces.push({kind: 'event', parts: partsOf(row)});
    } else if (row.type === DEFINE_BLOCK) {
      const returns =
        typeof fields.RETURNS === 'string' ? fields.RETURNS : undefined;
      const body = bodyOf(row);
      // A block that reports something says so on its face and compiles to
      // nothing (`actorBlockStatementOnly`), so its body is never generated.
      const reports = Boolean(returns && returns !== 'none');
      const head = reports ? undefined : `head-${heads.length}`;
      if (head) {
        heads.push({
          type: MEMBER_HEAD,
          id: head,
          x: 20,
          y: 20,
          extraState: {parts: partsOf(row)},
          ...(body ? {next: {block: body}} : {}),
        });
      }
      pieces.push({
        kind: 'block',
        parts: partsOf(row),
        ...(returns === undefined ? {} : {returns}),
        ...(head ? {head} : {}),
      });
    } else {
      kept.push(withoutNext(row));
      pieces.push({kind: 'row'});
    }
  }
  const chain = kept.reduceRight<Block | undefined>(
    (below, row) => (below ? {...row, next: {block: below}} : row),
    undefined,
  );
  const bare = withoutNext(root);
  return {
    workspace: {
      ...view,
      blocks: {
        ...blocks,
        blocks: [
          ...roots.map(one =>
            one === root
              ? {...bare, ...(chain ? {next: {block: chain}} : {})}
              : one,
          ),
          ...heads,
        ],
      },
    },
    pieces,
  };
}
