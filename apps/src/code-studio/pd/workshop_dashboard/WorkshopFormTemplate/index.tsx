import Alert from '@code-dot-org/component-library/alert';
import {Heading1} from '@code-dot-org/component-library/typography';
import {isEmpty} from 'lodash';
import React, {
  FC,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react';
import {useNavigate, useParams} from 'react-router-dom';

import {getAuthenticityToken} from '@cdo/apps/util/AuthenticityTokenStore';
import {useFetch} from '@cdo/apps/util/useFetch';

import {DATETIME_FORMAT} from '../workshopConstants';

import {generateNewSession} from './components/SessionsEditor';
import {sessionsReducer} from './reducers/sessionsReducer';
import {workshopReducer} from './reducers/workshopReducer';
import AdditionalInfo from './sections/AdditionalInfo';
import Basics from './sections/Basics';
import EmailsReminders from './sections/EmailsReminders';
import PartnerFacilitator from './sections/PartnerFacilitator';
import PublishCancelButtons from './sections/PublishCancelButtons';
import PublishSettings from './sections/PublishSettings';
import Schedule from './sections/Schedule';
import {
  Errors,
  FieldConfig,
  Facilitator,
  RegionalPartner,
  Session,
  SessionErrors,
  SessionFormState,
  Workshop,
  WorkshopFormState,
  WorkshopFormTemplateProps,
  DestroyedSession,
} from './types';
import {workshopDataToState, sessionDataToState, workshopLabel} from './utils';

import styles from './styles.module.scss';

export const REQUIRED_ERROR = 'Required';
export const VALIDATION_ERROR =
  'Your form contains validation errors that must be corrected';

export const workshopStateToApi = (
  workshop: WorkshopFormState
): Omit<Workshop, 'sessions' | 'organizer'> => ({
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
): Array<Session | DestroyedSession> => {
  const newOrUpdatedSessions: Array<Session | DestroyedSession> = [];
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
      id: session.id.startsWith('new')
        ? undefined
        : Number(session.id.replace(/\D/g, '')),
      session_format: session.format,
      start: moment
        .tz(`${session.date} ${session.start}`, DATETIME_FORMAT, timeZone)
        .utc()
        .toISOString(),
      end: moment
        .tz(`${session.date} ${session.end}`, DATETIME_FORMAT, timeZone)
        .utc()
        .toISOString(),
      location_address: session.locationAddress || undefined,
      location_name: session.locationName || undefined,
      meeting_link: session.meetingLink || undefined,
    });
  });

  return newOrUpdatedSessions.concat(sessionsToDestroy);
};

