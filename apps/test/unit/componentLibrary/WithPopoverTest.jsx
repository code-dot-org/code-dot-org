import {render, screen, fireEvent} from '@testing-library/react';
import React from 'react';

import {WithPopover} from '@cdo/apps/componentLibrary/popover';

describe('Design System - WithPopover Component', () => {
  const popoverProps = {
    title: 'Test Popover',
    content: 'This is the content of the popover.',
    onClose: jest.fn(),
  };

  it('renders children correctly', () => {
    render(
      <WithPopover popoverProps={popoverProps}>
        <button type="button">Btn Text</button>
      </WithPopover>
    );

    const childElement = screen.getByText('Btn Text');
    expect(childElement).toBeInTheDocument();
  });

  it('shows popover when showPopover is true', () => {
    render(
      <WithPopover popoverProps={popoverProps} showPopover={true}>
        <button type="button">Btn Text</button>
      </WithPopover>
    );

    const popover = screen.getByText('This is the content of the popover.');
    expect(popover).toBeInTheDocument();
  });

  it('updates popover position on window resize', () => {
    const updatePositionSpy = jest.spyOn(
      require('@cdo/apps/componentLibrary/common/helpers'),
      'updatePositionedElementStyles'
    );

    render(
      <WithPopover popoverProps={popoverProps} showPopover={true}>
        <button type="button">Btn Text</button>
      </WithPopover>
    );

    fireEvent.resize(window);
    expect(updatePositionSpy).toHaveBeenCalled();
  });
});
