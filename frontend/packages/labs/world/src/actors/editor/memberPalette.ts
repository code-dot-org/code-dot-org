// The blocks an actor's members make, as the toolbox makes them
// (specs/ACTOR_BLOCKS_PLAN.md, step 2).
//
// A member is drawn as the block it makes: the hat an event's handlers sit
// under, the call a block is used by. Those are minted from the actor's own
// metadata by the same palette the editor uses, so the picture is the block
// and not a likeness of it.

import {
  buildDomainPalette,
  callBlockType,
  eventBlockType,
} from '../../blockly/domainBlocks';
import {parseActorOwnMeta} from '../../blockly/ownProperties';
import {designedName} from '../../blockly/ruleMeta';
import {isActorData, type ActorMember} from '../actorData';

export interface MemberPalette {
  /** The definitions the pictures need, the minted blocks among them. */
  blocks: ReturnType<typeof buildDomainPalette>['blocks'];
  /**
   * The block type a member makes, or nothing for one that makes none: no
   * words, or reading the same as one before it, whose block it would be.
   */
  typeOf: (member: ActorMember) => string | undefined;
}

/** The palette for the actor in `contents`, written at `modulePath`. */
export function memberPalette(
  modulePath: string,
  contents: string,
): MemberPalette {
  const meta = parseActorOwnMeta(modulePath, contents);
  const members = membersOf(contents);
  if (!meta) {
    return {blocks: [], typeOf: () => undefined};
  }
  const {blocks} = buildDomainPalette([], {
    ownProperties: [meta],
    ownActorModule: modulePath,
  });
  // The first of each reading is the one with a block, as the metadata
  // reads them (`parseActorOwnMeta`).
  const firstOf = new Map<string, string>();
  for (const member of members) {
    const key = `${member.kind}:${designedName(member.parts)}`;
    if (!firstOf.has(key)) {
      firstOf.set(key, member.id);
    }
  }
  return {
    blocks,
    typeOf: member => {
      const name = designedName(member.parts);
      if (!name || firstOf.get(`${member.kind}:${name}`) !== member.id) {
        return undefined;
      }
      if (member.kind === 'event') {
        const event = meta.events.find(one => one.name === name);
        return event ? eventBlockType(event) : undefined;
      }
      const action = meta.actions.find(one => one.name === name);
      return action ? callBlockType(action) : undefined;
    },
  };
}

/** The members a data-shaped file holds. */
function membersOf(contents: string): readonly ActorMember[] {
  try {
    const held = JSON.parse(contents) as unknown;
    return isActorData(held) ? (held.members ?? []) : [];
  } catch {
    return [];
  }
}

/**
 * A member as it reads aloud: its words, its values in angle brackets, and a
 * line break as nothing. An event reads as its hat does, after `when` and
 * the actor it happens to.
 */
export function memberReading(member: ActorMember, actorName: string): string {
  const words = member.parts
    .map(part =>
      part.kind === 'label'
        ? part.text.trim()
        : part.kind === 'param'
          ? `⟨${part.name ?? part.type}⟩`
          : '',
    )
    .filter(Boolean)
    .join(' ');
  return member.kind === 'event' ? `when ${actorName} ${words}` : words;
}
