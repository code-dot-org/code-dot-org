import moment from 'moment-timezone';

import {DATETIME_FORMAT} from '@cdo/apps/code-studio/pd/workshop_dashboard/workshopConstants';
import {
  Organizer,
  Session,
  SessionFormState,
  Workshop,
  WorkshopFormState,
} from '@cdo/apps/code-studio/pd/workshop_dashboard/WorkshopFormTemplate/types';
import {
  sessionDataToState,
  sessionStateToApi,
  workshopDataToState,
  workshopStateToApi,
} from '@cdo/apps/code-studio/pd/workshop_dashboard/WorkshopFormTemplate/utils';

describe('sessionDataToState', () => {
  it('should convert session data to state', () => {
    const sessionData: Session[] = [
      {
        id: 1,
        start: '2024-01-01T16:00:00Z',
        end: '2024-01-02T00:00:00Z',
        location_address: '123 Main St',
        location_name: 'Test Location',
        meeting_link: 'https://test.com',
        session_format: 'in_person',
      },
    ];
    const timeZone = 'America/Denver';
    const expectedState = [
      {
        id: '1',
        date: '2024-01-01',
        start: '9:00am',
        end: '5:00pm',
        locationAddress: '123 Main St',
        locationName: 'Test Location',
        meetingLink: 'https://test.com',
        format: 'in_person',
        sameAsPrevious: false,
      },
    ];
    const state = sessionDataToState(sessionData, timeZone);
    expect(state).toEqual(expectedState);
  });
});

describe('workshopDataToState', () => {
  it('should convert workshop data to state', () => {
    const workshopData: Workshop = {
      id: 1,
      course: 'Test Course',
      capacity: 10,
      description: 'Test Description',
      facilitators: [1, 2],
      fee: '100',
      grades: ['K', '1'],
      hidden: true,
      name: 'Test Workshop',
      notes: 'Test Notes',
      organizer: {id: 1} as Organizer,
      prereq: 'Test Prereq',
      regional_partner_id: 1,
      registration_link: 'https://test.com',
      subject: 'Test Subject',
      suppress_email: true,
      course_offerings: [1, 2],
      participant_group_type: 'Test Group',
      time_zone: 'America/Denver',
      sessions: [],
    };
    const expectedState = {
      course: 'Test Course',
      capacity: '10',
      description: 'Test Description',
      facilitators: [1, 2],
      fee: '100',
      grades: ['K', '1'],
      hidden: true,
      name: 'Test Workshop',
      notes: 'Test Notes',
      organizerId: 1,
      prereq: 'Test Prereq',
      hasPrereq: true,
      regionalPartnerId: 1,
      registrationLink: 'https://test.com',
      subject: 'Test Subject',
      suppressEmail: true,
      courseOfferings: ['1', '2'],
      participantGroupType: 'Test Group',
      timeZone: 'America/Denver',
    };
    const state = workshopDataToState(workshopData);
    expect(state).toEqual(expectedState);
  });
});

