import {Heading1} from '@code-dot-org/component-library/typography';
import moment from 'moment-timezone';
import React, {FC, useCallback, useEffect, useMemo, useReducer} from 'react';
import {useParams} from 'react-router-dom';

import {useFetch} from '@cdo/apps/util/useFetch';

import {workshopLabel} from '../utils/workshopLabel';
import {DATE_FORMAT, TIME_FORMAT} from '../workshopConstants';

import {generateNewSession} from './components/SessionsEditor';
import AdditionalInfo from './sections/AdditionalInfo';
import Basics from './sections/Basics';
import EmailsReminders from './sections/EmailsReminders';
import PartnerFacilitator from './sections/PartnerFacilitator';
import PublishCancelButtons from './sections/PublishCancelButtons';
import PublishSettings from './sections/PublishSettings';
import Schedule from './sections/Schedule';
import {
  Session,
  SessionAction,
  SessionFormState,
  Workshop,
  WorkshopAction,
  WorkshopFormState,
  WorkshopFormTemplateProps,
} from './types';

import styles from './styles.module.scss';

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

export const workshopReducer = (
  state: WorkshopFormState,
  action: WorkshopAction
): WorkshopFormState => {
  switch (action.type) {
    case 'UPDATE_WORKSHOP':
      return {...state, ...action.payload};
    case 'ADD_GRADE': {
      const newGrades = state.grades.concat(action.payload);
      newGrades.sort((a, b) => {
        // sort 'K' to beginning
        if (a === 'K') return -1;
        if (b === 'K') return 1;
        // sort 'Other' to end
        if (a === 'Other') return 1;
        if (b === 'Other') return -1;
        const numA = Number(a);
        const numB = Number(b);
        if (isNaN(numA) || isNaN(numB)) return 0;
        return numA - numB;
      });
      return {...state, grades: newGrades};
    }
    case 'REMOVE_GRADE':
      return {
        ...state,
        grades: state.grades.filter(grade => grade !== action.payload),
      };
    case 'ADD_COURSE_OFFERING':
      return {
        ...state,
        courseOfferings: [...state.courseOfferings, action.payload],
      };
    case 'REMOVE_COURSE_OFFERING':
      return {
        ...state,
        courseOfferings: state.courseOfferings.filter(
          offering => offering !== action.payload
        ),
      };
    case 'SET_COURSE_OFFERINGS':
      return {
        ...state,
        courseOfferings: action.payload,
      };
    case 'SET_WORKSHOP':
      return action.payload;
    default:
      return state;
  }
};

export const sessionsReducer = (
  state: SessionFormState[],
  action: SessionAction
): SessionFormState[] => {
  switch (action.type) {
    case 'ADD_SESSION':
      return state.concat(generateNewSession(state[state.length - 1]));

    case 'UPDATE_SESSION':
      return state.map(session =>
        session.id === action.id ? {...session, ...action.payload} : session
      );

    case 'UPDATE_SESSION_SAME_AS_PREVIOUS':
      return state.map((session, i) =>
        session.id === action.id
          ? {...session, ...(state[i - 1] ?? {}), sameAsPrevious: true}
          : session
      );

    case 'DELETE_SESSION':
      return state.filter(session => session.id !== action.id);

    case 'SET_SESSIONS':
      return action.payload;

    default:
      return state;
  }
};

export const WorkshopFormTemplate: FC<WorkshopFormTemplateProps> = ({
  config,
}) => {
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const {workshopId} = useParams();

  const {data: workshop} = useFetch<Workshop>(
    workshopId ? `/api/v1/pd/workshops/${workshopId}` : ''
  );

  const [workshopFormState, dispatchWorkshop] = useReducer(workshopReducer, {
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
    timeZone: userTimeZone,
  });

  const [sessionFormState, dispatchSessions] = useReducer(sessionsReducer, [
    generateNewSession(),
  ]);

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

  const publish = useCallback(() => {}, []);
  const cancel = useCallback(() => {}, []);

  const heading = workshopLabel(`New ${config.label}`);

  const sectionProps = useMemo(
    () => ({
      dispatchWorkshop,
      config,
    }),
    [dispatchWorkshop, config]
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
        {...sectionProps}
      />
      <Schedule
        timeZone={workshopFormState.timeZone}
        sessions={sessionFormState}
        dispatchSessions={dispatchSessions}
        {...sectionProps}
      />
      <PartnerFacilitator
        facilitators={workshopFormState.facilitators}
        regionalPartnerId={workshopFormState.regionalPartnerId}
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
        {...sectionProps}
      />
      <PublishSettings {...sectionProps} />
      <PublishCancelButtons publish={publish} cancel={cancel} />
    </form>
  );
};
