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
import {useParams} from 'react-router-dom';

import {useFetch} from '@cdo/apps/util/useFetch';

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
  SessionErrors,
  SessionFormState,
  Workshop,
  WorkshopFormState,
  WorkshopFormTemplateProps,
} from './types';
import {workshopDataToState, sessionDataToState, workshopLabel} from './utils';

import styles from './styles.module.scss';

export const REQUIRED_ERROR = 'Required';

export const WorkshopFormTemplate: FC<WorkshopFormTemplateProps> = ({
  config,
}) => {
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const {workshopId} = useParams();

  const {data: workshop} = useFetch<Workshop>(
    workshopId ? `/api/v1/pd/workshops/${workshopId}` : ''
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

  const hasErrors = useMemo(
    () => Object.keys({...workshopErrors, ...sessionErrors}).length > 0,
    [workshopErrors, sessionErrors]
  );

  const publish = useCallback(async () => {
    try {
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
      // api request
    } catch (error) {
      // handle error
    }
  }, [getSessionErrors, getWorkshopErrors]);

  const cancel = () => {};

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
      {hasErrors && (
        <Alert
          type="danger"
          text="Your form contains validation errors that must be corrected"
        />
      )}
      <PublishCancelButtons publish={publish} cancel={cancel} />
    </form>
  );
};
