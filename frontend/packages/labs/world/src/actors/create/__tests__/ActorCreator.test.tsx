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

const SPRITES = ['coin.png', 'crawler.png'];
const ANIMATIONS = [
  {id: 'coinSpin', name: 'Coin Spin', animation: {frames: []}},
];

const onCreate = vi.fn(() => true);
const onCancel = vi.fn();

const show = (props: Partial<React.ComponentProps<typeof ActorCreator>> = {}) =>
  render(
    <ActorCreator
      actors={ACTORS}
      templates={TEMPLATES}
      sprites={SPRITES}
      images={{}}
      animations={ANIMATIONS}
      onCreate={onCreate}
      onCancel={onCancel}
      {...props}
    />,
  );

const onward = () => screen.getByRole('button', {name: 'Next'});
const creator = () => screen.getByRole('button', {name: 'Create'});
const name = () => screen.getByRole('textbox');

/** Answer step one and walk into step two. */
const pastOrigin = (door: string, called = 'Chaser', which?: string) => {
  fireEvent.click(screen.getByText(door));
  if (which) {
    fireEvent.click(screen.getByRole('button', {name: which}));
  }
  fireEvent.change(name(), {target: {value: called}});
  fireEvent.click(onward());
};

beforeEach(() => vi.clearAllMocks());

describe('the wizard shell', () => {
  it('says which step this is, and how many there are', () => {
    // A wizard that does not say where you are is a sequence of dialogs that
    // happen to follow each other.
    show();

    expect(screen.getByText(/Step 1 of 2/)).toBeTruthy();
    expect(screen.getByText(/Where does it come from/)).toBeTruthy();
  });

  it('will not go on until a door is chosen', () => {
    show();

    expect(onward()).toBeDisabled();
  });

  it('goes on, and comes back with the answers still there', () => {
    show();
    pastOrigin('Copy one of mine', 'Chaser', 'Crawler');
    expect(screen.getByText(/Step 2 of 2/)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', {name: 'Back'}));
    expect(screen.getByText(/Step 1 of 2/)).toBeTruthy();
    expect(screen.getByRole('button', {name: 'Crawler'})).toHaveAttribute(
      'aria-pressed',
      'true',
    );
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
    expect(onward()).toBeDisabled();
    fireEvent.change(name(), {target: {value: 'Chaser'}});
    expect(onward()).not.toBeDisabled();
  });

  it('asks which of mine, and will not make one until told', () => {
    show();
    fireEvent.click(screen.getByText('Copy one of mine'));

    expect(onward()).toBeDisabled();
    fireEvent.click(screen.getByRole('button', {name: 'Crawler'}));
    expect(onward()).not.toBeDisabled();

    fireEvent.click(onward());
    fireEvent.click(creator());
    expect(onCreate).toHaveBeenCalledWith({
      origin: 'copy',
      source: 'a2',
      // The chosen actor's own name, since an untouched field is not an
      // unanswered question — it is the answer the door already gave.
      name: 'Crawler',
      // …and nothing about its look, which it already has.
      look: undefined,
    });
  });

  it('asks which of theirs, and names it what the library calls it', () => {
    show();
    fireEvent.click(screen.getByText('Start from a template'));
    fireEvent.click(screen.getByRole('button', {name: 'Coin'}));
    fireEvent.click(onward());
    fireEvent.click(creator());

    expect(onCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        origin: 'template',
        source: 'coin',
        name: 'Coin',
      }),
    );
  });

  it('lets that name be changed on the spot', () => {
    show();
    fireEvent.click(screen.getByText('Start from a template'));
    fireEvent.click(screen.getByRole('button', {name: 'Coin'}));
    fireEvent.change(name(), {target: {value: 'Gold Piece'}});
    fireEvent.click(onward());
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

    expect(onward()).toBeDisabled();
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
    expect(onward()).toBeDisabled();

    fireEvent.change(name(), {target: {value: 'Chaser'}});
    expect(screen.queryByText('Already taken.')).toBeNull();
    expect(onward()).not.toBeDisabled();
  });

  it('closes when the making worked', async () => {
    show();
    pastOrigin('Create my own');
    fireEvent.click(creator());

    await vi.waitFor(() => expect(onCancel).toHaveBeenCalled());
  });

  it('stays up when it did not', async () => {
    // The caller's complaint is on screen by then, and a wizard that vanished
    // would take the answers with it.
    onCreate.mockReturnValueOnce(false);
    show();
    pastOrigin('Create my own');
    fireEvent.click(creator());

    await vi.waitFor(() => expect(onCreate).toHaveBeenCalled());
    expect(onCancel).not.toHaveBeenCalled();
  });
});

describe('the picture step', () => {
  it('offers the project’s pictures and its animations together', () => {
    show();
    pastOrigin('Create my own');

    expect(screen.getByRole('button', {name: 'coin.png'})).toBeTruthy();
    expect(screen.getByRole('button', {name: 'Coin Spin'})).toBeTruthy();
  });

  it('will make one with no picture at all', () => {
    // An actor that paints itself needs none, so this step is a way on rather
    // than a demand (`specs/UI_ACTORS.md`).
    show();
    pastOrigin('Create my own');

    expect(creator()).not.toBeDisabled();
    fireEvent.click(creator());
    expect(onCreate).toHaveBeenCalledWith(
      expect.objectContaining({look: undefined}),
    );
  });

  it('hands back the picture that was pressed', () => {
    show();
    pastOrigin('Create my own');
    fireEvent.click(screen.getByRole('button', {name: 'crawler.png'}));
    fireEvent.click(creator());

    expect(onCreate).toHaveBeenCalledWith(
      expect.objectContaining({look: {kind: 'sprite', value: 'crawler.png'}}),
    );
  });

  it('hands back an animation by its own id', () => {
    // What a `play animation` row stores is the animation's key inside its
    // `.anim` file, which is not always the file's stem.
    show();
    pastOrigin('Create my own');
    fireEvent.click(screen.getByRole('button', {name: 'Coin Spin'}));
    fireEvent.click(creator());

    expect(onCreate).toHaveBeenCalledWith(
      expect.objectContaining({look: {kind: 'animation', value: 'coinSpin'}}),
    );
  });

  it('opens on what the copied actor already looks like', () => {
    // The whole reason step one comes first: a copied Crawler is already a
    // Crawler, and this step shows that answer rather than an empty grid.
    show({
      actors: [
        {
          fileId: 'a2',
          name: 'Crawler',
          look: {kind: 'sprite', value: 'crawler.png'},
        },
      ],
    });
    pastOrigin('Copy one of mine', 'Chaser', 'Crawler');

    expect(screen.getByRole('button', {name: 'crawler.png'})).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    // …and pressing on through says nothing about it, since there is nothing
    // for the caller to do.
    fireEvent.click(creator());
    expect(onCreate).toHaveBeenCalledWith(
      expect.objectContaining({look: undefined}),
    );
  });
});
