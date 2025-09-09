import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import Link from '@/link';

describe('Design System - Link', () => {
  it('renders with correct text when passed as children prop', () => {
    render(<Link href="https://studio.code.org/home">Home</Link>);

    const link = screen.getByRole('link', {name: 'Home'});
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://studio.code.org/home');
  });

  it('renders with correct text when passed as text prop', () => {
    render(<Link href="https://studio.code.org/home" text="Home" />);

    const link = screen.getByRole('link', {name: 'Home'});
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://studio.code.org/home');
  });

  it('sets target="_blank" when openInNewTab is true', () => {
    render(
      <Link href="https://studio.code.org/home" openInNewTab>
        Home
      </Link>,
    );

    const link = screen.getByRole('link', {name: 'Home'});
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders external icon and sets rel attribute when external is true', () => {
    render(
      <Link href="https://studio.code.org/home" external>
        Home
      </Link>,
    );

    const link = screen.getByRole('link', {name: 'Home'});
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(screen.getByTestId('font-awesome-v6-icon')).toBeInTheDocument();
  });

  it('calls onClick handler correctly', async () => {
    const user = userEvent.setup();
    const spyOnClick = jest.fn();

    render(<Link onClick={spyOnClick}>Home</Link>);

    const link = screen.getByText('Home');
    await user.click(link);

    expect(spyOnClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', async () => {
    const user = userEvent.setup();
    const spyOnClick = jest.fn();

    render(
      <Link disabled onClick={spyOnClick}>
        Home
      </Link>,
    );

    const link = screen.getByText('Home');
    await user.click(link);

    expect(spyOnClick).not.toHaveBeenCalled();
  });

  it('does not set href when disabled', () => {
    render(
      <Link disabled href="https://studio.code.org/home">
        Disabled
      </Link>,
    );

    const link = screen.getByText('Disabled');
    expect(link).not.toHaveAttribute('href');
  });
});
