import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';

import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import ProjectManager from '@cdo/apps/lab2/projects/ProjectManager';
import ShareActions from '@cdo/apps/p5lab/spritelab/lab2/views/components/ShareActions';

describe('ShareActions', () => {
  const redirectToView = jest.fn();
  const redirectToRemix = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest
      .spyOn(Lab2Registry.getInstance(), 'getProjectManager')
      .mockReturnValue({
        redirectToView,
        redirectToRemix,
      } as unknown as ProjectManager);
  });

  afterEach(() => jest.restoreAllMocks());

  it('opens the project read-only from View code', () => {
    render(<ShareActions />);
    fireEvent.click(screen.getByRole('button', {name: 'View code'}));
    expect(redirectToView).toHaveBeenCalledTimes(1);
    expect(redirectToRemix).not.toHaveBeenCalled();
  });

  it('starts a copy from Make my own', () => {
    render(<ShareActions />);
    fireEvent.click(screen.getByRole('button', {name: 'Make my own'}));
    expect(redirectToRemix).toHaveBeenCalledTimes(1);
    expect(redirectToView).not.toHaveBeenCalled();
  });

  it('shows it is working, and stops taking presses, once one is pressed', () => {
    render(<ShareActions />);
    fireEvent.click(screen.getByRole('button', {name: 'Make my own'}));
    expect(screen.getByRole('button', {name: 'Make my own'})).toBeDisabled();
    expect(screen.getByRole('button', {name: 'View code'})).toBeDisabled();
    fireEvent.click(screen.getByRole('button', {name: 'Make my own'}));
    expect(redirectToRemix).toHaveBeenCalledTimes(1);
  });

  it('takes presses again when the page is shown again', () => {
    render(<ShareActions />);
    fireEvent.click(screen.getByRole('button', {name: 'View code'}));
    expect(screen.getByRole('button', {name: 'View code'})).toBeDisabled();
    fireEvent(window, new Event('pageshow'));
    expect(screen.getByRole('button', {name: 'View code'})).toBeEnabled();
  });

  it('takes presses again when leaving fails', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    redirectToRemix.mockImplementationOnce(() => {
      throw new Error('no channel');
    });
    render(<ShareActions />);
    fireEvent.click(screen.getByRole('button', {name: 'Make my own'}));
    expect(screen.getByRole('button', {name: 'Make my own'})).toBeEnabled();
  });

  it('does nothing while no project is loaded', () => {
    jest
      .spyOn(Lab2Registry.getInstance(), 'getProjectManager')
      .mockReturnValue(null);
    render(<ShareActions />);
    fireEvent.click(screen.getByRole('button', {name: 'Make my own'}));
    fireEvent.click(screen.getByRole('button', {name: 'View code'}));
    expect(redirectToRemix).not.toHaveBeenCalled();
    expect(redirectToView).not.toHaveBeenCalled();
  });
});
