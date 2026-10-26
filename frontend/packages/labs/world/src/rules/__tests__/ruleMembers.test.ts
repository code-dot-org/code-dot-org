// A rule's events and blocks on the member page (specs/RULE_EDITOR_PLAN.md,
// step 4).

import {describe, expect, it} from 'vitest';

import type {MultiFileSource, ProjectFile} from '@code-dot-org/core/api';

import type {ActorMember} from '../../actors/actorData';
import {addMember, newMember, setMember} from '../../actors/editor/memberEdits';
import type {RuleData} from '../ruleData';
import {
  asMemberHost,
  fromMemberHost,
  renameRuleMember,
  ruleMemberName,
  ruleMemberTypes,
} from '../ruleMembers';

const word = (text: string) => ({kind: 'label' as const, text});

const ready: ActorMember = {
  id: 'block-0',
  kind: 'block',
  parts: [word('is ready?')],
  returns: 'boolean',
  body: {type: 'world_return'},
};
const fired: ActorMember = {
  id: 'event-1',
  kind: 'event',
  parts: [word('fires')],
};

const timer = (): RuleData => ({
  type: 'rule',
  name: 'Time',
  ability: 'Has Time',
  members: [fired],
  traits: [{name: 'Cools Down', members: [ready]}],
  variables: [{id: 'v1', name: 'left', type: 'Number'}],
});

describe('a rule on the member page', () => {
  it('is every member of the rule, with its variables', () => {
    const host = asMemberHost(timer(), 'Cools Down');
    expect(host.members).toEqual([fired, ready]);
    expect(host.blocks?.variables).toEqual(timer().variables);
    expect(host.name).toBe('⟨actor⟩');
  });

  it('comes back with each member where it was', () => {
    const data = timer();
    const host = asMemberHost(data, null);
    const changed = setMember(host, {...ready, description: 'Whether.'});
    const next = fromMemberHost(data, changed, null);
    expect(next.traits![0].members).toEqual([
      {...ready, description: 'Whether.'},
    ]);
    expect(next.members).toEqual([fired]);
  });

  it('puts a new member in the definition it was made from', () => {
    const data = timer();
    const host = asMemberHost(data, 'Cools Down');
    const made = newMember(host, 'event');
    const next = fromMemberHost(data, addMember(host, made), 'Cools Down');
    expect(next.traits![0].members!.map(one => one.id)).toEqual([
      'block-0',
      made.id,
    ]);
    expect(next.members).toEqual([fired]);
    expect(fromMemberHost(data, asMemberHost(data, null), null)).toBe(data);
  });
});

describe('a rule’s member', () => {
  it('is asked as a question when it reports a value', () => {
    expect(ruleMemberTypes('Time', ready)).toEqual([
      'world_query_Time_IsReadyQuery',
    ]);
    expect(ruleMemberTypes('Time', fired)).toEqual([
      'world_on_Time_FiresEvent',
      'world_emit_Time_FiresEvent',
    ]);
  });

  it('is named on the trail by its words', () => {
    expect(ruleMemberName(timer(), 'block-0')).toBe('is ready?');
    expect(ruleMemberName(timer(), 'nothing')).toBe('New block');
  });

  it('takes its uses to its new words', () => {
    const file = (contents: unknown): ProjectFile => ({
      id: 'w',
      name: 'main.world',
      folderId: '0',
      language: 'world',
      contents: JSON.stringify(contents),
    });
    const source: MultiFileSource = {
      folders: {},
      files: {
        w: file({
          blocks: {
            languageVersion: 0,
            blocks: [{type: 'world_query_Time_IsReadyQuery'}],
          },
        }),
      },
      openFiles: [],
    };
    const next = renameRuleMember(source, 'Time', ready, {
      ...ready,
      parts: [word('can go?')],
    });
    expect(next.files.w.contents).toContain('world_query_Time_CanGoQuery');
  });
});