export const WorkshopFormTemplate: FC<WorkshopFormTemplateProps> = ({
  config,
}) => {
  const navigate = useNavigate();
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const {workshopId} = useParams();

  const {data: workshop} = useFetch<Workshop>(
    workshopId ? `/api/v1/pd/workshops/${workshopId}` : ''
  );

  const {data: regionalPartnerData} = useFetch<RegionalPartner[]>(
    '/api/v1/regional_partners'
  );

  const {data: facilitatorData} = useFetch<Facilitator[]>(
    `/api/v1/pd/course_facilitators?course=${encodeURIComponent(config.label)}`
  );

  const [workshopFormState, dispatchWorkshop] = useReducer(workshopReducer, {
    course: config.label,
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
    timeZone: userTimeZone,
  });

  const [sessionFormState, dispatchSessions] = useReducer(sessionsReducer, [
    generateNewSession(),
  ]);

  const [workshopErrors, setWorkshopErrors] = useState<
    Errors<keyof WorkshopFormState>
  >({});

  const [sessionErrors, setSessionErrors] = useState<SessionErrors>({});

  const [responseErrors, setResponseErrors] = useState<string[]>([]);

  useEffect(() => {
    if (workshop) {
      dispatchWorkshop({
        type: 'SET_WORKSHOP',
        payload: workshopDataToState(workshop),
      });
      dispatchSessions({
        type: 'SET_SESSIONS',
        payload: sessionDataToState(
          workshop.sessions,
          workshop.time_zone ?? userTimeZone
        ),
      });
    }
  }, [workshop, userTimeZone]);

  const getWorkshopErrors = useCallback(
    () =>
      Object.values(config.fields).reduce(
        (
          acc: Errors<keyof WorkshopFormState>,
          field: FieldConfig<WorkshopFormState>
        ) => {
          const {stateKey} = field;
          const required =
            field.required ||
            (stateKey === 'prereq' && workshopFormState.hasPrereq);
          if (required && isEmpty(workshopFormState[stateKey])) {
            acc[stateKey] = REQUIRED_ERROR;
          }
          return acc;
        },
        {}
      ),
    [config.fields, workshopFormState]
  );

  const getSessionErrors = useCallback(
    () =>
      Object.values(config.session_fields).reduce(
        (acc: SessionErrors, field: FieldConfig<SessionFormState>) => {
          const {stateKey, required} = field;
          sessionFormState.forEach(session => {
            if (required && isEmpty(session[stateKey])) {
              acc[session.id] = {
                ...(acc[session.id] ?? {}),
                [stateKey]: REQUIRED_ERROR,
              };
            }
          });

          return acc;
        },
        {}
      ),
    [config.session_fields, sessionFormState]
  );

  const publish = useCallback(async () => {
    try {
      setResponseErrors([]);
      const workshopValidationErrors = getWorkshopErrors();
      setWorkshopErrors(workshopValidationErrors);
      const sessionValidationErrors = getSessionErrors();
      setSessionErrors(sessionValidationErrors);
      if (
        Object.keys({...workshopValidationErrors, ...sessionValidationErrors})
          .length
      ) {
        return;
      }
      const workshopData = workshopStateToApi(workshopFormState);
      const sessionData = sessionStateToApi(
        sessionFormState,
        workshopFormState.timeZone,
        workshop?.sessions
      );

      const method = workshop ? 'PATCH' : 'POST';
      const url = workshop
        ? `/api/v1/pd/workshops/${workshop.id}`
        : '/api/v1/pd/workshops';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': await getAuthenticityToken(),
        },
        body: JSON.stringify({
          pd_workshop: {...workshopData, sessions_attributes: sessionData},
        }),
      });

      const responseData = await response.json();

      if (responseData.errors || responseData.error) {
        const allErrors = [responseData.error]
          .concat(responseData.errors)
          .filter(e => !!e);
        setResponseErrors(allErrors);
      }

      if (response.ok) {
        navigate(`/workshops/${responseData.id}`);
      }
    } catch (error) {
      setResponseErrors([
        'There was a problem processing your request. Please try again or contact support@code.org',
      ]);
    }
  }, [
    getSessionErrors,
    getWorkshopErrors,
    navigate,
    sessionFormState,
    workshop,
    workshopFormState,
  ]);

  const cancel = useCallback(() => navigate('/workshops'), [navigate]);

  const heading = workshopLabel(`New ${config.label}`);

  const sectionProps = useMemo(
    () => ({
      dispatchWorkshop,
      config,
    }),
    [dispatchWorkshop, config]
  );

  const allErrors = useMemo(
    () =>
      isEmpty({...workshopErrors, ...sessionErrors})
        ? responseErrors
        : [VALIDATION_ERROR, ...responseErrors],
    [workshopErrors, sessionErrors, responseErrors]
  );

  return (
    <form id="workshop-form-template" className={styles.container}>
      <Heading1 visualAppearance="heading-xl">{heading}</Heading1>
      <Basics
        capacity={workshopFormState.capacity}
        description={workshopFormState.description}
        prereq={workshopFormState.prereq}
        hasPrereq={workshopFormState.hasPrereq}
        subject={workshopFormState.subject}
        grades={workshopFormState.grades}
        courseOfferings={workshopFormState.courseOfferings}
        name={workshopFormState.name}
        errors={workshopErrors}
        {...sectionProps}
      />
      <Schedule
        timeZone={workshopFormState.timeZone}
        sessions={sessionFormState}
        dispatchSessions={dispatchSessions}
        errors={sessionErrors}
        {...sectionProps}
      />
      <PartnerFacilitator
        facilitators={workshopFormState.facilitators}
        regionalPartnerId={workshopFormState.regionalPartnerId}
        errors={workshopErrors}
        regionalPartnerData={regionalPartnerData}
        facilitatorData={facilitatorData}
        {...sectionProps}
      />
      <EmailsReminders
        suppressEmail={workshopFormState.suppressEmail}
        {...sectionProps}
      />
      <AdditionalInfo
        fee={workshopFormState.fee}
        participantGroupType={workshopFormState.participantGroupType}
        notes={workshopFormState.notes}
        errors={workshopErrors}
        {...sectionProps}
      />
      <PublishSettings
        registrationLink={workshopFormState.registrationLink}
        hidden={workshopFormState.hidden}
        errors={workshopErrors}
        {...sectionProps}
      />
      {allErrors.length > 0 &&
        allErrors.map(error => (
          <Alert key={error} type="danger" text={error} />
        ))}
      <PublishCancelButtons publish={publish} cancel={cancel} />
    </form>
  );
};
