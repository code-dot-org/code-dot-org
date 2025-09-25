import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';
import {
  MapProps,
  SourceProps,
  PopupProps,
  MapMouseEvent,
  MapLoadEvent,
  LayerSpecification,
} from 'react-map-gl/mapbox';

import AdoptionMap from '../AdoptionMap';
import {default as mockSchoolInfo} from '../AdoptionMapInfo';
import {MAP_POINT_TYPES} from '../AdoptionMapPoint';
import type {School} from '../types';

jest.mock('../AdoptionMapInfo', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="school-info">School Info Mock</div>),
}));

jest.mock('../AdoptionMapPoint', () => {
  const actual = jest.requireActual('../AdoptionMapPoint');
  return {
    __esModule: true,
    ...actual,
    default: jest.fn((props: {type: string}) => (
      <div data-testid={`map-point-${props.type}`} />
    )),
  };
});

const createMockLayer = (id: string): LayerSpecification => ({
  id,
  type: 'circle',
  source: 'mock-source',
});

const mockMapInstance = {
  getZoom: jest.fn().mockReturnValue(5),
  flyTo: jest.fn(),
  resize: jest.fn(),
  querySourceFeatures: jest.fn(),
  once: jest.fn().mockImplementation((event: string, callback: () => void) => {
    if (event === 'moveend') callback();
  }),
};

let storedClickHandler: MapProps['onClick'] | null = null;
let storedOnLoadHandler: MapProps['onLoad'] | null = null;
jest.mock('react-map-gl/mapbox', () => {
  const ForwardRefMap = React.forwardRef((props: MapProps = {}, ref) => {
    storedClickHandler = props.onClick;
    storedOnLoadHandler = props.onLoad;

    React.useEffect(() => {
      if (props.onLoad) props.onLoad({target: mockMapInstance} as MapLoadEvent);

      if (ref) {
        const refObject = {
          getMap: () => mockMapInstance,
        };

        if (typeof ref === 'function') {
          ref(refObject);
        } else {
          ref.current = refObject;
        }
      }
    }, [props.onLoad, ref]);

    return (
      <div data-testid="map-container">
        <div
          data-testid="map-view"
          data-initial-view={JSON.stringify(props.initialViewState)}
        >
          {props.children}
        </div>
      </div>
    );
  });

  ForwardRefMap.displayName = 'Map';

  return {
    __esModule: true,
    default: ForwardRefMap,
    NavigationControl: () => <div data-testid="navigation-control" />,
    FullscreenControl: () => <div data-testid="fullscreen-control" />,
    Source: ({children}: SourceProps) => (
      <div data-testid="map-source">{children}</div>
    ),
    Layer: () => <div data-testid="map-layer" />,
    Popup: ({children, onClose}: PopupProps) => (
      <div data-testid="map-popup">
        <button
          data-testid="popup-close"
          onClick={() => onClose && onClose()}
          aria-label="Close popup"
        />
        {children}
      </div>
    ),
  };
});

const triggerMapClick = (event: MapMouseEvent): void => {
  if (storedClickHandler) storedClickHandler(event);
};

