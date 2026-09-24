import {render, screen} from '@testing-library/react';
import React from 'react';

import HeaderBanner from '@cdo/apps/code-studio/components/header/HeaderBanner';
import HeaderMiddle from '@cdo/apps/code-studio/components/header/HeaderMiddle';

describe('HeaderBanner', () => {
  it('shows the level label', () => {
    render(<HeaderBanner imageUrl="/logo.png" label="Story" width={200} />);
    expect(screen.getByText('Story')).toBeTruthy();
  });

  it("draws a bar filled to the current level's place in the sub-path", () => {
    render(
      <HeaderBanner
        label="Story"
        width={300}
        progress={{position: 1, total: 4}}
      />
    );
    const bar = screen.getByRole('progressbar');
    expect(bar.getAttribute('aria-valuetext')).toBe('Level 1 of 4');
    expect(bar.firstChild.style.width).toBe('25%');
  });

  it('draws no bar without progress', () => {
    render(<HeaderBanner label="Story" width={300} />);
    expect(screen.queryByRole('progressbar')).toBeNull();
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

  it('places the current level among those sharing its label', () => {
    expect(HeaderMiddle.subPathProgressFor(levelsWithCurrent('3'))).toEqual({
      position: 2,
      total: 3,
    });
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
