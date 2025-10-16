import {render, screen} from '@testing-library/react';

import {isExternalLink} from '@/components/common/utils';
import {Brand} from '@/config/brand';

import LinkItem from '../LinkItem';

jest.mock('@/components/common/utils', () => ({
  isExternalLink: jest.fn(),
}));

const mockedIsExternalLink = isExternalLink as jest.Mock;

describe('LinkItem', () => {
  const defaultProps = {
    label: 'Test Link',
    href: 'https://example.com',
  };

  beforeEach(() => {
    mockedIsExternalLink.mockReturnValue(false);
  });

  it('renders label text', () => {
    render(<LinkItem {...defaultProps} />);
    expect(screen.getByText('Test Link')).toBeInTheDocument();
  });

  it('sets target and rel for external links', () => {
    mockedIsExternalLink.mockReturnValue(true);
    render(<LinkItem {...defaultProps} />);
    const link = screen.getByText('Test Link');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('does not set target and rel for internal links', () => {
    render(<LinkItem {...defaultProps} />);
    const link = screen.getByText('Test Link');
    expect(link).not.toHaveAttribute('target');
    expect(link).not.toHaveAttribute('rel');
  });

  it('uses default brand if not provided', () => {
    render(<LinkItem {...defaultProps} />);
    expect(isExternalLink).toHaveBeenCalledWith(
      defaultProps.href,
      Brand.CS_FOR_ALL,
      'production',
    );
  });
});
