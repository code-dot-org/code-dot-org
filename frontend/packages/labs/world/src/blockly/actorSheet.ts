// An actor, laid out to be compiled from its data
// (specs/COMPILE_FROM_DATA_PLAN.md, 5c step 5).
//
// What the actor is — the kind it acts like, whether it is data, its
// animations, its traits, the blocks and events it adds — is said from the
// data (`BlocklyGenerator.actorCode`). What generates as code is loaded as
// blocks: its still picture, the values set on it, its effects and its code
// rows, chained under a `define actor` root where `actor` is the builder;
// its handlers beside it; and each block's body under its page's head
// (`memberHead`).

import {
  CODE_ROWS,
  MAIN_ANIMATION,
  stillSpriteOf,
  writeEffect,
  writeValue,
  type ActorData,
  type Block,
} from '../actors/actorData';
import type {Timeline} from '../engine/core/keyframes';

import {MEMBER_HEAD} from './bodySurfaces';

const ROOT = 'world_actor';

type Part = {kind?: string; text?: string; var?: string};

/** One piece of the definition, in the order its code is written. */
export type ActorPiece =
  | {kind: 'row'}
  | {kind: 'actsLike'; actor: string}
  | {kind: 'isData'}
  | {kind: 'animations'; animations: Record<string, Timeline>}
  | {kind: 'trait'; trait: string}
  | {kind: 'event'; parts: Part[]}
  | {kind: 'block'; parts: Part[]; returns?: string; head?: string};

export interface ActorSheet {
  /** What is loaded: the root and its rows, the handlers, and the heads. */
  workspace: Record<string, unknown>;
  pieces: ActorPiece[];
}

const alone = (row: Block): Block =>
  Object.fromEntries(
    Object.entries(row).filter(([key]) => !['next', 'x', 'y'].includes(key)),
  ) as Block;

/** An actor's data, as the compiler loads and writes it. */
export function actorSheet(data: ActorData): ActorSheet {
  const pieces: ActorPiece[] = [];
  const rows: Block[] = [];
  const heads: Block[] = [];
  const row = (block: Block) => {
    rows.push(alone(block));
    pieces.push({kind: 'row'});
  };

  if (data.actsLike !== undefined) {
    pieces.push({kind: 'actsLike', actor: data.actsLike});
  }
  if (data.isData) {
    pieces.push({kind: 'isData'});
  }
  // A still Main is the `set sprite` it always was; anything more is played.
  const animations = {...data.animations};
  const still = stillSpriteOf(animations[MAIN_ANIMATION]);
  if (still !== undefined) {
    delete animations[MAIN_ANIMATION];
  }
  if (Object.keys(animations).length) {
    pieces.push({kind: 'animations', animations});
  }
  if (still !== undefined) {
    row({type: 'world_set_sprite', fields: {SPRITE: still}});
  }
  for (const trait of data.traits ?? []) {
    pieces.push({kind: 'trait', trait});
  }
  (data.values ?? []).forEach(value => row(writeValue(value)));
  (data.effects ?? [])
    .filter(effect => effect.on)
    .forEach(effect => row(writeEffect(effect)));
  for (const member of data.members ?? []) {
    const parts = member.parts as Part[];
    if (member.kind === 'event') {
      pieces.push({kind: 'event', parts});
      continue;
    }
    // A block that reports something compiles to nothing yet
    // (`actorBlockStatementOnly`), so its body is never generated.
    const head = member.returns ? undefined : `head-${heads.length}`;
    if (head) {
      heads.push({
        type: MEMBER_HEAD,
        id: head,
        x: 20,
        y: 20,
        extraState: {parts},
        ...(member.body ? {next: {block: member.body}} : {}),
      });
    }
    pieces.push({
      kind: 'block',
      parts,
      ...(member.returns === undefined ? {} : {returns: member.returns}),
      ...(head ? {head} : {}),
    });
  }
  const roots = (data.blocks?.blocks?.blocks ?? []) as Block[];
  const isCode = (root: Block) =>
    typeof root.type === 'string' && CODE_ROWS.has(root.type);
  roots.filter(isCode).forEach(row);

  const chain = rows.reduceRight<Block | undefined>(
    (below, one) => (below ? {...one, next: {block: below}} : one),
    undefined,
  );
  return {
    workspace: {
      ...data.blocks,
      blocks: {
        languageVersion: 0,
        ...data.blocks?.blocks,
        blocks: [
          {
            type: ROOT,
            x: 20,
            y: 20,
            fields: {NAME: data.name},
            ...(chain ? {next: {block: chain}} : {}),
          },
          ...roots.filter(root => !isCode(root)),
          ...heads,
        ],
      },
    },
    pieces,
  };
}
