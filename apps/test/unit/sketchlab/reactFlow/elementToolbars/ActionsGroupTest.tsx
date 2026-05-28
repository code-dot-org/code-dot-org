import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import React from 'react';

import {getIsStartMode} from '@cdo/apps/lab2/projects/utils';
import ActionsGroup from '@cdo/apps/sketchlab/reactFlow/elementToolbars/sections/ActionsGroup';

jest.mock('@cdo/apps/lab2/projects/utils', () => ({
  getIsStartMode: jest.fn(),
}));

const mockGetIsStartMode = getIsStartMode as jest.MockedFunction<
  typeof getIsStartMode
>;

describe('ActionsGroup', () => {
  beforeEach(() => {
    mockGetIsStartMode.mockReturnValue(false);
  });

  describe('conditional rendering', () => {
    it('renders no action buttons when no callbacks are provided', () => {
      render(<ActionsGroup />);
      expect(
        screen.queryByRole('button', {name: 'Duplicate'})
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', {name: 'Bring to front'})
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', {name: 'Send to back'})
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', {name: 'Lock element'})
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', {name: 'Delete'})
      ).not.toBeInTheDocument();
    });

    it('renders only the buttons whose callbacks are provided', () => {
      render(<ActionsGroup onDelete={jest.fn()} onDuplicate={jest.fn()} />);
      expect(screen.getByRole('button', {name: 'Delete'})).toBeInTheDocument();
      expect(
        screen.getByRole('button', {name: 'Duplicate'})
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('button', {name: 'Bring to front'})
      ).not.toBeInTheDocument();
    });

    it('shows Lock only when start mode is active', () => {
      const onLock = jest.fn();
      const {rerender} = render(<ActionsGroup onLock={onLock} />);
      expect(
        screen.queryByRole('button', {name: 'Lock element'})
      ).not.toBeInTheDocument();

      mockGetIsStartMode.mockReturnValue(true);
      rerender(<ActionsGroup onLock={onLock} />);
      expect(
        screen.getByRole('button', {name: 'Lock element'})
      ).toBeInTheDocument();
    });

    it('hides Lock if onLock is omitted even in start mode', () => {
      mockGetIsStartMode.mockReturnValue(true);
      render(<ActionsGroup />);
      expect(
        screen.queryByRole('button', {name: 'Lock element'})
      ).not.toBeInTheDocument();
    });
  });

  describe('handles toggle', () => {
    it('does not render the handles button when handlesToggle is omitted', () => {
      render(<ActionsGroup />);
      expect(
        screen.queryByRole('button', {name: /connection handles/})
      ).not.toBeInTheDocument();
    });

    it('shows "Hide connection handles" with aria-pressed=true when visible', () => {
      render(
        <ActionsGroup handlesToggle={{visible: true, onToggle: jest.fn()}} />
      );
      const button = screen.getByRole('button', {
        name: 'Hide connection handles',
      });
      expect(button).toHaveAttribute('aria-pressed', 'true');
    });

    it('shows "Show connection handles" with aria-pressed=false when hidden', () => {
      render(
        <ActionsGroup handlesToggle={{visible: false, onToggle: jest.fn()}} />
      );
      const button = screen.getByRole('button', {
        name: 'Show connection handles',
      });
      expect(button).toHaveAttribute('aria-pressed', 'false');
    });
  });

  describe('click handlers', () => {
    it('fires the matching callback when each button is clicked', async () => {
      mockGetIsStartMode.mockReturnValue(true);
      const onDelete = jest.fn();
      const onLock = jest.fn();
      const onBringToFront = jest.fn();
      const onSendToBack = jest.fn();
      const onDuplicate = jest.fn();
      const onToggle = jest.fn();
      render(
        <ActionsGroup
          onDelete={onDelete}
          onLock={onLock}
          onBringToFront={onBringToFront}
          onSendToBack={onSendToBack}
          onDuplicate={onDuplicate}
          handlesToggle={{visible: true, onToggle}}
        />
      );
      const user = userEvent.setup();
      await user.click(screen.getByRole('button', {name: 'Duplicate'}));
      await user.click(screen.getByRole('button', {name: 'Bring to front'}));
      await user.click(screen.getByRole('button', {name: 'Send to back'}));
      await user.click(screen.getByRole('button', {name: 'Lock element'}));
      await user.click(
        screen.getByRole('button', {name: 'Hide connection handles'})
      );
      await user.click(screen.getByRole('button', {name: 'Delete'}));
      expect(onDuplicate).toHaveBeenCalledTimes(1);
      expect(onBringToFront).toHaveBeenCalledTimes(1);
      expect(onSendToBack).toHaveBeenCalledTimes(1);
      expect(onLock).toHaveBeenCalledTimes(1);
      expect(onToggle).toHaveBeenCalledTimes(1);
      expect(onDelete).toHaveBeenCalledTimes(1);
    });
  });
});
