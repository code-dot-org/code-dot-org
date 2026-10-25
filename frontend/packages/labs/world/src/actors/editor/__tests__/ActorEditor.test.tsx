// The Actor Editor (specs/ACTOR_EDITOR_PLAN.md, step 4).

import {fireEvent, render, screen, within} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';

import type {MultiFileSource} from '@code-dot-org/core/api';

import {WORLD_SCENARIOS} from '../../../fixtures/scenarios';
import {asActorData, viewOf} from '../../actorData';

// The starter's project, with its Player in the data shape.
const STARTER = WORLD_SCENARIOS.simple.source;
const PLAYER_ID = Object.values(STARTER.files).find(
  file => file.name === 'player.actor',
)!.id;
const PLAYER = asActorData(STARTER.files[PLAYER_ID].contents);
let SOURCE: MultiFileSource = {
  ...STARTER,
  files: {
    ...STARTER.files,
    [PLAYER_ID]: {...STARTER.files[PLAYER_ID], contents: PLAYER},
  },
};

const replaceSources = vi.fn();
vi.mock('@code-dot-org/lab/contexts', () => ({
  // Read when called: a test may hand the project a changed file.
  useSources: () => ({currentSources: {source: SOURCE}, replaceSources}),
}));
vi.mock('../../../runtime/WorldRuntimeContext', () => ({
  useWorldRuntime: () => ({getActorInfo: vi.fn(), hasCompiled: false}),
}));
// The code is the file editor over the actor's view; what it is handed and
// what it saves are what is asked about here.
const saved: {
  onChange?: (contents: string) => void;
  contents?: string;
  actorCode?: boolean;
} = {};
vi.mock('../../../blockly/BlocklyFileEditor', () => ({
  BlocklyFileEditor: (props: {
    initialContents: string;
    onChange: (contents: string) => void;
    actorCode?: boolean;
  }) => {
    saved.onChange = props.onChange;
    saved.contents = props.initialContents;
    saved.actorCode = props.actorCode;
    return <div data-testid="blocks" />;
  },
}));
const requestActorEnhance = vi.fn();
vi.mock('../../enhance/actorEnhance', () => ({
  requestActorEnhance: (target: unknown) => requestActorEnhance(target),
}));

const {ActorFileEditor} = await import('../ActorEditor');

const onChange = vi.fn();
beforeEach(() => onChange.mockClear());

const open = (contents = PLAYER) =>
  render(
    <ActorFileEditor
      fileId={PLAYER_ID}
      initialContents={contents}
      language="actor"
      isReadOnly={false}
      onChange={onChange}
    />,
  );

const written = () => JSON.parse(onChange.mock.calls.at(-1)![0] as string);

