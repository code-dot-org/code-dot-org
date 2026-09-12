// The Actor Creator's shell, and the question it asks first.
//
// The steps after this one are not built, so what is worth pinning is the
// FRAME: that the three doors are a choice, that two of them ask a second
// question and one does not, that nothing may be made until both are answered,
// and that a name the caller refuses stops it rather than being written.

import {fireEvent, render, screen} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';

import {ActorCreator} from '../ActorCreator';

const ACTORS = [
  {fileId: 'a1', name: 'Player'},
  {fileId: 'a2', name: 'Crawler'},
];

const TEMPLATES = [
  {id: 'coin', name: 'Coin', description: 'Something to collect.'},
  {id: 'label', name: 'Label', description: 'Words on the screen.'},
];

const onCreate = vi.fn(() => true);
const onCancel = vi.fn();

const show = (props: Partial<React.ComponentProps<typeof ActorCreator>> = {}) =>
  render(
    <ActorCreator
      actors={ACTORS}
      templates={TEMPLATES}
      onCreate={onCreate}
      onCancel={onCancel}
      {...props}
    />,
  );

const creator = () => screen.getByRole('button', {name: 'Create'});
const name = () => screen.getByRole('textbox');

beforeEach(() => vi.clearAllMocks());

describe('the wizard shell', () => {
  it('says which step this is, and how many there are', () => {
    // A wizard that does not say where you are is a sequence of dialogs that
    // happen to follow each other.
    show();

    expect(screen.getByText(/Step 1 of 1/)).toBeTruthy();
    expect(screen.getByText(/Where does it come from/)).toBeTruthy();
  });

  it('will not make anything until a door is chosen', () => {
    show();

    expect(creator()).toBeDisabled();
  });

  it('offers cancel rather than back on the first step', () => {
    // There is nowhere behind step one, and a Back that went nowhere would be
    // a control that lies.
    show();

    expect(screen.getByRole('button', {name: 'Cancel'})).toBeTruthy();
    expect(screen.queryByRole('button', {name: 'Back'})).toBeNull();
  });
});

describe('the three doors', () => {
  it('asks nothing more for one made from nothing', () => {
    show();
    fireEvent.click(screen.getByText('Create my own'));

    expect(screen.queryByRole('button', {name: 'Player'})).toBeNull();
    // …but it still wants a name, which is the only answer it has.
    expect(creator()).toBeDisabled();
    fireEvent.change(name(), {target: {value: 'Chaser'}});
    expect(creator()).not.toBeDisabled();
  });

  it('asks which of mine, and will not make one until told', () => {
    show();
    fireEvent.click(screen.getByText('Copy one of mine'));

    expect(creator()).toBeDisabled();
    fireEvent.click(screen.getByRole('button', {name: 'Crawler'}));
    expect(creator()).not.toBeDisabled();

    fireEvent.click(creator());
    expect(onCreate).toHaveBeenCalledWith({
      origin: 'copy',
      source: 'a2',
      // The chosen actor's own name, since an untouched field is not an
      // unanswered question — it is the answer the door already gave.
      name: 'Crawler',
    });
  });

  it('asks which of theirs, and names it what the library calls it', () => {
    show();
    fireEvent.click(screen.getByText('Start from a template'));
    fireEvent.click(screen.getByRole('button', {name: 'Coin'}));
    fireEvent.click(creator());

    expect(onCreate).toHaveBeenCalledWith({
      origin: 'template',
      source: 'coin',
      name: 'Coin',
    });
  });

  it('lets that name be changed on the spot', () => {
    show();
    fireEvent.click(screen.getByText('Start from a template'));
    fireEvent.click(screen.getByRole('button', {name: 'Coin'}));
    fireEvent.change(name(), {target: {value: 'Gold Piece'}});
    fireEvent.click(creator());

    expect(onCreate).toHaveBeenCalledWith(
      expect.objectContaining({name: 'Gold Piece'}),
    );
  });

  it('forgets the other door’s answer when the door changes', () => {
    // Kept, and the wizard would hand a stock id over as a file to clone.
    show();
    fireEvent.click(screen.getByText('Copy one of mine'));
    fireEvent.click(screen.getByRole('button', {name: 'Player'}));
    fireEvent.click(screen.getByText('Start from a template'));

    expect(creator()).toBeDisabled();
  });

  it('says when there is nothing to copy', () => {
    show({actors: []});
    fireEvent.click(screen.getByText('Copy one of mine'));

    expect(
      screen.getByText('This project has no actors to copy yet.'),
    ).toBeTruthy();
  });
});

describe('the name', () => {
  it('is refused by the caller’s rule, not this dialog’s', () => {
    // What a name may be is the project's business — which files it has, and
    // what a file name may hold (`files/FileMenus.nameProblem`).
    show({
      nameProblem: value => (value === 'Player' ? 'Already taken.' : undefined),
    });
    fireEvent.click(screen.getByText('Create my own'));
    fireEvent.change(name(), {target: {value: 'Player'}});

    expect(screen.getByText('Already taken.')).toBeTruthy();
    expect(creator()).toBeDisabled();

    fireEvent.change(name(), {target: {value: 'Chaser'}});
    expect(screen.queryByText('Already taken.')).toBeNull();
    expect(creator()).not.toBeDisabled();
  });

  it('closes when the making worked', async () => {
    show();
    fireEvent.click(screen.getByText('Create my own'));
    fireEvent.change(name(), {target: {value: 'Chaser'}});
    fireEvent.click(creator());

    await vi.waitFor(() => expect(onCancel).toHaveBeenCalled());
  });

  it('stays up when it did not', async () => {
    // The caller's complaint is on screen by then, and a wizard that vanished
    // would take the answers with it.
    onCreate.mockReturnValueOnce(false);
    show();
    fireEvent.click(screen.getByText('Create my own'));
    fireEvent.change(name(), {target: {value: 'Chaser'}});
    fireEvent.click(creator());

    await vi.waitFor(() => expect(onCreate).toHaveBeenCalled());
    expect(onCancel).not.toHaveBeenCalled();
  });
});
