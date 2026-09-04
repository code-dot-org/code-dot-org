// The animation editor, as a person uses it.
//
// Its pure halves are well covered — `frameOps`, `playback`, `sheetFrames`,
// `timing`, `animDocument`, and the three dialogs, fifty-odd tests between
// them — and `renameAnimation` is tested where it lives. What none of them
// touch is the component's WIRING of those parts, which is where the two
// hardest things in this editor are.
//
// Both are about an id being a reference. A `play animation` block holds an
// id and nothing else — no block records which file it came from — so
// renaming one is an edit to the whole project and deleting one is a
// promise this editor cannot keep. The comments in the component say all of
// this; nothing until now checked that the code does it.

import {fireEvent, render, screen} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';

import type {MultiFileSource} from '@code-dot-org/core/api';

/** The last `updateSources`, so a project-wide write can be read back. */
const updateSources = vi.fn();
let source: MultiFileSource;

vi.mock('@code-dot-org/lab/contexts', () => ({
  useSources: () => ({
    currentSources: {source},
    updateSources,
    sourcesEpoch: 0,
  }),
}));

/** An `.anim` holding one animation of two frames. */
const ANIM = JSON.stringify({
  type: 'animation',
  animations: {
    spin: {frameRate: 8, frames: [{sprite: 'coin.png'}, {sprite: 'coin.png'}]},
    idle: {frameRate: 4, frames: [{sprite: 'coin.png'}]},
  },
});

/** An actor that plays `spin` — the reference a rename has to carry to. */
const PLAYER = JSON.stringify({
  blocks: {
    blocks: [
      {
        type: 'world_actor',
        fields: {NAME: 'Player'},
        next: {
          block: {type: 'world_play_animation', fields: {ANIMATION: 'spin'}},
        },
      },
    ],
  },
});

const project = (extra: MultiFileSource['files'] = {}): MultiFileSource => ({
  files: {
    game: {
      id: 'game',
      name: 'game.anim',
      language: 'anim',
      contents: ANIM,
      folderId: 'animations',
    },
    player: {
      id: 'player',
      name: 'player.actor',
      language: 'actor',
      contents: PLAYER,
      folderId: 'actors',
    },
    ...extra,
  },
  folders: {
    animations: {id: 'animations', name: 'animations', parentId: '0'},
    actors: {id: 'actors', name: 'actors', parentId: '0'},
  },
  openFiles: [],
});

const {AnimationEditor} = await import('../AnimationEditor');

beforeEach(() => {
  updateSources.mockClear();
  source = project();
});

const open = (isReadOnly = false) => {
  const onChange = vi.fn();
  const view = render(
    <AnimationEditor
      fileId="game"
      initialContents={ANIM}
      language="anim"
      isReadOnly={isReadOnly}
      onChange={onChange}
    />,
  );
  return {onChange, ...view};
};

/** One animation's tab in the list — `role="tab"`, not a plain button. */
const tab = (name: string) => screen.getByRole('tab', {name});

/** The name field, which is how an animation is renamed. */
const nameField = () =>
  document.querySelector('input[name="anim-id"]') as HTMLInputElement;

/** Type a new name and leave the field, which is what commits a rename. */
const rename = (to: string) => {
  fireEvent.change(nameField(), {target: {value: to}});
  fireEvent.blur(nameField());
};

/** The files as the last project-wide write left them. */
const written = (): MultiFileSource['files'] =>
  (updateSources.mock.calls.at(-1)![0] as {source: MultiFileSource}).source
    .files;

