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

  it('setter takes a value checked to the same tag the getter reports', () => {
    // The pair has to agree: what a `Vector` variable accepts is exactly what
    // reading one can be plugged into. A mismatch is invisible until a learner
    // drags a getter into a setter and Blockly silently refuses the connection.
    const v = createTypedVariable({type: 'Vector'});
    expect(v.setterType).toBe('variables_set_Vector');
    expect(v.setterBlock.args0?.[0]).toMatchObject({
      type: 'field_variable',
      name: 'VAR',
      variableTypes: ['Vector'],
    });
    expect(v.setterBlock.args0?.[1]).toMatchObject({
      type: 'input_value',
      name: 'VALUE',
      check: 'Vector',
    });
    expect(v.setterBlock.output).toBeUndefined();
    expect(v.setterBlock.previousStatement).toBe(true);
  });

  it('setter honours an explicit output check, as the getter does', () => {
    // `check` overrides the tag for connections — a Color variable is tagged
    // `Color` but wires as Blockly's `Colour`.
    const v = createTypedVariable({type: 'Color', check: 'Colour'});
    expect(v.getterBlock.output).toBe('Colour');
    expect(v.setterBlock.args0?.[1]).toMatchObject({check: 'Colour'});
  });

  it('setter assigns through the same name table as the getter', () => {
    const v = createTypedVariable({type: 'Number'});
    const code = v.setterBlock.generator.javascript(
      {
        getFieldValue: (name: string) => (name === 'VAR' ? 'id-7' : ''),
      } as never,
      {
        getVariableName: (id: string) => `v_${id.replace(/-/g, '_')}`,
        valueToCode: () => 'other + 1',
      } as never,
      undefined as never,
    );
    expect(code).toBe('v_id_7 = other + 1;\n');
  });

  it('setter falls back to 0 for an empty socket, not to nothing', () => {
    // `x = ;` would not parse. A cleared socket is a half-finished block, and
    // the rest of the body should still generate so the learner can see it.
    const v = createTypedVariable({type: 'Number'});
    const code = v.setterBlock.generator.javascript(
      {getFieldValue: () => 'id-1'} as never,
      {getVariableName: () => 'x', valueToCode: () => ''} as never,
      undefined as never,
    );
    expect(code).toBe('x = 0;\n');
  });
});
