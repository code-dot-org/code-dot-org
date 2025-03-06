import React, {FC, useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';

import {useFetch} from '@cdo/apps/util/useFetch';

import {
  CourseOffering,
  Session,
  SessionFormState,
  Workshop,
  WorkshopFormState,
  WorkshopFormTemplateProps,
} from './types';

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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {data: courseOfferings} =
    useFetch<CourseOffering[]>(courseOfferingsUrl);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [sessionFormState, setSessionFormState] = useState<SessionFormState[]>(
    []
  );

  useEffect(() => {
    if (workshop) {
      setWorkshopFormState(workshopDataToState(workshop));
      setSessionFormState(sessionDataToState(workshop.sessions));
    }
  }, [workshop]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleChange = <K extends keyof WorkshopFormState>(
    update: Record<K, WorkshopFormState[K]>
  ) => {
    setWorkshopFormState(prevState => ({
      ...prevState,
      ...update,
    }));
  };

  return <h1>{config.label}</h1>;
};
