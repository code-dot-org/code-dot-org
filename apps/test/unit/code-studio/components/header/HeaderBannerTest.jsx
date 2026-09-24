import {render, screen} from '@testing-library/react';
import React from 'react';

import HeaderBanner from '@cdo/apps/code-studio/components/header/HeaderBanner';
import HeaderMiddle from '@cdo/apps/code-studio/components/header/HeaderMiddle';

// The lesson's levels as getCurrentLevels gives them, with one current.
const levelsWithCurrent = currentId =>
  [
    {id: '1', headerLabel: 'Getting started', status: 'perfect'},
    {id: '2', headerLabel: 'Story', status: 'passed'},
    {id: '3', headerLabel: 'Story', status: 'attempted'},
    {id: '4', headerLabel: 'Story', status: 'not_tried'},
    {id: '5', status: 'not_tried'},
  ].map(level => ({...level, isCurrentLevel: level.id === currentId}));

describe('HeaderBanner', () => {
  it('shows the current level label and its place in the sub-path', () => {
    render(
      <HeaderBanner
        imageUrl="/logo.png"
        levels={levelsWithCurrent('3')}
        width={300}
      />
    );
    expect(screen.getByText('Story')).toBeTruthy();
    const bar = screen.getByRole('progressbar');
    expect(bar.getAttribute('aria-valuetext')).toBe('Level 2 of 3');
    expect(bar.firstChild.style.width).toBe(`${(100 * 2) / 3}%`);
  });

  it('draws no bar when the label covers one level', () => {
    render(<HeaderBanner levels={levelsWithCurrent('1')} width={300} />);
    expect(screen.getByText('Getting started')).toBeTruthy();
    expect(screen.queryByRole('progressbar')).toBeNull();
  });

  it('shows nothing but the logo for a level without a label', () => {
    render(
      <HeaderBanner
        imageUrl="/logo.png"
        levels={levelsWithCurrent('5')}
        width={300}
      />
    );
    expect(screen.queryByRole('progressbar')).toBeNull();
    expect(document.querySelector('#header_banner').textContent).toBe('');
  });

  it('reports its natural width', () => {
    const setDesiredWidth = jest.fn();
    render(
      <HeaderBanner
        levels={levelsWithCurrent('2')}
        width={200}
        setDesiredWidth={setDesiredWidth}
      />
    );
    expect(setDesiredWidth).toHaveBeenCalled();
  });
});

describe('HeaderBanner.subPathFor', () => {
  it('places the current level among those sharing its label', () => {
    expect(HeaderBanner.subPathFor(levelsWithCurrent('3'))).toEqual({
      label: 'Story',
      position: 2,
      total: 3,
    });
  });

  it('gives only the label when it covers one level', () => {
    expect(HeaderBanner.subPathFor(levelsWithCurrent('1'))).toEqual({
      label: 'Getting started',
    });
  });

  it('is null for a level without a label, or with no levels', () => {
    expect(HeaderBanner.subPathFor(levelsWithCurrent('5'))).toBeNull();
    expect(HeaderBanner.subPathFor(undefined)).toBeNull();
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
