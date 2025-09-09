import '@testing-library/jest-dom';
import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';

import SectionAvatarEditDialog from '@cdo/apps/templates/studioHomepages/teacherHomepageV2/sectionAvatars/SectionAvatarEditDialog';

describe('SectionAvatarEditDialog', () => {
  let closeCallbackSpy: jest.Mock;
  let saveCallbackSpy: jest.Mock;

  beforeAll(() => {
    closeCallbackSpy = jest.fn(() => {});
    saveCallbackSpy = jest.fn((color: number, emoji: number) => {});
  });

  const renderComponent = (
    closeCallbackSpy: () => void,
    saveCallbackSpy: (color: number, emoji: number) => void,
    avatarColor: number,
    avatarEmoji: number
  ) => {
    render(
      <SectionAvatarEditDialog
        closeCallback={closeCallbackSpy}
        saveCallback={saveCallbackSpy}
        avatarColor={avatarColor}
        avatarEmoji={avatarEmoji}
      />
    );
  };

  afterAll(() => {
    jest.clearAllMocks();
  });

  it('renders the dialog with the correct heading', () => {
    renderComponent(closeCallbackSpy, saveCallbackSpy, 0, 0);
    screen.getByText('Edit avatar');
  });

  it('calls closeCallback when Cancel is clicked', () => {
    renderComponent(closeCallbackSpy, saveCallbackSpy, 0, 0);
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    expect(closeCallbackSpy).toHaveBeenCalled();
  });

  it('calls closeCallback when close button is clicked', () => {
    renderComponent(closeCallbackSpy, saveCallbackSpy, 0, 0);
    const cancelButton = screen.getByLabelText('Close dialog');
    fireEvent.click(cancelButton);
    expect(closeCallbackSpy).toHaveBeenCalled();
  });

  it('calls saveCallback with selected color and emoji when Save is clicked', () => {
    renderComponent(closeCallbackSpy, saveCallbackSpy, 0, 0);
    const emoji = screen.getByText('🥨');
    fireEvent.click(emoji);
    const color = screen.getByLabelText('Blue');
    fireEvent.click(color);
    const saveButton = screen.getByText('Select avatar');
    fireEvent.click(saveButton);
    expect(saveCallbackSpy).toHaveBeenCalledWith(5, 15);
  });
});
