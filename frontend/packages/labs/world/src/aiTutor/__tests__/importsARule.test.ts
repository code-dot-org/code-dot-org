// The answer the tutor could not give.
//
// Asked "my player falls off the edges of the map", it wrote a ring of
// thirty-seven Ground tiles — a correct answer, and the only one available to
// it, because the context listed the rules the project HAD and `Boundaries` was
// not among them. The better answer is one import and two rows.
//
// Nor could it have been APPLIED if it had been thought of, and this is the
// half that surprised. The gate does not refuse an actor electing a trait from
// a rule the project has not got — the generator deliberately mints a stand-in
// for any type nothing defines, so a project with one missing rule still opens
// instead of dying whole. The offer would have been accepted, the file written,
// and the trait would have done NOTHING. The player would still fall off the
// map, with an accepted change in the transcript saying otherwise.
//
// So the import is not a way past the check. It is what makes the answer true.

import {describe, expect, it, vi} from 'vitest';

import {compileProject} from '../../__tests__/support/compileProject';
import {importStockActor} from '../../actors/importStockActor';
import {stockActorById} from '../../actors/stock';
import {projectRuleMetas} from '../../blockly/projectModules';
import {ruleByName} from '../../blockly/ruleRegistry';
import {anyTraitOptions} from '../../blockly/traitOptions';
import {WORLD_SCENARIOS} from '../../fixtures/scenarios';
import {projectFiles} from '../../runtime/projectFiles';
import {impliedRules, ruleNamesIn} from '../impliedRules';
import {
  mergeProposedWorkspaces,
  proposedProject,
  workspacesGenerate,
} from '../proposals';
import {importableRules} from '../ruleShelf';

/** A Player actor that elects the two traits Boundaries provides. */
const PLAYER_THAT_STAYS = JSON.stringify({
  blocks: {
    blocks: [
      {
        type: 'world_actor',
        x: 20,
        y: 20,
        fields: {NAME: 'Player'},
        next: {
          block: {
            type: 'world_use_trait',
            fields: {TRAIT: 'Boundaries#StaysAcrossTrait'},
            next: {
              block: {
                type: 'world_use_trait',
                fields: {TRAIT: 'Boundaries#StaysDownTrait'},
              },
            },
          },
        },
      },
    ],
  },
});

/** A world that places its Player, so a built actor exists to ask about. */
const WORLD = JSON.stringify({
  blocks: {
    blocks: [
      {
        type: 'world_world',
        x: 20,
        y: 20,
        fields: {NAME: 'My World'},
        next: {
          block: {type: 'world_add_actor', fields: {ACTOR: 'actors/player'}},
        },
      },
    ],
  },
});

/** The empty scenario with a Player in it, which is where the question starts. */
const withAPlayer = () => {
  const source = importStockActor(
    WORLD_SCENARIOS.empty.source,
    stockActorById('player')!,
  ).source;
  const world = Object.values(source.files).find(
    file => file.name === 'main.world',
  )!;
  return {
    ...source,
    files: {...source.files, [world.id]: {...world, contents: WORLD}},
  };
};

describe('the shelf the tutor is shown', () => {
  it('offers Boundaries, and says what electing it does', () => {
    const said = importableRules(
      projectRuleMetas(projectFiles(withAPlayer())),
    )!;

    expect(said).toContain('**Boundaries**');
    expect(said).toContain('Stays in the Map');
    expect(said).toContain('Stays Across, Stays Down');
  });

  it('leaves out what the project already has', () => {
    // A Player brings Jumping, Gravity, Arrow Keys, Input and Physics. Listing
    // them again invites the model to import what it is already using.
    const said = importableRules(
      projectRuleMetas(projectFiles(withAPlayer())),
    )!;

    expect(said).not.toContain('**Jumping**');
    expect(said).not.toContain('**Gravity**');
  });

  it('tells it how a trait is spelled, since it must write one', () => {
    const said = importableRules([])!;

    expect(said).toContain('Boundaries#StaysAcrossTrait');
  });
});

