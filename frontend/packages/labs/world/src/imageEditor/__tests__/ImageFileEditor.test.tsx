// Which pool the image belongs to decides how it is edited.
//
// A sprite may be a grid, so its editor offers to cut one. A backdrop is
// stretched over the whole viewport, so a cell of it means nothing — no grid
// drawn, no controls (BACKGROUNDS.md §5). The folder is the whole of the rule,
// which is why the interesting case is a file that carries a `.sheet` and lives
// under `backgrounds/` anyway: dragging a spritesheet there brings its `.sheet`
// along (appearance/sheetCompanions), and it must still be edited as a picture.

import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

import type {MultiFileSource} from '@code-dot-org/core/api';

/** The heavy half: a canvas editor, replaced by what it was asked to draw. */
vi.mock('../PixelEditor', () => ({
  default: (props: {
    sheet?: unknown;
    onSheetChange?: unknown;
    title: string;
  }) => (
    <div
      data-testid="pixel-editor"
      data-title={props.title}
      data-sheet={props.sheet ? 'grid' : 'picture'}
      data-controls={props.onSheetChange ? 'offered' : 'hidden'}
    />
  ),
}));

const image = (
  id: string,
  name: string,
  folderId: string,
): MultiFileSource['files'][string] => ({
  id,
  name,
  language: 'png',
  contents: '',
  folderId,
  url: 'data:image/png;base64,iVBORw0KGgo=',
});

const sheetFile = (
  id: string,
  name: string,
  folderId: string,
): MultiFileSource['files'][string] => ({
  id,
  name,
  language: 'sheet',
  contents: JSON.stringify({type: 'sheet', cell: {width: 32, height: 32}}),
  folderId,
});

const SOURCE: MultiFileSource = {
  files: {
    strip: image('strip', 'coinSpin.png', 'sprites'),
    stripSheet: sheetFile('stripSheet', 'coinSpin.sheet', 'sprites'),
    // A spritesheet dragged into the backdrops, `.sheet` and all.
    sky: image('sky', 'coinSpin.png', 'backgrounds'),
    skySheet: sheetFile('skySheet', 'coinSpin.sheet', 'backgrounds'),
  },
  folders: {
    sprites: {id: 'sprites', name: 'sprites', parentId: '0'},
    backgrounds: {id: 'backgrounds', name: 'backgrounds', parentId: '0'},
  },
  openFiles: [],
};

vi.mock('@code-dot-org/lab/contexts', () => ({
  useSources: () => ({
    currentSources: {source: SOURCE},
    updateSources: vi.fn(),
  }),
}));

const {ImageFileEditor} = await import('../ImageFileEditor');

const openEditor = (fileId: string) =>
  render(
    <ImageFileEditor
      fileId={fileId}
      initialContents=""
      language="png"
      isReadOnly={false}
      onChange={vi.fn()}
    />,
  );

describe('ImageFileEditor', () => {
  it('offers the grid controls for a sprite', () => {
    openEditor('strip');

    const editor = screen.getByTestId('pixel-editor');
    expect(editor).toHaveAttribute('data-controls', 'offered');
    expect(editor).toHaveAttribute('data-sheet', 'grid');
  });

  it('hides them for a backdrop, even one carrying a .sheet', () => {
    openEditor('sky');

    const editor = screen.getByTestId('pixel-editor');
    expect(editor).toHaveAttribute('data-controls', 'hidden');
    // And no grid drawn over it: the `.sheet` beside it is not believed here.
    expect(editor).toHaveAttribute('data-sheet', 'picture');
  });
});
