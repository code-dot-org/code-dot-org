import moment from 'moment-timezone';

import {DATE_FORMAT, DATETIME_FORMAT, TIME_FORMAT} from '../workshopConstants';

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
  facilitators: data.facilitators?.map(({id}) => id) ?? [],
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
    id: session.id.toString(),
    date: moment(session.start).tz(timeZone).format(DATE_FORMAT),
    start: moment(session.start).tz(timeZone).format(TIME_FORMAT),
    end: moment(session.end).tz(timeZone).format(TIME_FORMAT),
    locationAddress: session.location_address ?? '',
    locationName: session.location_name ?? '',
    meetingLink: session.meeting_link ?? '',
    format: session.session_format ?? 'in_person',
    sameAsPrevious: false,
  }));

export const workshopStateToApi = (
  workshop: WorkshopFormState
): Omit<WorkshopRequest, 'sessions'> => ({
  course: workshop.course || undefined,
  capacity:
    workshop.capacity && !isNaN(Number(workshop.capacity))
      ? Number(workshop.capacity)
      : undefined,
  description: workshop.description || undefined,
  facilitators: workshop.facilitators,
  fee: workshop.fee || undefined,
  grades: workshop.grades,
  hidden: workshop.hidden,
  name: workshop.name || undefined,
  notes: workshop.notes || undefined,
  prereq: workshop.hasPrereq ? workshop.prereq : undefined,
  regional_partner_id: workshop.regionalPartnerId ?? undefined,
  registration_link: workshop.registrationLink || undefined,
  subject: workshop.subject || undefined,
  suppress_email: workshop.suppressEmail,
  course_offerings: workshop.courseOfferings.map(offering => Number(offering)),
  participant_group_type: workshop.participantGroupType,
  time_zone: workshop.timeZone,
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
        .tz(`${session.date} ${session.start}`, DATETIME_FORMAT, timeZone)
        .utc()
        .toISOString(),
      end: moment
        .tz(`${session.date} ${session.end}`, DATETIME_FORMAT, timeZone)
        .utc()
        .toISOString(),
      location_address:
        session.format === 'in_person'
          ? session.locationAddress || undefined
          : undefined,
      location_name:
        session.format === 'in_person'
          ? session.locationName || undefined
          : undefined,
      meeting_link:
        session.format === 'virtual'
          ? session.meetingLink || undefined
          : undefined,
    });
  });

  return newOrUpdatedSessions.concat(sessionsToDestroy);
};
