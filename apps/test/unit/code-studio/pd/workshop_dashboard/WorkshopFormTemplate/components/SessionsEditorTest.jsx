import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import moment from 'moment-timezone';
import PropTypes from 'prop-types';
import React, {useReducer} from 'react';
import {Provider} from 'react-redux';

import {
  DATE_FORMAT,
  TIME_FORMAT,
} from '@cdo/apps/code-studio/pd/workshop_dashboard/workshopConstants';
import {
  SessionsEditor,
  generateNewSession,
} from '@cdo/apps/code-studio/pd/workshop_dashboard/WorkshopFormTemplate/components/SessionsEditor';
import {SessionPart} from '@cdo/apps/code-studio/pd/workshop_dashboard/WorkshopFormTemplate/components/SessionsEditor/components/SessionPart';
import {sessionsReducer} from '@cdo/apps/code-studio/pd/workshop_dashboard/WorkshopFormTemplate/reducers/sessionsReducer';
import {BuildYourOwnWorkshopConfig} from '@cdo/apps/generated/pd/sharedWorkshopConstants';

// mock redux store
const initialState = {mapbox: {mapboxAccessToken: 'test-token'}};
const store = {getState: () => initialState, subscribe: () => {}};

describe('generateNewSession', () => {
  const newIdRegex = /^new-\d+-\w+$/;
  it('generates a new session with default values', () => {
    const newSession = generateNewSession();

    expect(newSession.id).toMatch(newIdRegex);
    expect(newSession.date).toEqual(moment().format(DATE_FORMAT));
    expect(newSession.start).toEqual(
      moment().startOf('day').add(7, 'hours').format(TIME_FORMAT)
    );
    expect(newSession.end).toEqual(
      moment().startOf('day').add(19, 'hours').format(TIME_FORMAT)
    );
    expect(newSession.locationAddress).toEqual('');
    expect(newSession.locationName).toEqual('');
    expect(newSession.meetingLink).toEqual('');
    expect(newSession.format).toEqual('in_person');
  });

  it('generates a new session based on the previous session', () => {
    const prevSession = {
      id: 'new-123-abc',
      date: '2025-03-28',
      start: '8:00am',
      end: '5:00pm',
      locationAddress: '123 Main St',
      locationName: 'Test Location',
      meetingLink: 'test.com',
      format: 'virtual',
    };
    const newSession = generateNewSession(prevSession);

    expect(newSession.date).toEqual(
      moment('2025-03-28', DATE_FORMAT).add(1, 'day').format(DATE_FORMAT)
    );
    expect(newSession.id).toMatch(newIdRegex);
    expect(newSession.id).not.toEqual(prevSession.id);
    expect(newSession.start).toEqual('8:00am');
    expect(newSession.end).toEqual('5:00pm');
    expect(newSession.locationAddress).toEqual('');
    expect(newSession.locationName).toEqual('');
    expect(newSession.meetingLink).toEqual('');
    expect(newSession.format).toEqual('virtual');
  });
});

describe('SessionsEditor', () => {
  const mockDispatchSessions = jest.fn();
  const initialSessions = [
    {
      id: 'new-123-abc',
      date: '2025-03-28',
      start: '8:00am',
      end: '5:00pm',
      locationAddress: '123 Main St',
      locationName: 'Test Location',
      meetingLink: '',
      format: 'in_person',
    },
  ];
  const user = userEvent.setup();

  const renderDefault = (props = {}) =>
    render(
      <Provider store={store}>
        <SessionsEditor
          sessions={initialSessions}
          dispatchSessions={mockDispatchSessions}
          errors={{}}
          fields={BuildYourOwnWorkshopConfig.session_fields}
          {...props}
        />
      </Provider>
    );

  beforeEach(() => {
    mockDispatchSessions.mockClear();
  });

  it('renders', () => {
    renderDefault();

    expect(screen.getByText('Add Date')).toBeInTheDocument();
  });

  it('adds a new session when "Add Date" is clicked', async () => {
    renderDefault();

    const addButton = screen.getByText('Add Date');
    await user.click(addButton);

    await waitFor(() => {
      expect(mockDispatchSessions).toHaveBeenCalledTimes(1);
      expect(mockDispatchSessions).toHaveBeenCalledWith({
        type: 'ADD_SESSION',
      });
    });
  });

  it('does not allow deleting the last session', async () => {
    renderDefault();

    const [firstSessionDeleteButton] = screen.getAllByRole('button', {
      name: 'delete workshop session',
    });
    expect(firstSessionDeleteButton).toBeDisabled();
    await user.click(firstSessionDeleteButton);

    await waitFor(() => {
      expect(mockDispatchSessions).toHaveBeenCalledTimes(0);
    });
  });

  it('allows deleting any but the last session', async () => {
    renderDefault({
      sessions: [
        ...initialSessions,
        {
          id: 'new-456-def',
          date: '2025-03-29',
          start: '8:00am',
          end: '5:00pm',
          locationAddress: '123 Main St',
          locationName: 'Test Location',
          meetingLink: '',
          format: 'in_person',
        },
      ],
    });

    const [firstSessionDeleteButton] = screen.getAllByRole('button', {
      name: 'delete workshop session',
    });
    expect(firstSessionDeleteButton).not.toBeDisabled();
    await user.click(firstSessionDeleteButton);

    await waitFor(() => {
      expect(mockDispatchSessions).toHaveBeenCalledTimes(1);
      expect(mockDispatchSessions).toHaveBeenCalledWith({
        type: 'DELETE_SESSION',
        id: initialSessions[0].id,
      });
    });
  });
});

