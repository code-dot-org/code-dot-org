import {render, screen, fireEvent} from '@testing-library/react';
import {vi} from 'vitest';

import * as helpers from '@/common/helpers';

import {WithPopover, PopoverProps} from './../index';

vi.mock('./../../common/helpers', async importOriginal => {
  const actual =
    await importOriginal<typeof import('./../../common/helpers')>();
  return {
    ...actual,
    updatePositionedElementStyles: vi.fn(),
  };
});

describe('Design System - WithPopover Component', () => {
  const popoverProps: PopoverProps = {
    title: 'Test Popover',
    content: 'This is the content of the popover.',
    onClose: vi.fn(),
  };

  it('renders children correctly', () => {
    render(
      <WithPopover popoverProps={popoverProps}>
        <button type="button">Btn Text</button>
      </WithPopover>,
    );

    const childElement = screen.getByText('Btn Text');
    expect(childElement).toBeInTheDocument();
  });

  it('shows popover when showPopover is true', () => {
    render(
      <WithPopover popoverProps={popoverProps} showPopover>
        <button type="button">Btn Text</button>
      </WithPopover>,
    );

    const popoverContent = screen.getByText(
      'This is the content of the popover.',
    );
    expect(popoverContent).toBeInTheDocument();
  });

  it('updates popover position on window resize', () => {
    const updatePositionSpy = vi.spyOn(
      helpers,
      'updatePositionedElementStyles',
    );

    render(
      <WithPopover popoverProps={popoverProps} showPopover>
        <button type="button">Btn Text</button>
      </WithPopover>,
    );

    fireEvent.resize(window);
    expect(updatePositionSpy).toHaveBeenCalled();
  });
});
