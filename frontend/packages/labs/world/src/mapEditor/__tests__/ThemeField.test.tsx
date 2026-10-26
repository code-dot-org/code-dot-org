// The Theme field's way to the themes themselves
// (specs/SHELL_FINISH_PLAN.md, step 4).

import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

import {setFileActHandler} from '../../files/fileActs';
import {ThemeField} from '../ThemeField';

const field = (
  options: Array<readonly [string, string]>,
  onChange: (path: string | undefined) => void,
) => (
  <ThemeField
    value="styles/neon"
    options={options}
    onChange={onChange}
    isReadOnly={false}
  />
);

describe('the Theme field', () => {
  it('opens the chosen theme, and takes a new one once it is made', async () => {
    const acts = vi.fn(async (act: {act: string}) =>
      act.act === 'make' ? 'midnight.style' : undefined,
    );
    setFileActHandler(acts);
    const {rerender} = render(field([['Neon', 'styles/neon']], vi.fn()));
    fireEvent.click(screen.getByRole('button', {name: 'Edit theme'}));
    expect(acts).toHaveBeenCalledWith({
      act: 'open',
      path: 'styles/neon.style',
    });

    fireEvent.click(screen.getByRole('button', {name: 'Themes'}));
    fireEvent.click(screen.getByRole('menuitem', {name: 'Delete Neon…'}));
    expect(acts).toHaveBeenCalledWith({
      act: 'delete',
      path: 'styles/neon.style',
    });
    fireEvent.click(screen.getByRole('button', {name: 'Themes'}));
    fireEvent.click(screen.getByRole('menuitem', {name: 'New theme…'}));
    expect(acts).toHaveBeenCalledWith({
      act: 'make',
      folder: 'styles',
      open: false,
      answer: 'name',
    });
    const onChange = vi.fn();
    rerender(
      field(
        [
          ['Midnight', 'styles/midnight'],
          ['Neon', 'styles/neon'],
        ],
        onChange,
      ),
    );
    await vi.waitFor(() =>
      expect(onChange).toHaveBeenCalledWith('styles/midnight'),
    );
    expect(acts).toHaveBeenCalledWith({
      act: 'open',
      path: 'styles/midnight.style',
    });
    setFileActHandler(null);
  });

  it('offers no Edit for a theme the project does not hold', () => {
    render(field([], vi.fn()));
    expect(screen.queryByRole('button', {name: 'Edit theme'})).toBeNull();
    fireEvent.click(screen.getByRole('button', {name: 'Themes'}));
    expect(
      screen.getAllByRole('menuitem').map(item => item.textContent),
    ).toEqual(['New theme…']);
  });
});
