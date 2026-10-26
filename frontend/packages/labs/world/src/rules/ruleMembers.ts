// A rule's events and blocks on the member page (specs/RULE_EDITOR_PLAN.md,
// step 4).
//
// The page edits an actor's members (`actors/editor/MemberPage`), and a
// rule's members are the same records, owned by the rule or by one of its
// traits. So the page is handed the rule as an actor would be: every member
// of the rule in one list, the traits' included, and the rule's variables.
// That one list is the namespace the rule's members share — their blocks are
// named by the rule and their words alone (`ruleEdits`) — so two members of
// different traits may not read alike, and new ids are new across the rule.
// What the page changes comes back by id; a member it made goes to the
// definition it was opened from.

import type {MultiFileSource} from '@code-dot-org/core/api';

import {
  ACTOR_DOCUMENT,
  type ActorData,
  type ActorMember,
} from '../actors/actorData';
import type {MemberPalette} from '../actors/editor/memberPalette';
import {
  memberTypes,
  memberUses,
  renameMember,
} from '../actors/editor/memberRename';
import {
  buildDomainPalette,
  callBlockType,
  eventBlockType,
} from '../blockly/domainBlocks';
import {designedName, parseRuleMeta} from '../blockly/ruleMeta';
import {ruleSlug} from '../blockly/ruleRegistry';

import type {RuleData} from './ruleData';
import type {Owner} from './ruleEdits';

/** What a rule's block may report: a value a question gives back. */
export const RULE_REPORTS: readonly string[] = [
  'number',
  'boolean',
  'string',
  'vector',
];

/** Every member of the rule, with the definition that owns it. */
export function allMembers(
  data: RuleData,
): Array<{owner: Owner; member: ActorMember}> {
  return [
    ...(data.members ?? []).map(member => ({owner: null, member})),
    ...(data.traits ?? []).flatMap(trait =>
      (trait.members ?? []).map(member => ({owner: trait.name, member})),
    ),
  ];
}

/** The member with this id, and its owner. */
export const memberOf = (data: RuleData, id: string) =>
  allMembers(data).find(({member}) => member.id === id);

/**
 * The rule as the member page reads an actor. `name` is what an event's
 * picture reads after `when`: the rule's own events happen to the world,
 * a trait's to whatever takes it.
 */
export function asMemberHost(data: RuleData, owner: Owner): ActorData {
  const trait = (data.traits ?? []).find(one => one.name === owner);
  return {
    type: ACTOR_DOCUMENT,
    name: trait ? (trait.subject === 'camera' ? '⟨camera⟩' : '⟨actor⟩') : '',
    members: allMembers(data).map(({member}) => member),
    ...(data.variables ? {blocks: {variables: data.variables}} : {}),
  };
}

/**
 * The rule with what the page changed: each member where it was, by id; a
 * new one in `owner`'s list; one taken away gone; and the variables.
 */
export function fromMemberHost(
  data: RuleData,
  host: ActorData,
  owner: Owner,
): RuleData {
  const byId = new Map((host.members ?? []).map(member => [member.id, member]));
  const known = new Set(allMembers(data).map(({member}) => member.id));
  const kept = (members: readonly ActorMember[] | undefined, mine: boolean) => {
    const next = (members ?? []).flatMap(member => {
      const now = byId.get(member.id);
      return now ? [now] : [];
    });
    if (mine) {
      next.push(...(host.members ?? []).filter(one => !known.has(one.id)));
    }
    return next;
  };
  const listed = <T extends {members?: ActorMember[]}>(
    definition: T,
    members: ActorMember[],
  ): T => {
    const next = {...definition};
    if (members.length) {
      next.members = members;
    } else {
      delete next.members;
    }
    return next;
  };
  const variables = host.blocks?.variables;
  const next: RuleData = listed(data, kept(data.members, owner === null));
  if (data.traits) {
    next.traits = data.traits.map(trait =>
      listed(trait, kept(trait.members, owner === trait.name)),
    );
  }
  if (variables) {
    next.variables = variables;
  } else {
    delete next.variables;
  }
  return JSON.stringify(next) === JSON.stringify(data) ? data : next;
}

/**
 * The blocks a rule's members make, for an event's picture, minted from the
 * rule as the compiler reads it. A member is matched by its words and owner.
 */
export function rulePalette(
  modulePath: string,
  contents: string,
): MemberPalette {
  const meta = parseRuleMeta(modulePath, contents);
  if (!meta) {
    return {blocks: [], typeOf: () => undefined};
  }
  const {blocks} = buildDomainPalette([meta], {ownRuleModule: modulePath});
  return {
    blocks,
    typeOf: member => {
      const name = designedName(member.parts);
      if (!name) {
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

/** What a member is called on the trail: its words, or what it is. */
export function ruleMemberName(data: RuleData | undefined, id: string): string {
  const found = data && memberOf(data, id);
  const words = found ? designedName(found.member.parts) : '';
  return words || (found?.member.kind === 'event' ? 'New event' : 'New block');
}

/** The files whose code uses a member of the rule called `rule`. */
export const ruleMemberUses = (
  source: MultiFileSource,
  rule: string,
  member: ActorMember,
): string[] => memberUses(source, ruleSlug(rule), member);

/** The project with a member's uses following its new words and values. */
export const renameRuleMember = (
  source: MultiFileSource,
  rule: string,
  before: ActorMember,
  after: ActorMember,
): MultiFileSource => renameMember(source, ruleSlug(rule), before, after);

/** The block types a member of the rule called `rule` makes. */
export const ruleMemberTypes = (rule: string, member: ActorMember): string[] =>
  memberTypes(ruleSlug(rule), member);
