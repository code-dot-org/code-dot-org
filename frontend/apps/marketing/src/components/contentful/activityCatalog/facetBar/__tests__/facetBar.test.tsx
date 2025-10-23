/* eslint-disable @typescript-eslint/no-explicit-any */
import {render, screen, fireEvent} from '@testing-library/react';

import FacetBar from '../facetBar';

const mockFacets = {
  subject: {
    values: {
      Math: 10,
      Science: 5,
      'Language Arts': 3,
    },
  },
  grade: {
    values: {
      '1': 2,
      '2': 4,
      '10': 1,
    },
  },
};

jest.mock('@/components/contentful/activityCatalog/config/facets', () => ({
  FACET_LABELS: {
    subject: 'Subject',
    grade: 'Grade',
  },
}));

describe('FacetBar', () => {
  const onFacetChange = jest.fn();
  const onSearchTermChange = jest.fn();
  const onClearAll = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing if facets is undefined', () => {
    const {container} = render(
      <FacetBar
        facets={undefined}
        selectedFacets={{}}
        onFacetChange={onFacetChange}
        onSearchTermChange={onSearchTermChange}
        onClearAll={onClearAll}
        searchTerm=""
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders all facet accordions and their values', () => {
    render(
      <FacetBar
        facets={mockFacets as any}
        selectedFacets={{}}
        onFacetChange={onFacetChange}
        onSearchTermChange={onSearchTermChange}
        onClearAll={onClearAll}
        searchTerm=""
      />,
    );
    expect(screen.getByText('Subject')).toBeInTheDocument();
    expect(screen.getByText('Grade')).toBeInTheDocument();
    expect(screen.getByText('Math')).toBeInTheDocument();
    expect(screen.getByText('Science')).toBeInTheDocument();
    expect(screen.getByText('Language Arts')).toBeInTheDocument();
  });

  it('checks the checkbox if the facet value is selected', () => {
    render(
      <FacetBar
        facets={mockFacets as any}
        selectedFacets={{subject: new Set(['Math'])}}
        onFacetChange={onFacetChange}
        onSearchTermChange={onSearchTermChange}
        onClearAll={onClearAll}
        searchTerm=""
      />,
    );
    const mathCheckbox = screen.getByLabelText('Math') as HTMLInputElement;
    expect(mathCheckbox.checked).toBe(true);
    const scienceCheckbox = screen.getByLabelText(
      'Science',
    ) as HTMLInputElement;
    expect(scienceCheckbox.checked).toBe(false);
  });

  it('calls onFacetChange when a checkbox is clicked', () => {
    render(
      <FacetBar
        facets={mockFacets as any}
        selectedFacets={{}}
        onFacetChange={onFacetChange}
        onSearchTermChange={onSearchTermChange}
        onClearAll={onClearAll}
        searchTerm=""
      />,
    );
    const mathCheckbox = screen.getByLabelText('Math');
    fireEvent.click(mathCheckbox);
    expect(onFacetChange).toHaveBeenCalledWith('subject', 'Math');
  });

  it('sorts facet values numerically when possible', () => {
    render(
      <FacetBar
        facets={mockFacets as any}
        selectedFacets={{}}
        onFacetChange={onFacetChange}
        onSearchTermChange={onSearchTermChange}
        onClearAll={onClearAll}
        searchTerm=""
      />,
    );
    // Grade values should be sorted as 1, 2, 10
    const gradeCheckboxes = [
      screen.getByLabelText('1'),
      screen.getByLabelText('2'),
      screen.getByLabelText('10'),
    ];
    expect(gradeCheckboxes[0]).toBeInTheDocument();
    expect(gradeCheckboxes[1]).toBeInTheDocument();
    expect(gradeCheckboxes[2]).toBeInTheDocument();
  });
});
