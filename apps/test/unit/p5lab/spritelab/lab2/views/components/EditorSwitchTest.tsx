import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';

import EditorSwitch from '@cdo/apps/p5lab/spritelab/lab2/views/components/EditorSwitch';

describe('EditorSwitch', () => {
  it('offers Code and World, pressing the one in use, and reports a choice', () => {
    const onChange = jest.fn();
    render(<EditorSwitch value="Code" onChange={onChange} />);
    const world = screen.getByRole('button', {name: 'World'});
    const code = screen.getByRole('button', {name: 'Code'});
    expect(code.getAttribute('aria-pressed')).toBe('true');
    expect(world.getAttribute('aria-pressed')).toBe('false');
    fireEvent.click(world);
    expect(onChange).toHaveBeenCalledWith('World', expect.anything());
  });

  it('disables an editor not on offer, with its reason on hover', () => {
    render(
      <EditorSwitch
        value="Code"
        onChange={jest.fn()}
        disabledEditors={{World: 'A story scene has no world.'}}
      />
    );
    const world = screen.getByRole('button', {name: 'World'});
    expect((world as HTMLButtonElement).disabled).toBe(true);
    expect(world.getAttribute('title')).toBe('A story scene has no world.');
    const code = screen.getByRole('button', {name: 'Code'});
    expect((code as HTMLButtonElement).disabled).toBe(false);
    expect(code.getAttribute('title')).toBeNull();
  });

  it('offers the editors it is given, in order', () => {
    render(
      <EditorSwitch
        value="Pictures"
        onChange={jest.fn()}
        editors={['Pictures', 'Code', 'World']}
      />
    );
    expect(
      screen.getAllByRole('button').map(b => b.textContent?.trim())
    ).toEqual(['Pictures', 'Code', 'World']);
    expect(
      screen
        .getByRole('button', {name: 'Pictures'})
        .getAttribute('aria-pressed')
    ).toBe('true');
  });
});
