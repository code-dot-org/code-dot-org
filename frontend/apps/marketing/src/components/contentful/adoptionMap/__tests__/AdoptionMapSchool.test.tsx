import {render, screen, fireEvent} from '@testing-library/react';

import AdoptionMapInfo from '../AdoptionMapInfo';
import AdoptionMapPoint, {MAP_POINT_TYPES} from '../AdoptionMapPoint';
import {School} from '../types';

jest.mock('../AdoptionMapPoint', () => ({
  __esModule: true,
  ...jest.requireActual('../AdoptionMapPoint'),
  default: jest.fn(props => <span data-testid={`map-point-${props.type}`} />),
}));

describe('AdoptionMapSchool', () => {
  const defaultSchool: School = {
    nces_id: '123',
    name: 'Test School',
    city: 'Test City',
    state: 'Test State',
  };

  const onTakeSurveyClick = jest.fn();

  const renderComponent = (props = {}) =>
    render(
      <AdoptionMapInfo
        school={defaultSchool}
        onTakeSurveyClick={onTakeSurveyClick}
        {...props}
      />,
    );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders school name in the heading', () => {
    renderComponent();
    expect(screen.getByText(defaultSchool.name)).toBeInTheDocument();
  });

  it('renders school location when city and state are provided', () => {
    renderComponent();
    expect(
      screen.getByText(`${defaultSchool.city}, ${defaultSchool.state}`),
    ).toBeInTheDocument();
  });

  it('renders city only when state is missing', () => {
    const school = {...defaultSchool, state: undefined};
    renderComponent({school});
    expect(screen.getByText(`${school.city}`)).toBeInTheDocument();
    expect(
      screen.queryByText(`${defaultSchool.city}, ${defaultSchool.state}`),
    ).not.toBeInTheDocument();
  });

  it('renders state only when city is missing', () => {
    const school = {...defaultSchool, city: undefined};
    renderComponent({school});
    expect(screen.getByText(`${school.state}`)).toBeInTheDocument();
    expect(
      screen.queryByText(`${defaultSchool.city}, ${school.state}`),
    ).not.toBeInTheDocument();
  });

  it('does not render location section when both city and state are missing', () => {
    const school = {...defaultSchool, city: undefined, state: undefined};
    renderComponent({school});
    expect(screen.queryByText(`${defaultSchool.city}`)).not.toBeInTheDocument();
    expect(
      screen.queryByText(`${defaultSchool.state}`),
    ).not.toBeInTheDocument();
  });

  it('calls onTakeSurveyClick with school data when button is clicked', () => {
    renderComponent();
    expect(screen.getByText('Take the survey')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Take the survey'));
    expect(onTakeSurveyClick).toHaveBeenCalledWith(defaultSchool);
  });

  [
    {
      value: 'YES',
      type: MAP_POINT_TYPES.HAS_CS,
      text: 'We believe this school offers Computer Science',
    },
    {
      value: 'Y',
      type: MAP_POINT_TYPES.HAS_CS,
      text: 'We believe this school offers Computer Science',
    },
    {
      value: 'NO',
      type: MAP_POINT_TYPES.NO_CS,
      text: 'We believe this school offers no Computer Science opportunities',
    },
    {
      value: 'N',
      type: MAP_POINT_TYPES.NO_CS,
      text: 'We believe this school offers no Computer Science opportunities',
    },
    {
      value: 'HISTORICAL_YES',
      type: MAP_POINT_TYPES.HAS_CS,
      text: 'We believe this school historically offered Computer Science',
    },
    {
      value: 'HY',
      type: MAP_POINT_TYPES.HAS_CS,
      text: 'We believe this school historically offered Computer Science',
    },
    {
      value: 'HISTORICAL_NO',
      type: MAP_POINT_TYPES.NO_CS,
      text: 'We believe this school historically offered no Computer Science opportunities',
    },
    {
      value: 'HN',
      type: MAP_POINT_TYPES.NO_CS,
      text: 'We believe this school historically offered no Computer Science opportunities',
    },
    {
      value: 'UNKNOWN',
      type: MAP_POINT_TYPES.NO_DATA,
      text: 'We need data for this school',
    },
  ].forEach(({value, type, text}) => {
    it(`renders correct map point and text for school that "${value}"`, () => {
      const school = {...defaultSchool, teachesCs: value};
      renderComponent({school});

      expect(AdoptionMapPoint).toHaveBeenCalledWith(
        expect.objectContaining({type}),
        expect.anything(),
      );
      expect(screen.getByText(text)).toBeInTheDocument();
    });
  });
});
