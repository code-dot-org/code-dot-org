// A rename reaches a hat whose subject is a property
// (specs/PROPERTY_SUBJECTS_PLAN.md, step 4), and an actor's own keys.

import {describe, expect, it} from 'vitest';

import type {MultiFileSource} from '@code-dot-org/core/api';

import type {ActorData} from '../../actors/actorData';
import {actorDocument} from '../../actors/actorDocument';
import {renameReferences} from '../../files/renameThing';
import type {RuleData} from '../../rules/ruleData';
import {renameRuleInSource} from '../renameRule';
import {rewriteWorkspace} from '../rewriteWorkspaces';

const hat = (subject: string) =>
  JSON.stringify({
    blocks: {
      blocks: [
        {type: 'world_on_Health_IsDamagedEvent', fields: {SUBJECT: subject}},
      ],
    },
  });

describe('a hat about a property, renamed', () => {
  it('follows the property’s getter, which names it', () => {
    const renamed = rewriteWorkspace(
      hat('world_get_ScreensMain_CurrentPlayerProperty'),
      {
        type: type => type.replace('CurrentPlayerProperty', 'HeroProperty'),
        fields() {},
      },
    )!;
    expect(JSON.parse(renamed).blocks.blocks[0].fields.SUBJECT).toBe(
      'world_get_ScreensMain_HeroProperty',
    );
  });

  it('leaves a kind to the rename that moves paths', () => {
    const seen: string[] = [];
    rewriteWorkspace(hat('actors/player'), {
      type: type => {
        seen.push(type);
        return type;
      },
      fields() {},
    });
    expect(seen).toEqual(['world_on_Health_IsDamagedEvent']);
  });
});

/** A project holding one actor, as data. */
const holding = (contents: string): MultiFileSource => ({
  folders: {f: {id: 'f', name: 'actors', parentId: '0', open: true}},
  files: {
    hero: {
      id: 'hero',
      name: 'hero.actor',
      language: 'actor',
      folderId: 'f',
      contents,
    },
  },
  openFiles: [],
});

const HERO = actorDocument({
  name: 'Hero',
  actsLike: 'actors/label',
  traits: ['Gravity#AffectedByGravityTrait'],
  sprite: 'coin.png',
  values: [
    {setter: 'world_set_ActorsLabel_TextProperty', type: 'string', value: 'hi'},
    {setter: 'world_set_Gravity_PullProperty', type: 'number', value: 2},
    {
      setter: 'world_set_ActorsHero_IconProperty',
      type: 'picture',
      value: 'coin.png',
    },
  ],
  effects: [{effect: 'effects/ripple', on: false}],
});

const heroIn = (source: MultiFileSource): ActorData =>
  JSON.parse(source.files.hero.contents) as ActorData;

describe('an actor’s own keys, renamed', () => {
  it('follows an actor renamed: its parent and the setters it inherits', () => {
    const hero = heroIn(
      renameReferences(holding(HERO), {
        from: 'actors/label',
        to: 'actors/sign',
      }),
    );

    expect(hero.actsLike).toBe('actors/sign');
    expect(hero.values?.[0].setter).toBe('world_set_ActorsSign_TextProperty');
  });

  it('follows a rule renamed: its trait and its setters', () => {
    const hero = heroIn(renameRuleInSource(holding(HERO), 'Gravity', 'Weight'));

    expect(hero.traits).toEqual(['Weight#AffectedByGravityTrait']);
    expect(hero.values?.[1].setter).toBe('world_set_Weight_PullProperty');
  });

  it('follows a picture renamed: its look and a value that names it', () => {
    const hero = heroIn(
      renameReferences(holding(HERO), {from: 'coin.png', to: 'gem.png'}),
    );

    expect(hero.animations?.Main.tracks.sprite?.[0].value).toBe('gem.png');
    expect(hero.values?.[2]).toMatchObject({type: 'picture', value: 'gem.png'});
  });

  it('follows an effect renamed, and keeps it off', () => {
    const hero = heroIn(
      renameReferences(holding(HERO), {
        from: 'effects/ripple',
        to: 'effects/wave',
      }),
    );

    expect(hero.effects).toEqual([{effect: 'effects/wave', on: false}]);
  });

  it('leaves an actor that names none of it as it was', () => {
    const source = holding(HERO);

    expect(
      renameReferences(source, {from: 'actors/coin', to: 'actors/gem'}),
    ).toBe(source);
  });
});

describe('a rule’s own keys, renamed', () => {
  const KEYS: RuleData = {
    type: 'rule',
    name: 'Keys',
    ability: 'Has Keys',
    uses: ['Gravity'],
    steps: [
      {
        name: 'fall',
        phase: 'move',
        body: {
          type: 'world_set_Gravity_StrengthProperty',
          inputs: {
            VALUE: {shadow: {type: 'math_number', fields: {NUM: 2}}},
          },
        },
      },
    ],
    traits: [{name: 'Opens', uses: ['Gravity#AffectedByGravityTrait']}],
  };
  const project = (): MultiFileSource => ({
    folders: {f: {id: 'f', name: 'rules', parentId: '0', open: true}},
    files: {
      keys: {
        id: 'keys',
        name: 'keys.rule',
        language: 'rule',
        folderId: 'f',
        contents: JSON.stringify(KEYS),
      },
    },
    openFiles: [],
  });
  const keysIn = (source: MultiFileSource): RuleData =>
    JSON.parse(source.files.keys.contents) as RuleData;

  it('follows a rule it uses: the use, a trait’s use and a body', () => {
    const keys = keysIn(renameRuleInSource(project(), 'Gravity', 'Weight'));

    expect(keys.uses).toEqual(['Weight']);
    expect(keys.traits?.[0].uses).toEqual(['Weight#AffectedByGravityTrait']);
    expect(keys.steps?.[0].body?.type).toBe(
      'world_set_Weight_StrengthProperty',
    );
  });

  it('follows its own name', () => {
    expect(keysIn(renameRuleInSource(project(), 'Keys', 'Locks')).name).toBe(
      'Locks',
    );
  });
});
