import {describe, expect, it} from 'vitest';

import {createTypedVariable} from '../createTypedVariable';

describe('createTypedVariable', () => {
  it('derives defaults from the type tag', () => {
    const v = createTypedVariable({type: 'Actor'});
    expect(v.type).toBe('Actor');
    expect(v.getterType).toBe('variables_get_Actor');
    expect(v.getterBlock.type).toBe('variables_get_Actor');
    // `check` defaults to the type tag, so a read only plugs into `Actor` sockets.
    expect(v.getterBlock.output).toBe('Actor');
    expect(v.getterBlock.style).toBe('variable_blocks');
    expect(v.getterBlock.message0).toBe('%1');
  });

  it('honours overrides', () => {
    const v = createTypedVariable({
      type: 'Sprite',
      check: 'SpriteRef',
      style: 'sprite_blocks',
      getterType: 'get_sprite',
      message0: 'the %1',
      defaultName: 'thing',
    });
    expect(v.getterType).toBe('get_sprite');
    expect(v.getterBlock.output).toBe('SpriteRef');
    expect(v.getterBlock.style).toBe('sprite_blocks');
    expect(v.getterBlock.message0).toBe('the %1');
    expect(v.field('VAR')).toMatchObject({variable: 'thing'});
  });

  it('field() binds a type-restricted field_variable', () => {
    const v = createTypedVariable({type: 'Actor', defaultName: 'actor'});
    expect(v.field('LOOP')).toEqual({
      type: 'field_variable',
      name: 'LOOP',
      variable: 'actor',
      variableTypes: ['Actor'],
      defaultType: 'Actor',
    });
    // An explicit default-name override.
    expect(v.field('LOOP', {variable: 'other'})).toMatchObject({
      variable: 'other',
    });
    // The getter reads through the same typed field.
    expect(v.getterBlock.args0?.[0]).toMatchObject({
      type: 'field_variable',
      name: 'VAR',
      variableTypes: ['Actor'],
      defaultType: 'Actor',
    });
  });

  it('getter emits the mapped variable name as an atomic expression', () => {
    const v = createTypedVariable({type: 'Actor'});
    const block = {
      getFieldValue: (name: string) => (name === 'VAR' ? 'id-42' : ''),
    };
    const generator = {
      getVariableName: (id: string) => `v_${id.replace(/-/g, '_')}`,
    };
    const code = v.getterBlock.generator.javascript(
      block as never,
      generator as never,
      undefined as never,
    );
    // [expression, Order.ATOMIC] — Order.ATOMIC === 0.
    expect(code).toEqual(['v_id_42', 0]);
  });
});
