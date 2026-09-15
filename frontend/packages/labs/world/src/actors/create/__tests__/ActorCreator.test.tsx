// The Actor Creator's shell, and the question it asks first.
//
// The steps after this one are not built, so what is worth pinning is the
// FRAME: that the three doors are a choice, that two of them ask a second
// question and one does not, that nothing may be made until both are answered,
// and that a name the caller refuses stops it rather than being written.

import {fireEvent, render, screen} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';

import type {
  GeneratedPicture,
  ImageGenerator,
} from '../../../appearance/generate/imageGenerator';
import {groupsFor} from '../../enhance/enhancements';
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

/**
 * What the caller would make of these answers, without writing it.
 *
 * A project holding one actor file, which is enough for the abilities step:
 * what those rows read is the actor's own chain (`enhance/EnhancementChecklist`).
 */
const build = vi.fn((draft: {name: string}) => ({
  source: {
    folders: {f1: {id: 'f1', name: 'actors', parentId: '0', open: true}},
    files: {
      made: {
        id: 'made',
        name: 'chaser.actor',
        language: 'actor',
        contents: JSON.stringify({
          blocks: {
            blocks: [{type: 'world_actor', fields: {NAME: draft.name}}],
          },
        }),
        folderId: 'f1',
      },
    },
    openFiles: [],
  } as never,
  path: 'actors/chaser',
}));

/** A generator that answers at once, so the tests are about the flow. */
const DRAWN: GeneratedPicture[] = [
  {name: 'crab', dataUrl: 'data:image/png;base64,AAAA', mediaType: 'image/png'},
  {name: 'star', dataUrl: 'data:image/png;base64,BBBB', mediaType: 'image/png'},
];
const draw = vi.fn(async () => DRAWN);
const drawing: ImageGenerator = {kind: 'fixture', draw};
const onKeep = vi.fn(
  async (picture: GeneratedPicture) => `${picture.name}.png`,
);

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
      build={build}
      drawing={drawing}
      onKeep={onKeep}
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

/** Walk the rest of the way and make it. */
const toTheEnd = () => {
  fireEvent.click(onward());
  fireEvent.click(creator());
};

