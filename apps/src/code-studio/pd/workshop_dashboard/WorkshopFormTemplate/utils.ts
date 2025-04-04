import moment from 'moment-timezone';

import {DATE_FORMAT, TIME_FORMAT} from '../workshopConstants';

import {Workshop, WorkshopFormState, Session, SessionFormState} from './types';

export const workshopLabel = (label: string): string =>
  `${label.replace(/workshop$/i, '').trim()} Workshop`;

export const workshopDataToState = (data: Workshop): WorkshopFormState => ({
  course: data.course ?? '',
  capacity: data.capacity?.toString() ?? '',
  description: data.description ?? '',
  facilitators: data.facilitators ?? [],
  fee: data.fee ?? '',
  grades: data.grades ?? [],
  hidden: data.hidden ?? false,
  name: data.name ?? '',
  notes: data.notes ?? '',
  organizerId: data.organizer?.id ?? null,
  prereq: data.prereq ?? '',
  hasPrereq: data.prereq ? true : false,
  regionalPartnerId: data.regional_partner_id ?? null,
  registrationLink: data.registration_link ?? '',
  subject: data.subject ?? '',
  suppressEmail: data.suppress_email ?? false,
  courseOfferings: data.course_offerings?.map(n => n.toString()) ?? [],
  participantGroupType: data.participant_group_type ?? '',
  timeZone: data.time_zone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
});

export const sessionDataToState = (
  data: Session[],
  timeZone: string
): SessionFormState[] =>
  data.map(session => ({
    id: `existing-${session.id}`,
    date: moment(session.start).tz(timeZone).format(DATE_FORMAT),
    start: moment(session.start).tz(timeZone).format(TIME_FORMAT),
    end: moment(session.end).tz(timeZone).format(TIME_FORMAT),
    locationAddress: session.location_address ?? '',
    locationName: session.location_name ?? '',
    meetingLink: session.meeting_link ?? '',
    format: session.session_format ?? 'in_person',
    sameAsPrevious: false,
  }));
