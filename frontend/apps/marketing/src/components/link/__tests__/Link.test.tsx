import Link, {LinkProps} from '@/components/link';
import {render, screen} from '@testing-library/react';

describe('Link Component', () => {
  const defaultProps = {
    href: 'https://example.com',
    size: 'm',
    isLinkExternal: false,
    children: 'Test Link',
  } as LinkProps;

  it('renders the Link component with correct text', () => {
    render(<Link {...defaultProps} />);
    expect(screen.getByText('Test Link')).toBeInTheDocument();
  });

  it('renders with correct href attribute', () => {
    render(<Link {...defaultProps} />);
    expect(screen.getByRole('link')).toHaveAttribute('href', defaultProps.href);
  });

  it('applies correct CSS classes based on props', () => {
    render(<Link {...defaultProps} />);
    const linkElement = screen.getByRole('link');
    expect(linkElement).toHaveClass('link');
    expect(linkElement).toHaveClass('link-size-m');
  });

  it('renders external link icon when isLinkExternal is true', () => {
    render(<Link {...defaultProps} isLinkExternal={true} />);

    // Find the icon by FontAwesome class
    const icon = screen
      .getByRole('link')
      .querySelector('.fa-up-right-from-square');

    expect(icon).toBeInTheDocument();
  });

  it('opens external links in a new tab', () => {
    render(<Link {...defaultProps} isLinkExternal={true} />);
    expect(screen.getByRole('link')).toHaveAttribute('target', '_blank');
  });
});
