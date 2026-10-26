// The events a section can start with (`eventChoices`), and the ones that can
// reach a particular kind — checked against the starter project, where the
// Player and the Coin hold different traits.

import {describe, expect, it} from 'vitest';

import {WORLD_SCENARIOS} from '../../fixtures/scenarios';
import {projectFiles} from '../../runtime/projectFiles';
import {BUILTIN_RULE_META} from '../builtinMeta';
import {buildDomainPalette} from '../domainBlocks';
import {
  eventChoicesForKind,
  eventChoicesIn,
  kindFactsFrom,
  traitValuesIn,
} from '../eventChoices';
import {FOUNDATION_TRAIT_VALUES} from '../foundation';
import {eventsNarrowerFor, eventsUnheardBy} from '../kindEvents';
import {projectOwnMetas, projectRuleMetas} from '../projectModules';

const files = projectFiles(WORLD_SCENARIOS.simple.source);
const rules = [...BUILTIN_RULE_META, ...projectRuleMetas(files)];
const palette = buildDomainPalette(projectRuleMetas(files), {
  fileKind: 'placement',
  ownProperties: projectOwnMetas(files),
});
const choices = eventChoicesIn(palette.toolbox, palette.blocks);
const facts = kindFactsFrom(files, projectOwnMetas(files) as never);
const labels = (list: ReadonlyArray<{label: string}>) =>
  list.map(choice => choice.label);

describe('the events a toolbox offers', () => {
  it('are its hats, worded as they read, each once', () => {
    expect(choices.length).toBeGreaterThan(5);
    expect(choices.every(choice => choice.type.startsWith('world_on_'))).toBe(
      true,
    );
    expect(new Set(choices.map(choice => choice.type)).size).toBe(
      choices.length,
    );
    expect(labels(choices)).toContain('when … starts falling');
  });
});

describe('the events that can reach a kind', () => {
  it('reads the traits an actor file elects', () => {
    expect(traitValuesIn(files['actors/player.actor'])).toEqual(
      expect.arrayContaining([expect.stringMatching(/Gravity/)]),
    );
  });

  it('gives the Player its traits’ events and the world’s, and not the rest', () => {
    const player = labels(
      eventChoicesForKind(
        choices,
        'actors/player',
        facts,
        rules,
        FOUNDATION_TRAIT_VALUES,
      ),
    );
    // Affected by Gravity and Takes Keyboard Input are the Player's.
    expect(player).toContain('when … starts falling');
    expect(player).toContain('when … presses …');
    // Dealing damage and being collected are other kinds' traits.
    expect(player).not.toContain('when … damages …');
    expect(player).not.toContain('when … is collected by …');
    // …and showing a map is a Viewport's.
    expect(player).not.toContain('when … shows a map');
    // Every actor is positioned and drawn, so the built-in rules' events
    // reach it — though they name no trait of their own.
    expect(player).toContain('when … is created');
    expect(player).toContain('when … animation ends');
  });

  it('gives a Coin no falling, which it does not do', () => {
    const coin = labels(
      eventChoicesForKind(
        choices,
        'actors/coin',
        facts,
        rules,
        FOUNDATION_TRAIT_VALUES,
      ),
    );
    expect(coin).not.toContain('when … starts falling');
  });
});

describe('the events other kinds declare for themselves', () => {
  // An event an actor declares in its own file belongs to no rule, and was
  // once let through to every kind as though it were the language's own.
  const kit = projectFiles(WORLD_SCENARIOS.interface.source);
  const kitPalette = buildDomainPalette(projectRuleMetas(kit), {
    fileKind: 'placement',
    ownProperties: projectOwnMetas(kit),
  });
  const kitChoices = eventChoicesIn(kitPalette.toolbox, kitPalette.blocks);
  const narrow = eventsNarrowerFor(kit);
  const drawersOf = (kind: string) =>
    narrow(kitChoices, kind).map(choice => `${choice.drawer}: ${choice.label}`);

  it('are not offered to a Button', () => {
    const button = drawersOf('actors/button');
    expect(button).not.toContain('Slider: when … changed');
    expect(button.some(row => row.startsWith('Toggle:'))).toBe(false);
    // …which still hears its own traits'.
    expect(button).toContain('Mouse: when … is clicked with …');
  });

  it('are offered to the kind that declares them', () => {
    expect(drawersOf('actors/slider')).toContain('Slider: when … changed');
  });
});

describe('the toolbox of one actor’s code', () => {
  const kit = projectFiles(WORLD_SCENARIOS.interface.source);
  const kitPalette = buildDomainPalette(projectRuleMetas(kit), {
    fileKind: 'actor',
    ownProperties: projectOwnMetas(kit),
  });
  const unheard = (kind: string) =>
    eventsUnheardBy(
      kitPalette.toolbox,
      kitPalette.blocks,
      eventsNarrowerFor(kit),
      kind,
    );

  it('leaves out the events a Button cannot hear', () => {
    const left = unheard('actors/button');
    expect([...left].some(type => type.includes('ActorsList_'))).toBe(true);
    expect([...left].some(type => type.includes('ActorsSlider_'))).toBe(true);
    // …and keeps the click, which it hears.
    expect(left.has('world_on_Mouse_IsClickedWithEvent')).toBe(false);
  });

  it('keeps a List’s own events in a List’s', () => {
    expect(
      [...unheard('actors/list')].some(t => t.includes('ActorsList_')),
    ).toBe(false);
  });
});
