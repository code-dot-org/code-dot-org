import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';

import EditorSwitch from '@cdo/apps/p5lab/spritelab/lab2/views/components/EditorSwitch';

describe('EditorSwitch', () => {
  it('offers World and Code, pressing the one in use, and reports a choice', () => {
    const onChange = jest.fn();
    render(<EditorSwitch value="Code" onChange={onChange} />);
    const world = screen.getByRole('button', {name: 'World'});
    const code = screen.getByRole('button', {name: 'Code'});
    expect(code.getAttribute('aria-pressed')).toBe('true');
    expect(world.getAttribute('aria-pressed')).toBe('false');
    fireEvent.click(world);
    expect(onChange).toHaveBeenCalledWith('World', expect.anything());
  });
});
