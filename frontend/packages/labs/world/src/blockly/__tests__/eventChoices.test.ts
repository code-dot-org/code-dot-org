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
