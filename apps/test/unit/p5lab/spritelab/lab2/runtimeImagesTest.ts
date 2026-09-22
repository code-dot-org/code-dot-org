import {
  CHOSEN_IMAGE,
  chosenImageName,
  costumeNames,
  createImageCommands,
  EVERY_IMAGE,
  expandReferencedImages,
  gridLayout,
  ImageLibrary,
  resolveImageName,
} from '@cdo/apps/p5lab/spritelab/lab2/runtimeImages';
import {RuntimeAnimationList} from '@cdo/apps/p5lab/spritelab/lab2/types';
import {UiSprite} from '@cdo/apps/p5lab/spritelab/lab2/uiSprites';

function props(name: string, categories: string[] = []) {
  return {
    name,
    categories,
    frameSize: {x: 1, y: 1},
    frameCount: 1,
    looping: false,
    frameDelay: 1,
  };
}

const list: RuntimeAnimationList = {
  orderedKeys: ['a', 'b', 'c', 'd'],
  propsByKey: {
    a: props('fern'),
    b: props('garden', ['backgrounds']),
    c: props('cactus'),
    d: props('brick', ['blocks']),
  },
};

describe('costumeNames', () => {
  it('lists costumes in order, not backgrounds or blocks', () => {
    expect(costumeNames(list)).toEqual(['fern', 'cactus']);
  });
});

describe('chosenImageName', () => {
  it('uses the choice while the project still has it', () => {
    expect(chosenImageName('cactus', list)).toBe('cactus');
  });

  it('falls back to the first costume', () => {
    expect(chosenImageName(undefined, list)).toBe('fern');
    expect(chosenImageName('deleted', list)).toBe('fern');
  });
});

describe('resolveImageName', () => {
  it('maps only the chosen marker', () => {
    expect(resolveImageName(CHOSEN_IMAGE, 'cactus', list)).toBe('cactus');
    expect(resolveImageName('fern', 'cactus', list)).toBe('fern');
  });
});

describe('expandReferencedImages', () => {
  it('adds the chosen costume to the preload', () => {
    const out = expandReferencedImages(
      new Set(['garden', CHOSEN_IMAGE]),
      'cactus',
      list
    );
    expect(out && [...out].sort()).toEqual(
      ['@chosen', 'cactus', 'garden'].sort()
    );
  });

  it('preloads everything for a grid of every image', () => {
    expect(
      expandReferencedImages(new Set([EVERY_IMAGE]), undefined, list)
    ).toBeNull();
  });

  it('leaves a plain set alone', () => {
    const plain = new Set(['fern']);
    expect(expandReferencedImages(plain, undefined, list)).toBe(plain);
  });
});

describe('gridLayout', () => {
  it('lays six pictures out three to a row, inside the canvas', () => {
    const cells = gridLayout(6);
    expect(cells).toHaveLength(6);
    expect(new Set(cells.map(c => c.y)).size).toBe(2);
    cells.forEach(c => {
      expect(c.x - c.size / 2).toBeGreaterThanOrEqual(0);
      expect(c.x + c.size / 2).toBeLessThanOrEqual(400);
      expect(c.y + c.size / 2).toBeLessThanOrEqual(400);
    });
  });

  it('is empty for no pictures', () => {
    expect(gridLayout(0)).toEqual([]);
  });
});

describe('createImageCommands', () => {
  function world(sprites: Partial<UiSprite>[]) {
    const events: ((args: unknown) => void)[] = [];
    const added: unknown[] = [];
    const library: ImageLibrary = {
      addSprite: opts => added.push(opts),
      getSpriteArray: arg =>
        sprites.filter(s => s.id === (arg as {id?: number}).id) as UiSprite[],
      addEvent: (_type, _args, callback) => events.push(callback),
    };
    return {events, added, library};
  }

  it('chooses the clicked picture, then runs the handler', () => {
    const {events, library} = world([
      {id: 4, getAnimationLabel: () => 'cactus'},
    ]);
    const store: {chosen?: string} = {};
    const handler = jest.fn();
    createImageCommands(library, store, list).whenImageClicked(handler);
    events[0]({clickedSprite: 4});
    expect(store.chosen).toBe('cactus');
    expect(handler).toHaveBeenCalled();
  });

  it('ignores a click on a button', () => {
    const {events, library} = world([
      {id: 1, __slab2Ui: 'button', getAnimationLabel: () => ''},
    ]);
    const store: {chosen?: string} = {};
    const handler = jest.fn();
    createImageCommands(library, store, list).whenImageClicked(handler);
    events[0]({clickedSprite: 1});
    expect(store.chosen).toBeUndefined();
    expect(handler).not.toHaveBeenCalled();
  });

  it('makes one sprite per costume', () => {
    const {added, library} = world([]);
    createImageCommands(library, {}, list).makeImageGrid();
    expect(added.map(a => (a as {animation: string}).animation)).toEqual([
      'fern',
      'cactus',
    ]);
  });
});
