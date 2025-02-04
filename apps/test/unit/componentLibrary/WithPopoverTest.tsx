import {render, screen, fireEvent} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import * as helpers from '@cdo/apps/componentLibrary/common/helpers';
import {WithPopover, PopoverProps} from '@cdo/apps/componentLibrary/popover';

describe('Design System - WithPopover Component', () => {
  const popoverProps: PopoverProps = {
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
      <WithPopover popoverProps={popoverProps} showPopover>
        <button type="button">Btn Text</button>
      </WithPopover>
    );

    const popoverContent = screen.getByText(
      'This is the content of the popover.'
    );
    expect(popoverContent).toBeInTheDocument();
  });

  it('updates popover position on window resize', () => {
    const updatePositionSpy = jest.spyOn(
      helpers,
      'updatePositionedElementStyles'
    );

    render(
      <WithPopover popoverProps={popoverProps} showPopover>
        <button type="button">Btn Text</button>
      </WithPopover>
    );

    fireEvent.resize(window);
    expect(updatePositionSpy).toHaveBeenCalled();
  });
});
