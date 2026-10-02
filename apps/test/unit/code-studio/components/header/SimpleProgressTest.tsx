import {render, screen} from '@testing-library/react';
import React from 'react';

import SimpleProgress, {
  subPathFor,
} from '@cdo/apps/code-studio/components/header/SimpleProgress';

// The lesson's levels as getCurrentLevels gives them, with one current.
const levelsWithCurrent = (currentId: string) =>
  [
    {id: '1', headerLabel: 'Getting started', status: 'perfect'},
    {id: '2', headerLabel: 'Story', status: 'passed'},
    {id: '3', headerLabel: 'Story', status: 'attempted'},
    {id: '4', headerLabel: 'Story', status: 'not_tried'},
    {id: '5', headerLabel: undefined, status: 'not_tried'},
  ].map(level => ({...level, isCurrentLevel: level.id === currentId}));

describe('SimpleProgress', () => {
  it('shows the current level label and its place in the sub-path', () => {
    render(
      <SimpleProgress
        imageUrl="/logo.png"
        levels={levelsWithCurrent('3')}
        width={300}
      />
    );
    expect(screen.getByText('Story')).toBeTruthy();
    const bar = screen.getByRole('progressbar');
    expect(bar.getAttribute('aria-valuetext')).toBe('Level 2 of 3');
    expect((bar.firstChild as HTMLElement).style.width).toBe(
      `${(100 * 2) / 3}%`
    );
  });

  it('draws no bar when the label covers one level', () => {
    render(<SimpleProgress levels={levelsWithCurrent('1')} width={300} />);
    expect(screen.getByText('Getting started')).toBeTruthy();
    expect(screen.queryByRole('progressbar')).toBeNull();
  });

  it('shows nothing but the logo for a level without a label', () => {
    render(
      <SimpleProgress
        imageUrl="/logo.png"
        levels={levelsWithCurrent('5')}
        width={300}
      />
    );
    expect(screen.queryByRole('progressbar')).toBeNull();
    expect(document.querySelector('#simple_progress')?.textContent).toBe('');
  });

  it('shrinks to its slot, the label ellipsizing and the bar filling the column', () => {
    render(
      <SimpleProgress
        imageUrl="/logo.png"
        levels={levelsWithCurrent('3')}
        width={120}
      />
    );
    const label = screen.getByText('Story');
    const inner = label.parentElement!.parentElement!;
    expect(inner.style.maxWidth).toBe('100%');
    expect(label.style.textOverflow).toBe('ellipsis');
    expect(label.parentElement!.style.minWidth).toBe('0');
    expect(label.parentElement!.style.flex).toBe('1 1 auto');
    expect(screen.getByRole('progressbar').style.width).toBe('100%');
  });

  it('asks for its natural width even while squeezed, counting what the label hides', () => {
    const setDesiredWidth = jest.fn();
    // A fresh element each time: React skips a re-render of the same one.
    const squeezed = () => (
      <SimpleProgress
        imageUrl="/logo.png"
        levels={levelsWithCurrent('3')}
        width={120}
        setDesiredWidth={setDesiredWidth}
      />
    );
    const {rerender} = render(squeezed());
    const label = screen.getByText('Story');
    // jsdom lays nothing out: the banner measures 0 wide, and the label
    // hides 80px behind its ellipsis.
    Object.defineProperty(label, 'scrollWidth', {value: 140});
    Object.defineProperty(label, 'clientWidth', {value: 60});
    rerender(squeezed());
    expect(setDesiredWidth).toHaveBeenLastCalledWith(81);
  });

  it('names the bar after its label', () => {
    render(<SimpleProgress levels={levelsWithCurrent('3')} width={300} />);
    const bar = screen.getByRole('progressbar');
    expect(bar.getAttribute('aria-labelledby')).toBe('simple_progress_label');
    expect(screen.getByText('Story').id).toBe('simple_progress_label');
  });

  it('reports its natural width', () => {
    const setDesiredWidth = jest.fn();
    render(
      <SimpleProgress
        levels={levelsWithCurrent('2')}
        width={200}
        setDesiredWidth={setDesiredWidth}
      />
    );
    expect(setDesiredWidth).toHaveBeenCalled();
  });
});

describe('subPathFor', () => {
  it('places the current level among those sharing its label', () => {
    expect(subPathFor(levelsWithCurrent('3'))).toEqual({
      label: 'Story',
      position: 2,
      total: 3,
    });
  });

  it('gives only the label when it covers one level', () => {
    expect(subPathFor(levelsWithCurrent('1'))).toEqual({
      label: 'Getting started',
    });
  });

  it("counts a sublevel's parent as current and leaves bonus levels out", () => {
    const levels = [
      {id: '1', headerLabel: 'Story'},
      {id: '2', headerLabel: 'Story', sublevels: [{isCurrentLevel: true}]},
      {id: '3', headerLabel: 'Story', bonus: true},
    ];
    expect(subPathFor(levels)).toEqual({label: 'Story', position: 2, total: 2});
  });

  it('is null for a level without a label, or with no levels', () => {
    expect(subPathFor(levelsWithCurrent('5'))).toBeNull();
    expect(subPathFor(undefined)).toBeNull();
  });
});