describe('sessionStateToApi', () => {
  it('should correctly transform session state to API format', () => {
    const timeZone = 'America/Denver';
    const sessionState: SessionFormState[] = [
      {
        id: '1',
        date: '2024-03-15',
        start: '9:00am',
        end: '12:00pm',
        locationAddress: '123 Test St',
        locationName: 'Test Location',
        meetingLink: 'https://test.meeting',
        format: 'virtual',
        sameAsPrevious: false,
      },
      {
        id: 'new-2',
        date: '2024-03-16',
        start: '1:00pm',
        end: '4:00pm',
        locationAddress: '456 New St',
        locationName: 'New Location',
        meetingLink: '',
        format: 'in_person',
        sameAsPrevious: false,
      },
    ];

    const expectedApiFormat = [
      {
        id: 1,
        session_format: 'virtual',
        start: moment
          .tz('2024-03-15 9:00am', DATETIME_FORMAT, timeZone)
          .utc()
          .toISOString(),
        end: moment
          .tz('2024-03-15 12:00pm', DATETIME_FORMAT, timeZone)
          .utc()
          .toISOString(),
        location_address: '123 Test St',
        location_name: 'Test Location',
        meeting_link: 'https://test.meeting',
      },
      {
        id: undefined,
        session_format: 'in_person',
        start: moment
          .tz('2024-03-16 1:00pm', DATETIME_FORMAT, timeZone)
          .utc()
          .toISOString(),
        end: moment
          .tz('2024-03-16 4:00pm', DATETIME_FORMAT, timeZone)
          .utc()
          .toISOString(),
        location_address: '456 New St',
        location_name: 'New Location',
        meeting_link: undefined,
      },
    ];

    const apiFormat = sessionStateToApi(sessionState, timeZone);
    expect(apiFormat).toEqual(expectedApiFormat);
  });

  it('should handle empty or undefined values correctly', () => {
    const timeZone = 'America/Denver';
    const sessionState: SessionFormState[] = [
      {
        id: '1',
        date: '2024-03-15',
        start: '9:00am',
        end: '12:00pm',
        locationAddress: '',
        locationName: '',
        meetingLink: '',
        format: 'in_person',
        sameAsPrevious: false,
      },
    ];

    const expectedApiFormat = [
      {
        id: 1,
        session_format: 'in_person',
        start: moment
          .tz('2024-03-15 9:00am', DATETIME_FORMAT, timeZone)
          .utc()
          .toISOString(),
        end: moment
          .tz('2024-03-15 12:00pm', DATETIME_FORMAT, timeZone)
          .utc()
          .toISOString(),
        location_address: undefined,
        location_name: undefined,
        meeting_link: undefined,
      },
    ];

    const apiFormat = sessionStateToApi(sessionState, timeZone);
    expect(apiFormat).toEqual(expectedApiFormat);
  });

  it('should handle deleting existing sessions', () => {
    const timeZone = 'America/Denver';
    const sessionState: SessionFormState[] = [
      {
        id: '1',
        date: '2024-03-15',
        start: '9:00am',
        end: '12:00pm',
        locationAddress: '123 Test St',
        locationName: 'Test Location',
        meetingLink: 'https://test.meeting',
        format: 'virtual',
        sameAsPrevious: false,
      },
      {
        id: 'new-3',
        date: '2024-03-17',
        start: '1:00pm',
        end: '4:00pm',
        locationAddress: '789 New St',
        locationName: 'New Location',
        meetingLink: '',
        format: 'in_person',
        sameAsPrevious: false,
      },
    ];

    const existingSessions: Session[] = [
      {
        id: 1,
        session_format: 'virtual',
        start: '2024-03-15T16:00:00Z',
        end: '2024-03-15T19:00:00Z',
        location_address: '123 Test St',
        location_name: 'Test Location',
        meeting_link: 'https://test.meeting',
      },
      {
        id: 2,
        session_format: 'in_person',
        start: '2024-03-16T17:00:00Z',
        end: '2024-03-16T20:00:00Z',
        location_address: '456 Old St',
        location_name: 'Old Location',
        meeting_link: '',
      },
    ];

    const expectedApiFormat = [
      {
        id: 1,
        session_format: 'virtual',
        start: moment
          .tz('2024-03-15 9:00am', DATETIME_FORMAT, timeZone)
          .utc()
          .toISOString(),
        end: moment
          .tz('2024-03-15 12:00pm', DATETIME_FORMAT, timeZone)
          .utc()
          .toISOString(),
        location_address: '123 Test St',
        location_name: 'Test Location',
        meeting_link: 'https://test.meeting',
      },
      {
        id: undefined,
        session_format: 'in_person',
        start: moment
          .tz('2024-03-17 1:00pm', DATETIME_FORMAT, timeZone)
          .utc()
          .toISOString(),
        end: moment
          .tz('2024-03-17 4:00pm', DATETIME_FORMAT, timeZone)
          .utc()
          .toISOString(),
        location_address: '789 New St',
        location_name: 'New Location',
        meeting_link: undefined,
      },
      {
        id: 2,
        _destroy: true,
      },
    ];

    const apiFormat = sessionStateToApi(
      sessionState,
      timeZone,
      existingSessions
    );
    expect(apiFormat).toEqual(expectedApiFormat);
  });
});

