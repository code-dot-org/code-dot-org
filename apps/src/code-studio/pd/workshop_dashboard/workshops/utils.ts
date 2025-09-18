import {isEqual} from 'lodash';
import moment from 'moment-timezone';

import {isOption, Option} from '../workshop_form/components/MultiSelectInput';
import {DATE_FORMAT, DATETIME_FORMAT, TIME_FORMAT} from '../workshopConstants';

import {
  DestroyedSession,
  Enrollment,
  EnrollmentData,
  Session,
  SessionFormState,
  SessionRequest,
  Workshop,
  WorkshopData,
  WorkshopFormState,
  WorkshopRequest,
  LikertResults,
  Breakdown,
  PromoterResults,
  SurveyQuestion,
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

export const workshopDataToProps = (apiData: Workshop): WorkshopData => ({
  id: apiData.id,
  state: apiData.state,
  timeZone: apiData.time_zone,
  name: apiData.name,
  course: apiData.course,
  subject: apiData.subject,
  courseOfferingNames: apiData.course_offering_names,
  sessions: apiData.sessions.map(session => ({
    id: session.id,
    start: session.start,
    end: session.end,
    sessionFormat: session.session_format,
    locationName: session.location_name,
    locationAddress: session.location_address,
    meetingLink: session.meeting_link,
    code: session.code,
    showLink: session['show_link?'] ?? false,
    attendanceCount: session.attendance_count,
  })),
  facilitators: apiData.facilitators.map(facilitator => ({
    id: facilitator.id,
    name: facilitator.name,
    email: facilitator.email,
  })),
  regionalPartnerName: apiData.regional_partner_name,
  accountRequiredForAttendance:
    apiData['account_required_for_attendance?'] ?? false,
  readyToClose: apiData['ready_to_close?'] ?? false,
  registrationLink: apiData.registration_link,
  createdAt: apiData.created_at,
  enrolledTeacherCount: apiData.enrolled_teacher_count,
  hidden: apiData.hidden,
});

export const enrollmentDataToProps = (
  apiResults: Enrollment[]
): EnrollmentData[] =>
  apiResults.map(apiData => ({
    id: apiData.id,
    givenName: apiData.user_info.given_name ?? apiData.first_name ?? '',
    familyName: apiData.user_info.family_name ?? apiData.last_name ?? '',
    email: apiData.user_info.email ?? apiData.email ?? '',
    schoolName: apiData.user_info.school_name ?? apiData.school ?? '',
    districtName:
      apiData.user_info.district_name ?? apiData.district_name ?? '',
    role: apiData.user_info.role ?? apiData.role ?? '',
    userId: apiData.user_id,
    attendances: apiData.attendances,
    enrolledDate: apiData.enrolled_date,
  }));

// Returns if the workshop editor has made a change of one of the fields that
// could trigger a Detail Change Notification email if the editor desired.
export const madeImportantDetailChange = (
  workshop: Workshop | null,
  workshopFormState: WorkshopFormState,
  sessionFormState: SessionFormState[]
): boolean => {
  if (!workshop) return false;

  // Ignore 'hidden', 'registration_link', and 'suppress_email' when checking for
  // detail changes as already-enrolled users would be aware of these.
  const workshopOldWithImportantFields = Object.fromEntries(
    Object.entries(workshopDataToState(workshop)).filter(
      ([key]) => !['hidden', 'registrationLink', 'suppressEmail'].includes(key)
    )
  );
  const workshopNewWithImportantFields = Object.fromEntries(
    Object.entries(workshopFormState).filter(
      ([key]) => !['hidden', 'registrationLink', 'suppressEmail'].includes(key)
    )
  );
  if (
    !isEqual(workshopOldWithImportantFields, workshopNewWithImportantFields)
  ) {
    return true;
  }

  const sessionsOld = sessionDataToState(
    workshop.sessions,
    workshop.time_zone || ''
  );
  if (sessionsOld.length !== sessionFormState.length) return true;
  return sessionsOld.some(
    (session, index) => !isEqual(session, sessionFormState[index])
  );
};

export const isQuestionType = <T extends SurveyQuestion['question_type']>(
  question: SurveyQuestion | undefined,
  type: T
): question is Extract<SurveyQuestion, {question_type: T}> => {
  return !!question && question.question_type === type;
};

export const getQuestionDescription = (question: SurveyQuestion) => {
  if (
    isQuestionType(question, 'likert') ||
    isQuestionType(question, 'promoter')
  ) {
    return `${question.results.total_responses} responses`;
  }
  if (
    isQuestionType(question, 'multiSelect') &&
    question.question_name === 'barriers_implementation_curriculum'
  ) {
    if (!question.results.total_respondents) {
      return '';
    }
    const numWithBarriers =
      question.results.total_respondents -
      (question.results.breakdown?.none?.count ?? 0);
    return `${numWithBarriers} teachers reported at least 1 or more barriers to implementation`;
  }
  return '';
};

export const prepLikertBreakdown = (
  breakdown: LikertResults['breakdown']
): Breakdown[] =>
  Object.entries(breakdown ?? {})
    .map(
      ([key, value]): Breakdown => ({
        ...value,
        color:
          Number(key) === 4 ? 'neutral' : Number(key) > 4 ? 'success' : 'error',
      })
    )
    .reverse();

export const prepPromoterBreakdown = (
  breakdown: PromoterResults['breakdown']
): Breakdown[] =>
  Object.entries(breakdown ?? {}).map(([key, value]) => ({
    ...value,
    label: value.label.replace(/\D+/, ''),
    color: Number(key) > 8 ? 'success' : Number(key) > 6 ? 'warning' : 'error',
  }));
