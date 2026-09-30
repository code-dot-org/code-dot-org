import {render, screen} from '@testing-library/react';
import type {ReactNode} from 'react';
import {expect, it, vi} from 'vitest';

import {SPRITELAB2_BLOCKS} from '../blockly/setup';

// The lab mounts inside a host's <Lab>; what App itself decides is how it
// hands the lab to BlocklyLab.
let labProps: Record<string, unknown> = {};
vi.mock('@code-dot-org/lab/components', () => ({
  BlocklyLab: (props: Record<string, unknown> & {children?: ReactNode}) => {
    labProps = props;
    return <div data-testid="lab">{props.children}</div>;
  },
}));
vi.mock('@code-dot-org/lab/contexts', () => ({
  useLevelProperties: () => ({
    sharedBlocks: [
      {
        pool: 'GamelabJr',
        category: 'Sprites',
        config: {
          func: 'destroy',
          blockText: 'remove {SPRITE}',
          args: [{name: 'SPRITE', type: 'Sprite'}],
        },
      },
    ],
  }),
}));
vi.mock('../views/SpriteLabView', () => ({
  default: () => <div data-testid="view" />,
}));

const {default: App} = await import('../App');

it("gives BlocklyLab the lab's blocks, the level's pool and default sources, around the view", () => {
  render(<App />);

  expect(screen.getByTestId('lab').contains(screen.getByTestId('view'))).toBe(
    true,
  );
  const blocks = (labProps.blocklyProps as {blocks: {type: string}[]}).blocks;
  expect(blocks.slice(0, SPRITELAB2_BLOCKS.length)).toEqual(SPRITELAB2_BLOCKS);
  // The level's pool follows the lab's own blocks.
  expect(blocks.at(-1)?.type).toBe('gamelab_destroy');
  const sources = labProps.defaultSources as {
    source: {blocks: {blocks: {type: string}[]}};
  };
  expect(sources.source.blocks.blocks[0].type).toBe('spritelab2_whenRun');
});
