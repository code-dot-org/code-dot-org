import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import moment from 'moment-timezone';
import PropTypes from 'prop-types';
import React, {useState} from 'react';

import {
  DATE_FORMAT,
  TIME_FORMAT,
} from '@cdo/apps/code-studio/pd/workshop_dashboard/workshopConstants';
import {
  SessionsEditor,
  SessionPart,
  generateNewSession,
} from '@cdo/apps/code-studio/pd/workshop_dashboard/WorkshopFormTemplate/components/SessionsEditor';

describe('generateNewSession', () => {
  it('should generate a new session with default values', () => {
    const newSession = generateNewSession();

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

  it('should generate a new session based on the previous session', () => {
    const prevSession = {
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
  const mockHandleSessions = jest.fn();
  const initialSessions = [
    {
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
    mockHandleSessions.mockClear();
  });

  it('should render', () => {
    render(
      <SessionsEditor
        sessions={initialSessions}
        handleSessions={mockHandleSessions}
      />
    );

    expect(screen.getByText('Add Date')).toBeInTheDocument();
  });

  it('should call handleSessions when a session is updated', async () => {
    render(
      <SessionsEditor
        sessions={initialSessions}
        handleSessions={mockHandleSessions}
      />
    );

    const dateInput = screen.getByLabelText('Date');
    fireEvent.change(dateInput, {target: {value: '2025-03-29'}});

    await waitFor(() => {
      expect(mockHandleSessions).toHaveBeenCalledTimes(1);
      expect(mockHandleSessions).toHaveBeenCalledWith([
        {
          ...initialSessions[0],
          date: '2025-03-29',
        },
      ]);
    });
  });

  it('should call handleSessions when a session is deleted', async () => {
    render(
      <SessionsEditor
        sessions={initialSessions}
        handleSessions={mockHandleSessions}
      />
    );

    const deleteButton = screen.getByRole('button', {
      name: 'delete workshop session',
    });
    await user.click(deleteButton);

    await waitFor(() => {
      expect(mockHandleSessions).toHaveBeenCalledTimes(1);
      expect(mockHandleSessions).toHaveBeenCalledWith([]);
    });
  });

  it('should add a new session when "Add Date" is clicked', async () => {
    render(
      <SessionsEditor
        sessions={initialSessions}
        handleSessions={mockHandleSessions}
      />
    );

    const addButton = screen.getByText('Add Date');
    await user.click(addButton);

    await waitFor(() => {
      expect(mockHandleSessions).toHaveBeenCalledTimes(1);
      expect(mockHandleSessions).toHaveBeenCalledWith([
        ...initialSessions,
        generateNewSession(initialSessions[0]),
      ]);
    });
  });

  it('should update sameAsPrevious and copy data from previous session', async () => {
    const sessions = [
      {
        date: '2025-03-28',
        start: '8:00am',
        end: '5:00pm',
        locationAddress: '123 Main St',
        locationName: 'Test Location',
        meetingLink: '',
        format: 'in_person',
        sameAsPrevious: false,
      },
      {
        date: '2025-03-29',
        start: '9:00am',
        end: '6:00pm',
        locationAddress: '',
        locationName: '',
        meetingLink: '',
        format: 'in_person',
        sameAsPrevious: false,
      },
    ];
    render(
      <SessionsEditor sessions={sessions} handleSessions={mockHandleSessions} />
    );

    const checkbox = screen.getByLabelText('Location same as previous');
    await user.click(checkbox);

    await waitFor(() => {
      expect(mockHandleSessions).toHaveBeenCalledTimes(1);
      expect(mockHandleSessions).toHaveBeenCalledWith([
        sessions[0],
        {
          ...sessions[1],
          sameAsPrevious: true,
          locationAddress: sessions[0].locationAddress,
          locationName: sessions[0].locationName,
          meetingLink: sessions[0].meetingLink,
        },
      ]);
    });
  });
});

describe('SessionPart', () => {
  const mockHandleSession = jest.fn();
  const mockDeleteSession = jest.fn();
  const mockHandleSameAsPrevious = jest.fn();
  const mockSession = {
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
    const [session, setSession] = useState(props?.session ?? mockSession);
    return (
      <SessionPart
        handleSession={mockHandleSession.mockImplementation(setSession)}
        deleteSession={mockDeleteSession}
        handleSameAsPrevious={mockHandleSameAsPrevious}
        showSameAsPrevious={true}
        {...props}
        session={session}
      />
    );
  };
  SessionPartWithState.propTypes = {
    session: PropTypes.object,
    handleSession: PropTypes.func,
    deleteSession: PropTypes.func,
    handleSameAsPrevious: PropTypes.func,
    showSameAsPrevious: PropTypes.bool,
  };

  const user = userEvent.setup();

  beforeEach(() => {
    mockHandleSession.mockClear();
    mockDeleteSession.mockClear();
    mockHandleSameAsPrevious.mockClear();
  });

  it('should render without crashing', () => {
    render(<SessionPartWithState />);

    expect(screen.getByLabelText('Date')).toBeInTheDocument();
    expect(screen.getByLabelText('Start Time')).toBeInTheDocument();
    expect(screen.getByLabelText('End Time')).toBeInTheDocument();
    expect(screen.getByLabelText('Format')).toBeInTheDocument();
    expect(screen.getByLabelText('Location name')).toBeInTheDocument();
    expect(screen.getByLabelText('Location address')).toBeInTheDocument();
  });

  it('should call handleSession when date changes', async () => {
    render(<SessionPartWithState />);

    const dateInput = screen.getByLabelText('Date');
    fireEvent.change(dateInput, {target: {value: '2025-03-29'}});

    await waitFor(() => {
      expect(mockHandleSession).toHaveBeenCalledTimes(1);
      expect(mockHandleSession).toHaveBeenCalledWith({
        ...mockSession,
        date: '2025-03-29',
      });
    });
  });

  it('should call handleSession when start time changes', async () => {
    render(<SessionPartWithState />);

    const startTimeDropdown = screen.getByLabelText('Start Time');
    await user.selectOptions(startTimeDropdown, '8:30am');

    await waitFor(() => {
      expect(mockHandleSession).toHaveBeenCalledTimes(1);
      expect(mockHandleSession).toHaveBeenCalledWith({
        ...mockSession,
        start: '8:30am',
      });
    });
  });

  it('should call handleSession when end time changes', async () => {
    render(<SessionPartWithState />);

    const endTimeDropdown = screen.getByLabelText('End Time');
    await user.selectOptions(endTimeDropdown, '5:30pm');

    await waitFor(() => {
      expect(mockHandleSession).toHaveBeenCalledTimes(1);
      expect(mockHandleSession).toHaveBeenCalledWith({
        ...mockSession,
        end: '5:30pm',
      });
    });
  });

  it('should call handleSession when format changes', async () => {
    render(<SessionPartWithState />);

    const formatDropdown = screen.getByLabelText('Format');
    await user.selectOptions(formatDropdown, 'virtual');

    await waitFor(() => {
      expect(mockHandleSession).toHaveBeenCalledTimes(1);
      expect(mockHandleSession).toHaveBeenCalledWith({
        ...mockSession,
        format: 'virtual',
      });
    });
  });

  it('should call deleteSession when delete button is clicked', async () => {
    render(<SessionPartWithState />);

    const deleteButton = screen.getByRole('button', {
      name: 'delete workshop session',
    });
    await user.click(deleteButton);

    expect(mockDeleteSession).toHaveBeenCalledTimes(1);
  });

  it('should call handleSession when location name changes', async () => {
    render(<SessionPartWithState />);

    const locationNameInput = screen.getByLabelText('Location name');
    const newLocation = 'New Location';
    await user.clear(locationNameInput);
    await user.type(locationNameInput, newLocation);

    await waitFor(() => {
      expect(mockHandleSession).toHaveBeenCalledTimes(newLocation.length + 1);
      expect(mockHandleSession).toHaveBeenCalledWith({
        ...mockSession,
        locationName: newLocation,
      });
    });
  });

  it('should call handleSession when location address changes', async () => {
    render(<SessionPartWithState />);

    const locationAddressInput = screen.getByLabelText('Location address');
    const newAddress = 'New Address';
    await user.clear(locationAddressInput);
    await user.type(locationAddressInput, newAddress);

    await waitFor(() => {
      expect(mockHandleSession).toHaveBeenCalledTimes(newAddress.length + 1);
      expect(mockHandleSession).toHaveBeenCalledWith({
        ...mockSession,
        locationAddress: newAddress,
      });
    });
  });

  it('should call handleSession when meeting link changes', async () => {
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
      expect(mockHandleSession).toHaveBeenCalledTimes(newLink.length + 1);
      expect(mockHandleSession).toHaveBeenCalledWith({
        ...virtualSession,
        meetingLink: newLink,
      });
    });
  });

  it('should call handleSameAsPrevious when same as previous checkbox is clicked', async () => {
    render(<SessionPartWithState />);

    const checkbox = screen.getByLabelText('Location same as previous');
    await user.click(checkbox);

    await waitFor(() => {
      expect(mockHandleSameAsPrevious).toHaveBeenCalledTimes(1);
      expect(mockHandleSameAsPrevious).toHaveBeenCalledWith(true);
    });
  });

  it('should update same as previous label when session format changes', async () => {
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

  it('should not show same as previous checkbox when showSameAsPrevious is false', () => {
    render(<SessionPartWithState showSameAsPrevious={false} />);

    expect(
      screen.queryByLabelText('Location same as previous')
    ).not.toBeInTheDocument();
  });

  it('should show meeting link when format is virtual', () => {
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
