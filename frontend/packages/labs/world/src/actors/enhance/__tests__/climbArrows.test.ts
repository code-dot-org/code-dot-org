// Climbing with the arrow keys — as edits, and then as a game.
//
// The control scheme used to be a trait of the Climbing rule, which made the
// rule depend on Input and left the key bindings somewhere a learner could
// neither see nor change. It is an enhancement now, so what lands is blocks in
// the actor's own file — and the half that cannot be checked by reading is
// whether those blocks actually climb.

import {describe, expect, it} from 'vitest';

import {compileProject} from '../../../__tests__/support/compileProject';
import {WORLD_SCENARIOS} from '../../../fixtures/scenarios';
import {fileIdAt, projectFiles} from '../../../runtime/projectFiles';
import {importStockActor} from '../../importStockActor';
import {stockActorById} from '../../stock';
import {climbArrowsEnhancement} from '../climbArrows';

const HERO = {
  kind: 'actor' as const,
  path: 'actors/player',
  name: 'Platformer Player',
};

const withPlayer = () =>
  importStockActor(WORLD_SCENARIOS.empty.source, stockActorById('player')!)
    .source;

const at = (source: ReturnType<typeof withPlayer>, path: string) => {
  const id = fileIdAt(source, path);
  return id ? source.files[id].contents : undefined;
};

describe('the climb-arrows enhancement, as edits', () => {
  it('gives the actor both traits and the four handlers', () => {
    const after = climbArrowsEnhancement.apply(withPlayer(), HERO);
    const actor = at(after, 'actors/player.actor')!;

    expect(actor).toContain('Climbing#ClimbsTrait');
    expect(actor).toContain('Input#TakesKeyboardInputTrait');
    // HATS, not a poll: two presses and the two releases that end them.
    expect(actor).toContain('world_on_Input_PressesEvent');
    expect(actor).toContain('world_on_Input_ReleasesEvent');
    expect(actor).not.toContain('world_is_key_down');
    expect(actor).toContain('world_do_Climbing_StartClimbingUpAction');
    expect(actor).toContain('world_do_Climbing_StartClimbingDownAction');
    // …and a release that names its DIRECTION, so letting go of one arrow
    // cannot cancel a climb the other arrow started on the same frame
    // (`rules/climb`, and the ladder in `jetpackPlays`).
    expect(actor).toContain('world_do_Climbing_StopClimbingUpAction');
    expect(actor).toContain('world_do_Climbing_StopClimbingDownAction');
    // Both rules, because the mechanic and the keyboard are separate imports.
    expect(at(after, 'rules/climb.rule')).toBeTruthy();
    expect(at(after, 'rules/input.rule')).toBeTruthy();
  });

  it('binds each key to the edge that means it', () => {
    // The pairing is the whole control scheme, and getting it crossed is
    // silent: a climb that starts on the release reads as a ladder that only
    // works when you let go.
    const actor = at(
      climbArrowsEnhancement.apply(withPlayer(), HERO),
      'actors/player.actor',
    )!;
    const bound = [
      ...actor.matchAll(
        /world_on_Input_(Presses|Releases)Event[\s\S]{0,200}?"FILTER0":\s*"([a-z ]+)"[\s\S]{0,200}?world_do_Climbing_(\w+)Action/g,
      ),
    ].map(one => `${one[1]} ${one[2]} -> ${one[3]}`);

    expect(bound).toEqual([
      'Presses up arrow -> StartClimbingUp',
      'Releases up arrow -> StopClimbingUp',
      'Presses down arrow -> StartClimbingDown',
      'Releases down arrow -> StopClimbingDown',
    ]);
  });

  it('asks the actor to climb, not nobody', () => {
    // A designed block's one parameter socket is `VALUE` whatever the
    // parameter is called. Written as `ACTOR` the socket is empty, the block
    // asks nobody to climb, and nothing anywhere complains.
    const actor = at(
      climbArrowsEnhancement.apply(withPlayer(), HERO),
      'actors/player.actor',
    )!;
    const sockets = [
      ...actor.matchAll(
        /world_do_Climbing_(\w+)Action[\s\S]{0,140}?"(VALUE|ACTOR)"/g,
      ),
    ].map(one => one[2]);

    expect(sockets).toHaveLength(4);
    expect(new Set(sockets)).toEqual(new Set(['VALUE']));
  });

  it('does nothing the second time', () => {
    const once = climbArrowsEnhancement.apply(withPlayer(), HERO);
    expect(climbArrowsEnhancement.applied(once, HERO)).toBe(true);

    expect(
      at(climbArrowsEnhancement.apply(once, HERO), 'actors/player.actor'),
    ).toBe(at(once, 'actors/player.actor'));
  });
});

describe('the climb-arrows enhancement, played', () => {
  it('compiles into a world that runs', async () => {
    // What reading cannot tell: whether the blocks it wrote are ones the
    // project can actually build. A mistyped type is minted as a stand-in and
    // draws fine while doing nothing.
    const after = climbArrowsEnhancement.apply(withPlayer(), HERO);
    const {world, modules} = await compileProject(projectFiles(after));

    // The world builds, and the rules the enhancement asked for are in it.
    // The actor itself is not placed — importing one adds its file, and the
    // empty scenario's world puts nothing in the room — so what this proves
    // is that the blocks written into that file compile.
    expect(world).toBeDefined();
    expect(modules['rules/climb']).toBeDefined();
    expect(modules['rules/input']).toBeDefined();
  });
});
