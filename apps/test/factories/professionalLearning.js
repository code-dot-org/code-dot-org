import {Factory} from 'rosie';

export const serializedWorkshopFactory = Factory.define('serializedWorkshop')
  .sequence('id')
  .attrs({
    sessions: [],
    location_name: 'My house',
    location_address: '123 Fake Street',
    on_map: false,
    funded: false,
    workshop_type: 'workshopType',
    course: 'course',
    subject: 'subject',
    enrolled_teacher_count: 10,
    capacity: 15,
    facilitators: [],
    organizer: {name: 'organizer_name', email: 'organizer_email'},
    enrollment_code: 'code1',
    user_id: 123,
    state: 'Not Started',
    attended: false,
    pre_workshop_survey_url: null,
    workshop_starting_date: null
  });
