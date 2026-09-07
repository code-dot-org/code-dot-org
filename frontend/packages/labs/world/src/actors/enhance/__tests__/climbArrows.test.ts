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
  it('gives the actor both traits and the step that reads the keys', () => {
    const after = climbArrowsEnhancement.apply(withPlayer(), HERO);
    const actor = at(after, 'actors/player.actor')!;

    expect(actor).toContain('Climbing#ClimbsTrait');
    expect(actor).toContain('Input#TakesKeyboardInputTrait');
    expect(actor).toContain('world_is_key_down');
    expect(actor).toContain('world_do_Climbing_StartClimbingUpAction');
    expect(actor).toContain('world_do_Climbing_StopClimbingAction');
    // Both rules, because the mechanic and the keyboard are separate imports.
    expect(at(after, 'rules/climb.rule')).toBeTruthy();
    expect(at(after, 'rules/input.rule')).toBeTruthy();
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

    expect(sockets).toHaveLength(3);
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
