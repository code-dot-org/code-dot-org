// An event's phrasing, and the filter in it (specs/ENUMS.md step 4).
//
// `define event` is designed like `define block`: labels are its wording, and a
// parameter is what a handler filters on. The hat shows that enum's choices
// with `(any)` at the front, and generates the guard a learner would otherwise
// write themselves — which is the difference between
//
//   when any Player a key is pressed / if (event value) = (key ⟨space⟩) / …
//
// and
//
//   when any Player ⟨space⟩ is pressed / …

import {describe, expect, it} from 'vitest';

import {buildDomainPalette} from '../domainBlocks';
import {parseRuleMeta} from '../ruleMeta';
import {shadowsFor} from '../valueShadow';

/** A `.rule` whose one event carries the given phrasing. */
const ruleWithEvent = (
  event: {parts: unknown[]},
  variables: Array<{id: string; name: string; type: string}> = [],
) =>
  parseRuleMeta(
    'rules/keys',
    JSON.stringify({
      variables,
      blocks: {
        blocks: [
          {
            type: 'world_rule',
            fields: {NAME: 'Keys', ABILITY: 'Responds to Keys'},
            next: {
              block: {
                type: 'world_rule_event',
                extraState: {parts: event.parts},
              },
            },
          },
        ],
      },
    }),
  )!;

const PRESSED = {
  parts: [
    {kind: 'param', type: 'enum:Engine#Key', var: 'k'},
    {kind: 'label', text: 'is pressed'},
  ],
};
const KEY_VAR = [{id: 'k', name: 'key', type: 'String'}];

/** The hat block this rule's event makes (the built-ins' hats are in there too). */
const hatFor = (meta: ReturnType<typeof ruleWithEvent>) => {
  const {blocks} = buildDomainPalette([meta]);
  return blocks.find(block => block.type.startsWith('world_on_Keys_')) as {
    type: string;
    message0: string;
    args0: Array<{
      type: string;
      name: string;
      options?: Array<[string, string]>;
    }>;
    generator: {
      javascript: (block: unknown, generator: unknown, env: unknown) => string;
    };
  };
};

/** Generate the hat's code with `filter` picked in its dropdown. */
const codeFor = (
  hat: ReturnType<typeof hatFor>,
  filter: string,
  body = 'log("hi");\n',
) =>
  hat.generator.javascript(
    {
      getFieldValue: (name: string) => (name === 'FILTER0' ? filter : null),
      getNextBlock: () => ({}),
    },
    {
      valueToCode: () => 'Player',
      blockToCode: () => body,
      definitions_: {},
    },
    {},
  );

/** The block that RAISES this rule's event. */
const emitFor = (meta: ReturnType<typeof ruleWithEvent>) => {
  const {blocks} = buildDomainPalette([meta]);
  return blocks.find(block => block.type.startsWith('world_emit_Keys_')) as {
    type: string;
    message0: string;
    args0: Array<{type: string; name: string; check?: string}>;
    generator: {
      javascript: (block: unknown, generator: unknown, env: unknown) => string;
    };
  };
};

describe('an event with a designed phrasing', () => {
  it('is named by its labels, not by the whole phrase', () => {
    const meta = ruleWithEvent(PRESSED, KEY_VAR);

    expect(meta.events[0].name).toBe('is pressed');
    expect(meta.events[0].parts).toEqual([
      {kind: 'param', name: 'key', type: 'enum:Engine#Key'},
      {kind: 'label', text: 'is pressed'},
    ]);
  });

  it('puts the choices on the hat, with `(any)` first', () => {
    const hat = hatFor(ruleWithEvent(PRESSED, KEY_VAR));

    expect(hat.message0).toBe('when %1 %2 is pressed');
    expect(hat.args0[1]).toMatchObject({
      type: 'field_dropdown',
      name: 'FILTER0',
    });
    // `(any)` leads, because "fires for every key" has to be sayable — and as
    // an emptied socket it would be a thing a learner found by deleting a block.
    expect(hat.args0[1].options?.[0]).toEqual(['(any)', '']);
    expect(hat.args0[1].options).toContainEqual(['space', 'space']);
  });

  it('generates the guard the learner would have written', () => {
    const hat = hatFor(ruleWithEvent(PRESSED, KEY_VAR));

    const code = codeFor(hat, 'space');

    expect(code).toContain('if (eventValue !== "space") return;');
    expect(code).toContain('log("hi");');
    // The guard is INSIDE the handler, before the body — a filter, not a
    // different registration.
    expect(code.indexOf('eventValue !==')).toBeLessThan(code.indexOf('log('));
  });

  it('generates no guard for `(any)`', () => {
    // Which is what an event with no filter has always done, so the two are one
    // block with a different word in it.
    const hat = hatFor(ruleWithEvent(PRESSED, KEY_VAR));

    // The handler still RECEIVES the value — its closure takes one either way,
    // and `event value` reads it. What `(any)` drops is the guard.
    const code = codeFor(hat, '');
    expect(code).not.toContain('eventValue !==');
    expect(code).toContain('(world, actor, eventValue)');
  });
});

describe('raising an event that carries a choice', () => {
  it('takes it through a SOCKET, where the hat gives it a field', () => {
    // The distinction the two sides genuinely have: a hat picks one of the
    // choices to wait for, an emit supplies whichever the code worked out.
    // `rules/input` is the case in point — it raises its event once per key it
    // is looping over, so a dropdown has to be droppable-over here.
    const emit = emitFor(ruleWithEvent(PRESSED, KEY_VAR));

    expect(emit.message0).toBe('emit %1 is pressed for %2');
    expect(emit.args0[0]).toMatchObject({
      type: 'input_value',
      name: 'VALUE',
      check: 'String',
    });
    expect(shadowsFor(emit.type)?.[0]?.shadow).toMatchObject({
      type: 'world_choice_Engine_Key',
    });
  });

  it('passes what is plugged in as the event’s value', () => {
    const emit = emitFor(ruleWithEvent(PRESSED, KEY_VAR));

    const code = emit.generator.javascript(
      {getFieldValue: () => null} as never,
      {
        definitions_: {},
        valueToCode: (_block: unknown, name: string) =>
          name === 'ACTOR' ? 'each' : 'key',
      } as never,
      {} as never,
    ) as string;

    expect(code).toBe('world.emit(IsPressedEvent, each, key);\n');
  });
});
