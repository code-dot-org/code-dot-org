import type * as Blockly from 'blockly/core';
import {describe, expect, it} from 'vitest';

import {PluginType} from '../../plugins';

import {createReactField} from '../createReactField';
import type {ReactFieldConfig} from '../createReactField';

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
    ariaLabel: 'test field',
    getAriaValue: value => `value ${value.n}`,
    ...overrides,
  });

interface FieldInstance extends Blockly.Field {
  saveState(): unknown;
  loadState(state: unknown): void;
  getText(): string;
  getValue(): Value;
  getAriaTypeName(): string | null;
  getAriaValue(): string | null;
  computeAriaLabel(includeTypeInfo?: boolean): string;
}

const fieldClassOf = (plugin: ReturnType<typeof build>) =>
  plugin.field as unknown as {
    new (value?: Value): FieldInstance;
    fromJson(options: {currentValue?: Value}): FieldInstance;
  };

describe('react-fields.md: createReactField', () => {
  it('RF-1: returns a field plugin wrapping the generated class', () => {
    const plugin = build();
    expect(plugin.type).toBe(PluginType.Field);
    expect(plugin.name).toBe('field_test');
    expect(typeof plugin.field).toBe('function');
  });

  it('RF-3: fromJson uses currentValue, falling back to the default', () => {
    const Field = fieldClassOf(build());
    expect(Field.fromJson({}).getValue()).toEqual({n: 0});
    expect(Field.fromJson({currentValue: {n: 7}}).getValue()).toEqual({n: 7});
  });

  it('RF-3: constructs with the default value', () => {
    const Field = fieldClassOf(build());
    expect(new Field().getValue()).toEqual({n: 0});
  });

  it('RF-3: resolves a function defaultValue lazily on each construction', () => {
    let calls = 0;
    const Field = fieldClassOf(
      createReactField<Value>({
        name: 'field_lazy',
        defaultValue: () => ({n: ++calls}),
        Editor,
        ariaLabel: 'lazy field',
        getAriaValue: value => `value ${value.n}`,
      }),
    );

    // Not evaluated at plugin-creation time.
    expect(calls).toBe(0);

    // Resolved fresh on each construction and each fromJson fallback.
    expect(new Field().getValue()).toEqual({n: 1});
    expect(Field.fromJson({}).getValue()).toEqual({n: 2});

    // An explicit currentValue still takes precedence over the default.
    expect(Field.fromJson({currentValue: {n: 99}}).getValue()).toEqual({n: 99});
    expect(calls).toBe(2);
  });

  describe('serialization', () => {
    it('RF-4: round-trips the value as-is by default', () => {
      const Field = fieldClassOf(build());
      const field = new Field({n: 5});

      expect(field.saveState()).toEqual({n: 5});

      field.loadState({n: 9});
      expect(field.getValue()).toEqual({n: 9});
    });

    it('RF-4: honors custom saveState/loadState', () => {
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
    it('RF-5: uses the configured getText', () => {
      const Field = fieldClassOf(build({getText: value => `count=${value.n}`}));
      expect(new Field({n: 3}).getText()).toBe('count=3');
    });

    it('RF-5: falls back to the base field text when none is given', () => {
      const Field = fieldClassOf(build());
      expect(typeof new Field({n: 3}).getText()).toBe('string');
    });
  });

  describe('aria', () => {
    it('RF-6: reports the configured ariaLabel as the field type name', () => {
      const Field = fieldClassOf(build({ariaLabel: 'tune editor'}));
      expect(new Field().getAriaTypeName()).toBe('tune editor');
    });

    it('RF-6: announces the value via the configured getAriaValue', () => {
      const Field = fieldClassOf(
        build({getAriaValue: value => `count ${value.n}`}),
      );
      expect(new Field({n: 5}).getAriaValue()).toBe('count 5');
    });

    it('RF-6: composes a verbose label from the type and value', () => {
      const Field = fieldClassOf(
        build({ariaLabel: 'tune editor', getAriaValue: () => 'three notes'}),
      );
      const label = new Field().computeAriaLabel(true);
      expect(label).toContain('tune editor');
      expect(label).toContain('three notes');
    });
  });
});