describe('reading a rule out of a proposed workspace', () => {
  it('finds the rule behind a trait reference', () => {
    expect(ruleNamesIn(PLAYER_THAT_STAYS)).toEqual(['Boundaries']);
  });

  it('finds one named by `use rule`', () => {
    expect(
      ruleNamesIn('{"type":"world_use_rule","fields":{"RULE":"Camera"}}'),
    ).toEqual(['Camera']);
  });

  it('asks for Boundaries, which the project has not got', () => {
    expect(
      impliedRules(withAPlayer(), [PLAYER_THAT_STAYS]).map(rule => rule.name),
    ).toEqual(['Boundaries']);
  });

  it('does not ask for a rule the project already holds', () => {
    const usesJumping = '{"fields":{"TRAIT":"Jumping#JumpsTrait"}}';

    expect(impliedRules(withAPlayer(), [usesJumping])).toEqual([]);
  });
});

describe('the offer itself', () => {
  const offer = [{path: 'actors/player.actor', contents: PLAYER_THAT_STAYS}];

  it('brings the rule in when applied', () => {
    const {source, imported} = proposedProject(withAPlayer(), offer);

    expect(imported.map(rule => rule.name)).toEqual(['Boundaries']);
    expect(Object.keys(projectFiles(source))).toContain('rules/bounds.rule');
  });

  it('generates what the model wrote, and not the rule it brought', () => {
    // The rule that arrives is ours — generated from `scripts/rules/*.mjs`,
    // committed, covered by its own tests — so generating it proves nothing
    // about the offer. It also cannot be generated: the palette is built from
    // the project's rules as they were, so a rule that has just arrived has no
    // block definitions and fails on the first of its own blocks.
    let asked: string[] = [];
    workspacesGenerate(withAPlayer(), offer, files => {
      asked = Object.keys(files);
      return files;
    });

    expect(asked).toContain('actors/player.actor');
    expect(asked).not.toContain('rules/bounds.rule');
  });

  it('still generates the rules the project already had', () => {
    // Only the NEWLY arrived one is skipped. A rule the project was already
    // using is part of what the offer has to keep working.
    let asked: string[] = [];
    workspacesGenerate(withAPlayer(), offer, files => {
      asked = Object.keys(files);
      return files;
    });

    expect(asked).toContain('rules/jump.rule');
  });

  it('produces an actor that really carries the trait', async () => {
    // The assertion that discriminates. Compiling does not: the generator mints
    // a stand-in for the unknown trait and the project builds either way, which
    // is exactly why a missing rule is invisible. What is not invisible is
    // whether the built actor HAS the trait — false when the rule never came.
    const {source} = proposedProject(withAPlayer(), offer);
    const {world, modules} = await compileProject(projectFiles(source));
    const bounds = modules['rules/bounds'] as unknown as {
      StaysAcrossTrait: unknown;
    };

    expect(bounds).toBeDefined();
    expect([...world.actors][0].has(bounds.StaysAcrossTrait as never)).toBe(
      true,
    );
  });

  it('and without the import, the trait is not there at all', async () => {
    // The same offer, merged without bringing the rule: it compiles, it opens,
    // and it does nothing. This is what the student would have accepted.
    const {source} = mergeProposedWorkspaces(withAPlayer(), offer);
    const {modules} = await compileProject(projectFiles(source));

    expect(modules['rules/bounds']).toBeUndefined();
  });

  it('would have been refused before the rule came with it', () => {
    const quiet = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const generateAll = (files: Record<string, string>) => {
      if (!files['rules/bounds.rule']) {
        throw new Error('Unknown trait Boundaries#StaysAcrossTrait');
      }
      return files;
    };

    // The same offer against a project where nothing implies the rule: the
    // trait is spelled as a project-local reference, so no stock rule matches.
    const local = [
      {
        path: 'actors/player.actor',
        contents: PLAYER_THAT_STAYS.replace(/Boundaries/g, 'Nonesuch'),
      },
    ];

    expect(workspacesGenerate(withAPlayer(), local, generateAll)).toBe(false);
    quiet.mockRestore();
  });
});

