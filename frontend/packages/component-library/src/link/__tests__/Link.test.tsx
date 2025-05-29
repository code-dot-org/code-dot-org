import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import Link from '@/link';

describe('Design System - Link', () => {
  it('renders with correct text when passed as children prop', () => {
    render(<Link href="https://studio.code.org/home">Home</Link>);

    const link = screen.getByRole<HTMLAnchorElement>('link', {name: 'Home'});
    expect(link).toBeInTheDocument();
    expect(link.href).toBe('https://studio.code.org/home');
  });

  it('renders with correct text when passed as text prop', () => {
    render(<Link href="https://studio.code.org/home" text="Home" />);

    const link = screen.getByRole<HTMLAnchorElement>('link', {name: 'Home'});
    expect(link).toBeInTheDocument();
    expect(link.href).toBe('https://studio.code.org/home');
  });

  it('openInNewTab adds target attribute', () => {
    render(
      <Link href="https://studio.code.org/home" openInNewTab>
        Home
      </Link>,
    );

    const link = screen.getByRole<HTMLAnchorElement>('link', {name: 'Home'});
    expect(link).toBeInTheDocument();
    expect(link.target).toBe('_blank');
    expect(link.href).toBe('https://studio.code.org/home');
  });

  it('external adds rel attribute', () => {
    render(
      <Link href="https://studio.code.org/home" external>
        Home
      </Link>,
    );

    const link = screen.getByRole<HTMLAnchorElement>('link', {name: 'Home'});
    expect(link).toBeInTheDocument();
    expect(link.rel).toBe('noopener noreferrer');
    expect(link.href).toBe('https://studio.code.org/home');
  });

  it('onClick is correctly called when clicked', async () => {
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
});
