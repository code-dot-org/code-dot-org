// App Builder (`appBuilder`): a level that makes an app leaves out what only a
// game wants. The lists are names of things, and a name that matches nothing
// is a silent failure — a rule left in the library, a block left in the
// toolbox — so the first tests are that every name is real.

import {render, screen} from '@testing-library/react';
import type {ReactNode} from 'react';
import {describe, expect, it, vi} from 'vitest';

import {createLevelPropertyFixture} from '@code-dot-org/core/api/mocks';
import {RootStateProvider} from '@code-dot-org/core/redux';
import {LevelPropertiesProvider} from '@code-dot-org/lab/contexts';

import {ENHANCEMENTS} from '../actors/enhance/enhancements';
import {ImportActorDialog} from '../actors/ImportActorDialog';
import {STOCK_ACTORS} from '../actors/stock';
import {
  APP_ACTORS,
  APP_ENHANCEMENTS,
  APP_HIDDEN_BLOCKS,
  APP_RULES,
} from '../appBuilder';
import {buildDomainPalette} from '../blockly/domainBlocks';
import {withoutBlocks} from '../blockly/toolboxFilter';
import {WORLD_SCENARIOS} from '../fixtures/scenarios';
import {ImportRuleDialog} from '../rules/ImportRuleDialog';
import {STOCK_RULES} from '../rules/stock';

vi.mock('../progression/BlockPreview', () => ({
  BlockPreview: () => null,
}));

/** Rendered inside a level that says what it is making. */
const inLevel = (mode: 'app' | 'game' | undefined, children: ReactNode) =>
  render(
    <RootStateProvider>
      <LevelPropertiesProvider
        levelId={1}
        levelPropertiesMap={{
          '1': createLevelPropertyFixture({
            id: 1,
            name: 'World Lab',
            type: 'World',
            appName: 'world',
            offerBrowserTts: false,
            showExemplarLink: false,
            levelData: mode ? {mode} : {},
          }),
        }}
      >
        {children}
      </LevelPropertiesProvider>
    </RootStateProvider>,
  );

describe('what App Builder names', () => {
  it('names stock rules, actors and Enhance rows that exist', () => {
    const rules = new Set(STOCK_RULES.map(rule => rule.id));
    const actors = new Set(STOCK_ACTORS.map(actor => actor.id));
    const enhancements = new Set(ENHANCEMENTS.map(one => one.id));
    expect([...APP_RULES].filter(id => !rules.has(id))).toEqual([]);
    expect([...APP_ACTORS].filter(id => !actors.has(id))).toEqual([]);
    expect([...APP_ENHANCEMENTS].filter(id => !enhancements.has(id))).toEqual(
      [],
    );
  });

  it('hides blocks the world’s toolbox actually lists', () => {
    const {toolbox} = buildDomainPalette([], {fileKind: 'world'});
    const listed = new Set(
      (toolbox as Array<{blocks?: unknown[]}>).flatMap(category =>
        (category.blocks ?? []).filter(
          (item): item is string => typeof item === 'string',
        ),
      ),
    );
    expect([...APP_HIDDEN_BLOCKS].filter(type => !listed.has(type))).toEqual(
      [],
    );
  });

  it('offers no actor whose import would bring a game rule with it', () => {
    // An actor brings the rules it requires, by name; an app actor that
    // required Health would put a game rule in an app by the side door.
    const idOf = new Map(STOCK_RULES.map(rule => [rule.name, rule.id]));
    const strays = STOCK_ACTORS.filter(actor => APP_ACTORS.has(actor.id))
      .flatMap(actor => actor.requires.map(name => [actor.id, name]))
      .filter(([, name]) => !APP_RULES.has(idOf.get(name) ?? name));
    expect(strays).toEqual([]);
  });

  it('is what the Notes and Interface Kit scenarios are, and no game', () => {
    const apps = Object.entries(WORLD_SCENARIOS)
      .filter(([, scenario]) => scenario.levelData?.mode === 'app')
      .map(([tag]) => tag)
      .sort();
    expect(apps).toEqual(['app', 'interface']);
  });
});

describe('the rule library in an app', () => {
  it('offers the app’s rules and not a game’s', {timeout: 20000}, () => {
    inLevel('app', <ImportRuleDialog onImport={vi.fn()} onCancel={vi.fn()} />);
    expect(
      screen.getByRole('button', {name: 'Shows Screens'}),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', {name: 'Has Gravity'})).toBeNull();
  });

  it(
    'offers everything in a game, which is the default',
    {timeout: 20000},
    () => {
      inLevel(
        undefined,
        <ImportRuleDialog onImport={vi.fn()} onCancel={vi.fn()} />,
      );
      expect(
        screen.getByRole('button', {name: 'Has Gravity'}),
      ).toBeInTheDocument();
    },
  );
});

describe('the actor library in an app', () => {
  it('offers the controls and not the game pieces', {timeout: 20000}, () => {
    inLevel('app', <ImportActorDialog onImport={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByRole('button', {name: /^Button/})).toBeInTheDocument();
    expect(screen.queryByRole('button', {name: /^Coin/})).toBeNull();
    expect(screen.queryByRole('button', {name: /^Viewport/})).toBeNull();
  });
});

describe('withoutBlocks', () => {
  const toolbox = [
    {name: 'World', blocks: ['world_world', 'world_define_camera']},
    {name: 'Cameras only', blocks: ['world_define_camera']},
    {name: 'Loops', blocks: ['controls_forEach']},
  ];

  it('drops the blocks, and a drawer left holding none', () => {
    expect(
      withoutBlocks(toolbox as never, new Set(['world_define_camera'])),
    ).toEqual([
      {name: 'World', blocks: ['world_world']},
      {name: 'Loops', blocks: ['controls_forEach']},
    ]);
  });

  it('hands back the same toolbox when nothing is hidden', () => {
    expect(withoutBlocks(toolbox as never, new Set())).toBe(toolbox);
    expect(withoutBlocks(toolbox as never, new Set(['nothing']))).toBe(toolbox);
  });
});
