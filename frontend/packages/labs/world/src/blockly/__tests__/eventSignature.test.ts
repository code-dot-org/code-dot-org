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

import {inputRule} from '../../rules/stock/input';
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
    // Declared on the RULE, so it is the world's: no actor socket, and the
    // filter is the first argument rather than the second.
    const hat = hatFor(ruleWithEvent(PRESSED, KEY_VAR));

    expect(hat.message0).toBe('when %1 is pressed');
    expect(hat.args0[0]).toMatchObject({
      type: 'field_dropdown',
      name: 'FILTER0',
    });
    // `(any)` leads, because "fires for every key" has to be sayable — and as
    // an emptied socket it would be a thing a learner found by deleting a block.
    expect(hat.args0[0].options?.[0]).toEqual(['(any)', '']);
    expect(hat.args0[0].options).toContainEqual(['space', 'space']);
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
    expect(code).toContain('(world, eventValue)');
  });

  it('registers a world event on the world, with no actor', () => {
    // The whole of what an event's scope decides. This one is declared on the
    // rule, so it is about the WORLD — there is nobody it happened to, and a
    // handler is handed nobody. `rules/input` used to raise its key events once
    // per actor per frame purely to have a subject to raise them for.
    const code = codeFor(hatFor(ruleWithEvent(PRESSED, KEY_VAR)), '');

    expect(code).toContain('world.on(IsPressedEvent, (world, eventValue)');
    expect(code).not.toContain('actor');
  });
});

describe('raising an event that carries a choice', () => {
  it('takes it through a SOCKET, where the hat gives it a field', () => {
    // The distinction the two sides genuinely have: a hat picks one of the
    // choices to wait for, an emit supplies whichever the code worked out.
    // `rules/input` is the case in point — it raises its event once per key it
    // is looping over, so a dropdown has to be droppable-over here.
    const emit = emitFor(ruleWithEvent(PRESSED, KEY_VAR));

    // No `for ⟨actor⟩`: a world event happened to the world, and naming a
    // subject would be inventing one.
    expect(emit.message0).toBe('emit %1 is pressed');
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

    // Once, however many actors are in the world.
    expect(code).toBe('world.emitToWorld(IsPressedEvent, key);\n');
  });
});

describe('where a world event\u2019s hat may be placed', () => {
  // It generates `world.on(…)` at the top of the module it sits in, and only a
  // `.world` binds `world` there — it is the builder. An `.actor` module is
  // `const actor = …` and nothing else, so the same hat is a ReferenceError as
  // soon as the file is imported: the whole project stops running, over one
  // block dragged out of a category that offered it.

  /** The blocks a rule's own toolbox category lists, for a given file kind. */
  const offered = (
    meta: ReturnType<typeof ruleWithEvent>,
    fileKind?: 'actor' | 'world' | 'rule',
  ): string[] => {
    const {toolbox} = buildDomainPalette([meta], {fileKind});
    const category = (toolbox as Array<{name: string; blocks?: string[]}>).find(
      entry => entry.name === meta.name,
    );
    return category?.blocks ?? [];
  };

  /** Every block the palette DEFINES, offered or not. */
  const defined = (
    meta: ReturnType<typeof ruleWithEvent>,
    fileKind?: 'actor' | 'world' | 'rule',
  ): string[] =>
    buildDomainPalette([meta], {fileKind}).blocks.map(block => block.type);

  it('is not an actor file, for an event the rule declares', () => {
    // `ruleWithEvent` hangs its event off the rule root, so it is the world's.
    const meta = ruleWithEvent(PRESSED, KEY_VAR);
    const hat = 'world_on_Keys_IsPressedEvent';

    expect(offered(meta, 'world')).toContain(hat);
    expect(offered(meta, 'actor')).not.toContain(hat);
  });

  it('is still DEFINED in an actor file, so one already there loads', () => {
    // The same arrangement `emit` has. Withholding the definition would turn a
    // file that already holds the block from wrong into unopenable.
    const meta = ruleWithEvent(PRESSED, KEY_VAR);

    expect(defined(meta, 'actor')).toContain('world_on_Keys_IsPressedEvent');
  });

  it('offers everything when no file kind is given', () => {
    // The headless generator has no one file, and a block it fails to define
    // is a project that will not compile — so absent means offer.
    expect(offered(ruleWithEvent(PRESSED, KEY_VAR))).toContain(
      'world_on_Keys_IsPressedEvent',
    );
  });

  it('is not a rule file, which binds neither world nor actor', () => {
    // A rule module is `const rule = new RuleBuilder(…)`, and
    // `extractRuleBodies` matches a hat against none of its three roots — so a
    // hat there, and everything a learner chained under it, is dropped without
    // a word. A rule says when it acts with `during <phase>`.
    const meta = ruleWithEvent(PRESSED, KEY_VAR);
    const hat = 'world_on_Keys_IsPressedEvent';

    expect(offered(meta, 'rule')).not.toContain(hat);
    expect(defined(meta, 'rule')).toContain(hat);
  });
});

describe('an actor event\u2019s hat, in the same rule', () => {
  // `rules/input` declares its key events TWICE — on the rule, where they are
  // the world's, and under a trait, where they are an actor's. Only the first
  // kind is withheld from an `.actor`, and the starter player's jump handler is
  // the second kind, so getting this wrong takes the jump out of the palette.
  const input = parseRuleMeta('rules/input', inputRule)!;

  const offered = (
    fileKind?: 'actor' | 'world' | 'rule',
    ownRuleModule?: string,
  ) => {
    const {toolbox} = buildDomainPalette([input], {fileKind, ownRuleModule});
    const category = (toolbox as Array<{name: string; blocks?: string[]}>).find(
      entry => entry.name === 'Input',
    );
    return category?.blocks ?? [];
  };

  it('is offered in an actor file, where the world\u2019s is not', () => {
    const inActor = offered('actor');

    expect(inActor).toContain('world_on_Input_PressesEvent');
    expect(inActor).toContain('world_on_Input_ReleasesEvent');
    expect(inActor).not.toContain('world_on_Input_IsPressedEvent');
    expect(inActor).not.toContain('world_on_Input_IsReleasedEvent');
  });

  it('and a world file gets both', () => {
    const inWorld = offered('world');

    expect(inWorld).toContain('world_on_Input_PressesEvent');
    expect(inWorld).toContain('world_on_Input_IsPressedEvent');
  });

  it('and a rule file gets neither, but keeps the blocks that RAISE them', () => {
    // The category is not simply empty here — `emit` is offered while a rule is
    // being written, and declaring an event is a rule-authoring act. So the
    // hats are absent from a category that has plenty in it, which is the
    // distinction worth pinning: a rule says what happened, not what to do.
    const inRule = offered('rule', 'rules/input');

    expect(inRule).not.toContain('world_on_Input_PressesEvent');
    expect(inRule).not.toContain('world_on_Input_IsPressedEvent');
    expect(inRule).toContain('world_emit_Input_PressesEvent');
    expect(inRule).toContain('world_emit_Input_IsPressedEvent');
  });
});
