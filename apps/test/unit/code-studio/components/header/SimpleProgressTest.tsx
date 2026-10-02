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
      <SimpleProgress imageUrl="/logo.png" levels={levelsWithCurrent('3')} />
    );
    expect(screen.getByText('Story')).toBeTruthy();
    const bar = screen.getByRole('progressbar');
    expect(bar.getAttribute('aria-valuetext')).toBe('Level 2 of 3');
    expect((bar.firstChild as HTMLElement).style.width).toBe(
      `${(100 * 2) / 3}%`
    );
  });

  it('draws no bar when the label covers one level', () => {
    render(<SimpleProgress levels={levelsWithCurrent('1')} />);
    expect(screen.getByText('Getting started')).toBeTruthy();
    expect(screen.queryByRole('progressbar')).toBeNull();
  });

  it('shows nothing but the logo for a level without a label', () => {
    render(
      <SimpleProgress imageUrl="/logo.png" levels={levelsWithCurrent('5')} />
    );
    expect(screen.queryByRole('progressbar')).toBeNull();
    expect(document.querySelector('#simple_progress')?.textContent).toBe('');
  });

  it("shrinks with the header's row, the label ellipsizing and the bar filling the column", () => {
    render(
      <SimpleProgress imageUrl="/logo.png" levels={levelsWithCurrent('3')} />
    );
    const outer = document.querySelector('#simple_progress') as HTMLElement;
    expect(outer.style.minWidth).toBe('0');
    const label = screen.getByText('Story');
    expect(label.style.textOverflow).toBe('ellipsis');
    expect(label.parentElement!.style.minWidth).toBe('0');
    expect(label.parentElement!.style.flex).toBe('1 1 auto');
    expect(screen.getByRole('progressbar').style.width).toBe('100%');
  });

  it('names the bar after its label', () => {
    render(<SimpleProgress levels={levelsWithCurrent('3')} />);
    const bar = screen.getByRole('progressbar');
    expect(bar.getAttribute('aria-labelledby')).toBe('simple_progress_label');
    expect(screen.getByText('Story').id).toBe('simple_progress_label');
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