describe('renaming an animation', () => {
  it('carries the new name to every block that plays it', () => {
    // An id IS the reference. Renaming without carrying leaves a `play
    // animation` naming something the project no longer has — which is a
    // silently broken game, from a rename that looked like it worked.
    open();
    rename('whirl');

    const files = written();
    expect(JSON.parse(files.game.contents!).animations).toHaveProperty('whirl');
    expect(JSON.parse(files.game.contents!).animations).not.toHaveProperty(
      'spin',
    );
    expect(files.player.contents).toContain('"whirl"');
    expect(files.player.contents).not.toContain('"spin"');
  });

  it('writes the file and the project in ONE update', () => {
    // The reason this is not two saves: `onChange` saves through a `saveFile`
    // that closes over the sources of the render that made it, so an ordinary
    // per-file save following a project write would put the other files back
    // as they were — undoing the rename it had just carried.
    const {onChange} = open();
    rename('whirl');

    expect(updateSources).toHaveBeenCalledTimes(1);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('refuses a name another animation already answers to', () => {
    open();
    rename('idle');

    expect(updateSources).not.toHaveBeenCalled();
    expect(nameField().value).toBe('spin'); // put back
    expect(screen.getByText(/already called/i)).toBeInTheDocument();
  });

  it('refuses an empty name, because a name is what plays it', () => {
    open();
    rename('   ');

    expect(updateSources).not.toHaveBeenCalled();
    expect(nameField().value).toBe('spin');
    expect(screen.getByText(/needs a name/i)).toBeInTheDocument();
  });

  it('leaves the plays alone when the old name was ambiguous', () => {
    // Another `.anim` defines `spin` too, so a block playing it may mean the
    // other one. Rewriting would move plays that were never this animation's.
    // The key is still rekeyed here; the plays are left as written.
    source = project({
      other: {
        id: 'other',
        name: 'other.anim',
        language: 'anim',
        contents: JSON.stringify({
          type: 'animation',
          animations: {spin: {frameRate: 8, frames: [{sprite: 'ball.png'}]}},
        }),
        folderId: 'animations',
      },
    });
    open();
    rename('whirl');

    const files = written();
    expect(JSON.parse(files.game.contents!).animations).toHaveProperty('whirl');
    expect(files.player.contents).toContain('"spin"');
  });

  it('does nothing at all when the name has not changed', () => {
    open();
    rename('spin');
    expect(updateSources).not.toHaveBeenCalled();
  });
});

describe('deleting an animation', () => {
  const deleteButton = () =>
    screen.getByRole('button', {name: /delete this animation/i});

  it('says what plays it before letting it go', () => {
    // A block holds an id and nothing else, so deleting one that is played
    // leaves a block that quietly stops working. Renaming can carry; deleting
    // cannot, because there is nothing to carry to — so the next best thing
    // is to say so and let the learner decide.
    const {onChange} = open();
    fireEvent.click(deleteButton());

    expect(
      screen.getByText(/player\.actor plays this animation/i),
    ).toBeVisible();
    expect(onChange).not.toHaveBeenCalled(); // nothing gone yet
  });

  it('goes ahead when the learner says so, and leaves the blocks', () => {
    // The play is left exactly as written: a `play animation` naming
    // something the project no longer has is visible and fixable, where a
    // field silently emptied is neither.
    const {onChange} = open();
    fireEvent.click(deleteButton());
    fireEvent.click(screen.getByRole('button', {name: /delete anyway/i}));

    const doc = JSON.parse(onChange.mock.calls.at(-1)![0] as string);
    expect(doc.animations).not.toHaveProperty('spin');
    expect(doc.animations).toHaveProperty('idle');
  });

  it('asks nothing when nothing plays it', () => {
    // `idle` is played by no block, so there is nothing to warn about and the
    // dialog would be a click for its own sake.
    const {onChange} = open();
    fireEvent.click(tab('idle'));
    fireEvent.click(deleteButton());

    expect(screen.queryByRole('button', {name: /delete anyway/i})).toBeNull();
    const doc = JSON.parse(onChange.mock.calls.at(-1)![0] as string);
    expect(doc.animations).not.toHaveProperty('idle');
    expect(doc.animations).toHaveProperty('spin');
  });
});

describe('a locked workspace', () => {
  it('offers nothing that would change the file', () => {
    open(true);

    expect(nameField()).toBeDisabled();
    expect(
      screen.getByRole('button', {name: /delete this animation/i}),
    ).toBeDisabled();
  });

  it('writes nothing, whatever is done to it', () => {
    const {onChange} = open(true);

    rename('whirl');

    expect(onChange).not.toHaveBeenCalled();
    expect(updateSources).not.toHaveBeenCalled();
  });
});

describe('the animation list', () => {
  it('shows every animation the file defines', () => {
    open();
    expect(screen.getAllByRole('tab').map(one => one.textContent)).toEqual([
      'spin',
      'idle',
    ]);
  });

  it('falls back to the first when the selected one is deleted', () => {
    // A selection is editor state and the file is not, so a deleted animation
    // leaves the selection pointing at nothing — which would render an
    // inspector for something that is gone.
    open();
    fireEvent.click(tab('idle'));
    expect(nameField().value).toBe('idle');

    fireEvent.click(
      screen.getByRole('button', {name: /delete this animation/i}),
    );

    expect(nameField().value).toBe('spin');
  });
});
