import {render, screen} from '@testing-library/react';
import React from 'react';

import HeaderBanner from '@cdo/apps/code-studio/components/header/HeaderBanner';
import HeaderMiddle from '@cdo/apps/code-studio/components/header/HeaderMiddle';

describe('HeaderBanner', () => {
  it('shows the level label', () => {
    render(<HeaderBanner imageUrl="/logo.png" label="Story" width={200} />);
    expect(screen.getByText('Story')).toBeTruthy();
  });

  it('draws a segment per step and says how many are complete', () => {
    render(
      <HeaderBanner
        label="Story"
        width={300}
        steps={[
          {completed: true, current: false},
          {completed: false, current: true},
          {completed: false, current: false},
        ]}
      />
    );
    const steps = screen.getByRole('img', {name: '1 of 3 complete'});
    expect(steps.children).toHaveLength(3);
  });

  it('draws no segments without steps', () => {
    render(<HeaderBanner label="Story" width={300} />);
    expect(screen.queryByRole('img')).toBeNull();
  });

  it('reports its natural width', () => {
    const setDesiredWidth = jest.fn();
    render(
      <HeaderBanner
        label="Story"
        width={200}
        setDesiredWidth={setDesiredWidth}
      />
    );
    expect(setDesiredWidth).toHaveBeenCalled();
  });
});

describe('HeaderMiddle.headerLabelFor', () => {
  const lessonData = {
    levels: [
      {id: '1', ids: ['1'], headerLabel: 'Getting started'},
      {id: '2', ids: ['2', '3']},
      {id: '4', ids: ['4'], headerLabel: 'Story'},
    ],
  };

  it('finds the label of the current level, by any of its ids', () => {
    expect(HeaderMiddle.headerLabelFor(lessonData, '1')).toBe(
      'Getting started'
    );
    expect(HeaderMiddle.headerLabelFor(lessonData, '4')).toBe('Story');
  });

  it('is empty for a level without one', () => {
    expect(HeaderMiddle.headerLabelFor(lessonData, '3')).toBe('');
    expect(HeaderMiddle.headerLabelFor(undefined, '3')).toBe('');
  });
});

describe('HeaderMiddle.subPathProgressFor', () => {
  const levelsWithCurrent = currentId =>
    [
      {id: '1', headerLabel: 'Getting started', status: 'perfect'},
      {id: '2', headerLabel: 'Story', status: 'passed'},
      {id: '3', headerLabel: 'Story', status: 'attempted'},
      {id: '4', headerLabel: 'Story', status: 'not_tried'},
      {id: '5', status: 'not_tried'},
    ].map(level => ({...level, isCurrentLevel: level.id === currentId}));

  it('lists the levels sharing the current label, marking done and current', () => {
    expect(HeaderMiddle.subPathProgressFor(levelsWithCurrent('3'))).toEqual([
      {completed: true, current: false},
      {completed: false, current: true},
      {completed: false, current: false},
    ]);
  });

  it('is null when the label covers one level, or the level has none', () => {
    expect(HeaderMiddle.subPathProgressFor(levelsWithCurrent('1'))).toBeNull();
    expect(HeaderMiddle.subPathProgressFor(levelsWithCurrent('5'))).toBeNull();
    expect(HeaderMiddle.subPathProgressFor(undefined)).toBeNull();
  });
});

describe('HeaderMiddle.getWidths with a banner', () => {
  it('gives the popup no room', () => {
    const widths = HeaderMiddle.getWidths(
      350,
      false,
      false,
      0,
      200,
      350,
      0,
      200,
      true,
      false
    );
    expect(widths.popup).toEqual(0);
    expect(widths.showPopupBecauseProgressCropped).toEqual(false);
  });
});