describe('workshopStateToApi', () => {
  it('should correctly transform workshop state to API format', () => {
    const workshopState: WorkshopFormState = {
      course: 'Test Course',
      capacity: '25',
      description: 'Test Description',
      facilitators: [1, 2, 3],
      fee: '100',
      grades: ['K', '1', '2'],
      hidden: true,
      name: 'Test Workshop',
      notes: 'Test Notes',
      organizerId: 123,
      prereq: 'Test Prereq',
      hasPrereq: true,
      regionalPartnerId: 456,
      registrationLink: 'https://test.com',
      subject: 'Test Subject',
      suppressEmail: true,
      courseOfferings: ['1', '2', '3'],
      participantGroupType: 'Test Group',
      timeZone: 'America/Denver',
    };

    const expectedApiFormat = {
      course: 'Test Course',
      capacity: 25,
      description: 'Test Description',
      facilitators: [1, 2, 3],
      fee: '100',
      grades: ['K', '1', '2'],
      hidden: true,
      name: 'Test Workshop',
      notes: 'Test Notes',
      prereq: 'Test Prereq',
      regional_partner_id: 456,
      registration_link: 'https://test.com',
      subject: 'Test Subject',
      suppress_email: true,
      course_offerings: [1, 2, 3],
      participant_group_type: 'Test Group',
      time_zone: 'America/Denver',
    };

    const apiFormat = workshopStateToApi(workshopState);
    expect(apiFormat).toEqual(expectedApiFormat);
  });

  it('should handle undefined or empty values correctly', () => {
    const workshopState: WorkshopFormState = {
      course: '',
      capacity: '',
      description: '',
      facilitators: [],
      fee: '',
      grades: [],
      hidden: false,
      name: '',
      notes: '',
      organizerId: null,
      prereq: '',
      hasPrereq: false,
      regionalPartnerId: null,
      registrationLink: '',
      subject: '',
      suppressEmail: false,
      courseOfferings: [],
      participantGroupType: '',
      timeZone: 'America/Denver',
    };

    const expectedApiFormat = {
      course: undefined,
      capacity: undefined,
      description: undefined,
      facilitators: [],
      fee: undefined,
      grades: [],
      hidden: false,
      name: undefined,
      notes: undefined,
      prereq: undefined,
      regional_partner_id: undefined,
      registration_link: undefined,
      subject: undefined,
      suppress_email: false,
      course_offerings: [],
      participant_group_type: '',
      time_zone: 'America/Denver',
    };

    const apiFormat = workshopStateToApi(workshopState);
    expect(apiFormat).toEqual(expectedApiFormat);
  });

  it('should handle non-numeric capacity', () => {
    const workshopState: WorkshopFormState = {
      course: '',
      capacity: 'not a number',
      description: '',
      facilitators: [],
      fee: '',
      grades: [],
      hidden: false,
      name: '',
      notes: '',
      organizerId: null,
      prereq: '',
      hasPrereq: false,
      regionalPartnerId: null,
      registrationLink: '',
      subject: '',
      suppressEmail: false,
      courseOfferings: [],
      participantGroupType: '',
      timeZone: 'America/Denver',
    };

    const expectedApiFormat = {
      course: undefined,
      capacity: undefined,
      description: undefined,
      facilitators: [],
      fee: undefined,
      grades: [],
      hidden: false,
      name: undefined,
      notes: undefined,
      prereq: undefined,
      regional_partner_id: undefined,
      registration_link: undefined,
      subject: undefined,
      suppress_email: false,
      course_offerings: [],
      participant_group_type: '',
      time_zone: 'America/Denver',
    };

    const apiFormat = workshopStateToApi(workshopState);
    expect(apiFormat).toEqual(expectedApiFormat);
  });
});
