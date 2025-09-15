import {Option} from '@cdo/apps/code-studio/pd/workshop_dashboard/WorkshopFormTemplate/components/MultiSelectInput';
import {
  Session,
  Workshop,
  Organizer,
  SessionFormState,
  WorkshopFormState,
} from '@cdo/apps/code-studio/pd/workshop_dashboard/workshops/types';
import {
  sessionDataToState,
  workshopDataToState,
  sessionStateToApi,
  workshopStateToApi,
  emptyValue,
} from '@cdo/apps/code-studio/pd/workshop_dashboard/workshops/utils';

describe('sessionDataToState', () => {
  it('should convert session data to state with timezone', () => {
    const sessionData: Session[] = [
      {
        id: 1,
        start: '2024-01-01T16:00:00.000Z',
        end: '2024-01-02T00:00:00.000Z',
        location_address: '123 Main St',
        location_name: 'Test Location',
        meeting_link: null,
        session_format: 'in_person',
        code: 'abc',
        'show_link?': null,
        attendance_count: null,
        is_local: null,
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
        meetingLink: '',
        format: 'in_person',
      },
    ];
    const state = sessionDataToState(sessionData, timeZone);
    expect(state).toEqual(expectedState);
  });

  it('should convert session data to state without timezone', () => {
    const sessionData: Session[] = [
      {
        id: 1,
        start: '2024-01-01T09:00:00.000Z',
        end: '2024-01-01T17:00:00.000Z',
        location_address: '123 Main St',
        location_name: 'Test Location',
        meeting_link: null,
        session_format: 'in_person',
        code: 'abc',
        'show_link?': null,
        attendance_count: null,
        is_local: null,
      },
    ];
    const timeZone = null;
    const expectedState = [
      {
        id: '1',
        date: '2024-01-01',
        start: '9:00am',
        end: '5:00pm',
        locationAddress: '123 Main St',
        locationName: 'Test Location',
        meetingLink: '',
        format: 'in_person',
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
      facilitators: [
        {
          id: 1,
          name: 'Facilitator 1',
          email: 'facilitator1@mail.com',
        },
        {
          id: 2,
          name: 'Facilitator 2',
          email: 'facilitator2@mail.com',
        },
      ],
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
      state: 'Not Started',
      enrolled_teacher_count: 0,
      'ready_to_close?': null,
      'account_required_for_attendance?': null,
      regional_partner_name: null,
      course_offering_names: null,
      created_at: 'timestamp',
      sessions: [],
    };
    const expectedState = {
      course: 'Test Course',
      capacity: '10',
      description: 'Test Description',
      facilitators: [
        {
          id: 1,
          label: 'Facilitator 1',
          secondaryLabel: 'facilitator1@mail.com',
          searchText: ['Facilitator 1', 'facilitator1@mail.com'],
        },
        {
          id: 2,
          label: 'Facilitator 2',
          secondaryLabel: 'facilitator2@mail.com',
          searchText: ['Facilitator 2', 'facilitator2@mail.com'],
        },
      ],
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
      },
    ];

    const expectedApiFormat = [
      {
        id: 1,
        session_format: 'virtual',
        start: '2024-03-15T15:00:00.000Z',
        end: '2024-03-15T18:00:00.000Z',
        meeting_link: 'https://test.meeting',
        location_address: null,
        location_name: null,
      },
      {
        id: undefined,
        session_format: 'in_person',
        start: '2024-03-16T19:00:00.000Z',
        end: '2024-03-16T22:00:00.000Z',
        meeting_link: null,
        location_address: '456 New St',
        location_name: 'New Location',
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
      },
    ];

    const expectedApiFormat = [
      {
        id: 1,
        session_format: 'in_person',
        start: '2024-03-15T15:00:00.000Z',
        end: '2024-03-15T18:00:00.000Z',
        location_address: null,
        location_name: null,
        meeting_link: null,
      },
    ];

    const apiFormat = sessionStateToApi(sessionState, timeZone);
    expect(apiFormat).toEqual(expectedApiFormat);
  });

  it('should handle empty time zone correctly', () => {
    const timeZone = '';
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
      },
    ];

    const expectedApiFormat = [
      {
        id: 1,
        session_format: 'in_person',
        start: '2024-03-15T09:00:00.000Z',
        end: '2024-03-15T12:00:00.000Z',
        location_address: null,
        location_name: null,
        meeting_link: null,
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
      },
    ];

    const existingSessions: Session[] = [
      {
        id: 1,
        session_format: 'virtual',
        start: '2024-03-15T16:00:00.000Z',
        end: '2024-03-15T19:00:00.000Z',
        meeting_link: 'https://test.meeting',
        location_address: null,
        location_name: null,
        code: 'abc',
        'show_link?': null,
        attendance_count: null,
        is_local: null,
      },
      {
        id: 2,
        session_format: 'in_person',
        start: '2024-03-16T17:00:00.000Z',
        end: '2024-03-16T20:00:00.000Z',
        meeting_link: null,
        location_address: '456 Old St',
        location_name: 'Old Location',
        code: 'abc',
        'show_link?': null,
        attendance_count: null,
        is_local: null,
      },
    ];

    const expectedApiFormat = [
      {
        id: 1,
        session_format: 'virtual',
        start: '2024-03-15T15:00:00.000Z',
        end: '2024-03-15T18:00:00.000Z',
        meeting_link: 'https://test.meeting',
        location_address: null,
        location_name: null,
      },
      {
        id: undefined,
        session_format: 'in_person',
        start: '2024-03-17T19:00:00.000Z',
        end: '2024-03-17T22:00:00.000Z',
        meeting_link: null,
        location_address: '789 New St',
        location_name: 'New Location',
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
      facilitators: [{id: 1} as Option, {id: 2} as Option, {id: 3} as Option],
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
      organizer_id: 123,
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
      course: null,
      capacity: null,
      description: null,
      facilitators: [],
      fee: null,
      grades: [],
      hidden: false,
      name: null,
      notes: null,
      organizer_id: null,
      prereq: null,
      regional_partner_id: null,
      registration_link: null,
      subject: null,
      suppress_email: false,
      course_offerings: [],
      participant_group_type: null,
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
      course: null,
      capacity: null,
      description: null,
      facilitators: [],
      fee: null,
      grades: [],
      hidden: false,
      name: null,
      notes: null,
      organizer_id: null,
      prereq: null,
      regional_partner_id: null,
      registration_link: null,
      subject: null,
      suppress_email: false,
      course_offerings: [],
      participant_group_type: null,
      time_zone: 'America/Denver',
    };

    const apiFormat = workshopStateToApi(workshopState);
    expect(apiFormat).toEqual(expectedApiFormat);
  });
});

