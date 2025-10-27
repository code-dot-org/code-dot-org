import Alert from '@code-dot-org/component-library/alert';
import {Dialog} from '@code-dot-org/component-library/dialog';
import {Heading1} from '@code-dot-org/component-library/typography';
import React, {
  FC,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react';
import {useNavigate, useParams} from 'react-router-dom';

import {WorkshopCourseConfigs} from '@cdo/apps/generated/pd/sharedWorkshopConstants';
import {getAuthenticityToken} from '@cdo/apps/util/AuthenticityTokenStore';
import {useFetch} from '@cdo/apps/util/useFetch';

import {
  Workshop,
  WorkshopFormState,
  SessionErrors,
  WorkshopCourseConfig,
  SessionFormState,
  FieldConfig,
  RegionalPartner,
  WorkshopErrors,
} from '../workshops/types';
import {
  workshopDataToState,
  sessionDataToState,
  emptyValue,
  workshopStateToApi,
  sessionStateToApi,
  workshopLabel,
  madeImportantDetailChange,
} from '../workshops/utils';

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

import styles from './WorkshopForm.module.scss';

export const REQUIRED_ERROR = 'Required';
export const VALIDATION_ERROR =
  'Your form contains validation errors that must be corrected';

export interface WorkshopFormProps {
  config?: WorkshopCourseConfig;
  regionalPartnerData?: RegionalPartner[];
}

export const WorkshopForm: FC<WorkshopFormProps> = ({config}) => {
  const navigate = useNavigate();
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const {workshopId} = useParams();
  const [workshopConfig, setWorkshopConfig] = useState(config);
  const [loadingState, setLoadingState] = useState<
    'notifyLoading' | 'dontNotifyLoading' | null
  >(null);
  const [showDetailChangeEmailDialog, setShowDetailChangeEmailDialog] =
    useState(false);

  const {data: workshop} = useFetch<Workshop>(
    workshopId ? `/api/v1/pd/workshops/${workshopId}` : ''
  );

  const [workshopFormState, dispatchWorkshop] = useReducer(workshopReducer, {
    course: workshopConfig?.label ?? '',
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

  const [workshopErrors, setWorkshopErrors] = useState<WorkshopErrors>({});

  const [sessionErrors, setSessionErrors] = useState<SessionErrors>({});

  const [responseErrors, setResponseErrors] = useState<string[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (workshop) {
      dispatchWorkshop({
        type: 'SET_WORKSHOP',
        payload: workshopDataToState(workshop),
      });
      dispatchSessions({
        type: 'SET_SESSIONS',
        payload: sessionDataToState(workshop.sessions, workshop.time_zone),
      });
      setWorkshopConfig(
        (WorkshopCourseConfigs as WorkshopCourseConfig[]).find(
          wsc => wsc.label === workshop.course
        )
      );
    }
  }, [workshop, userTimeZone]);

  const getWorkshopErrors = useCallback(
    () =>
      Object.values(workshopConfig?.fields ?? {}).reduce(
        (acc: WorkshopErrors, field: FieldConfig<WorkshopFormState>) => {
          const {stateKey} = field;
          let {required} = field;
          // prereq is not configured to be required
          // only if user indicates prereq is required
          if (stateKey === 'prereq' && workshopFormState.hasPrereq) {
            required = true;
          }
          if (required && emptyValue(workshopFormState[stateKey])) {
            acc[stateKey] = REQUIRED_ERROR;
          }
          return acc;
        },
        {}
      ),
    [workshopConfig?.fields, workshopFormState]
  );

  const getSessionErrors = useCallback(
    () =>
      Object.values(workshopConfig?.session_fields ?? {}).reduce(
        (acc: SessionErrors, field: FieldConfig<SessionFormState>) => {
          const {stateKey, required} = field;
          sessionFormState.forEach(session => {
            if (required && emptyValue(session[stateKey])) {
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
    [workshopConfig?.session_fields, sessionFormState]
  );

  const publish = useCallback(
    async (notify: boolean) => {
      try {
        setLoadingState(notify ? 'notifyLoading' : 'dontNotifyLoading');
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
            notify: notify,
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
        setLoadingState(null);
        setShowDetailChangeEmailDialog(false);
      }
    },
    [navigate, sessionFormState, workshop, workshopFormState]
  );

  const clickPublish = useCallback(async () => {
    // Ensure no errors before attempting to publish
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

    // If there are enrollees and it's a vital detail change, open dialog asking if an email should
    // be sent to enrollees about the change. Otherwise, just update.
    if (
      workshop?.enrolled_teacher_count &&
      workshop.enrolled_teacher_count > 0 &&
      madeImportantDetailChange(workshop, workshopFormState, sessionFormState)
    ) {
      setShowDetailChangeEmailDialog(true);
    } else {
      publish(false);
    }
  }, [
    getSessionErrors,
    getWorkshopErrors,
    workshop,
    workshopFormState,
    sessionFormState,
    publish,
  ]);

  const cancel = useCallback(
    () => (window.history.length > 1 ? navigate(-1) : navigate('/workshops')),
    [navigate]
  );

  const heading = workshopLabel(
    `${workshop ? 'Edit' : 'New'} ${workshopConfig?.label}`
  );

  const allErrors = useMemo(
    () =>
      emptyValue({...workshopErrors, ...sessionErrors})
        ? responseErrors
        : [VALIDATION_ERROR, ...responseErrors],
    [workshopErrors, sessionErrors, responseErrors]
  );

  if (!workshopConfig) return null;

  return (
    <form id="workshop-form-template" className={styles.container}>
      {showDetailChangeEmailDialog && (
        <Dialog
          title="Workshop Detail Change"
          description="You're making an important update to your workshop, would you like your enrollees to be notified via email?"
          mode="light"
          primaryButtonProps={{
            text: 'Notify',
            isPending: loadingState === 'notifyLoading',
            onClick: () => publish(true),
          }}
          secondaryButtonProps={{
            text: "Don't notify",
            isPending: loadingState === 'dontNotifyLoading',
            onClick: () => publish(false),
          }}
          onClose={() => {
            setShowDetailChangeEmailDialog(false);
            setLoadingState(null);
          }}
          closeLabel="Cancel"
        />
      )}
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
        dispatchWorkshop={dispatchWorkshop}
        config={workshopConfig}
      />
      <Schedule
        timeZone={workshopFormState.timeZone}
        sessions={sessionFormState}
        dispatchSessions={dispatchSessions}
        errors={sessionErrors}
        dispatchWorkshop={dispatchWorkshop}
        config={workshopConfig}
      />
      <PartnerFacilitator
        facilitators={workshopFormState.facilitators}
        regionalPartnerId={workshopFormState.regionalPartnerId}
        organizerId={workshopFormState.organizerId}
        courseOfferings={workshopFormState.courseOfferings}
        errors={workshopErrors}
        dispatchWorkshop={dispatchWorkshop}
        config={workshopConfig}
      />
      <EmailsReminders
        suppressEmail={workshopFormState.suppressEmail}
        dispatchWorkshop={dispatchWorkshop}
        config={workshopConfig}
      />
      <AdditionalInfo
        fee={workshopFormState.fee}
        participantGroupType={workshopFormState.participantGroupType}
        notes={workshopFormState.notes}
        errors={workshopErrors}
        dispatchWorkshop={dispatchWorkshop}
        config={workshopConfig}
      />
      <PublishSettings
        registrationLink={workshopFormState.registrationLink}
        hidden={workshopFormState.hidden}
        errors={workshopErrors}
        dispatchWorkshop={dispatchWorkshop}
        config={workshopConfig}
      />
      {allErrors.length > 0 &&
        allErrors.map(error => (
          <Alert key={error} type="danger" text={error} />
        ))}
      <PublishCancelButtons
        publish={clickPublish}
        cancel={cancel}
        loading={loadingState !== null}
      />
    </form>
  );
};
