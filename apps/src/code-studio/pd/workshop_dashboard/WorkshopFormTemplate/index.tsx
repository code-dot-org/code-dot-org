import {Heading1} from '@code-dot-org/component-library/typography';
import React, {FC, useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';

import {useFetch} from '@cdo/apps/util/useFetch';

import {workshopLabel} from '../utils/workshopLabel';

import {AdditionalInfo} from './sections/AdditionalInfo';
import {Basics} from './sections/Basics';
import {EmailsReminders} from './sections/EmailsReminders';
import {PartnerFacilitator} from './sections/PartnerFacilitator';
import {PublishCancelButtons} from './sections/PublishCancelButtons';
import {PublishSettings} from './sections/PublishSettings';
import {Schedule} from './sections/Schedule';
import {
  CourseOffering,
  Facilitator,
  RegionalPartner,
  Session,
  SessionFormState,
  Workshop,
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
  timeZone: data.time_zone ?? '',
});

export const sessionDataToState = (data: Session[]): SessionFormState[] =>
  data.map(session => ({
    id: session.id,
    start: session.start ?? '',
    end: session.end ?? '',
    code: session.code ?? '',
    locationAddress: session.location_address ?? '',
    locationName: session.location_name ?? '',
    meetingLink: session.meeting_link ?? '',
    sessionFormat: session.session_format ?? 'in_person',
  }));

export const WorkshopFormTemplate: FC<WorkshopFormTemplateProps> = ({
  config,
}) => {
  const {workshopId} = useParams();

  const workshopUrl = workshopId ? `/api/v1/pd/workshops/${workshopId}` : '';

  const {data: workshop} = useFetch<Workshop>(workshopUrl);

  const courseOfferingsUrl = config.fields.course_offerings
    ? '/course_offerings/self_paced_pl_course_offerings'
    : '';

  const {data: courseOfferings} =
    useFetch<CourseOffering[]>(courseOfferingsUrl);

  const regionalPartnersUrl = '/api/v1/regional_partners';

  const {data: regionalPartners} =
    useFetch<RegionalPartner[]>(regionalPartnersUrl);

  const facilitatorsUrl = `/api/v1/pd/course_facilitators?course=${encodeURIComponent(
    config.label
  )}`;

  const {data: facilitators} = useFetch<Facilitator[]>(facilitatorsUrl);

  const [workshopFormState, setWorkshopFormState] = useState<WorkshopFormState>(
    {
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
      timeZone: '',
    }
  );

  const [sessionFormState, setSessionFormState] = useState<SessionFormState[]>(
    []
  );

  useEffect(() => {
    if (workshop) {
      setWorkshopFormState(workshopDataToState(workshop));
      setSessionFormState(sessionDataToState(workshop.sessions));
    }
  }, [workshop]);

  const handleChange = <K extends keyof WorkshopFormState>(
    update: Record<K, WorkshopFormState[K]>
  ) => {
    setWorkshopFormState(prevState => ({
      ...prevState,
      ...update,
    }));
  };

  const heading = workshopLabel(`New ${config.label}`);

  return (
    <form id="workshop-form-template" className={styles.container}>
      <Heading1 visualAppearance="heading-xl">{heading}</Heading1>
      <Basics
        state={workshopFormState}
        courseOfferings={courseOfferings}
        handleChange={handleChange}
        config={config}
      />
      <Schedule state={sessionFormState} />
      <PartnerFacilitator
        state={workshopFormState}
        regionalPartners={regionalPartners}
        facilitators={facilitators}
        handleChange={handleChange}
        config={config}
      />
      <EmailsReminders
        state={workshopFormState}
        handleChange={handleChange}
        config={config}
      />
      <AdditionalInfo
        state={workshopFormState}
        handleChange={handleChange}
        config={config}
      />
      <PublishSettings
        state={workshopFormState}
        handleChange={handleChange}
        config={config}
      />
      <PublishCancelButtons publish={() => {}} cancel={() => {}} />
    </form>
  );
};
