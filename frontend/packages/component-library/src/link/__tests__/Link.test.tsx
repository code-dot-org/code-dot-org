import {render, screen, cleanup} from '@testing-library/react';
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

  describe('automatic external link detection', () => {
    it('automatically detects external links and shows external icon', () => {
      render(<Link href="https://google.com">External Link</Link>);

      const link = screen.getByRole('link', {name: 'External Link'});
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      expect(screen.getByTestId('font-awesome-v6-icon')).toBeInTheDocument();
    });

    it('treats relative paths as internal links', () => {
      render(<Link href="/about">About</Link>);

      const link = screen.getByRole('link', {name: 'About'});
      expect(link).not.toHaveAttribute('rel');
      expect(
        screen.queryByTestId('font-awesome-v6-icon'),
      ).not.toBeInTheDocument();
    });

    it('treats hash links as internal', () => {
      render(<Link href="#section">Section</Link>);

      const link = screen.getByRole('link', {name: 'Section'});
      expect(link).not.toHaveAttribute('rel');
      expect(
        screen.queryByTestId('font-awesome-v6-icon'),
      ).not.toBeInTheDocument();
    });

    it('treats query-only links as internal', () => {
      render(<Link href="?param=value">Query Link</Link>);

      const link = screen.getByRole('link', {name: 'Query Link'});
      expect(link).not.toHaveAttribute('rel');
      expect(
        screen.queryByTestId('font-awesome-v6-icon'),
      ).not.toBeInTheDocument();
    });

    it('treats internal links correctly', () => {
      const paths = [
        'https://code.org',
        'https://studio.code.org',
        'https://studio.code.org/teacher_dashboard/home',
        'https://localhost-studio.code.org:3000',
        'https://localhost-studio.code.org:3000/teacher_dashboard/home',
        'https://localhost',
        'https://localhost:3000',
        'http://localhost:6006/?path=/story/designsystem-link--external-link-auto-detected',
        'https://dev-code.org',
        'https://hourofcode.com',
        'https://csedweek.org',
      ];

      for (const path of paths) {
        render(<Link href={path}>{path}</Link>);

        const link = screen.getByRole('link', {name: path});
        expect(link).not.toHaveAttribute('rel');
        expect(
          screen.queryByTestId('font-awesome-v6-icon'),
        ).not.toBeInTheDocument();

        cleanup();
      }
    });

    it('allows external prop to override automatic detection (external=true)', () => {
      render(
        <Link href="https://studio.code.org/same-origin" external={true}>
          Override External
        </Link>,
      );

      const link = screen.getByRole('link', {name: 'Override External'});
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      expect(screen.getByTestId('font-awesome-v6-icon')).toBeInTheDocument();
    });

    it('allows external prop to override automatic detection (external=false)', () => {
      render(
        <Link href="https://google.com" external={false}>
          Override Internal
        </Link>,
      );

      const link = screen.getByRole('link', {name: 'Override Internal'});
      expect(link).not.toHaveAttribute('rel');
      expect(
        screen.queryByTestId('font-awesome-v6-icon'),
      ).not.toBeInTheDocument();
    });

    it('handles malformed URLs gracefully', () => {
      render(<Link href="not-a-valid-url">Invalid URL</Link>);

      const link = screen.getByRole('link', {name: 'Invalid URL'});
      expect(link).not.toHaveAttribute('rel');
      expect(
        screen.queryByTestId('font-awesome-v6-icon'),
      ).not.toBeInTheDocument();
    });
  });
});
