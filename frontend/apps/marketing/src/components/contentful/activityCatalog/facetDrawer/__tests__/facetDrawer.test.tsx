import {render, screen, fireEvent} from '@testing-library/react';

import FacetDrawer from '../facetDrawer';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockFacetBarProps: any = {
  facets: {subject: {values: {Math: 1}}},
  selectedFacets: {},
  onFacetChange: jest.fn(),
  onSearchTermChange: jest.fn(),
  onClearAll: jest.fn(),
  searchTerm: '',
};

describe('FacetDrawer', () => {
  it('renders Drawer when isOpen is true', () => {
    render(
      <FacetDrawer isOpen={true} onClose={jest.fn()} {...mockFacetBarProps} />,
    );
    expect(screen.getByText('Filters')).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /go/i})).toBeInTheDocument();
  });

  it('does not render Drawer content when isOpen is false', () => {
    render(
      <FacetDrawer isOpen={false} onClose={jest.fn()} {...mockFacetBarProps} />,
    );
    // Drawer is rendered but content is not visible
    expect(screen.queryByText('Filters')).not.toBeInTheDocument();
  });

  it('calls onClose when Go button is clicked', () => {
    const onClose = jest.fn();
    render(
      <FacetDrawer isOpen={true} onClose={onClose} {...mockFacetBarProps} />,
    );
    fireEvent.click(screen.getByRole('button', {name: /go/i}));
    expect(onClose).toHaveBeenCalled();
  });

  it('renders FacetBar with isInDrawer prop', () => {
    render(
      <FacetDrawer isOpen={true} onClose={jest.fn()} {...mockFacetBarProps} />,
    );
    // FacetBar renders the facet value
    expect(screen.getByText('Math')).toBeInTheDocument();
  });
});
