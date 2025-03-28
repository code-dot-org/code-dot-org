import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import moment from 'moment-timezone';
import PropTypes from 'prop-types';
import React, {useReducer} from 'react';

import {
  DATE_FORMAT,
  TIME_FORMAT,
} from '@cdo/apps/code-studio/pd/workshop_dashboard/workshopConstants';
import {sessionsReducer} from '@cdo/apps/code-studio/pd/workshop_dashboard/WorkshopFormTemplate';
import {
  SessionsEditor,
  SessionPart,
  generateNewSession,
} from '@cdo/apps/code-studio/pd/workshop_dashboard/WorkshopFormTemplate/components/SessionsEditor';

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
    expect(newSession.sameAsPrevious).toEqual(false);
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
      sameAsPrevious: true,
    };
    const newSession = generateNewSession(prevSession);

    expect(newSession.date).toEqual(
      moment('2025-03-28', DATE_FORMAT).add(1, 'day').format(DATE_FORMAT)
    );
    expect(newSession.id).toMatch(newIdRegex);
    expect(newSession.id).not.toEqual(prevSession.id);
    expect(newSession.start).toEqual('8:00am');
    expect(newSession.end).toEqual('5:00pm');
    expect(newSession.locationAddress).toEqual('123 Main St');
    expect(newSession.locationName).toEqual('Test Location');
    expect(newSession.meetingLink).toEqual('test.com');
    expect(newSession.format).toEqual('virtual');
    expect(newSession.sameAsPrevious).toEqual(true);
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
      sameAsPrevious: false,
    },
  ];
  const user = userEvent.setup();

  beforeEach(() => {
    mockDispatchSessions.mockClear();
  });

  it('renders', () => {
    render(
      <SessionsEditor
        sessions={initialSessions}
        dispatchSessions={mockDispatchSessions}
      />
    );

    expect(screen.getByText('Add Date')).toBeInTheDocument();
  });

  it('adds a new session when "Add Date" is clicked', async () => {
    render(
      <SessionsEditor
        sessions={initialSessions}
        dispatchSessions={mockDispatchSessions}
      />
    );

    const addButton = screen.getByText('Add Date');
    await user.click(addButton);

    await waitFor(() => {
      expect(mockDispatchSessions).toHaveBeenCalledTimes(1);
      expect(mockDispatchSessions).toHaveBeenCalledWith({
        type: 'ADD_SESSION',
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
    sameAsPrevious: false,
  };

  const SessionPartWithState = (props = {}) => {
    const [sessions, dispatch] = useReducer(sessionsReducer, [
      props?.session ?? mockSession,
    ]);
    if (!sessions.length) return null;
    return (
      <SessionPart
        dispatchSessions={dispatchSessions.mockImplementation(dispatch)}
        showSameAsPrevious={true}
        index={0}
        {...props}
        {...sessions[0]}
      />
    );
  };
  SessionPartWithState.propTypes = {
    session: PropTypes.object,
    dispatchSessions: PropTypes.func,
    showSameAsPrevious: PropTypes.bool,
    index: PropTypes.number,
  };

  const user = userEvent.setup();

  beforeEach(() => {
    dispatchSessions.mockClear();
  });

  it('renders with form fields', () => {
    render(<SessionPartWithState />);

    expect(screen.getByLabelText('Date')).toBeInTheDocument();
    expect(screen.getByLabelText('Start Time')).toBeInTheDocument();
    expect(screen.getByLabelText('End Time')).toBeInTheDocument();
    expect(screen.getByLabelText('Format')).toBeInTheDocument();
    expect(screen.getByLabelText('Location name')).toBeInTheDocument();
    expect(screen.getByLabelText('Location address')).toBeInTheDocument();
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

    const startTimeDropdown = screen.getByLabelText('Start Time');
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

    const endTimeDropdown = screen.getByLabelText('End Time');
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

    const formatDropdown = screen.getByLabelText('Format');
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

    const locationNameInput = screen.getByLabelText('Location name');
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

    const locationAddressInput = screen.getByLabelText('Location address');
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

    const meetingLinkInput = screen.getByLabelText('Meeting link');
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

  it('dispatches UPDATE_SESSION when same as previous checkbox is unchecked', async () => {
    render(
      <SessionPartWithState session={{...mockSession, sameAsPrevious: true}} />
    );

    const checkbox = screen.getByLabelText('Location same as previous');
    await user.click(checkbox);

    await waitFor(() => {
      expect(dispatchSessions).toHaveBeenCalledTimes(1);
      expect(dispatchSessions).toHaveBeenCalledWith({
        id: mockSession.id,
        type: 'UPDATE_SESSION',
        payload: {sameAsPrevious: false},
      });
    });
  });

  it('dispatches UPDATE_SESSION_SAME_AS_PREVIOUS when same as previous checkbox is checked', async () => {
    render(<SessionPartWithState />);

    const checkbox = screen.getByLabelText('Location same as previous');
    await user.click(checkbox);

    await waitFor(() => {
      expect(dispatchSessions).toHaveBeenCalledTimes(1);
      expect(dispatchSessions).toHaveBeenCalledWith({
        id: mockSession.id,
        type: 'UPDATE_SESSION_SAME_AS_PREVIOUS',
      });
    });
  });

  it('updates same as previous label when session format changes', async () => {
    render(<SessionPartWithState />);

    expect(
      screen.getByLabelText('Location same as previous')
    ).toBeInTheDocument();

    const formatDropdown = screen.getByLabelText('Format');
    await user.selectOptions(formatDropdown, 'virtual');

    expect(
      screen.getByLabelText('Meeting link same as previous')
    ).toBeInTheDocument();
  });

  it('does not show same as previous checkbox when showSameAsPrevious is false', () => {
    render(<SessionPartWithState showSameAsPrevious={false} />);

    expect(
      screen.queryByLabelText('Location same as previous')
    ).not.toBeInTheDocument();
  });

  it('shows meeting link when format is virtual', () => {
    const virtualSession = {
      ...mockSession,
      format: 'virtual',
    };
    render(<SessionPartWithState session={virtualSession} />);

    expect(screen.getByLabelText('Meeting link')).toBeInTheDocument();
    expect(screen.queryByLabelText('Location name')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Location address')).not.toBeInTheDocument();
  });
});
