import moment from 'moment-timezone';

import {DATE_FORMAT, DATETIME_FORMAT, TIME_FORMAT} from '../workshopConstants';

import {isOption, Option} from './components/MultiSelectInput';
import {
  Workshop,
  WorkshopFormState,
  Session,
  SessionFormState,
  DestroyedSession,
  SessionRequest,
  WorkshopRequest,
} from './types';

export const workshopLabel = (label: string): string =>
  `${label.replace(/workshop$/i, '').trim()} Workshop`;

export const workshopDataToState = (data: Workshop): WorkshopFormState => ({
  course: data.course ?? '',
  capacity: data.capacity?.toString() ?? '',
  description: data.description ?? '',
  facilitators:
    data.facilitators?.map(({id, name, email}) => ({
      id,
      label: name,
      secondaryLabel: email,
      searchText: [name, email],
    })) ?? [],
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
  timeZone: data.time_zone ?? '',
});

export const sessionDataToState = (
  data: Session[],
  timeZone: Workshop['time_zone']
): SessionFormState[] =>
  data.map(session => ({
    id: session.id.toString(),
    date: moment
      .utc(session.start)
      .tz(timeZone || 'UTC')
      .format(DATE_FORMAT),
    start: moment
      .utc(session.start)
      .tz(timeZone || 'UTC')
      .format(TIME_FORMAT),
    end: moment
      .utc(session.end)
      .tz(timeZone || 'UTC')
      .format(TIME_FORMAT),
    locationAddress: session.location_address ?? '',
    locationName: session.location_name ?? '',
    meetingLink: session.meeting_link ?? '',
    format: session.session_format ?? 'in_person',
  }));

export const workshopStateToApi = (
  workshop: WorkshopFormState
): Omit<WorkshopRequest, 'sessions'> => ({
  course: workshop.course || null,
  capacity:
    workshop.capacity && !isNaN(Number(workshop.capacity))
      ? Number(workshop.capacity)
      : null,
  description: workshop.description || null,
  facilitators: workshop.facilitators.map(({id}) => Number(id)),
  fee: workshop.fee || null,
  grades: workshop.grades,
  hidden: workshop.hidden,
  name: workshop.name || null,
  notes: workshop.notes || null,
  prereq: workshop.hasPrereq ? workshop.prereq : null,
  regional_partner_id: workshop.regionalPartnerId,
  organizer_id: workshop.organizerId,
  registration_link: workshop.registrationLink || null,
  subject: workshop.subject || null,
  suppress_email: workshop.suppressEmail,
  course_offerings: workshop.courseOfferings.map(offering => Number(offering)),
  participant_group_type: workshop.participantGroupType || null,
  time_zone: workshop.timeZone || null,
});

export const sessionStateToApi = (
  sessions: SessionFormState[],
  timeZone: string,
  existingSessions?: Array<Session>
): Array<SessionRequest | DestroyedSession> => {
  const newOrUpdatedSessions: Array<SessionRequest | DestroyedSession> = [];
  const sessionsMap = new Map(sessions.map(s => [s.id, s]));
  const sessionsToDestroy =
    existingSessions?.reduce((acc: DestroyedSession[], curr) => {
      if (curr.id && !sessionsMap.get(curr.id.toString())) {
        acc.push({
          id: curr.id,
          _destroy: true,
        });
      }
      return acc;
    }, []) ?? [];

  sessions.forEach(session => {
    newOrUpdatedSessions.push({
      id: session.id.startsWith('new') ? undefined : Number(session.id),
      session_format: session.format,
      start: moment
        .tz(
          `${session.date} ${session.start}`,
          DATETIME_FORMAT,
          timeZone || 'UTC'
        )
        .utc()
        .toISOString(),
      end: moment
        .tz(
          `${session.date} ${session.end}`,
          DATETIME_FORMAT,
          timeZone || 'UTC'
        )
        .utc()
        .toISOString(),
      location_address:
        session.format === 'in_person' ? session.locationAddress || null : null,
      location_name:
        session.format === 'in_person' ? session.locationName || null : null,
      meeting_link:
        session.format === 'virtual' ? session.meetingLink || null : null,
    });
  });

  return newOrUpdatedSessions.concat(sessionsToDestroy);
};

export const emptyValue = (
  value:
    | null
    | undefined
    | string
    | number
    | Option
    | string[]
    | number[]
    | Option[]
    | boolean
    | Record<string, string>
): boolean => {
  if (value === null) return true;
  if (isOption(value)) {
    return false;
  }
  switch (typeof value) {
    case 'undefined':
      return true;
    case 'string':
      return value.trim() === '';
    case 'object':
      if (Array.isArray(value)) {
        return !value.length || value.every(emptyValue);
      } else {
        return (
          !Object.keys(value).length || Object.values(value).every(emptyValue)
        );
      }
    case 'number':
      return !Number.isInteger(value) || value < 0;
    case 'boolean':
      return false;
    default:
      return true;
  }
};
