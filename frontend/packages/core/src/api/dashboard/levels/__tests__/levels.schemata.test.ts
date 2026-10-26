import {describe, expect, it} from 'vitest';

import {LevelPropertiesBaseSchema, ValidationSchema} from '../levels.schemata';

// The fields every level carries, as the server sends them.
const baseLevel = {
  id: 1,
  appName: 'music',
  type: 'Music',
  name: 'music-level',
  offerBrowserTts: null,
  showExemplarLink: null,
};

// From a Music Lab level file.
const musicValidation = {
  conditions: [
    {name: 'played_sounds_together', value: 2},
    {name: 'played_sound_id', value: 'play_sounds_together:5'},
  ],
  message: 'Nice work!',
  next: true,
  key: 'played-together',
  callout: 'run-button',
  comment: 'levelbuilder note',
};

// What Pythonlab#get_validations derives: no key.
const derivedValidation = {
  conditions: [{name: 'PASSED_ALL_TESTS', value: 'true'}],
  message: '',
  next: true,
};

describe('ValidationSchema', () => {
  it('parses a levelbuilder-written validation', () => {
    expect(ValidationSchema.parse(musicValidation)).toEqual(musicValidation);
  });

  it('parses a validation the server derives, without a key', () => {
    expect(ValidationSchema.parse(derivedValidation)).toEqual(
      derivedValidation,
    );
  });

  it('reads a condition without a value, or with a null one, as absent', () => {
    const parsed = ValidationSchema.parse({
      ...derivedValidation,
      conditions: [{name: 'played_any'}, {name: 'played_none', value: null}],
    });
    expect(parsed.conditions).toStrictEqual([
      {name: 'played_any'},
      {name: 'played_none'},
    ]);
  });

  it('rejects a validation without next', () => {
    const withoutNext: Partial<typeof derivedValidation> = {
      ...derivedValidation,
    };
    delete withoutNext.next;
    expect(() => ValidationSchema.parse(withoutNext)).toThrow();
  });
});

describe('LevelPropertiesBaseSchema validations', () => {
  it('types the validations it carries', () => {
    const parsed = LevelPropertiesBaseSchema.parse({
      ...baseLevel,
      validations: [musicValidation, derivedValidation],
    });
    expect(parsed.validations).toHaveLength(2);
    expect(parsed.validations?.[0].conditions[0].value).toBe(2);
  });

  it('allows a level without validations', () => {
    expect(
      LevelPropertiesBaseSchema.parse(baseLevel).validations,
    ).toBeUndefined();
  });
});