describe('SessionPart', () => {
  const dispatchSessions = jest.fn();
  const mockSession = {
    id: 'new-123-abc',
    date: '2025-03-28',
    start: '8:00am',
    end: '5:00pm',
    locationAddress: '123 Main St',
    locationName: 'Test Location',
    meetingLink: '',
    format: 'in_person',
  };

  const SessionPartWithState = (props = {}) => {
    const [sessions, dispatch] = useReducer(sessionsReducer, [
      props?.session ?? mockSession,
    ]);
    if (!sessions.length) return null;
    return (
      <Provider store={store}>
        <SessionPart
          fields={BuildYourOwnWorkshopConfig.session_fields}
          dispatchSessions={dispatchSessions.mockImplementation(dispatch)}
          index={0}
          {...props}
          {...sessions[0]}
        />
      </Provider>
    );
  };
  SessionPartWithState.propTypes = {
    session: PropTypes.object,
    dispatchSessions: PropTypes.func,
    index: PropTypes.number,
  };

  const user = userEvent.setup();

  beforeEach(() => {
    dispatchSessions.mockClear();
  });

  it('renders with form fields', () => {
    render(<SessionPartWithState />);

    expect(
      screen.getByLabelText(
        BuildYourOwnWorkshopConfig.session_fields.date.label
      )
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(
        BuildYourOwnWorkshopConfig.session_fields.start.label
      )
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(BuildYourOwnWorkshopConfig.session_fields.end.label)
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(
        BuildYourOwnWorkshopConfig.session_fields.session_format.label
      )
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(
        BuildYourOwnWorkshopConfig.session_fields.location_name.label
      )
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(
        BuildYourOwnWorkshopConfig.session_fields.location_address.label
      )
    ).toBeInTheDocument();
  });

  it('dispatches UPDATE_SESSION when date changes', async () => {
    render(<SessionPartWithState />);

    const dateInput = screen.getByLabelText('Date');
    fireEvent.change(dateInput, {target: {value: '2025-03-29'}});

    await waitFor(() => {
      expect(dispatchSessions).toHaveBeenCalledTimes(1);
      expect(dispatchSessions).toHaveBeenCalledWith({
        id: mockSession.id,
        type: 'UPDATE_SESSION',
        payload: {
          date: '2025-03-29',
        },
      });
    });
  });

  it('dispatches UPDATE_SESSION when start time changes', async () => {
    render(<SessionPartWithState />);

    const startTimeDropdown = screen.getByLabelText(
      BuildYourOwnWorkshopConfig.session_fields.start.label
    );
    await user.selectOptions(startTimeDropdown, '8:30am');

    await waitFor(() => {
      expect(dispatchSessions).toHaveBeenCalledTimes(1);
      expect(dispatchSessions).toHaveBeenCalledWith({
        id: mockSession.id,
        type: 'UPDATE_SESSION',
        payload: {
          start: '8:30am',
        },
      });
    });
  });

  it('dispatches UPDATE_SESSION when end time changes', async () => {
    render(<SessionPartWithState />);

    const endTimeDropdown = screen.getByLabelText(
      BuildYourOwnWorkshopConfig.session_fields.end.label
    );
    await user.selectOptions(endTimeDropdown, '5:30pm');

    await waitFor(() => {
      expect(dispatchSessions).toHaveBeenCalledTimes(1);
      expect(dispatchSessions).toHaveBeenCalledWith({
        id: mockSession.id,
        type: 'UPDATE_SESSION',
        payload: {
          end: '5:30pm',
        },
      });
    });
  });

  it('dispatches UPDATE_SESSION when format changes', async () => {
    render(<SessionPartWithState />);

    const formatDropdown = screen.getByLabelText(
      BuildYourOwnWorkshopConfig.session_fields.session_format.label
    );
    await user.selectOptions(formatDropdown, 'virtual');

    await waitFor(() => {
      expect(dispatchSessions).toHaveBeenCalledTimes(1);
      expect(dispatchSessions).toHaveBeenCalledWith({
        id: mockSession.id,
        type: 'UPDATE_SESSION',
        payload: {
          format: 'virtual',
        },
      });
    });
  });

  it('dispatches DELETE_SESSION when delete button is clicked', async () => {
    render(<SessionPartWithState />);

    const deleteButton = screen.getByRole('button', {
      name: 'delete workshop session',
    });
    await user.click(deleteButton);

    expect(dispatchSessions).toHaveBeenCalledTimes(1);
    expect(dispatchSessions).toHaveBeenCalledWith({
      id: mockSession.id,
      type: 'DELETE_SESSION',
    });
  });

  it('dispatches UPDATE_SESSION when location name changes', async () => {
    render(<SessionPartWithState />);

    const locationNameInput = screen.getByLabelText(
      BuildYourOwnWorkshopConfig.session_fields.location_name.label
    );
    const newLocation = 'New Location';
    await user.clear(locationNameInput);
    await user.type(locationNameInput, newLocation);

    await waitFor(() => {
      expect(dispatchSessions).toHaveBeenCalledTimes(newLocation.length + 1);
      expect(dispatchSessions).toHaveBeenCalledWith({
        id: mockSession.id,
        type: 'UPDATE_SESSION',
        payload: {
          locationName: newLocation,
        },
      });
    });
  });

  it('dispatches UPDATE_SESSION when location address changes', async () => {
    render(<SessionPartWithState />);

    const locationAddressInput = screen.getByLabelText(
      BuildYourOwnWorkshopConfig.session_fields.location_address.label
    );
    const newAddress = 'New Address';
    await user.clear(locationAddressInput);
    await user.type(locationAddressInput, newAddress);

    await waitFor(() => {
      expect(dispatchSessions).toHaveBeenCalledTimes(newAddress.length + 1);
      expect(dispatchSessions).toHaveBeenCalledWith({
        id: mockSession.id,
        type: 'UPDATE_SESSION',
        payload: {
          locationAddress: newAddress,
        },
      });
    });
  });

  it('dispatches UPDATE_SESSION when meeting link changes', async () => {
    const virtualSession = {
      ...mockSession,
      format: 'virtual',
      meetingLink: 'old.com',
    };
    render(<SessionPartWithState session={virtualSession} />);

    const meetingLinkInput = screen.getByLabelText(
      BuildYourOwnWorkshopConfig.session_fields.meeting_link.label
    );
    const newLink = 'new.com';
    await user.clear(meetingLinkInput);
    await user.type(meetingLinkInput, newLink);

    await waitFor(() => {
      expect(dispatchSessions).toHaveBeenCalledTimes(newLink.length + 1);
      expect(dispatchSessions).toHaveBeenCalledWith({
        id: mockSession.id,
        type: 'UPDATE_SESSION',
        payload: {
          meetingLink: newLink,
        },
      });
    });
  });

  it('shows meeting link when format is virtual', () => {
    const virtualSession = {
      ...mockSession,
      format: 'virtual',
    };
    render(<SessionPartWithState session={virtualSession} />);

    expect(
      screen.getByLabelText(
        BuildYourOwnWorkshopConfig.session_fields.meeting_link.label
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByLabelText(
        BuildYourOwnWorkshopConfig.session_fields.location_name.label
      )
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText(
        BuildYourOwnWorkshopConfig.session_fields.location_address.label
      )
    ).not.toBeInTheDocument();
  });
});
