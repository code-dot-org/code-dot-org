import {render, screen} from '@testing-library/react';

import Link, {LinkProps} from '@/components/contentful/link';

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
    expect(linkElement).toHaveClass('link--size-m');
  });

  it('opens external links in a new tab', () => {
    render(<Link {...defaultProps} isLinkExternal={true} />);
    expect(screen.getByRole('link')).toHaveAttribute('target', '_blank');
  });
});
