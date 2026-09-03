import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import React from 'react';

import ReactionChips from '@cdo/apps/aiTutor/views/gallery/ReactionChips';
import * as reactionsApi from '@cdo/apps/aiTutor/views/gallery/reactionsApi';
import {Reaction} from '@cdo/apps/aiTutor/views/gallery/types';

describe('ReactionChips', () => {
  let addReaction: jest.SpyInstance;
  let removeReaction: jest.SpyInstance;

  beforeEach(() => {
    addReaction = jest.spyOn(reactionsApi, 'addReaction');
    removeReaction = jest.spyOn(reactionsApi, 'removeReaction');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const heart = (overrides: Partial<Reaction> = {}): Reaction => ({
    emoji: 'heart',
    count: 3,
    reacted: false,
    ...overrides,
  });

  it('renders a chip per reaction with its count, plus the add button', () => {
    render(
      <ReactionChips
        responseId={5}
        reactions={[heart(), {emoji: 'clap', count: 1, reacted: false}]}
      />
    );

    expect(
      screen.getByRole('button', {name: /Heart, 3 reactions/})
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: /Clap, 1 reaction$/})
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: 'Add reaction'})
    ).toBeInTheDocument();
  });

  it('renders read-only chips with no add button and no toggling', async () => {
    const user = userEvent.setup();
    render(
      <ReactionChips
        responseId={5}
        reactions={[heart({reacted: true})]}
        readOnly
      />
    );

    // The chip shows as a static label, not a button, and there is no picker.
    const chip = screen.getByRole('img', {name: /Heart, 3 reactions/});
    expect(chip).toBeInTheDocument();
    expect(
      screen.queryByRole('button', {name: 'Add reaction'})
    ).not.toBeInTheDocument();

    await user.click(chip);
    expect(addReaction).not.toHaveBeenCalled();
    expect(removeReaction).not.toHaveBeenCalled();
  });

  it('renders nothing read-only when there are no reactions', () => {
    const {container} = render(
      <ReactionChips responseId={5} reactions={[]} readOnly />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('marks the viewer’s own reaction as pressed', () => {
    render(
      <ReactionChips responseId={5} reactions={[heart({reacted: true})]} />
    );

    expect(screen.getByRole('button', {name: /Heart/})).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  it('adds the reaction and reconciles when a not-yet-reacted chip is clicked', async () => {
    const user = userEvent.setup();
    addReaction.mockResolvedValue([heart({count: 4, reacted: true})]);
    render(<ReactionChips responseId={5} reactions={[heart()]} />);

    await user.click(screen.getByRole('button', {name: /Heart/}));

    expect(addReaction).toHaveBeenCalledWith(5, 'heart');
    await waitFor(() =>
      expect(screen.getByRole('button', {name: /Heart/})).toHaveAttribute(
        'aria-pressed',
        'true'
      )
    );
    expect(
      screen.getByRole('button', {name: /Heart, 4 reactions/})
    ).toBeInTheDocument();
  });

  it('removes the reaction when an already-reacted chip is clicked', async () => {
    const user = userEvent.setup();
    removeReaction.mockResolvedValue([heart({count: 2, reacted: false})]);
    render(
      <ReactionChips
        responseId={5}
        reactions={[heart({count: 3, reacted: true})]}
      />
    );

    await user.click(screen.getByRole('button', {name: /Heart/}));

    expect(removeReaction).toHaveBeenCalledWith(5, 'heart');
    await waitFor(() =>
      expect(screen.getByRole('button', {name: /Heart/})).toHaveAttribute(
        'aria-pressed',
        'false'
      )
    );
  });

  it('reverts the optimistic update when the request fails', async () => {
    const user = userEvent.setup();
    addReaction.mockRejectedValue(new Error('network'));
    render(<ReactionChips responseId={5} reactions={[heart()]} />);

    await user.click(screen.getByRole('button', {name: /Heart/}));

    await waitFor(() =>
      expect(
        screen.getByRole('button', {name: /Heart, 3 reactions/})
      ).toBeInTheDocument()
    );
    expect(screen.getByRole('button', {name: /Heart/})).toHaveAttribute(
      'aria-pressed',
      'false'
    );
  });

  it('opens the picker and adds the chosen emoji', async () => {
    const user = userEvent.setup();
    addReaction.mockResolvedValue([{emoji: 'fire', count: 1, reacted: true}]);
    render(<ReactionChips responseId={5} reactions={[]} />);

    await user.click(screen.getByRole('button', {name: 'Add reaction'}));
    await user.click(screen.getByRole('menuitem', {name: 'Fire'}));

    expect(addReaction).toHaveBeenCalledWith(5, 'fire');
    // The picker closes after a choice.
    await waitFor(() =>
      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    );
  });

  it('reports reaction changes to onReactionsChange for the owning view', async () => {
    const user = userEvent.setup();
    const onReactionsChange = jest.fn();
    const server = [heart({count: 4, reacted: true})];
    addReaction.mockResolvedValue(server);
    render(
      <ReactionChips
        responseId={5}
        reactions={[heart()]}
        onReactionsChange={onReactionsChange}
      />
    );

    await user.click(screen.getByRole('button', {name: /Heart/}));

    // Fired optimistically at once, then again with the server's tallies.
    expect(onReactionsChange).toHaveBeenCalled();
    await waitFor(() =>
      expect(onReactionsChange).toHaveBeenLastCalledWith(server)
    );
  });
});
