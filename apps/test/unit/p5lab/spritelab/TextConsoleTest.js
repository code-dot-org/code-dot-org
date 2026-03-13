import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';

import TextConsole, {
  AUTO_CLOSE_TIME,
} from '@cdo/apps/p5lab/spritelab/TextConsole';

describe('Sprite Lab Text Console', () => {
  let rerender;

  beforeEach(() => {
    ({rerender} = render(<TextConsole consoleMessages={[]} />));
  });

  it('is initially closed', () => {
    expect(screen.getByText('+', {selector: 'button'})).not.toBeVisible();
  });

  it('and the button text is +', () => {
    expect(screen.getByText('+', {selector: 'button'})).toBeInTheDocument();
  });

  describe('after a line is added', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      rerender(<TextConsole consoleMessages={['hello world2']} />);
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('opens', () => {
      expect(screen.getByRole('button', {name: '-'})).toBeInTheDocument();
    });

    it('the button text is -', () => {
      expect(screen.getByRole('button', {name: '-'})).toBeInTheDocument();
    });

    it('closes after AUTO_CLOSE_TIME ms', () => {
      expect(screen.getByRole('button', {name: '-'})).toBeInTheDocument();
      jest.advanceTimersByTime(AUTO_CLOSE_TIME);
      expect(screen.queryByRole('button', {name: '-'})).not.toBeInTheDocument();
      expect(screen.getByRole('button', {name: '+'})).toBeInTheDocument();
    });

    describe('and the console is toggled', () => {
      let toggleButton;

      beforeEach(() => {
        toggleButton = screen.getByRole('button');
        fireEvent.click(toggleButton);
      });

      it('closes', () => {
        expect(screen.getByRole('button', {name: '+'})).toBeInTheDocument();
      });

      it('the button becomes visible', () => {
        expect(screen.getByRole('button')).toBeVisible();
      });

      it('opens when toggled again', () => {
        fireEvent.click(toggleButton);
        expect(screen.getByRole('button', {name: '-'})).toBeInTheDocument();
      });

      it('opens and stays open when the button is clicked', () => {
        fireEvent.click(toggleButton);
        expect(screen.getByRole('button', {name: '-'})).toBeInTheDocument();
        jest.advanceTimersByTime(AUTO_CLOSE_TIME * 2);
        expect(screen.getByRole('button', {name: '-'})).toBeInTheDocument();
      });
    });
  });
});