describe('AdoptionMap', () => {
  const onTakeSurveyClick = jest.fn();
  const testSchool: School = {
    nces_id: '123456789',
    name: 'Test School',
    city: 'Test City',
    state: 'Test State',
    latitude: '37.7749',
    longitude: '-122.4194',
    teachesCs: 'YES',
  };

  const renderComponent = (props = {}) =>
    render(<AdoptionMap onTakeSurveyClick={onTakeSurveyClick} {...props} />);

  beforeEach(() => {
    jest.clearAllMocks();
    storedClickHandler = null;
    storedOnLoadHandler = null;
  });

  it('renders the map container', () => {
    renderComponent();
    expect(screen.getByTestId('map-container')).toBeInTheDocument();
  });

  it('renders with correct initial view state', () => {
    renderComponent();
    const mapView = screen.getByTestId('map-view');
    const initialViewState = JSON.parse(
      mapView.getAttribute('data-initial-view') || '{}',
    );

    expect(initialViewState).toEqual({
      longitude: -98,
      latitude: 39,
      zoom: 3,
    });
  });

  it('calls flyTo when moving to a school location', () => {
    jest
      .spyOn(React, 'useState')
      .mockImplementationOnce(() => [true, jest.fn()])
      .mockImplementationOnce(() => [null, jest.fn()]);

    jest.spyOn(React, 'useRef').mockReturnValue({
      current: {
        getMap: () => mockMapInstance,
      },
    });

    renderComponent();
    triggerMapClick({
      lngLat: {lng: -122.4194, lat: 37.7749},
      features: [
        {
          layer: createMockLayer('census-schools'),
          geometry: {
            type: 'Point',
            coordinates: [-122.4194, 37.7749],
          },
          properties: {
            school_id: '123456',
            school_name: 'Test School',
            school_city: 'Test City',
            school_state: 'Test State',
            teaches_cs: 'YES',
          },
        },
      ],
    });

    expect(mockMapInstance.flyTo).toHaveBeenCalledWith({
      zoom: 5,
      center: {lng: -122.4194, lat: 37.7749},
      speed: 2,
      essential: true,
    });
  });

  it('handles coordinate wrapping when clicking across the date line', () => {
    jest
      .spyOn(React, 'useState')
      .mockImplementationOnce(() => [true, jest.fn()])
      .mockImplementationOnce(() => [null, jest.fn()]);

    jest.spyOn(React, 'useRef').mockReturnValue({
      current: {
        getMap: () => mockMapInstance,
      },
    });

    renderComponent();
    triggerMapClick({
      lngLat: {lng: 170, lat: 45},
      features: [
        {
          layer: createMockLayer('census-schools'),
          geometry: {
            type: 'Point',
            coordinates: [-170, 45],
          },
          properties: {
            school_id: '888888',
            school_name: 'Date Line School',
            school_city: 'Date City',
            school_state: 'Date State',
            teaches_cs: 'YES',
          },
        },
      ],
    });

    expect(mockMapInstance.flyTo).toHaveBeenCalledWith(
      expect.objectContaining({
        center: expect.objectContaining({
          lng: expect.any(Number),
          lat: 45,
        }),
      }),
    );
  });

  it('clears popup when clicking on a non-school area', () => {
    const setPopupDataMock = jest.fn();
    jest
      .spyOn(React, 'useState')
      .mockImplementationOnce(() => [true, jest.fn()])
      .mockImplementationOnce(() => [
        {
          longitude: -122,
          latitude: 37,
          school: testSchool,
        },
        setPopupDataMock,
      ]);

    jest.spyOn(React, 'useRef').mockReturnValue({
      current: {
        getMap: () => mockMapInstance,
      },
    });

    renderComponent();
    triggerMapClick({
      lngLat: {lng: -100, lat: 40},
      features: [],
    });

    expect(setPopupDataMock).toHaveBeenCalledWith(null);
  });

  it('shows school popup when school prop is provided', () => {
    mockMapInstance.querySourceFeatures.mockReturnValueOnce([
      {
        geometry: {
          type: 'Point',
          coordinates: [-122.5, 37.5],
        },
        properties: {
          school_id: testSchool.nces_id,
          school_name: testSchool.name,
          teaches_cs: 'YES',
        },
      },
    ]);

    const setPopupDataMock = jest.fn();
    jest
      .spyOn(React, 'useState')
      .mockImplementationOnce(() => [true, jest.fn()])
      .mockImplementationOnce(() => [null, setPopupDataMock]);

    jest.spyOn(React, 'useRef').mockReturnValue({
      current: {
        getMap: () => mockMapInstance,
      },
    });

    renderComponent({school: testSchool});
    if (storedOnLoadHandler) storedOnLoadHandler({} as MapLoadEvent);

    expect(mockMapInstance.flyTo).toHaveBeenCalledWith({
      zoom: 14,
      center: {
        lng: Number(testSchool.longitude),
        lat: Number(testSchool.latitude),
      },
      speed: 2,
      essential: true,
    });
    expect(mockMapInstance.querySourceFeatures).toHaveBeenCalledWith(
      'censustiles',
      {
        sourceLayer: 'census',
        filter: ['all', ['==', 'school_id', testSchool.nces_id]],
      },
    );
  });

  it('falls back to school coordinates if no point is found in querySourceFeatures', () => {
    mockMapInstance.querySourceFeatures.mockReturnValue([]);

    const setPopupDataMock = jest.fn();
    jest
      .spyOn(React, 'useState')
      .mockImplementationOnce(() => [true, jest.fn()])
      .mockImplementationOnce(() => [null, setPopupDataMock]);

    jest.spyOn(React, 'useRef').mockReturnValue({
      current: {
        getMap: () => mockMapInstance,
      },
    });

    renderComponent({school: testSchool});

    const onceImplementation = mockMapInstance.once.mock.calls?.[0]?.[1];
    if (onceImplementation) onceImplementation();

    expect(setPopupDataMock).toHaveBeenCalledWith({
      longitude: Number(testSchool.longitude),
      latitude: Number(testSchool.latitude),
      school: testSchool,
    });
  });

  it('adds resize event listener when map is loaded', () => {
    const addEventListenerSpy = jest.spyOn(window, 'addEventListener');

    jest.spyOn(React, 'useRef').mockReturnValue({
      current: {
        getMap: () => mockMapInstance,
      },
    });

    jest
      .spyOn(React, 'useState')
      .mockImplementationOnce(() => [true, jest.fn()])
      .mockImplementationOnce(() => [null, jest.fn()]);

    renderComponent();

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'resize',
      expect.any(Function),
    );
    expect(mockMapInstance.resize).toHaveBeenCalled();

    addEventListenerSpy.mockRestore();
  });

  it('closes popup when close button is clicked', () => {
    const setPopupDataMock = jest.fn();
    jest
      .spyOn(React, 'useState')
      .mockImplementationOnce(() => [true, jest.fn()])
      .mockImplementationOnce(() => [
        {
          longitude: -122,
          latitude: 37,
          school: testSchool,
        },
        setPopupDataMock,
      ]);

    renderComponent();

    const closeButton = screen.getByTestId('popup-close');
    fireEvent.click(closeButton);

    expect(setPopupDataMock).toHaveBeenCalledWith(null);
  });

  it('renders popup with AdoptionMapSchool and passes correct props', () => {
    jest
      .spyOn(React, 'useState')
      .mockImplementationOnce(() => [true, jest.fn()])
      .mockImplementationOnce(() => [
        {
          longitude: -122,
          latitude: 37,
          school: testSchool,
        },
        jest.fn(),
      ]);

    renderComponent();

    expect(mockSchoolInfo).toHaveBeenCalledWith(
      expect.objectContaining({
        school: testSchool,
        onTakeSurveyClick: onTakeSurveyClick,
      }),
      expect.anything(),
    );
  });

  it('renders map legend with all point types', () => {
    renderComponent();

    expect(screen.getByText('Legend')).toBeInTheDocument();
    expect(
      screen.getByTestId(`map-point-${MAP_POINT_TYPES.HAS_CS}`),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(`map-point-${MAP_POINT_TYPES.NO_CS}`),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(`map-point-${MAP_POINT_TYPES.NO_DATA}`),
    ).toBeInTheDocument();

    expect(screen.getByText('Offers computer science')).toBeInTheDocument();
    expect(screen.getByText('No CS opportunities')).toBeInTheDocument();
    expect(screen.getByText('No Data')).toBeInTheDocument();
  });
});
