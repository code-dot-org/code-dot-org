// `the actor named ⟨…⟩`: one placement, by the name a map gave it.
//
// The block `any ⟨kind⟩` could not be: a pause menu's Resume and Quit are
// both Buttons, and "when the Resume button is clicked" needs to name ONE of
// them. It compiles two ways for the same reason `any ⟨kind⟩` does — a hat's
// subject socket wants something to register on that will reach an actor
// placed later, and everything else wants the actors themselves.

import {describe, expect, it} from 'vitest';

import {DOMAIN_BLOCKS} from '../domainBlocks';
import {NONE_VALUE} from '../moduleOptions';

/** A stand-in workspace whose one root is `define world` or `define actor`. */
const fileOf = (root: 'world_world' | 'world_actor') => ({
  getTopBlocks: () => [{type: root}],
});

const emit = (
  name: string,
  parentType: string,
  workspace = fileOf('world_world'),
): string => {
  const definition = DOMAIN_BLOCKS.find(b => b.type === 'world_actor_named')!;
  const [code] = definition.generator.javascript(
    {
      workspace,
      getFieldValue: (field: string) => (field === 'NAME' ? name : undefined),
      outputConnection: {
        targetConnection: {getSourceBlock: () => ({type: parentType})},
      },
    } as never,
    {definitions_: {}} as never,
    {} as never,
  ) as [string, number];
  return code;
};

const HAT = 'world_on_ActorsButton_ClickedEvent';
const VALUE = 'world_set_position';

describe('the actor named ⟨…⟩', () => {
  it('registers by name under a hat, so a later placement still hears', () => {
    expect(emit('Resume', HAT)).toBe('world.named("Resume")');
  });

  it('leaves the handler with the template in an actor file', () => {
    // No `world` at module scope there: the kind keeps it, and the world that
    // first places the kind registers it (`ActorBuilder.named`).
    expect(emit('Resume', HAT, fileOf('world_actor'))).toBe(
      'actor.named("Resume")',
    );
  });

  it('is the actors so named anywhere else', () => {
    expect(emit('Resume', VALUE)).toBe('world.actorsNamed("Resume")');
  });

  it('quotes the name, whatever the map’s author typed', () => {
    expect(emit('Pause "menu"', VALUE)).toBe(
      'world.actorsNamed("Pause \\"menu\\"")',
    );
  });

  it('names nobody when no map has placed anything yet', () => {
    // The fallback row's value: a hat about it is about the actor in scope,
    // and a value of it is empty — a statement over it does nothing.
    expect(emit(NONE_VALUE, HAT)).toBe('actor');
    expect(emit(NONE_VALUE, VALUE)).toBe('[]');
  });
});
