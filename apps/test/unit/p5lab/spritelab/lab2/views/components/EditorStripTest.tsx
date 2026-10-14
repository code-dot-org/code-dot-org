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
});
