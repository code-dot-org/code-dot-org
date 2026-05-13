import {render, screen, fireEvent} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import BorderedCallToAction from '@cdo/apps/templates/studioHomepages/BorderedCallToAction';

describe('BorderedCallToAction', () => {
  const headingText = 'Do Something';
  const descriptionText = 'Get started now';
  const buttonText = 'Get to it';
  const buttonUrl = '/my/path';
  const defaultProps = {
    headingText,
    descriptionText,
    buttonText,
    buttonUrl,
  };

  describe('default behavior', () => {
    it('renders a heading', () => {
      render(<BorderedCallToAction {...defaultProps} />);
      expect(
        screen.getByRole('heading', {name: headingText})
      ).toBeInTheDocument();
    });

    it('renders a description', () => {
      render(<BorderedCallToAction {...defaultProps} />);
      expect(screen.getByText(descriptionText)).toBeInTheDocument();
    });

    it('renders a button with text', () => {
      render(<BorderedCallToAction {...defaultProps} />);
      expect(screen.getByRole('link', {name: buttonText})).toBeInTheDocument();
    });

    it('button goes to url when clicked', () => {
      render(<BorderedCallToAction {...defaultProps} />);
      const link = screen.getByRole('link', {name: buttonText});
      expect(link).toHaveAttribute('href', buttonUrl);
    });
  });

  describe('custom behavior', () => {
    it('must have either a buttonUrl or onClick', () => {
      expect(() => {
        render(
          <BorderedCallToAction {...defaultProps} buttonUrl={undefined} />
        );
      }).toThrow(Error);
    });

    it('can use a custom onClick', () => {
      const onClickSpy = jest.fn();
      render(<BorderedCallToAction {...defaultProps} onClick={onClickSpy} />);
      const button = screen.getByRole('link', {name: buttonText});
      fireEvent.click(button);
      expect(onClickSpy).toHaveBeenCalledTimes(1);
    });
  });
});