describe('the Actor Editor', () => {
  it('opens a data-shaped actor', () => {
    open();
    expect(screen.getByTestId('actor-editor')).toBeInTheDocument();
    expect(screen.getByRole('heading', {name: 'Player'})).toBeInTheDocument();
    expect(screen.queryByTestId('blocks')).toBeNull();
  });

  it('leaves an actor still in blocks to the file editor', () => {
    open(viewOf(PLAYER));
    expect(screen.getByTestId('blocks')).toBeInTheDocument();
    expect(screen.queryByTestId('actor-editor')).toBeNull();
  });

  it('says what it looks like, and changes it', () => {
    open();
    const look = screen.getByLabelText('Looks like') as HTMLSelectElement;
    expect(look.value).toBe('animation:playerBob');
    fireEvent.change(look, {target: {value: ''}});
    expect(written().look).toBeUndefined();
  });

  it('adds a property of its own, and sets where it starts', () => {
    open();
    fireEvent.change(screen.getByLabelText('New property'), {
      target: {value: 'lives'},
    });
    fireEvent.click(screen.getByRole('button', {name: 'Add property'}));
    expect(written().properties).toEqual([
      {name: 'lives', type: 'number', access: 'writable', value: '0'},
    ]);

    const lives = screen.getByLabelText('Lives');
    fireEvent.change(lives, {target: {value: '3'}});
    fireEvent.blur(lives);
    expect(written().properties[0].value).toBe('3');
  });

  it('renames a property of its own across the project, and deletes one after saying so', () => {
    // A Player with lives of its own.
    const withLives = JSON.stringify({
      ...JSON.parse(PLAYER),
      properties: [{name: 'lives', type: 'number', access: 'writable'}],
    });
    const shipped = SOURCE;
    SOURCE = {
      ...SOURCE,
      files: {
        ...SOURCE.files,
        [PLAYER_ID]: {...SOURCE.files[PLAYER_ID], contents: withLives},
      },
    };
    open(withLives);

    fireEvent.click(screen.getByRole('button', {name: 'Rename lives'}));
    fireEvent.change(screen.getByLabelText('Rename lives'), {
      target: {value: 'hearts'},
    });
    fireEvent.click(screen.getByRole('button', {name: 'Save name'}));
    const replaced = replaceSources.mock.calls.at(-1)![0] as {
      source: MultiFileSource;
    };
    expect(
      JSON.parse(replaced.source.files[PLAYER_ID].contents).properties[0].name,
    ).toBe('hearts');

    fireEvent.click(screen.getByRole('button', {name: 'Delete lives'}));
    expect(screen.getByRole('group', {name: 'Delete lives'})).toHaveTextContent(
      'No code uses it.',
    );
    fireEvent.click(
      within(screen.getByRole('group', {name: 'Delete lives'})).getByRole(
        'button',
        {name: 'Delete'},
      ),
    );
    expect(written().properties).toBeUndefined();
    SOURCE = shipped;
  });

  it('shows each trait with what can be set on it, and takes one away', () => {
    open();
    const jumps = screen.getByRole('region', {name: 'Jumps'});
    const field = within(jumps).getAllByRole('spinbutton')[0];
    fireEvent.change(field, {target: {value: '777'}});
    fireEvent.blur(field);
    expect(written().values).toEqual([
      expect.objectContaining({type: 'number', value: 777}),
    ]);

    fireEvent.click(within(jumps).getByRole('button', {name: 'Remove Jumps'}));
    expect(written().traits).not.toContain('Jumping#JumpsTrait');
  });

  it('offers the traits it does not take, and the enhancements', () => {
    open();
    fireEvent.click(screen.getByRole('button', {name: 'Enhance Actor'}));
    const menu = screen.getByRole('menu');
    expect(within(menu).queryByRole('menuitem', {name: /^Jumps/})).toBeNull();
    fireEvent.click(
      within(menu).getByRole('menuitem', {name: 'Enhancements…'}),
    );
    expect(requestActorEnhance).toHaveBeenCalledWith(
      expect.objectContaining({kind: 'actor', path: 'actors/player'}),
    );
  });

  it('opens its code, without define actor, and keeps the data as it was', () => {
    open();
    fireEvent.click(screen.getByRole('button', {name: 'Code'}));
    expect(screen.getByTestId('blocks')).toBeInTheDocument();
    // What it is stays in the panel; the code is its handlers and code rows.
    const code = JSON.parse(saved.contents!);
    const types = code.blocks.blocks.map((block: {type: string}) => block.type);
    expect(types).not.toContain('world_actor');
    expect(types.length).toBeGreaterThan(0);

    // A handler taken away, saved from the blocks.
    saved.onChange!(
      JSON.stringify({...code, blocks: {...code.blocks, blocks: []}}),
    );
    expect(written()).toMatchObject({
      type: 'actor',
      name: 'Player',
      traits: JSON.parse(PLAYER).traits,
      blocks: {blocks: {blocks: []}},
    });
  });

  it('tells the file editor the workspace is an actor’s code', () => {
    open();
    fireEvent.click(screen.getByRole('button', {name: 'Code'}));
    expect(saved.actorCode).toBe(true);
  });
});
