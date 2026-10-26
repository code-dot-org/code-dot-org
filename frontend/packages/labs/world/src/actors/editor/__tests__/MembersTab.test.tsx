// The Blocks tab (specs/ACTOR_BLOCKS_PLAN.md, step 2).

import {render, screen, within} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

import {asActorData, type ActorData} from '../../actorData';
import {STOCK_ACTORS} from '../../stock';
import {memberPalette, memberReading} from '../memberPalette';

// The drawing is Blockly's, and jsdom lays nothing out; what is asked here is
// which block each row draws and what it is called.
vi.mock('@code-dot-org/blockly', async importOriginal => ({
  ...(await importOriginal<object>()),
  BlocklyProvider: ({children}: {children: unknown}) => children,
  BlocklyWorkspace: ({startBlocks}: {startBlocks: unknown}) => (
    <span data-testid="drawn">{JSON.stringify(startBlocks)}</span>
  ),
}));

const {MembersTab} = await import('../MembersTab');

const stock = (id: string) =>
  asActorData(STOCK_ACTORS.find(actor => actor.id === id)!.contents);

const show = (contents: string, props = {}) =>
  render(
    <MembersTab
      data={JSON.parse(contents) as ActorData}
      contents={contents}
      modulePath="actors/list"
      isReadOnly={false}
      {...props}
    />,
  );

describe('the Blocks tab', () => {
  it('draws each event as its hat, named by how it reads', () => {
    show(stock('list'));

    const events = screen.getByRole('region', {name: 'Events'});
    const pictures = within(events).getAllByRole('img');
    expect(pictures.map(picture => picture.getAttribute('aria-label'))).toEqual(
      [
        'when List is chosen ⟨word⟩ at ⟨place⟩',
        'when List loses ⟨word⟩ at ⟨place⟩',
      ],
    );
    expect(within(pictures[0]).getByTestId('drawn').textContent).toContain(
      'world_on_ActorsList_IsChosenAtEvent',
    );
  });

  it('draws each block as its call, with what it is for', () => {
    const contents = stock('textArea');
    render(
      <MembersTab
        data={JSON.parse(contents) as ActorData}
        contents={contents}
        modulePath="actors/textArea"
        isReadOnly={false}
      />,
    );

    const blocks = screen.getByRole('region', {name: 'Blocks'});
    const drawn = within(blocks).getAllByTestId('drawn');
    expect(drawn.length).toBeGreaterThan(0);
    for (const one of drawn) {
      expect(one.textContent).toMatch(/world_do_ActorsTextArea_/);
    }
  });

  it('keeps the drawing out of the tab order and the accessibility tree', () => {
    show(stock('list'));

    const drawing = screen.getAllByTestId('drawn')[0].parentElement!;
    expect(drawing.getAttribute('aria-hidden')).toBe('true');
    expect(drawing.hasAttribute('inert')).toBe(true);
  });

  it('says so when there is nothing to show', () => {
    const contents = asActorData(
      JSON.stringify({
        blocks: {blocks: [{type: 'world_actor', fields: {NAME: 'Rock'}}]},
      }),
    );
    show(contents);

    expect(screen.getByText(/No events yet/)).toBeInTheDocument();
    expect(screen.getByText(/No blocks yet/)).toBeInTheDocument();
  });

  it('names Edit, Delete and New for what they act on', () => {
    show(stock('list'), {onEdit: vi.fn(), onDelete: vi.fn(), onNew: vi.fn()});

    expect(
      screen.getByRole('button', {
        name: 'Edit when List is chosen ⟨word⟩ at ⟨place⟩',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: 'Delete when List loses ⟨word⟩ at ⟨place⟩',
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'New event'})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'New block'})).toBeInTheDocument();
  });

  it('offers no changes when read-only', () => {
    show(stock('list'), {
      isReadOnly: true,
      onEdit: vi.fn(),
      onDelete: vi.fn(),
      onNew: vi.fn(),
    });

    expect(screen.queryByRole('button')).toBeNull();
  });
});

describe('memberPalette', () => {
  it('gives a second member that reads the same no block', () => {
    const data = JSON.parse(stock('toggle')) as ActorData;
    const twin = {...data.members![0], id: 'twin'};
    const contents = JSON.stringify({
      ...data,
      members: [...data.members!, twin],
    });
    const palette = memberPalette('actors/toggle', contents);

    expect(palette.typeOf(data.members![0])).toBeDefined();
    expect(palette.typeOf(twin)).toBeUndefined();
  });

  it('reads a line break as nothing', () => {
    expect(
      memberReading(
        {
          id: 'm',
          kind: 'block',
          parts: [
            {kind: 'label', text: 'heal'},
            {kind: 'row'},
            {kind: 'label', text: 'now'},
          ],
        },
        'Hero',
      ),
    ).toBe('heal now');
  });
});
