import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';

import EditorStrip from '@cdo/apps/p5lab/spritelab/lab2/views/components/EditorStrip';

describe('EditorStrip', () => {
  it('names the open editor and offers the switch', () => {
    const onChange = jest.fn();
    const {rerender} = render(
      <EditorStrip editor="Code" onChange={onChange} />
    );
    expect(screen.getByRole('heading', {name: 'Workspace'})).toBeTruthy();
    fireEvent.click(screen.getByRole('button', {name: 'World'}));
    expect(onChange).toHaveBeenCalledWith('World', expect.anything());
    rerender(<EditorStrip editor="World" onChange={onChange} />);
    expect(screen.getByRole('heading', {name: 'World'})).toBeTruthy();
  });

  it('names a bare pane with no switch, and can put the switch first', () => {
    const {unmount} = render(<EditorStrip title="Preview" />);
    expect(screen.getByRole('heading', {name: 'Preview'})).toBeTruthy();
    expect(screen.queryByRole('button')).toBeNull();
    unmount();
    render(<EditorStrip editor="Code" onChange={jest.fn()} switchAtStart />);
    const heading = screen.getByRole('heading', {name: 'Workspace'});
    expect(heading.parentElement!.firstElementChild).toBe(heading);
  });
});
