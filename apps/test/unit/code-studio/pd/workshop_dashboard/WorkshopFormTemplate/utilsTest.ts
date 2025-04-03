import {
  Organizer,
  Session,
  Workshop,
} from '@cdo/apps/code-studio/pd/workshop_dashboard/WorkshopFormTemplate/types';
import {
  sessionDataToState,
  workshopDataToState,
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
        id: 'existing-1',
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
