import {afterEach, describe, expect, it} from 'vitest';

import {Blockly} from '@code-dot-org/blockly';

import {addActorThumbnails, setActorThumbnails} from '../actorThumbnails';
import {localActorValue} from '../localActors';
import {
  actorFieldOptions,
  actorOptions,
  bindLiveOptions,
  setProjectActors,
} from '../moduleOptions';

// Registries are module state; reset between cases.
afterEach(() => {
  setProjectActors([]);
  setActorThumbnails({});
});

/** A field whose workspace holds one `define actor` named `name`. */
const fieldInWorldWith = (blockId: string, name: string) => {
  const blocks = [
    {
      id: blockId,
      type: 'world_actor',
      getFieldValue: (f: string) => (f === 'NAME' ? name : undefined),
    },
    {id: 'w', type: 'world_world', getFieldValue: () => undefined},
  ];
  return {
    getSourceBlock: () => ({
      workspace: {
        getTopBlocks: () => blocks,
        getBlockById: (id: string) => blocks.find(b => b.id === id) ?? null,
      },
    }),
  } as never;
};

const PIXEL = 'data:image/png;base64,AAAA';

describe('moduleOptions', () => {
  it('returns the actor options it was given', () => {
    setProjectActors([
      ['Player', 'actors/player'],
      ['Ground', 'actors/ground'],
    ]);
    expect(actorOptions()).toEqual([
      ['Player', 'actors/player'],
      ['Ground', 'actors/ground'],
    ]);
  });

  it('falls back to a single (none) option when empty', () => {
    expect(actorOptions()).toEqual([['(none)', '']]);
  });
});

describe('a live dropdown', () => {
  // What a list looks like while a file is still loading: the block is built,
  // its value is set, and the thing that value names has not been read yet.
  let listed: Array<[string, string]> = [];
  const field = () => {
    const made = new Blockly.FieldDropdown([['(none)', '']]);
    bindLiveOptions(made, () => listed);
    return made;
  };

  it('asks for the options every time, rather than trusting a cache', () => {
    // Blockly caches the generated list and hands the CACHED one to
    // `doValueUpdate_`, which is where the label comes from. A live list
    // generated at block-construction time is a snapshot of a half-loaded file.
    const dropdown = field();
    listed = [['Player', 'actors/player']];
    expect(dropdown.getOptions(true)).toEqual([['Player', 'actors/player']]);
    listed = [['Coin', 'actors/coin']];
    expect(dropdown.getOptions(true)).toEqual([['Coin', 'actors/coin']]);
  });

  it('names the value it holds once something explains it', () => {
    // The reported bug: a `create ⟨actor⟩ in map` naming an actor defined
    // further down the same world drew the FIRST actor's name. The value was
    // right — the game ran with the right actor, and the menu opened on the
    // right row — and only the label was wrong, because Blockly resolves it
    // once, against the list as it was, and leaves it alone when it misses.
    listed = [['Player', 'actors/player']];
    const dropdown = field();
    dropdown.setValue('actors/player');
    expect(dropdown.getText()).toBe('Player');

    // Loaded before the `define actor` it names…
    dropdown.setValue('local:blockId');
    expect(dropdown.getText()).toBe('Player');

    // …and read again once that block exists.
    listed = [
      ['Blob', 'local:blockId'],
      ['Player', 'actors/player'],
    ];
    expect(dropdown.getText()).toBe('Blob');
  });

  it('keeps the name it had for a value nothing explains', () => {
    // A value naming something genuinely gone. Showing the raw `local:…` or an
    // empty chip would be worse than a stale name: the block still says what it
    // was set to, and the menu is where the truth is.
    listed = [['Player', 'actors/player']];
    const dropdown = field();
    dropdown.setValue('actors/player');
    listed = [['Coin', 'actors/coin']];

    expect(dropdown.getValue()).toBe('actors/player');
    expect(dropdown.getText()).toBe('Player');
  });
});

describe('actorFieldOptions', () => {
  it('draws a world’s own actor with its picture', () => {
    // The thumbnail registry is keyed by the TYPE a placed actor carries, and
    // the dropdown stores `local:<block id>` — two different strings on
    // purpose, since the value has to survive a rename and the type has to
    // match what the running world stamps. Looking one up by the other found
    // nothing at all, so a single-world project got a list of names beside a
    // project's list of pictures.
    addActorThumbnails({Coin: PIXEL});
    const [option] = actorFieldOptions(fieldInWorldWith('a1', 'Coin'));

    expect(option).toEqual([
      {src: PIXEL, width: 24, height: 24, alt: 'Coin'},
      localActorValue('a1'),
    ]);
  });

  it('falls back to the name while no picture has arrived', () => {
    // Thumbnails are rendered by the sandbox and turn up after the editor has
    // drawn, so "no picture yet" is the ordinary first state and not an error.
    const [option] = actorFieldOptions(fieldInWorldWith('a1', 'Coin'));
    expect(option).toEqual(['Coin', localActorValue('a1')]);
  });

  it('still keys a module actor by its path', () => {
    setProjectActors([['Player', 'actors/player']]);
    addActorThumbnails({'actors/player': PIXEL});
    const [option] = actorFieldOptions(undefined);

    expect(option).toEqual([
      {src: PIXEL, width: 24, height: 24, alt: 'Player'},
      'actors/player',
    ]);
  });
});
