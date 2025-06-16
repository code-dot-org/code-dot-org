import Cell from '../Cell';
import DirtDrawer from '../DirtDrawer';
import MazeMap from '../MazeMap';

let svg: SVGSVGElement | undefined;

function setGlobals() {
  svg = document.createElement('div') as unknown as SVGSVGElement;
  svg.id = 'svgMaze';
  svg.innerHTML = '<div class="pegman-location"></div>';
  document.body.appendChild(svg);
}

function cleanupGlobals() {
  if (svg) {
    document.body.removeChild(svg);
  }
}

function createFakeSkin() {
  return {
    dirt: 'http://fakedirt.png',
  };
}

describe('DirtDrawer', () => {
  beforeEach(setGlobals);
  afterEach(cleanupGlobals);

  // The actual values of these are ignored by most of these tests
  const dirtMap: MazeMap<Cell> = MazeMap.parseFromOldValues(
    [
      [1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1],
    ],
    [
      [0, 1, 2, 10, 11, -1, -2, -10, -11],
      [0, 1, 2, 10, 11, -1, -2, -10, -11],
      [0, 1, 2, 10, 11, -1, -2, -10, -11],
    ],
    Cell,
  );

  const skin = createFakeSkin();

  it('spriteIndexForDirt', () => {
    expect(DirtDrawer.spriteIndexForDirt(-11)).toEqual(0);
    expect(DirtDrawer.spriteIndexForDirt(-10)).toEqual(1);
    expect(DirtDrawer.spriteIndexForDirt(-9)).toEqual(2);
    expect(DirtDrawer.spriteIndexForDirt(-8)).toEqual(3);
    expect(DirtDrawer.spriteIndexForDirt(-7)).toEqual(4);
    expect(DirtDrawer.spriteIndexForDirt(-6)).toEqual(5);
    expect(DirtDrawer.spriteIndexForDirt(-5)).toEqual(6);
    expect(DirtDrawer.spriteIndexForDirt(-4)).toEqual(7);
    expect(DirtDrawer.spriteIndexForDirt(-3)).toEqual(8);
    expect(DirtDrawer.spriteIndexForDirt(-2)).toEqual(9);
    expect(DirtDrawer.spriteIndexForDirt(-1)).toEqual(10);
    expect(DirtDrawer.spriteIndexForDirt(0)).toEqual(-1);
    expect(DirtDrawer.spriteIndexForDirt(1)).toEqual(11);
    expect(DirtDrawer.spriteIndexForDirt(2)).toEqual(12);
    expect(DirtDrawer.spriteIndexForDirt(3)).toEqual(13);
    expect(DirtDrawer.spriteIndexForDirt(4)).toEqual(14);
    expect(DirtDrawer.spriteIndexForDirt(5)).toEqual(15);
    expect(DirtDrawer.spriteIndexForDirt(6)).toEqual(16);
    expect(DirtDrawer.spriteIndexForDirt(7)).toEqual(17);
    expect(DirtDrawer.spriteIndexForDirt(8)).toEqual(18);
    expect(DirtDrawer.spriteIndexForDirt(9)).toEqual(19);
    expect(DirtDrawer.spriteIndexForDirt(10)).toEqual(20);
    expect(DirtDrawer.spriteIndexForDirt(11)).toEqual(21);
  });

  it('createImage', () => {
    if (!svg) {
      fail('svg not created');
    }

    const drawer: DirtDrawer = new DirtDrawer(dirtMap, skin.dirt, svg);

    const row = 2;
    const col = 3;

    let image = document.getElementById(DirtDrawer.cellId('dirt', row, col));
    let clip = document.getElementById(DirtDrawer.cellId('dirtClip', row, col));

    expect(image).toBeNull();
    expect(clip).toBeNull();

    drawer.getOrCreateImage_('dirt', row, col);

    image = document.getElementById(DirtDrawer.cellId('dirt', row, col));
    clip = document.getElementById(DirtDrawer.cellId('dirtClip', row, col));

    expect(image).toBeDefined();
    expect(clip).toBeDefined();
    expect(clip?.childNodes).toBeDefined();
    const rect = clip?.childNodes[0] as HTMLElement | undefined;
    expect(rect).toBeDefined();

    expect(parseInt(rect?.getAttribute('x') || '0')).toEqual(150);
    expect(parseInt(rect?.getAttribute('y') || '0')).toEqual(100);
    expect(parseInt(rect?.getAttribute('width') || '0')).toEqual(50);
    expect(parseInt(rect?.getAttribute('height') || '0')).toEqual(50);

    expect(image?.getAttribute('xlink:href')).toEqual(skin.dirt);
    expect(parseInt(image?.getAttribute('height') || '0')).toEqual(50);
    expect(parseInt(image?.getAttribute('width') || '0')).toEqual(1100);
    expect(image?.getAttribute('clip-path')).toEqual(
      'url(#' + DirtDrawer.cellId('dirtClip', row, col) + ')',
    );
  });

  describe('updateItemImage', () => {
    let drawer: DirtDrawer;
    const row = 0;
    const col = 0;
    const dirtId = DirtDrawer.cellId('', row, col);

    beforeEach(() => {
      if (!svg) {
        fail('svg not created');
      }

      drawer = new DirtDrawer(dirtMap, skin.dirt, svg);
    });

    it('update from nonExistent to hidden', () => {
      expect(document.getElementById(dirtId)).toBeNull();
      drawer.map_.setValue(row, col, 0);
      drawer.updateItemImage(row, col);
      expect(document.getElementById(dirtId)).toBeNull();
    });

    it('update from nonExistent to visible', () => {
      expect(document.getElementById(dirtId)).toBeNull();
      drawer.map_.setValue(row, col, -11);
      drawer.updateItemImage(row, col);
      expect(document.getElementById(dirtId)).not.toBeNull();
    });

    it('update from visible to hidden', () => {
      // create image
      drawer.map_.setValue(row, col, -11);
      drawer.updateItemImage(row, col);
      let image = document.getElementById(dirtId);
      expect(image).not.toBeNull();
      expect(image?.getAttribute('visibility')).toEqual('visible');

      drawer.map_.setValue(row, col, 0);
      drawer.updateItemImage(row, col);
      image = document.getElementById(dirtId);
      expect(image).not.toBeNull();
      expect(image?.getAttribute('visibility')).toEqual('hidden');
    });

    it('update from visible to visible', () => {
      // create image
      drawer.map_.setValue(row, col, -11);
      drawer.updateItemImage(row, col);
      let image = document.getElementById(dirtId);
      expect(image).not.toBeNull();
      expect(image?.getAttribute('visibility')).toEqual('visible');
      expect(parseInt(image?.getAttribute('x') || '0')).toEqual(50 * col);
      expect(parseInt(image?.getAttribute('y') || '0')).toEqual(50 * row);

      drawer.map_.setValue(row, col, -9);
      drawer.updateItemImage(row, col);
      image = document.getElementById(dirtId);
      expect(image).not.toBeNull();
      expect(image?.getAttribute('visibility')).toEqual('visible');
      // make sure we updated x/y
      expect(parseInt(image?.getAttribute('x') || '0')).toEqual(50 * (col - 2));
      expect(parseInt(image?.getAttribute('y') || '0')).toEqual(50 * row);
    });

    it('update from hidden to visible', () => {
      // create image
      drawer.map_.setValue(row, col, -11);
      drawer.updateItemImage(row, col);
      // hide it
      drawer.map_.setValue(row, col, 0);
      drawer.updateItemImage(row, col);

      let image = document.getElementById(dirtId);
      expect(image).not.toBeNull();
      expect(image?.getAttribute('visibility')).toEqual('hidden');

      drawer.map_.setValue(row, col, -9);
      drawer.updateItemImage(row, col);
      image = document.getElementById(dirtId);
      expect(image).not.toBeNull();
      expect(image?.getAttribute('visibility')).toEqual('visible');
      // make sure we updated x/y
      expect(parseInt(image?.getAttribute('x') || '0')).toEqual(50 * (col - 2));
      expect(parseInt(image?.getAttribute('y') || '0')).toEqual(50 * row);
    });

    it('update from hidden to hidden', () => {
      // create image
      drawer.map_.setValue(row, col, -11);
      drawer.updateItemImage(row, col);
      // hide it
      drawer.map_.setValue(row, col, 0);
      drawer.updateItemImage(row, col);

      let image = document.getElementById(dirtId);
      expect(image).not.toBeNull();
      expect(image?.getAttribute('visibility')).toEqual('hidden');

      drawer.map_.setValue(row, col, 0);
      drawer.updateItemImage(row, col);
      image = document.getElementById(dirtId);
      expect(image).not.toBeNull();
      expect(image?.getAttribute('visibility')).toEqual('hidden');
    });
  });
});
