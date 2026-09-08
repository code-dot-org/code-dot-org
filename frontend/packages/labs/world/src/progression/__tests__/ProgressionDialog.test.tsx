// The modal, its opener, and the detail pane.
//
// The claims worth pinning are the ones specs/PROGRESSION_UI.md makes: that
// there is exactly ONE map however many things open it, that a tile's detail is
// its level properties rendered by the real instructions renderer rather than a
// second description written by hand, and that a shut tile refuses.

import {render, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {beforeEach, describe, expect, it, vi} from 'vitest';

import {RootStateProvider} from '@code-dot-org/core/redux';

import {TILES} from '../catalogue';
import {tile} from '../index';
import {LESSONS} from '../lessons';
import {useProgression} from '../progressionContext';
import {ProgressionProvider} from '../ProgressionProvider';
import type {TileId} from '../types';

// The drawn block under an unlock injects a real Blockly workspace, which
// needs a real browser — jsdom cannot parse the stylesheet Blockly writes, and
// the injection throws. The same bargain `__tests__/App` makes with the block
// editor, for the same reason: what this file is about is the dialog, and the
// preview is exercised where it can be, in `BlockPreview.test`.
vi.mock('../BlockPreview', () => ({
  BlockPreview: () => null,
  blockForRule: () => undefined,
}));

/** A stand-in for the button in the resource panel strip. */
const Opener = ({focus}: {focus?: TileId}) => {
  const {openTree, closeTree} = useProgression();
  return (
    <>
      <button type="button" onClick={() => openTree(focus)}>
        open
      </button>
      <button type="button" onClick={closeTree}>
        close
      </button>
    </>
  );
};

/**
 * The providers the dialog needs around it.
 *
 * The redux store because the dialog asks which lesson the lab has loaded
 * (`state.lab.channel`), which is what decides whether "Check my work" is
 * offered — a check measures the open project, so it may only be offered for
 * the tile that project belongs to.
 */
const lab = (props: {focus?: TileId; done?: TileId[]} = {}) =>
  render(
    <RootStateProvider>
      <ProgressionProvider initiallyCompleted={props.done ?? []}>
        <Opener focus={props.focus} />
      </ProgressionProvider>
    </RootStateProvider>,
  );

const dialog = () => screen.getByRole('dialog');
const detail = () => within(dialog()).getByRole('complementary');

beforeEach(() => {
  window.history.replaceState({}, '', '/');
});

describe('the opener', () => {
  it('shows no map until something asks for one', () => {
    lab();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('opens the map', async () => {
    lab();
    await userEvent.click(screen.getByRole('button', {name: 'open'}));
    expect(dialog()).toBeInTheDocument();
  });

  // The reason the provider owns the modal rather than each opener: two maps
  // on screen, each with its own scroll position and its own close button, is
  // the failure this shape rules out rather than manages.
  it('opens one map however many times it is asked', async () => {
    lab();
    const open = screen.getByRole('button', {name: 'open'});
    await userEvent.click(open);
    await userEvent.click(open);
    expect(screen.getAllByRole('dialog')).toHaveLength(1);
  });

  it('closes it again', async () => {
    lab();
    await userEvent.click(screen.getByRole('button', {name: 'open'}));
    await userEvent.click(screen.getByRole('button', {name: 'close'}));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('opens on the tile it was given', async () => {
    lab({focus: 'puzzle/push'});
    await userEvent.click(screen.getByRole('button', {name: 'open'}));
    expect(
      within(detail()).getByRole('heading', {name: tile('puzzle/push').title}),
    ).toBeInTheDocument();
  });

  // The focus may have come off a URL somebody typed or a link that outlived a
  // catalogue change, and neither is a reason to fail to open the map.
  it('opens on nothing when the tile is not one it has', async () => {
    lab({focus: 'nowhere/at-all'});
    await userEvent.click(screen.getByRole('button', {name: 'open'}));
    expect(within(detail()).getByText(/Pick a lesson/)).toBeInTheDocument();
  });
});

describe('the detail pane', () => {
  const openOn = async (id: TileId, done: TileId[] = []) => {
    lab({focus: id, done});
    await userEvent.click(screen.getByRole('button', {name: 'open'}));
  };

  // A tile whose lesson NOBODY HAS WRITTEN, which is what these two are about.
  //
  // It used to be FOUND — these tests named `logic/if`, then `logic/kinds`, and
  // each time somebody wrote that lesson the tests broke for a reason that had
  // nothing to do with them, so they took whichever the catalogue had left. The
  // catalogue has none left: sixty-seven tiles, sixty-seven lessons. The pane
  // still has to answer for a tile without one — a lesson can be removed, and a
  // new tile is designed before it is written — so one is taken away here and
  // put back, which is the same thing happening on purpose.
  const unwritten = TILES[TILES.length - 1];
  const withoutItsLesson = async (body: () => Promise<void>) => {
    const lessons = LESSONS as Record<string, unknown>;
    const saved = lessons[unwritten.id];
    delete lessons[unwritten.id];
    try {
      await body();
    } finally {
      lessons[unwritten.id] = saved;
    }
  };

  it('renders the lesson through the instructions renderer', async () => {
    await withoutItsLesson(async () => {
      await openOn(unwritten.id);
      const pane = detail();
      // Rendered markdown, not a string: `**What you do.**` has become bold, and
      // the tile's own task is what follows it.
      expect(within(pane).getByText('What you do.').tagName).toBe('STRONG');
      // Read off the whole pane rather than matched against one node, and with
      // the backticks taken out: a task with `code` in it is several nodes once
      // markdown has had it, and the marks themselves are gone — neither of
      // which is a thing this test has an opinion about.
      expect(pane.textContent).toContain(unwritten.task.replace(/`/g, ''));
    });
  });

  it('says when a lesson is designed but not written', async () => {
    await withoutItsLesson(async () => {
      await openOn(unwritten.id);
      expect(within(detail()).getByText(/not written yet/)).toBeInTheDocument();
    });
  });

  it('lists what the tile unlocks, by the name the library gives it', async () => {
    // Not "the jump rule": the icon beside it says which kind it is, and the
    // id is a file stem rather than a name anybody chose. (A rule whose block
    // can be drawn shows the block instead — the preview is stubbed in this
    // file, so what is left here is the row.)
    await openOn('platformer/jump');
    const unlocks = within(detail()).getByRole('region', {name: 'Unlocks'});

    expect(within(unlocks).getByText('Jumping')).toBeInTheDocument();
  });

  it('names an actor and a picture the same way', async () => {
    await openOn('platformer/pickups');
    const unlocks = within(detail()).getByRole('region', {name: 'Unlocks'});

    expect(within(unlocks).getByText('Coin')).toBeInTheDocument();
    expect(within(unlocks).getByText('Coin Spin')).toBeInTheDocument();
  });

  it('refuses a shut tile and says what it is waiting for', async () => {
    await openOn('platformer/jump');
    const pane = detail();
    expect(
      within(pane).getByRole('button', {name: 'Mark as done'}),
    ).toBeDisabled();
    // The row for what it needs says the state as well as the name — it is a
    // button now rather than a bullet with a link in it, so its accessible
    // name is the whole row.
    expect(
      within(pane).getByRole('button', {
        name: new RegExp(`^${tile('motion/gravity').title}\\b`),
      }),
    ).toBeInTheDocument();
  });

  it('moves to a prerequisite when its name is clicked', async () => {
    await openOn('platformer/jump');
    await userEvent.click(
      within(detail()).getByRole('button', {
        name: new RegExp(`^${tile('motion/gravity').title}\\b`),
      }),
    );
    expect(
      within(detail()).getByRole('heading', {
        name: tile('motion/gravity').title,
      }),
    ).toBeInTheDocument();
  });

  // A written lesson brings its own heading, so the pane does not add a second.
  it('shows one title for a written lesson, not two', async () => {
    await openOn('motion/gravity');
    expect(
      within(detail()).getAllByRole('heading', {
        name: tile('motion/gravity').title,
      }),
    ).toHaveLength(1);
  });

  it('offers Start only where there is a lesson to start', async () => {
    await openOn('logic/if');
    expect(within(detail()).queryByRole('link', {name: 'Start'})).toBeNull();
  });

  it('sends Start to a channel of the lesson’s own', async () => {
    // Origin, because it is the one tile that is open from nothing — and a
    // channel of its own is the whole point: starting a lesson must never
    // replace the sources of the project you came from.
    await openOn('origin/first-world');
    expect(
      within(detail()).getByRole('link', {name: 'Start'}).getAttribute('href'),
    ).toBe('/app/projects/world/lesson-origin-first-world/edit');
  });

  it('does not offer to start a shut lesson', async () => {
    await openOn('motion/gravity');
    expect(within(detail()).queryByRole('link')).toBeNull();
  });

  it('offers a done lesson again rather than nothing', async () => {
    await openOn('origin/first-world', ['origin/first-world']);
    expect(
      within(detail()).getByRole('link', {name: 'Do it again'}),
    ).toBeInTheDocument();
  });

  it('completes an open tile, and the header counts it', async () => {
    await openOn('origin/first-world');
    expect(
      within(dialog()).getByText(/^0 of 78 lessons done/),
    ).toBeInTheDocument();
    await userEvent.click(
      within(detail()).getByRole('button', {name: 'Mark as done'}),
    );
    expect(
      within(dialog()).getByText(/^1 of 78 lessons done/),
    ).toBeInTheDocument();
  });

  it('opens what completing a tile unlocked', async () => {
    await openOn('origin/first-world');
    await userEvent.click(
      within(detail()).getByRole('button', {name: 'Mark as done'}),
    );
    // Motion's first tile was shut a moment ago and is now ready.
    expect(
      screen.getByRole('option', {
        name: /Speed is not a place\. Motion\. Ready to start\./,
      }),
    ).toBeInTheDocument();
  });
});

describe('the URL', () => {
  it('carries the selected tile, so the map can be linked to', async () => {
    lab({focus: 'story/choice'});
    await userEvent.click(screen.getByRole('button', {name: 'open'}));
    expect(new URL(window.location.href).searchParams.get('tree')).toBe(
      'story/choice',
    );
  });

  it('lets go of it when the map closes', async () => {
    lab({focus: 'story/choice'});
    await userEvent.click(screen.getByRole('button', {name: 'open'}));
    await userEvent.click(screen.getByRole('button', {name: 'close'}));
    expect(new URL(window.location.href).searchParams.has('tree')).toBe(false);
  });
});
