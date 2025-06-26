import {render, screen, fireEvent, waitFor} from '@testing-library/react';

import SchoolSearchFieldset from '@/components/contentful/schoolSearchFieldset';

import {School} from '../../types';
import YourSchoolMap from '../YourSchoolMap';
import YourSchoolMapSection from '../YourSchoolMapSection';

const selectedSchool: School = {
  nces_id: '456',
  name: 'Selected School',
};

jest.mock('@/components/contentful/schoolSearchFieldset', () => ({
  __esModule: true,
  default: jest.fn(props => (
    <button
      data-testid="school-search-fieldset"
      onClick={() => props.onSelect?.(selectedSchool)}
    >
      School Search
    </button>
  )),
}));

jest.mock('../YourSchoolMap', () => ({
  __esModule: true,
  default: jest.fn(props => (
    <div data-testid="your-school-map">
      Map Component
      <button
        data-testid="mock-survey-button"
        onClick={() => props.onTakeSurveyClick?.(props.school)}
      >
        Take Survey
      </button>
    </div>
  )),
}));

describe('YourSchoolMapSection', () => {
  const dataSourceURL = 'https://example.com/data-sources';
  const onTakeSurveyClick = jest.fn();

  const testSchool: School = {
    nces_id: '123',
    name: 'Test School',
    city: 'Test City',
    state: 'Test State',
    teachesCs: 'YES',
  };

  const renderComponent = (props = {}) =>
    render(
      <YourSchoolMapSection
        dataSourceURL={dataSourceURL}
        onTakeSurveyClick={onTakeSurveyClick}
        {...props}
      />,
    );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the heading and description text', () => {
    renderComponent();
    expect(
      screen.getByRole('heading', {
        name: /Does your school teach teach computer science\?/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Find your school on the interactive map below/i),
    ).toBeInTheDocument();
  });

  it('renders SchoolSearchFieldset with correct props', () => {
    renderComponent({school: testSchool});
    expect(screen.getByTestId('school-search-fieldset')).toBeInTheDocument();
    expect(SchoolSearchFieldset).toHaveBeenCalledWith(
      expect.objectContaining({
        school: testSchool,
        onSelect: expect.any(Function),
      }),
      expect.anything(),
    );
  });

  it('renders YourSchoolMap with correct props', () => {
    renderComponent({school: testSchool});
    expect(screen.getByTestId('your-school-map')).toBeInTheDocument();
    expect(YourSchoolMap).toHaveBeenCalledWith(
      expect.objectContaining({
        school: testSchool,
        onTakeSurveyClick,
      }),
      expect.anything(),
    );
  });

  it('renders data sources link with correct URL', () => {
    renderComponent();
    const dataSourceLink = screen.getByText('data sources we use');
    expect(dataSourceLink).toBeInTheDocument();
    expect(dataSourceLink.closest('a')).toHaveAttribute('href', dataSourceURL);
  });

  it('renders the partnership information and CSTA logo', () => {
    renderComponent();
    expect(screen.getByText(/In partnership with/i)).toBeInTheDocument();
    expect(screen.getByAltText('CSTA')).toBeInTheDocument();
  });

  it('initializes selectedSchool state with provided school prop', () => {
    renderComponent({school: testSchool});
    expect(YourSchoolMap).toHaveBeenCalledWith(
      expect.objectContaining({
        school: testSchool,
      }),
      expect.anything(),
    );
  });

  it('updates selectedSchool when SchoolSearchFieldset calls onSelect', async () => {
    renderComponent();

    fireEvent.click(screen.getByTestId('school-search-fieldset'));

    await waitFor(() => {
      expect(YourSchoolMap).toHaveBeenCalledWith(
        expect.objectContaining({
          school: expect.objectContaining(selectedSchool),
        }),
        expect.anything(),
      );
    });
  });

  it('forwards onTakeSurveyClick callback to YourSchoolMap', () => {
    renderComponent({school: testSchool});
    fireEvent.click(screen.getByTestId('mock-survey-button'));
    expect(onTakeSurveyClick).toHaveBeenCalledWith(testSchool);
  });
});