describe('the wizard shell', () => {
  it('says which step this is, and how many there are', () => {
    // A wizard that does not say where you are is a sequence of dialogs that
    // happen to follow each other.
    show();

    expect(screen.getByText(/Step 1 of 3/)).toBeTruthy();
    expect(screen.getByText(/Where does it come from/)).toBeTruthy();
  });

  it('will not go on until a door is chosen', () => {
    show();

    expect(onward()).toBeDisabled();
  });

  it('goes on, and comes back with the answers still there', () => {
    show();
    pastOrigin('Copy one of mine', 'Chaser', 'Crawler');
    expect(screen.getByText(/Step 2 of 3/)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', {name: 'Back'}));
    expect(screen.getByText(/Step 1 of 3/)).toBeTruthy();
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
    toTheEnd();
    // The DRAFT goes to `build`, which answers what the actor would be; what
    // `onCreate` is handed is that answer, to write.
    expect(build).toHaveBeenCalledWith({
      origin: 'copy',
      source: 'a2',
      // The chosen actor's own name, since an untouched field is not an
      // unanswered question — it is the answer the door already gave.
      name: 'Crawler',
      // …and nothing about its look, which it already has.
      look: undefined,
      // One tile, which every actor is and which writes no row.
      shape: {x: 1, y: 1},
    });
    expect(onCreate).toHaveBeenCalled();
  });

  it('asks which of theirs, and names it what the library calls it', () => {
    show();
    fireEvent.click(screen.getByText('Start from a template'));
    fireEvent.click(screen.getByRole('button', {name: 'Coin'}));
    fireEvent.click(onward());
    toTheEnd();

    expect(build).toHaveBeenCalledWith(
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
    toTheEnd();

    expect(build).toHaveBeenCalledWith(
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
    toTheEnd();

    await vi.waitFor(() => expect(onCancel).toHaveBeenCalled());
  });

  it('stays up when it did not', async () => {
    // The caller's complaint is on screen by then, and a wizard that vanished
    // would take the answers with it.
    onCreate.mockReturnValueOnce(false);
    show();
    pastOrigin('Create my own');
    toTheEnd();

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

    expect(onward()).not.toBeDisabled();
    toTheEnd();
    expect(build).toHaveBeenCalledWith(
      expect.objectContaining({look: undefined}),
    );
  });

  it('hands back the picture that was pressed', () => {
    show();
    pastOrigin('Create my own');
    fireEvent.click(screen.getByRole('button', {name: 'crawler.png'}));
    toTheEnd();

    expect(build).toHaveBeenCalledWith(
      expect.objectContaining({look: {kind: 'sprite', value: 'crawler.png'}}),
    );
  });

  it('hands back an animation by its own id', () => {
    // What a `play animation` row stores is the animation's key inside its
    // `.anim` file, which is not always the file's stem.
    show();
    pastOrigin('Create my own');
    fireEvent.click(screen.getByRole('button', {name: 'Coin Spin'}));
    toTheEnd();

    expect(build).toHaveBeenCalledWith(
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
    toTheEnd();
    expect(build).toHaveBeenCalledWith(
      expect.objectContaining({look: undefined}),
    );
  });
});

describe('the abilities step', () => {
  /** Walk to the third step, having made an actor from nothing. */
  const toAbilities = () => {
    show();
    pastOrigin('Create my own');
    fireEvent.click(onward());
  };

  /**
   * Open a group, which the shelf now starts with shut.
   *
   * Thirteen rows is past what the dialog holds without scrolling, so the
   * groups fold themselves — the rule the checklist's own tests pin at fifteen
   * with a stand-in shelf (`enhance/__tests__/EnhancementChecklist`). A test
   * that wants a row has to open its heading, exactly as a learner does.
   */
  const openGroup = (name: string) => {
    const heading = screen.getByRole('button', {name: new RegExp(name)});
    if (heading.getAttribute('aria-expanded') === 'false') {
      fireEvent.click(heading);
    }
  };

  it('reads the actor being made, not the project as it stands', () => {
    // The whole of what `build` is for: the rows ask what THIS actor has, and
    // it is not in the learner's project yet.
    toAbilities();

    expect(build).toHaveBeenCalledWith(
      expect.objectContaining({name: 'Chaser'}),
    );
    expect(screen.getByText(/Step 3 of 3/)).toBeTruthy();
    expect(screen.getByText('Walks and jumps like a platformer')).toBeTruthy();
  });

  it('is a list to tick rather than a row to press and confirm', () => {
    // IT WAS TWO MISTAKES WEARING ONE COAT. An `Add this` button under the
    // rows is a press that is not the press a learner was going to make
    // anyway — the trap the drawing panel had — and it was needed once PER
    // ability, which nothing on screen said.
    toAbilities();

    openGroup('Being an enemy');
    expect(screen.queryByRole('button', {name: 'Add this'})).toBeNull();
    expect(
      screen.getByRole('checkbox', {name: 'Walks a beat'}),
    ).not.toBeChecked();
  });

  it('takes as many as you like, and applies them all at Create', () => {
    toAbilities();
    openGroup('Being an enemy');
    for (const ability of ['Walks a beat', 'Hurts what it touches']) {
      fireEvent.click(screen.getByRole('checkbox', {name: ability}));
    }
    // Nothing has been applied yet: the actor is still the one step two made.
    expect(onCreate).not.toHaveBeenCalled();

    fireEvent.click(creator());

    const written = (
      onCreate.mock.calls.at(-1) as unknown as [
        {files: Record<string, {contents: string}>},
      ]
    )[0];
    expect(written.files.made.contents).toContain('Patrol#PatrolsAcrossTrait');
    expect(written.files.made.contents).toContain('Damage');
  });

  it('lets one be taken back off again', () => {
    // Which the old step could not do at all: applied was applied.
    toAbilities();
    openGroup('Being an enemy');
    const tick = () => screen.getByRole('checkbox', {name: 'Walks a beat'});
    fireEvent.click(tick());
    expect(tick()).toBeChecked();

    fireEvent.click(tick());
    expect(tick()).not.toBeChecked();

    fireEvent.click(creator());
    const written = (
      onCreate.mock.calls.at(-1) as unknown as [
        {files: Record<string, {contents: string}>},
      ]
    )[0];
    expect(written.files.made.contents).not.toContain(
      'Patrol#PatrolsAcrossTrait',
    );
  });

  it('ticks and locks what the actor already has', () => {
    // TWO OF STEP ONE'S THREE DOORS hand this step an actor that can already
    // do things — a copied Crawler patrols — and the honest way to show that
    // is the same tick in the same column, not a row greyed out for reasons of
    // its own. The tick is not a claim that this step did it.
    const patrolling = vi.fn(() => ({
      source: {
        folders: {f1: {id: 'f1', name: 'actors', parentId: '0', open: true}},
        files: {
          made: {
            id: 'made',
            name: 'chaser.actor',
            language: 'actor',
            contents: JSON.stringify({
              blocks: {
                blocks: [
                  {
                    type: 'world_actor',
                    fields: {NAME: 'Chaser'},
                    next: {
                      block: {
                        type: 'world_use_trait',
                        fields: {TRAIT: 'Patrol#PatrolsAcrossTrait'},
                      },
                    },
                  },
                ],
              },
            }),
            folderId: 'f1',
          },
        },
        openFiles: [],
      } as never,
      path: 'actors/chaser',
    }));
    show({build: patrolling});
    pastOrigin('Create my own');
    fireEvent.click(onward());

    openGroup('Being an enemy');
    const walks = screen.getByRole('checkbox', {name: 'Walks a beat'});
    expect(walks).toBeChecked();
    expect(walks).toBeDisabled();
    // …and the one it has not got is neither.
    const hurts = screen.getByRole('checkbox', {
      name: 'Hurts what it touches',
    });
    expect(hurts).not.toBeChecked();
    expect(hurts).not.toBeDisabled();
  });

  it('sorts them under headings, so one run can be told from the next', () => {
    // Ten rows read as a list; thirty will be a wall again, and the rule shelf
    // had to learn that already (`rules/stockRuleGroups`). The order was the
    // grouping all along — it was three comments nobody could see.
    toAbilities();

    for (const heading of [
      'Being the player',
      'Gravity and ground',
      'Health, scoring and speech',
      'Being an enemy',
    ]) {
      expect(
        screen.getByRole('heading', {name: new RegExp(heading)}),
      ).toBeTruthy();
    }
    // …and not a heading with nothing under it: these are an actor's rows, so
    // the world's group is not drawn at all.
    expect(
      screen.queryByRole('heading', {name: /What the screen shows/}),
    ).toBeNull();
  });

  it('says how many are under each heading', () => {
    // Which is what makes a shut group worth looking at rather than a word
    // with nothing behind it.
    //
    // ASKED OF THE SHELF rather than of a number written here: this said
    // "Being an enemy 3" until two more enemies were added, and a test that
    // must be edited every time a row lands is one that will be edited
    // without being read.
    toAbilities();

    const enemies = groupsFor({
      kind: 'actor',
      path: 'actors/chaser',
      name: 'Chaser',
    }).find(group => group.name === 'Being an enemy')!;

    expect(
      screen.getByRole('button', {
        name: new RegExp(`Being an enemy ${enemies.members.length}`),
      }),
    ).toBeTruthy();
  });

  it('opens a group, and folds it away again', () => {
    toAbilities();
    const heading = () =>
      screen.getByRole('button', {name: /Gravity and ground/});
    const row = () => screen.queryByRole('checkbox', {name: 'Holds things up'});

    // Out of the accessibility tree while shut, not merely out of sight: a
    // folded row is not a control anything should be able to reach.
    expect(heading()).toHaveAttribute('aria-expanded', 'false');
    expect(row()).toBeNull();

    fireEvent.click(heading());
    expect(heading()).toHaveAttribute('aria-expanded', 'true');
    expect(row()).toBeTruthy();

    fireEvent.click(heading());
    expect(row()).toBeNull();
  });

  it('starts folded, the shelf being past what fits at once', () => {
    // Thirteen rows over five headings. The rule itself — open while the whole
    // list can be seen, shut above that — is pinned at both sizes with a
    // stand-in shelf (`enhance/__tests__/EnhancementChecklist`); this is the
    // real one, which crossed the line when the shelf grew.
    toAbilities();

    for (const group of ['Being the player', 'Being an enemy']) {
      expect(
        screen.getByRole('button', {name: new RegExp(group)}),
      ).toHaveAttribute('aria-expanded', 'false');
    }
  });

  it('keeps the description behind a press', () => {
    // Twelve rows of name, sentence and "also adds" is a wall; twelve names
    // is a list you can scan.
    toAbilities();
    openGroup('Being an enemy');
    expect(screen.queryByText(/pacing left and right/)).toBeNull();

    fireEvent.click(
      screen.getByRole('button', {name: 'What Walks a beat does'}),
    );
    expect(screen.getByText(/pacing left and right/)).toBeTruthy();
  });

  it('builds afresh when the answers behind it change', () => {
    // Walking back to rename and forward again must not leave this step
    // editing the actor that was.
    toAbilities();
    fireEvent.click(screen.getByRole('button', {name: 'Back'}));
    fireEvent.click(screen.getByRole('button', {name: 'Back'}));
    fireEvent.change(name(), {target: {value: 'Stalker'}});
    fireEvent.click(onward());
    fireEvent.click(onward());

    expect(build).toHaveBeenLastCalledWith(
      expect.objectContaining({name: 'Stalker'}),
    );
  });
});

describe('the way out', () => {
  const out = () => screen.getByRole('button', {name: 'Create it now'});

  it('is on every step but the last, where the button already says it', () => {
    // `New actor` was one press for a learner who knew what they wanted. Three
    // Nexts answerable with nothing is two questions walked past.
    show();
    pastOrigin('Create my own');
    expect(out()).toBeTruthy();

    fireEvent.click(onward());
    expect(screen.queryByRole('button', {name: 'Create it now'})).toBeNull();
    expect(screen.getByRole('button', {name: 'Create'})).toBeTruthy();
  });

  it('waits for the wizard to have enough to make one', () => {
    show();
    expect(out()).toBeDisabled();

    fireEvent.click(screen.getByText('Create my own'));
    fireEvent.change(name(), {target: {value: 'Chaser'}});
    expect(out()).not.toBeDisabled();
  });

  it('makes the actor out of the answers given so far', async () => {
    show();
    fireEvent.click(screen.getByText('Create my own'));
    fireEvent.change(name(), {target: {value: 'Chaser'}});

    fireEvent.click(out());

    expect(build).toHaveBeenCalledWith(
      expect.objectContaining({origin: 'new', name: 'Chaser', look: undefined}),
    );
    await vi.waitFor(() => expect(onCreate).toHaveBeenCalled());
    await vi.waitFor(() => expect(onCancel).toHaveBeenCalled());
  });

  it('takes the picture step’s answer with it', () => {
    show();
    pastOrigin('Create my own');
    fireEvent.click(screen.getByRole('button', {name: 'coin.png'}));

    fireEvent.click(out());

    expect(build).toHaveBeenCalledWith(
      expect.objectContaining({look: {kind: 'sprite', value: 'coin.png'}}),
    );
  });

  it('keeps a drawn picture on the way out', async () => {
    show();
    pastOrigin('Create my own');
    fireEvent.click(screen.getByText(/Or describe one to be drawn/));
    fireEvent.change(screen.getByLabelText('Describe a picture'), {
      target: {value: 'a crab'},
    });
    fireEvent.click(screen.getByRole('button', {name: 'Draw'}));
    await screen.findByRole('img');

    fireEvent.click(out());

    await vi.waitFor(() => expect(onKeep).toHaveBeenCalledWith(DRAWN[0]));
    await vi.waitFor(() =>
      expect(build).toHaveBeenCalledWith(
        expect.objectContaining({look: {kind: 'sprite', value: 'crab.png'}}),
      ),
    );
  });

  it('stays put when the actor could not be made', async () => {
    // The caller's complaint is on screen by then, and a wizard that vanished
    // would take the answers with it — the same reasoning `Create` has.
    onCreate.mockReturnValueOnce(false as never);
    show();
    fireEvent.click(screen.getByText('Create my own'));
    fireEvent.change(name(), {target: {value: 'Chaser'}});

    fireEvent.click(out());

    await vi.waitFor(() => expect(onCreate).toHaveBeenCalled());
    expect(onCancel).not.toHaveBeenCalled();
  });
});

describe('describing a picture', () => {
  /** Step two, with the drawing panel open. */
  const atThePictures = () => {
    show();
    pastOrigin('Create my own');
    fireEvent.click(screen.getByText(/Or describe one to be drawn/));
  };

  it('is a door under the pictures the project has', () => {
    // Another way of answering the same question, and the likelier answer is
    // still one of the pictures already there — so it is a press away rather
    // than in the way.
    show();
    pastOrigin('Create my own');
    expect(screen.queryByLabelText('Describe a picture')).toBeNull();

    fireEvent.click(screen.getByText(/Or describe one to be drawn/));
    expect(screen.getByLabelText('Describe a picture')).toBeTruthy();
    expect(screen.getByRole('button', {name: 'Draw'})).toBeDisabled();
  });

  it('takes the whole view, and gives it back', () => {
    // A prompt, a shape and a picture big enough to judge do not fit under the
    // grid; the grid is a press away in both directions.
    atThePictures();
    expect(screen.queryByRole('button', {name: 'coin.png'})).toBeNull();

    fireEvent.click(screen.getByRole('button', {name: /Choose a picture/}));
    expect(screen.getByRole('button', {name: 'coin.png'})).toBeTruthy();
  });

  it('asks how many tiles it fills', () => {
    atThePictures();

    expect(screen.getByLabelText('How many tiles it fills')).toBeTruthy();
  });

  it('is not offered at all when nothing can draw', () => {
    // A lab with nothing behind the door should look like a lab without the
    // feature, rather than one whose button fails.
    show({drawing: undefined});
    pastOrigin('Create my own');

    expect(screen.queryByText(/Or describe one to be drawn/)).toBeNull();
  });

  it('asks with the learner’s own words', async () => {
    atThePictures();
    fireEvent.change(screen.getByLabelText('Describe a picture'), {
      target: {value: '  a purple crab  '},
    });
    fireEvent.click(screen.getByRole('button', {name: 'Draw'}));

    await vi.waitFor(() => expect(draw).toHaveBeenCalled());
    const asked = draw.mock.calls.at(-1) as unknown as [{prompt: string}];
    expect(asked[0].prompt).toBe('a purple crab');
  });

  it('shows what came back, big enough to judge', async () => {
    atThePictures();
    fireEvent.change(screen.getByLabelText('Describe a picture'), {
      target: {value: 'a crab'},
    });
    fireEvent.click(screen.getByRole('button', {name: 'Draw'}));

    expect(await screen.findByRole('img')).toBeTruthy();
    expect(screen.getByRole('button', {name: 'Keep this one'})).toBeTruthy();
  });

  it('keeps the words, so asking again is an edit', async () => {
    // The commonest second action is a small change to the prompt rather than
    // a fresh thought.
    atThePictures();
    const field = screen.getByLabelText('Describe a picture');
    fireEvent.change(field, {target: {value: 'a crab'}});
    fireEvent.click(screen.getByRole('button', {name: 'Draw'}));

    await screen.findByRole('button', {name: 'Keep this one'});
    expect((field as HTMLTextAreaElement).value).toBe('a crab');
  });

  it('writes the one that was pressed, and makes it the actor’s picture', async () => {
    atThePictures();
    fireEvent.change(screen.getByLabelText('Describe a picture'), {
      target: {value: 'a crab'},
    });
    fireEvent.click(screen.getByRole('button', {name: 'Draw'}));
    fireEvent.click(await screen.findByRole('button', {name: 'Keep this one'}));

    await vi.waitFor(() => expect(onKeep).toHaveBeenCalledWith(DRAWN[0]));
    // …and the panel gives the view back, with the kept picture chosen among
    // the project's own — it is one of those now.
    await vi.waitFor(() =>
      expect(screen.getByRole('button', {name: 'coin.png'})).toBeTruthy(),
    );
    toTheEnd();
    expect(build).toHaveBeenCalledWith(
      expect.objectContaining({look: {kind: 'sprite', value: 'crab.png'}}),
    );
  });

  it('says so when the drawing failed, rather than showing nothing', async () => {
    // The fixture cannot fail, so this was dead until the dev proxy could: a
    // service that refuses a key leaves a learner pressing a button that
    // appears to do nothing, and "nothing happened" is the one answer a door
    // must never give.
    draw.mockRejectedValueOnce(
      new Error('The drawing service refused the key.') as never,
    );
    atThePictures();
    fireEvent.change(screen.getByLabelText('Describe a picture'), {
      target: {value: 'a crab'},
    });
    fireEvent.click(screen.getByRole('button', {name: 'Draw'}));

    expect(
      await screen.findByText('The drawing service refused the key.'),
    ).toBeTruthy();
    // …and the button comes back, so asking again is one press.
    expect(screen.getByRole('button', {name: 'Draw'})).not.toBeDisabled();
  });

  it('clears the complaint when the next ask works', async () => {
    draw.mockRejectedValueOnce(new Error('Busy.') as never);
    atThePictures();
    const field = screen.getByLabelText('Describe a picture');
    fireEvent.change(field, {target: {value: 'a crab'}});
    fireEvent.click(screen.getByRole('button', {name: 'Draw'}));
    await screen.findByText('Busy.');

    fireEvent.click(screen.getByRole('button', {name: 'Draw'}));

    await screen.findByRole('button', {name: 'Keep this one'});
    expect(screen.queryByText('Busy.')).toBeNull();
  });

  it('keeps nothing when the write refused', async () => {
    onKeep.mockResolvedValueOnce(undefined as never);
    atThePictures();
    fireEvent.change(screen.getByLabelText('Describe a picture'), {
      target: {value: 'a crab'},
    });
    fireEvent.click(screen.getByRole('button', {name: 'Draw'}));
    fireEvent.click(await screen.findByRole('button', {name: 'Keep this one'}));

    await vi.waitFor(() => expect(onKeep).toHaveBeenCalled());
    // Still there to try again, rather than silently gone.
    expect(screen.getByRole('button', {name: 'Keep this one'})).toBeTruthy();
  });

  it('keeps what is drawn when the learner presses on', async () => {
    // THE REPORTED SURPRISE: a picture made, looked at, and not on the actor,
    // because the press that kept it sat beside the press a learner was going
    // to make anyway. Choosing one from the grid costs one press; so does
    // this, and `Next` is what says "that one".
    atThePictures();
    fireEvent.change(screen.getByLabelText('Describe a picture'), {
      target: {value: 'a crab'},
    });
    fireEvent.click(screen.getByRole('button', {name: 'Draw'}));
    await screen.findByRole('img');

    fireEvent.click(onward());

    await vi.waitFor(() => expect(onKeep).toHaveBeenCalledWith(DRAWN[0]));
    await vi.waitFor(() =>
      expect(build).toHaveBeenCalledWith(
        expect.objectContaining({look: {kind: 'sprite', value: 'crab.png'}}),
      ),
    );
  });

  it('stays put when the write refused, rather than walking on without it', async () => {
    onKeep.mockResolvedValueOnce(undefined as never);
    atThePictures();
    fireEvent.change(screen.getByLabelText('Describe a picture'), {
      target: {value: 'a crab'},
    });
    fireEvent.click(screen.getByRole('button', {name: 'Draw'}));
    await screen.findByRole('img');

    fireEvent.click(onward());

    await vi.waitFor(() => expect(onKeep).toHaveBeenCalled());
    // Walking on would be the same surprise wearing a different hat: an actor
    // built without the picture the learner had just been looking at.
    expect(build).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Describe a picture')).toBeTruthy();
  });

  it('does not keep one the learner walked away from', async () => {
    // Going back to the grid is a rejection of the drawn one, so pressing on
    // from there must write nothing.
    atThePictures();
    fireEvent.change(screen.getByLabelText('Describe a picture'), {
      target: {value: 'a crab'},
    });
    fireEvent.click(screen.getByRole('button', {name: 'Draw'}));
    await screen.findByRole('img');

    fireEvent.click(screen.getByRole('button', {name: /Choose a picture/}));
    fireEvent.click(onward());

    expect(onKeep).not.toHaveBeenCalled();
  });

  it('asks what sort of picture it is, which the door cannot tell', async () => {
    // THE REPORTED BUG. The door hard-coded a centred subject, so a learner
    // asking for tileable ground got "draw only the subject, centred … no
    // ground" wrapped round their words. An actor is as often terrain as it is
    // a character — the platformer's ground is an actor.
    atThePictures();
    expect(screen.getByLabelText('What it is')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', {name: /A surface/}));
    fireEvent.click(screen.getByRole('button', {name: 'Side to side'}));
    fireEvent.click(screen.getByRole('button', {name: 'Partly see-through'}));
    fireEvent.change(screen.getByLabelText('Describe a picture'), {
      target: {value: 'a mossy platform with vines under it'},
    });
    fireEvent.click(screen.getByRole('button', {name: 'Draw'}));

    await vi.waitFor(() => expect(draw).toHaveBeenCalled());
    const asked = draw.mock.calls.at(-1) as unknown as [
      {kind?: string; surface?: object},
    ];
    expect(asked[0]).toMatchObject({
      kind: 'surface',
      surface: {ways: 'across', through: true},
    });
  });

  it('keeps the size question for a surface that repeats', async () => {
    // A platform three tiles wide and two high, joining side to side, is one
    // actor whose picture is the whole platform — and `set scale` stretches a
    // sprite rather than repeating it, so the shape has to reach the provider.
    atThePictures();
    fireEvent.click(screen.getByRole('button', {name: /A surface/}));
    expect(screen.getByLabelText('How many tiles it fills')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', {name: '3 across, 2 up'}));
    fireEvent.change(screen.getByLabelText('Describe a picture'), {
      target: {value: 'earth with grass on top'},
    });
    fireEvent.click(screen.getByRole('button', {name: 'Draw'}));

    await vi.waitFor(() => expect(draw).toHaveBeenCalled());
    const asked = draw.mock.calls.at(-1) as unknown as [
      {shape?: object; kind?: string},
    ];
    expect(asked[0]).toMatchObject({kind: 'surface', shape: {x: 3, y: 2}});
  });

  it('writes the shape it was given into the actor', async () => {
    // A fact about the ACTOR rather than the picture, so it survives leaving
    // the panel and is written whatever the picture ends up being.
    atThePictures();
    fireEvent.click(screen.getByRole('button', {name: '2 across, 3 up'}));
    fireEvent.click(screen.getByRole('button', {name: /Choose a picture/}));
    toTheEnd();

    expect(build).toHaveBeenCalledWith(
      expect.objectContaining({shape: {x: 2, y: 3}}),
    );
  });
});
