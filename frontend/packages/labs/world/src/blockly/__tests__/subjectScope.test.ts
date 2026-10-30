// Which actor properties a hat may be about, by the file it is in
// (specs/PROPERTY_SUBJECTS_PLAN.md, step 4).

import {describe, expect, it} from 'vitest';

import {registerSubjectProperty, subjectOptions} from '../eventSubject';
import type {PropertyMeta} from '../ruleMeta';

const property = (
  name: string,
  modulePath: string,
  scope: 'world' | 'actor',
): PropertyMeta =>
  ({
    id: name,
    name,
    type: 'actor',
    scope,
    ref: {source: 'project', modulePath, exportName: `${name}Property`},
  }) as unknown as PropertyMeta;

registerSubjectProperty(
  'test_get_game_player',
  property('current player', 'screens/main', 'world'),
);
registerSubjectProperty(
  'test_get_settings_pick',
  property('picked', 'screens/settings', 'world'),
);
registerSubjectProperty(
  'test_get_bar_subject',
  property('subject', 'actors/healthBar', 'actor'),
);

/** The subject field of a hat in a workspace tagged as editing `file`. */
const fieldIn = (file?: string, actor?: string, held = '', withheld = false) =>
  ({
    getSourceBlock: () => ({
      workspace: {
        __editingFileModule: file,
        __editingActorModule: actor,
        __subjectPropertiesWithheld: withheld,
      },
      getFieldValue: () => held,
    }),
  }) as never;

const offered = (
  file?: string,
  actor?: string,
  held?: string,
  withheld?: boolean,
) =>
  subjectOptions(fieldIn(file, actor, held, withheld))
    .map(([, value]) => value)
    .filter(value => String(value).startsWith('test_get_'));

describe('the properties a hat may be about', () => {
  it('are the game’s everywhere', () => {
    expect(offered('maps/level')).toEqual(['test_get_game_player']);
  });

  it('are a screen’s own in that screen’s code', () => {
    expect(offered('screens/settings')).toEqual([
      'test_get_game_player',
      'test_get_settings_pick',
    ]);
  });

  it('are the placement’s own in its code', () => {
    expect(offered('screens/main', 'actors/healthBar')).toEqual([
      'test_get_game_player',
      'test_get_bar_subject',
    ]);
  });

  it('keep the one a hat already holds, wherever it is', () => {
    expect(offered('maps/level', undefined, 'test_get_bar_subject')).toEqual([
      'test_get_game_player',
      'test_get_bar_subject',
    ]);
  });

  it('are all of them where no file is said, as the generator loads', () => {
    expect(offered(undefined)).toEqual([
      'test_get_game_player',
      'test_get_settings_pick',
      'test_get_bar_subject',
    ]);
  });

  it('are none while the shelf withholds them, but the one a hat holds', () => {
    expect(offered('maps/level', undefined, '', true)).toEqual([]);
    expect(
      offered('maps/level', undefined, 'test_get_game_player', true),
    ).toEqual(['test_get_game_player']);
  });
});
