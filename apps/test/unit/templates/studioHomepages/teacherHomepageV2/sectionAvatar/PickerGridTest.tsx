import '@testing-library/jest-dom';
import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';

import PickerGrid from '@cdo/apps/templates/studioHomepages/teacherHomepageV2/sectionAvatars/PickerGrid';

describe('PickerGrid', () => {
  let selectCallbackSpy: jest.Mock;

  beforeAll(() => {
    selectCallbackSpy = jest.fn((index: number) => {});
  });

  const renderComponent = (
    type: 'emoji' | 'color',
    selectCallbackSpy: () => void,
    selected: number
  ) => {
    render(
      <PickerGrid
        type={type}
        selectCallback={selectCallbackSpy}
        selected={selected}
      />
    );
  };

  afterAll(() => {
    jest.clearAllMocks();
  });

  it('renders the emoji grid with the correct aria-labels', () => {
    renderComponent('emoji', selectCallbackSpy, 0);
    const emojiGridItems = screen.getAllByRole('button');
    expect(emojiGridItems[0]).toHaveAttribute('aria-label', 'Fire');
  });

  it('renders the color grid with the correct aria-labels', () => {
    renderComponent('color', selectCallbackSpy, 0);
    const colorGridItems = screen.getAllByRole('button');
    expect(colorGridItems[0]).toHaveAttribute('aria-label', 'Magenta');
  });

  it('calls selectCallback when an item is clicked', () => {
    renderComponent('emoji', selectCallbackSpy, 0);
    const emojiGridItems = screen.getAllByRole('button');
    fireEvent.click(emojiGridItems[5]);
    expect(selectCallbackSpy).toHaveBeenCalledWith(5);
  });

  it('calls selectCallback when an item is selected with Enter key', () => {
    renderComponent('emoji', selectCallbackSpy, 0);
    const emojiGridItems = screen.getAllByRole('button');
    fireEvent.keyDown(emojiGridItems[5], {key: 'Enter'});
    expect(selectCallbackSpy).toHaveBeenCalledWith(5);
  });
});
