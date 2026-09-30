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
vi.mock('../views/SpriteLabView', () => ({
  default: () => <div data-testid="view" />,
}));

const {default: App} = await import('../App');

it("gives BlocklyLab the lab's blocks and default sources, around the view", () => {
  render(<App />);

  expect(screen.getByTestId('lab').contains(screen.getByTestId('view'))).toBe(
    true,
  );
  expect((labProps.blocklyProps as {blocks: unknown}).blocks).toBe(
    SPRITELAB2_BLOCKS,
  );
  const sources = labProps.defaultSources as {
    source: {blocks: {blocks: {type: string}[]}};
  };
  expect(sources.source.blocks.blocks[0].type).toBe('spritelab2_whenRun');
});
