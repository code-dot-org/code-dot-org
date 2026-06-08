import type * as Blockly from 'blockly/core';
import {describe, expect, it} from 'vitest';

import {PluginType} from '../plugins';

import {createReactField} from './createReactField';
import type {ReactFieldConfig} from './createReactField';

/*
 * createReactField's field logic — construction, fromJson, save/loadState, and
 * getText — is plain field behavior with no DOM, so it runs in jsdom. The React
 * editor and SVG preview paths need a rendered block; they live in the browser
 * test.
 */

interface Value {
  n: number;
}

const Editor = () => null;

// Build a field plugin, overriding everything except the required config.
const build = (
  overrides: Partial<
    Omit<ReactFieldConfig<Value>, 'name' | 'defaultValue' | 'Editor'>
  > = {},
) =>
  createReactField<Value>({
    name: 'field_test',
    defaultValue: {n: 0},
    Editor,
    ...overrides,
  });

interface FieldInstance extends Blockly.Field {
  saveState(): unknown;
  loadState(state: unknown): void;
  getText(): string;
  getValue(): Value;
}

const fieldClassOf = (plugin: ReturnType<typeof build>) =>
  plugin.field as unknown as {
    new (value?: Value): FieldInstance;
    fromJson(options: {currentValue?: Value}): FieldInstance;
  };

describe('createReactField', () => {
  it('returns a field plugin wrapping the generated class', () => {
    const plugin = build();
    expect(plugin.type).toBe(PluginType.Field);
    expect(plugin.name).toBe('field_test');
    expect(typeof plugin.field).toBe('function');
  });

  it('fromJson uses currentValue, falling back to the default', () => {
    const Field = fieldClassOf(build());
    expect(Field.fromJson({}).getValue()).toEqual({n: 0});
    expect(Field.fromJson({currentValue: {n: 7}}).getValue()).toEqual({n: 7});
  });

  it('constructs with the default value', () => {
    const Field = fieldClassOf(build());
    expect(new Field().getValue()).toEqual({n: 0});
  });

  describe('serialization', () => {
    it('round-trips the value as-is by default', () => {
      const Field = fieldClassOf(build());
      const field = new Field({n: 5});

      expect(field.saveState()).toEqual({n: 5});

      field.loadState({n: 9});
      expect(field.getValue()).toEqual({n: 9});
    });

    it('honors custom saveState/loadState', () => {
      const Field = fieldClassOf(
        build({
          saveState: value => value.n, // serialize down to the number
          loadState: state => ({n: state as number}),
        }),
      );
      const field = new Field({n: 5});

      expect(field.saveState()).toBe(5);

      field.loadState(9);
      expect(field.getValue()).toEqual({n: 9});
    });
  });

  describe('getText', () => {
    it('uses the configured getText', () => {
      const Field = fieldClassOf(build({getText: value => `count=${value.n}`}));
      expect(new Field({n: 3}).getText()).toBe('count=3');
    });

    it('falls back to the base field text when none is given', () => {
      const Field = fieldClassOf(build());
      expect(typeof new Field({n: 3}).getText()).toBe('string');
    });
  });
});
