// A rule's bodies, laid out to be compiled (specs/COMPILE_FROM_DATA_PLAN.md,
// step 1).
//
// The generator needs a body's blocks loaded, but nothing above them: a
// body under the head its page draws (`memberHead`, `stepHead`) generates
// what it did under its `define` row. Scope, owner and id come from the data
// and decide only the key a body is filed under (`ruleBodyKey`).

import type {ActorMember, Block} from '../actors/actorData';
import {MEMBER_HEAD, STEP_HEAD} from '../blockly/bodySurfaces';
import {
  designedName,
  ruleBodyKey,
  slug,
  type MemberScope,
} from '../blockly/ruleMeta';

import type {RuleData, RuleStep} from './ruleData';

/** One body to generate: the head it hangs from, and where it is filed. */
export interface RuleBodyAt {
  key: string;
  /** The id of its head in the sheet. */
  head: string;
  /** The variables its closure takes, in order; none for a step. */
  params: string[];
}

export interface RuleBodySheet {
  /** A workspace: each body under its head, and the rule's variables. */
  workspace: {
    blocks: {languageVersion: 0; blocks: Block[]};
    variables?: unknown[];
  };
  /** In the order the rule's view generated them. */
  bodies: RuleBodyAt[];
}

/** Every body of a rule, each under a head of its own. */
export function ruleBodySheet(data: RuleData): RuleBodySheet {
  const heads: Block[] = [];
  const bodies: RuleBodyAt[] = [];
  const add = (key: string, head: Block, params: string[]) => {
    const id = `body-${heads.length}`;
    heads.push({...head, id, x: 20, y: 20 + heads.length * 200});
    bodies.push({key, head: id, params});
  };
  const below = (body: Block | undefined) =>
    body ? {next: {block: body}} : {};
  const visit = (
    members: readonly ActorMember[],
    steps: readonly RuleStep[],
    scope: MemberScope,
    owner: string | undefined,
  ) => {
    for (const member of members) {
      const id = slug(designedName(member.parts));
      if (member.kind !== 'block' || !id) {
        continue;
      }
      const kind =
        member.returns && member.returns !== 'none' ? 'query' : 'action';
      add(
        ruleBodyKey(kind, scope, owner, id),
        {
          type: MEMBER_HEAD,
          extraState: {parts: member.parts},
          ...below(member.body),
        },
        member.parts.flatMap(part => (part.kind === 'param' ? [part.var] : [])),
      );
    }
    for (const step of steps) {
      const id = slug(step.name);
      if (id) {
        add(
          ruleBodyKey('step', scope, owner, id),
          {type: STEP_HEAD, ...below(step.body)},
          [],
        );
      }
    }
  };
  visit(data.members ?? [], data.steps ?? [], 'world', undefined);
  for (const trait of data.traits ?? []) {
    visit(
      trait.members ?? [],
      trait.steps ?? [],
      trait.subject === 'camera' ? 'camera' : 'actor',
      slug(trait.name),
    );
  }
  return {
    workspace: {
      blocks: {languageVersion: 0, blocks: heads},
      ...(data.variables ? {variables: data.variables} : {}),
    },
    bodies,
  };
}
