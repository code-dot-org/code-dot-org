import {render, screen, fireEvent} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import {ButtonType} from '@cdo/apps/componentLibrary/button';
import AccountCard from '@cdo/apps/templates/account/AccountCard';

describe('AccountCard', () => {
  const onClickMock = jest.fn();
  const defaultProps = {
    id: 'test-card',
    icon: 'user',
    title: 'Test Title',
    content: 'This is the content of the card.',
    buttonText: 'Click Me',
    buttonType: 'primary' as ButtonType,
    onClick: onClickMock,
  };

  it('renders the card with required props', () => {
    render(<AccountCard {...defaultProps} />);
    expect(
      screen.getByRole('heading', {name: defaultProps.title})
    ).toBeInTheDocument();
    expect(screen.getByText(defaultProps.content)).toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: defaultProps.buttonText})
    ).toBeInTheDocument();
  });

  it('renders a link button when href is provided', () => {
    render(<AccountCard {...defaultProps} href="https://example.com" />);
    const linkButton = screen.getByRole('link', {
      name: defaultProps.buttonText,
    });
    expect(linkButton).toBeInTheDocument();
    expect(linkButton).toHaveAttribute('href', 'https://example.com');
  });

  it('renders a regular button when onClick is provided', () => {
    const onClickMock = jest.fn();
    render(<AccountCard {...defaultProps} onClick={onClickMock} />);
    const button = screen.getByRole('button', {name: defaultProps.buttonText});
    fireEvent.click(button);
    expect(onClickMock).toHaveBeenCalledTimes(1);
  });

  it('renders the icon list when iconList is provided', () => {
    const iconList = ['Feature 1', 'Feature 2', 'Feature 3'];
    render(<AccountCard {...defaultProps} iconList={iconList} />);
    const listItems = screen.getAllByRole('listitem');
    expect(listItems).toHaveLength(iconList.length);
    iconList.forEach(item => {
      expect(screen.getByText(item)).toBeInTheDocument();
    });
  });

  it('renders different button types based on buttonType prop', () => {
    render(<AccountCard {...defaultProps} buttonType="secondary" />);
    const button = screen.getByRole('button', {name: defaultProps.buttonText});
    expect(button).toBeInTheDocument();
  });
});