// The half that was missing, and the reason a correct answer was still refused.
//
// A trait is not a block type; it is a reference the generator RESOLVES against
// a module-global list of the rules in play. Handing the generator a file map
// that contains `bounds.rule` does not put Boundaries in that list, so
// `use trait Boundaries#StaysAcrossTrait` still named a rule nothing had heard
// of — and the offer that brings the rule with it was refused for not already
// having it.
describe('the registry, while the check runs', () => {
  const offer = [{path: 'actors/player.actor', contents: PLAYER_THAT_STAYS}];

  it('knows the rule the offer brings', () => {
    let sawBoundaries = false;
    const generateAll = (files: Record<string, string>) => {
      sawBoundaries = !!ruleByName('Boundaries');
      return files;
    };

    workspacesGenerate(withAPlayer(), offer, generateAll);

    expect(sawBoundaries).toBe(true);
  });

  it('offers the trait as a DROPDOWN VALUE, which is the thing that failed', () => {
    // The registry above is not the one that decides. `use trait` is a single
    // block whose TRAIT field is a dropdown, and a field value with no option
    // behind it is a file that will not load. Two registries, filled by one
    // call, and updating only the first is what left a correct answer refused.
    let offered: string[] = [];
    workspacesGenerate(withAPlayer(), offer, files => {
      offered = anyTraitOptions().map(([, value]) => value);
      return files;
    });

    expect(offered).toContain('Boundaries#StaysAcrossTrait');
    expect(offered).toContain('Boundaries#StaysDownTrait');
  });

  it('and stops offering it once the check is over', () => {
    workspacesGenerate(withAPlayer(), offer, files => files);

    expect(anyTraitOptions().map(([, value]) => value)).not.toContain(
      'Boundaries#StaysAcrossTrait',
    );
  });

  it('is put back afterwards, because the editor reads it too', () => {
    // Left describing a project the student has not agreed to, the palette
    // would offer blocks from a rule they do not have.
    workspacesGenerate(withAPlayer(), offer, files => files);

    expect(ruleByName('Boundaries')).toBeUndefined();
  });

  it('is put back even when generating throws', () => {
    const quiet = vi.spyOn(console, 'warn').mockImplementation(() => {});

    workspacesGenerate(withAPlayer(), offer, () => {
      throw new Error('nope');
    });

    expect(ruleByName('Boundaries')).toBeUndefined();
    quiet.mockRestore();
  });
});

// The failure the harness could not see.
//
// `compileProject` builds its block palette from the files it is HANDED, so an
// imported rule's blocks exist by the time it loads them and the offer sailed
// through every test here. The running lab builds its palette from a memoised
// prop holding the project's rules as they WERE, so `bounds.rule` arrived with
// none of its own blocks defined and generating it died on the first one:
//
//   Invalid block definition for type world_query_Boundaries_KeepBetweenAndQuery
//
// Blamed on `actors/player.actor`, because every per-file retry generates the
// whole project. Two days of this bug were spent on a harness kinder than
// production, so the stand-in below is deliberately less kind.
describe('a generator that only knows the blocks it started with', () => {
  const offer = [{path: 'actors/player.actor', contents: PLAYER_THAT_STAYS}];

  /** Refuses any `.rule` whose blocks the project did not already define. */
  const strict = (known: Set<string>) => (files: Record<string, string>) => {
    for (const path of Object.keys(files)) {
      if (path.endsWith('.rule') && !known.has(path)) {
        throw new Error(
          'Invalid block definition for type world_query_Boundaries_KeepBetweenAndQuery',
        );
      }
    }
    return files;
  };

  it('accepts the offer, because the new rule is never generated', () => {
    const known = new Set(
      Object.keys(projectFiles(withAPlayer())).filter(path =>
        path.endsWith('.rule'),
      ),
    );

    expect(workspacesGenerate(withAPlayer(), offer, strict(known))).toBe(true);
  });
});
