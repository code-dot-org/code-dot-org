import {render, screen} from '@testing-library/react';
import React from 'react';

import SimpleProgress, {
  subPathFor,
} from '@cdo/apps/code-studio/components/header/SimpleProgress';

import styles from '@cdo/apps/code-studio/components/header/simple-progress.module.scss';

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
  it('fills the bar to the position in the total and says so', () => {
    render(
      <SimpleProgress subPath={{label: 'Story', position: 2, total: 3}} />
    );
    const bar = screen.getByRole('progressbar');
    expect(bar.getAttribute('aria-valuetext')).toBe('Level 2 of 3');
    expect(bar.classList.contains(styles.track)).toBe(true);
    expect((bar.firstChild as HTMLElement).style.width).toBe(
      `${(100 * 2) / 3}%`
    );
  });

  it('reads a given value text instead of the level wording', () => {
    render(
      <SimpleProgress
        subPath={{
          label: 'Introduction',
          position: 1,
          total: 4,
          valueText: 'Step 1 of 4',
        }}
      />
    );
    expect(screen.getByRole('progressbar').getAttribute('aria-valuetext')).toBe(
      'Step 1 of 4'
    );
  });

  it('shows nothing for no part', () => {
    render(<SimpleProgress subPath={null} />);
    expect(screen.queryByRole('progressbar')).toBeNull();
  });

  it('is named by the label beside it', () => {
    render(
      <SimpleProgress subPath={{label: 'Story', position: 1, total: 1}} />
    );
    expect(
      screen.getByRole('progressbar').getAttribute('aria-labelledby')
    ).toBe('simple_progress_label');
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

  it('counts a label that covers one level as 1 of 1', () => {
    expect(subPathFor(levelsWithCurrent('1'))).toEqual({
      label: 'Getting started',
      position: 1,
      total: 1,
    });
  });

  it("counts a sublevel's parent as current and leaves bonus levels out", () => {
    const levels = [
      {id: '1', headerLabel: 'Story', bonus: true, isCurrentLevel: false},
      {id: '2', headerLabel: 'Story', isCurrentLevel: false},
      {
        id: '3',
        headerLabel: 'Story',
        isCurrentLevel: false,
        sublevels: [{isCurrentLevel: true}],
      },
    ];
    expect(subPathFor(levels)).toEqual({label: 'Story', position: 2, total: 2});
  });

  it('is null for a level without a label, or with no levels', () => {
    expect(subPathFor(levelsWithCurrent('5'))).toBeNull();
    expect(subPathFor(undefined)).toBeNull();
    expect(subPathFor([])).toBeNull();
  });
});
