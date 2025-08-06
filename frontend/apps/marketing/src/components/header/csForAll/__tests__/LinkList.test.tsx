import {render, screen} from '@testing-library/react';

import LinkList, {LinkListProps} from '../LinkList';

const mockLinks: LinkListProps['linkList'] = [
  {
    id: '1',
    label: 'Internal Link',
    href: '/internal-link',
    typography: 'body3',
    target: '_self',
  },
  {
    id: '2',
    label: 'External Link',
    href: 'https://example.com/external-link',
    typography: 'h4',
    target: '_blank',
  },
];

describe('LinkList', () => {
  it('renders link list', () => {
    render(<LinkList />);
    expect(screen.getByRole('list')).toBeInTheDocument();
  });

  it('renders the correct number of links', () => {
    render(<LinkList linkList={mockLinks} />);
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(mockLinks.length);
  });

  it('renders the correct link slugs', () => {
    render(<LinkList linkList={mockLinks} />);
    expect(screen.getByText('Internal Link')).toBeInTheDocument();
    expect(screen.getByText('External Link')).toBeInTheDocument();
    // Check href attribute
    expect(screen.getByText('Internal Link').closest('a')).toHaveAttribute(
      'href',
      '/internal-link',
    );
    expect(screen.getByText('External Link').closest('a')).toHaveAttribute(
      'href',
      'https://example.com/external-link',
    );
  });

  it('renders external link correctly', () => {
    render(<LinkList linkList={mockLinks} />);
    const externalLink = screen.getByText('External Link').closest('a');
    expect(externalLink).toHaveAttribute('target', '_blank');
    expect(externalLink).toHaveAttribute(
      'rel',
      expect.stringContaining('noopener'),
    );
    expect(externalLink).toHaveAttribute(
      'rel',
      expect.stringContaining('noreferrer'),
    );
  });

  it('renders nothing when linkList is empty', () => {
    render(<LinkList linkList={[]} />);
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
  });
});
