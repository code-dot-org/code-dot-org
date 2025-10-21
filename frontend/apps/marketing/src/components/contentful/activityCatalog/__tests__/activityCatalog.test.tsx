/* eslint-disable @typescript-eslint/no-explicit-any */
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import {useSearchParams} from 'next/navigation';

import ActivityCatalog from '../activityCatalog';

// Mock child components

jest.mock(
  '@/components/contentful/activityCatalog/facetBar/facetBar',
  () => (props: any) => (
    <div data-testid="FacetBar">{JSON.stringify(props)}</div>
  ),
);
jest.mock(
  '@/components/contentful/activityCatalog/facetDrawer/facetDrawer',
  () => (props: any) => (
    <div data-testid="FacetDrawer">{JSON.stringify(props)}</div>
  ),
);
jest.mock(
  '@/components/csforall/activityCollection/ActivityCollection',
  () => (props: any) => (
    <div data-testid="ActivityCollection">
      {JSON.stringify(props.activities)}
    </div>
  ),
);

// Mock Orama and plugin-data-persistence
jest.mock('@orama/orama', () => ({
  search: jest.fn().mockResolvedValue({
    hits: [
      {document: {id: 1, title: 'Test Activity', languagesText: 'English'}},
      {document: {id: 2, title: 'Another Activity', languagesText: 'Spanish'}},
    ],
  }),
}));
jest.mock('@orama/plugin-data-persistence', () => ({
  restore: jest.fn().mockResolvedValue({}),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
}));

const mockActivities: any = [
  {id: 1, title: 'Test Activity', languagesText: 'English'},
  {id: 2, title: 'Another Activity', languagesText: 'Spanish'},
];
const mockFacets: any = {
  subject: {values: {Math: 1, Science: 2}},
  grade: {values: {'1': 1, '2': 1}},
};

const useSearchParamsMock = useSearchParams as jest.Mock;

describe('ActivityCatalog', () => {
  beforeEach(() => {
    useSearchParamsMock.mockReturnValue({
      get: (key: string) => (key === 'term' ? '' : null),
      toString: () => '',
    });
    window.history.pushState = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders FacetDrawer, FacetBar, and ActivityCollection', async () => {
    render(
      <ActivityCatalog
        serializedOramaDb="{}"
        activities={mockActivities}
        facets={mockFacets}
      />,
    );
    expect(screen.getByTestId('FacetDrawer')).toBeInTheDocument();
    expect(screen.getByTestId('FacetBar')).toBeInTheDocument();
    expect(screen.getByTestId('ActivityCollection')).toBeInTheDocument();
  });

  it('updates searchTerm when typing in search box', async () => {
    render(
      <ActivityCatalog
        serializedOramaDb="{}"
        activities={mockActivities}
        facets={mockFacets}
      />,
    );
    const input = screen.getByPlaceholderText('Search...');
    fireEvent.change(input, {target: {value: 'robot'}});
    expect((input as HTMLInputElement).value).toBe('robot');
    await waitFor(() => {
      expect(window.history.pushState).toHaveBeenCalled();
    });
  });

  it('opens and closes facet drawer', () => {
    render(
      <ActivityCatalog
        serializedOramaDb="{}"
        activities={mockActivities}
        facets={mockFacets}
      />,
    );
    const button = screen.getByRole('button', {name: /filters/i});
    fireEvent.click(button);
    expect(screen.getByTestId('FacetDrawer').textContent).toContain(
      '"isOpen":true',
    );
  });

  it('serializes and deserializes selected facets correctly', async () => {
    useSearchParamsMock.mockReturnValue({
      get: (key: string) => (key === 'term' ? 'abc' : null),
      toString: () => 'subject=Math%2CScience&grade=1',
      forEach: (cb: (value: string, key: string) => void) => {
        cb('Math%2CScience', 'subject');
        cb('1', 'grade');
      },
    });
    render(
      <ActivityCatalog
        serializedOramaDb="{}"
        activities={mockActivities}
        facets={mockFacets}
      />,
    );
    await waitFor(() => {
      expect(screen.getByTestId('FacetBar').textContent).toContain('Math');
    });
  });

  it('does not include unknown facets from URL', async () => {
    useSearchParamsMock.mockReturnValue({
      get: (key: string) => (key === 'term' ? '' : null),
      toString: () => 'unknown=foo&subject=Math',
      forEach: (cb: (value: string, key: string) => void) => {
        cb('foo', 'unknown');
        cb('Math', 'subject');
      },
    });
    render(
      <ActivityCatalog
        serializedOramaDb="{}"
        activities={mockActivities}
        facets={mockFacets}
      />,
    );
    await waitFor(() => {
      expect(screen.getByTestId('FacetBar').textContent).toContain('Math');
      expect(screen.getByTestId('FacetBar').textContent).not.toContain(
        'unknown',
      );
    });
  });

  it('renders with undefined facets', () => {
    render(
      <ActivityCatalog
        serializedOramaDb="{}"
        activities={mockActivities}
        facets={undefined}
      />,
    );
    expect(screen.getByTestId('FacetDrawer')).toBeInTheDocument();
    expect(screen.getByTestId('FacetBar')).toBeInTheDocument();
  });

  it('search box has correct aria-label', () => {
    render(
      <ActivityCatalog
        serializedOramaDb="{}"
        activities={mockActivities}
        facets={mockFacets}
      />,
    );
    expect(screen.getByLabelText('Search activities')).toBeInTheDocument();
  });
});