describe('emptyValue', () => {
  // null and undefined
  it('should return true for null', () => {
    expect(emptyValue(null)).toBe(true);
  });

  it('should return true for undefined', () => {
    expect(emptyValue(undefined)).toBe(true);
  });

  // strings
  it('should return true for an empty string', () => {
    expect(emptyValue('')).toBe(true);
  });

  it('should return true for a string with only whitespace', () => {
    expect(emptyValue('   ')).toBe(true);
  });

  it('should return false for a non-empty string', () => {
    expect(emptyValue('hello')).toBe(false);
  });

  it('should return false for a string with whitespace and characters', () => {
    expect(emptyValue('  hello  ')).toBe(false);
  });

  // arrays
  it('should return true for an empty array', () => {
    expect(emptyValue([])).toBe(true);
  });

  it('should return false for an array with elements', () => {
    expect(emptyValue([1, 2, 3])).toBe(false);
  });

  it('should return true for an array with all empty elements', () => {
    expect(emptyValue([null] as unknown as string[])).toBe(true);
    expect(emptyValue([undefined] as unknown as string[])).toBe(true);
    expect(emptyValue([''])).toBe(true);
  });

  // objects
  it('should return true for an empty object', () => {
    expect(emptyValue({})).toBe(true);
  });

  it('should return false for an object with properties', () => {
    expect(emptyValue({a: 'error'})).toBe(false);
  });

  it('should return true for an object with all empty property values', () => {
    expect(emptyValue({a: ''})).toBe(true);
  });

  // numbers
  it('should return false for the integer 0', () => {
    expect(emptyValue(0)).toBe(false);
  });

  it('should return false for positive integers', () => {
    expect(emptyValue(123)).toBe(false);
  });

  it('should return true for negative integers', () => {
    expect(emptyValue(-123)).toBe(true);
  });

  it('should return true for floating-point numbers', () => {
    expect(emptyValue(1.23)).toBe(true);
  });

  it('should return true for NaN', () => {
    expect(emptyValue(NaN)).toBe(true);
    expect(emptyValue(Number('not a number'))).toBe(true);
  });

  // booleans
  it('should return false for true', () => {
    expect(emptyValue(true)).toBe(false);
  });

  it('should return false for false', () => {
    expect(emptyValue(false)).toBe(false);
  });

  // Option
  it('should return false for an option', () => {
    expect(emptyValue({id: 1, label: 'option 1', searchText: []})).toBe(false);
  });

  it('should return false for an array of options', () => {
    expect(emptyValue([{id: 1, label: 'option 1', searchText: []}])).toBe(
      false
    );
  });
});
