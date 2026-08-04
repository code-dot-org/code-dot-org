// The enum model (specs/ENUMS.md step 1).
//
// An enum is an authoring construct: a named set of string choices, which the
// edit surface turns into a dropdown and generated code never mentions. These
// pin down what a reference to one means and how a parameter carries it.

import {afterEach, describe, expect, it} from 'vitest';

import {
  allEnums,
  enumByRef,
  enumOptions,
  enumParamType,
  enumRef,
  enumRefOfParamType,
  KEY_ENUM,
  registerProjectEnums,
  type EnumMeta,
} from '../enums';

const GUSTS: EnumMeta = {
  owner: 'Wind',
  name: 'Gusts',
  options: [
    ['breeze', 'breeze'],
    ['gale', 'gale'],
  ],
};

describe('enum references', () => {
  afterEach(() => registerProjectEnums([]));

  it('names an enum by its owner and name', () => {
    // The same shape a member reference has, and for the same reason: a rule
    // can be renamed or moved and what a block stored still resolves.
    expect(enumRef(KEY_ENUM)).toBe('Engine#Key');
    expect(enumByRef('Engine#Key')).toBe(KEY_ENUM);
  });

  it('resolves a project enum once the project declares it', () => {
    expect(enumByRef('Wind#Gusts')).toBeUndefined();

    registerProjectEnums([GUSTS]);

    expect(enumByRef('Wind#Gusts')).toBe(GUSTS);
    expect(allEnums()).toEqual([KEY_ENUM, GUSTS]);
  });

  it('gives an unknown reference no options rather than throwing', () => {
    // A block may name an enum from a rule the learner is halfway through
    // writing; a half-written project still has to render.
    expect(enumOptions('Wind#Gusts')).toEqual([]);
  });
});

describe('the Key enum', () => {
  it('is what the driver reports, under a label a learner reads', () => {
    // The two differ and have to: the space bar reads `space` and IS `" "`.
    expect(enumOptions('Engine#Key')).toContainEqual(['space', ' ']);
    expect(enumOptions('Engine#Key')).toContainEqual(['up arrow', 'ArrowUp']);
    expect(enumOptions('Engine#Key')).toContainEqual(['A', 'a']);
  });
});

describe('enums as parameter types', () => {
  it('round-trips through a parameter type', () => {
    const type = enumParamType('Engine#Key');

    expect(enumRefOfParamType(type)).toBe('Engine#Key');
  });

  it('leaves a plain type alone', () => {
    // Everything that reads a parameter type keeps working: a `vector` is a
    // vector, and only the `enum:` prefix means otherwise.
    expect(enumRefOfParamType('vector')).toBeUndefined();
    expect(enumRefOfParamType('string')).toBeUndefined();
  });
});
