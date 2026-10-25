// The Actor Editor (specs/ACTOR_EDITOR_PLAN.md, step 4).

import {fireEvent, render, screen, within} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';

import type {MultiFileSource} from '@code-dot-org/core/api';

import {WORLD_SCENARIOS} from '../../../fixtures/scenarios';
import {asActorData} from '../../actorData';

// The starter's project, with its Player in the data shape.
const STARTER = WORLD_SCENARIOS.simple.source;
const PLAYER_ID = Object.values(STARTER.files).find(
  file => file.name === 'player.actor',
)!.id;
const PLAYER = asActorData(STARTER.files[PLAYER_ID].contents);
const SOURCE: MultiFileSource = {
  ...STARTER,
  files: {
    ...STARTER.files,
    [PLAYER_ID]: {...STARTER.files[PLAYER_ID], contents: PLAYER},
  },
};

vi.mock('@code-dot-org/lab/contexts', () => ({
  useSources: () => ({currentSources: {source: SOURCE}}),
}));
vi.mock('../../../runtime/WorldRuntimeContext', () => ({
  useWorldRuntime: () => ({getActorInfo: vi.fn(), hasCompiled: false}),
}));
// The code is the file editor over the actor's view; what it is handed and
// what it saves are what is asked about here.
const saved: {onChange?: (contents: string) => void; contents?: string} = {};
vi.mock('../../../blockly/BlocklyFileEditor', () => ({
  BlocklyFileEditor: (props: {
    initialContents: string;
    onChange: (contents: string) => void;
  }) => {
    saved.onChange = props.onChange;
    saved.contents = props.initialContents;
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
    open(STARTER.files[PLAYER_ID].contents);
    expect(screen.getByTestId('blocks')).toBeInTheDocument();
    expect(screen.queryByTestId('actor-editor')).toBeNull();
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

  it('opens its code as its view, and keeps what is saved there as data', () => {
    open();
    fireEvent.click(screen.getByRole('button', {name: 'Code'}));
    expect(screen.getByTestId('blocks')).toBeInTheDocument();
    const view = JSON.parse(saved.contents!);
    expect(view.blocks.blocks[0]).toMatchObject({
      type: 'world_actor',
      fields: {NAME: 'Player'},
    });

    // A rename typed into the definition, saved from the blocks.
    view.blocks.blocks[0].fields.NAME = 'Hero';
    saved.onChange!(JSON.stringify(view));
    expect(written()).toMatchObject({type: 'actor', name: 'Hero'});
  });
});
